'use strict';

const fs = require('fs');
const FolderZip = require('folder-zip');
const path = require('path');
const promiseRetry = require('promise-retry');
const Q = require('q');
const Webdav = require('./util/webdav');
const pwd = __dirname;

const packageFile = require(path.join(pwd, '../package.json'));
const dataOptions = packageFile.deployment.dataOptions;
const dataBundles = packageFile.deployment.dataBundles;
let webdav = null;
let lastDeploymentTimestamp = null;

/**
 * @function
 * @desc Checks the last modified time of the given stat or if a deployment has occurred at all
 * @param stat
 * @returns
 */
function isDeployed(stat) {
    if (lastDeploymentTimestamp === null || (stat && stat.mtime > lastDeploymentTimestamp)) {
        return false;
    }

    return true;
}

/**
 * Explores recursively a directory and returns all the filepaths and folderpaths in the callback.
 * 
 * @see http://stackoverflow.com/a/5827895/4241030
 * @param {String} dir - Directory to start traversing from
 * @returns [String]
 */
async function buildFileList(dir) {
    const deferred = Q.defer();
    let results = [];

    function traverseFiles (dir) {
        fs.readdir(dir, (err, list) => {
            if (err) {
                deferred.reject(new Error(err));
            }

            var pending = list.length;

            if (!pending) {
                return deferred.resolve(results);
            }

            list.forEach(function(file) {
                file = path.resolve(dir, file);

                fs.stat(file, function(err, stat) {
                    // If directory, execute a recursive call
                    if (stat && stat.isDirectory()) {
                        traverseFiles(file);
                    } else {
                        if (!isDeployed(stat)) {
                            results.push(file);
                        }

                        if (!--pending) {
                            return deferred.resolve(results);
                        }
                    }
                });
            });
        });
    }

    traverseFiles(dir);

    return deferred.promise;
};

/**
 * 
 * @returns
 */
async function zipDataFiles(dataBundle) {
    const archiveFolders = dataBundles[dataBundle];
    let archiveFiles = [],
        zipBuilders = [];

    const buildZip = (files, filePath) => {
        const zip = new FolderZip();
        const deferred = Q.defer();

        zip.batchAdd(files, () => {
            zip.writeToFileSync(filePath);
            console.log('Created Archive: '+ filePath);
            archiveFiles.push(filePath);
            deferred.resolve();
        });

        return deferred.promise;
    };

    for (var i in archiveFolders) {
        const fileList = await buildFileList(path.join(dataOptions.archivePath, archiveFolders[i]));
        const filePath = path.resolve(pwd, path.join(dataOptions.archivePath, archiveFolders[i]) + '.zip');
        let files = [];

        fileList.forEach(file => {
            files.push({
                source: file,
                target: path.relative(path.join(pwd, dataOptions.archivePath), file)
            });
        });

        zipBuilders.push(buildZip(files, filePath));
    };

    return Q.all(zipBuilders).then(() => {
        return archiveFiles;
    });
}

/**
 * @function
 * @desc Uploads the zip files to the server
 * @param archiveFiles
 * @returns
 */
async function uploadData(archiveFiles) {
    for (var i in archiveFiles) {
        console.log('\nUploading archive file ' + path.basename(archiveFiles[i]) + '...');
        try {
            await webdav.uploadFile(archiveFiles[i]);
            console.log('Archive ' + path.basename(archiveFiles[i]) + ' successfully uploaded.');
        } catch (e) {
            if (e.code === 204) {
                console.log('Archive ' + path.basename(archiveFiles[i]) + ' found on server, deleting archive...');
                await deleteData([archiveFiles[i]]);
                await uploadData([archiveFiles[i]]);
            }
        }
    }
}

/**
 * @desc Unzips the given files
 * @param options
 * @param archiveFiles
 * @returns
 */
async function unzipData(archiveFiles) {
    for (var i in archiveFiles) {
        try {
            await webdav.unzipFile(path.basename(archiveFiles[i]));
            console.log('Archive ' + path.basename(archiveFiles[i]) + ' successfully unzipped.');
        } catch (e) {
            console.log(e);
        }
    }
}

/**
 * @function
 * @desc Imports each of the archive files into the instance
 * @param archiveFiles
 * @returns
 */
async function importData(archiveFiles) {
    const promise = archiveFiles.reduce(function(promise, file) {
        return promise.then(function() {
            return promiseRetry(function(retry) {
                return webdav.importReady().catch(retry);
            });
        }).then(function() {
            return webdav.importFile(path.basename(file));
        });
    }, Q());

    return promise;
}

/**
 * @desc Removes the zip files from the server
 * @param options
 * @param archiveFiles
 * @returns
 */
async function deleteData(archiveFiles) {
    for (var i in archiveFiles) {
        try {
            await webdav.deleteDestination(path.basename(archiveFiles[i]));
            console.log('Archive ' + path.basename(archiveFiles[i]) + ' successfully deleted.');
        } catch (e) {
            console.log(e);
        }
    }
}

/**
 * @function
 * @desc Deploys all data in the given data bundle
 * @param {Object} options - Options needed to upload the data
 * @returns
 */
async function deployData(options) {
    const hostnames = options.hostname;
    delete options.hostname;

    // Get timestamp of last data deployment (skip for "clean" data builds)
    const lastDeploymentFileName = dataOptions.lastDeploymentFileName;

    if(options.dataDeltaOnly && fs.existsSync(gb.lastDeploymentFileName)) {
        lastDeploymentTimestamp = fs.readFileSync(lastDeploymentFileName, 'utf8');
    }

    let archiveFiles = null;

    try {
        // Zip the data bundle directories
        archiveFiles = await zipDataFiles(options.dataBundle);
    } catch (e) {
        console.log(e);
        return;
    }

    for (var i in hostnames) {
        options.hostname = hostnames[i];
        webdav = new Webdav(options);

        try {
            // Upload the zip files
            await uploadData(archiveFiles);
        } catch (e) {
            console.log(e);
            return;
        }

        try {
            // Login to the business manager via form
            await webdav.formLogin();

            // Check if the import is ready to go
            await importData(archiveFiles);
        } catch (e) {
            console.log(e);
            await deleteData(archiveFiles);
            return;
        }

        // Remove the zip files
        await deleteData(archiveFiles);
    }

    // After imports are complete, record timestamp of deployment
    fs.writeFile(lastDeploymentFileName, new Date().getTime(), (err) => {
        if (err) { throw err; }
    });
}

module.exports = deployData;