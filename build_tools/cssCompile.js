'use strict';

const autoprefixer = require('autoprefixer');
const sass = require('node-sass');
const shell = require('shelljs');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');

const pwd = __dirname;
const TEMP_DIR = path.resolve(pwd, './tmp');
const TEMP_SCSS_LIBRARY_DIR = path.join(TEMP_DIR, 'scss', 'libraries');
const TEMP_SCSS_SOURCE_DIR = path.join(TEMP_DIR, 'scss', 'source');

const allPaths = new Set();
let baseCartridgePath = '';

/**
 * @function
 * @desc Retrieves all directories at the first level of the given source path.
 * @param srcpath
 * @returns
 */
function getDirectories(srcpath) {
    return fs.readdirSync(srcpath)
        .filter(file => fs.lstatSync(path.join(srcpath, file)).isDirectory());
}

/**
 * @function
 * @desc Copies the Sass files in the given base path to the given destination path for each locale
 * @param basePath
 * @param destinationPath
 * @returns
 */
function copyOneProject(basePath, destinationPath) {
    const locales = getDirectories(basePath);
    locales.forEach(locale => {
        const resolvedDestination = path.join(destinationPath, locale);
        const sassPath = path.join(basePath, locale, '*');
        shell.mkdir('-p', resolvedDestination);

        if (fs.existsSync(path.join(basePath, locale)) && shell.ls(path.join(basePath, locale)).length) {
            shell.cp('-r', sassPath, resolvedDestination);
        }
    });
}

/**
 * @function
 * @desc Decides if one or multiple cartridges need to have Sass files copied for compilation
 * @param basePath
 * @param destinationPath
 * @param items
 * @returns
 */
function copyDependancies(basePath, destinationPath, items) {
    if (!items) {
        copyOneProject(basePath, destinationPath);
    } else {
        Object.keys(items).forEach(item => {
            if (item === 'base') {
                baseCartridgePath = items[item];
            }
            copyOneProject(path.resolve(pwd, path.join(items[item], 'cartridge/client/scss')), destinationPath);
        });
    }
}
/**
 * @function
 * @desc Converts the Sass files in the tmp directory into css files
 * @param packageFile
 * @returns
 */
module.exports = function compileCss(packageFile) {
    const modules = packageFile.paths;
    const currentCartridgeName = packageFile.packageName || packageFile.name;
    const libraries = [];
    let sourceDir = path.join(pwd, '../cartridges/' + currentCartridgeName + '/cartridge/client/scss');
    let filePattern = '';

    copyDependancies(sourceDir, TEMP_SCSS_SOURCE_DIR, modules);

    libraries.push(path.join(pwd, '../node_modules'));
    libraries.push(path.join(pwd, '../node_modules/flag-icon-css/sass'));
    sourceDir = TEMP_SCSS_SOURCE_DIR;
    filePattern = path.join(sourceDir, '**/*.scss');

    const sassRenderer = filePath =>
        (resolve, reject) => {
            sass.render({
                file: filePath,
                includePaths: libraries,
                outputStyle: 'compressed',
                importer: (url) => {
                    let resultUrl = url;
                    const pathParts = url.split(path.sep);
                    let modulesCondition = false;

                    if (modules) {
                        modulesCondition = allPaths.has(pathParts[0]);
                    }

                    if (modulesCondition && pathParts.length > 1
                        && !(/^[a-z]{2}_[A-Z]{2}$/gm.test(pathParts[1]))
                    ) {
                        pathParts.splice(1, 0, 'default');
                        resultUrl = path.join.apply(null, pathParts);
                    }

                    return { file: resultUrl };
                }
            }, (error, result) => {
                if (error) {
                    reject({ file: filePath, error });
                } else {
                    resolve({ file: filePath, css: autoprefixer.process(result.css).css });
                }
            });
        };

    const compilationArray = shell.find(filePattern).filter(file => {
        const lastDir = file.lastIndexOf('/');
        return file[lastDir + 1] !== '_';
    });

    return new Promise((resolve, reject) => {
        Promise.all(compilationArray.map(filePath => new Promise(sassRenderer(filePath))))
            .then(values => {
                const changedFiles = [];
                console.log('Files written:');

                values.forEach(value => {
                    const fileName = value.file.replace('.scss', '.css');
                    const offsetPath = path.relative(sourceDir, fileName);
                    const pathParts = offsetPath.split(path.sep);
                    let locale = '';

                    if (pathParts.length > 0
                        && (pathParts[0] === 'default'
                        || /^[a-z]{2}_[A-Z]{2}$/gm.test(pathParts[0]))
                    ) {
                        locale = pathParts[0];
                    }

                    const targetDirectory = path.join(
                        pwd,
                        '../cartridges/'
                        + currentCartridgeName
                        + '/cartridge/static/'
                        + locale
                        + '/css');
                    const offsetPathFile = offsetPath.substring(offsetPath.indexOf(path.sep) + 1);
                    const targetFile = path.join(targetDirectory, offsetPathFile);

                    if (!fs.existsSync(path.dirname(targetFile))) {
                        shell.mkdir('-p', path.dirname(targetFile));
                    }

                    if (fs.existsSync(targetFile)) {
                        const fileContent = shell.cat(targetFile);

                        if (fileContent.toString() !== value.css) {
                            changedFiles.push(targetFile);
                        }
                    }

                    fs.writeFileSync(targetFile, value.css);
                    console.log(offsetPathFile);
                });

                resolve(changedFiles);
            }).catch(error => {
                console.error(chalk.red('Failed to compile scss files. ' + error));
                reject(error);
            });
    });
};
