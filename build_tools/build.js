#!/usr/bin/env node

'use strict';

const shell = require('shelljs');
const spawn = require('child_process').spawn;
const path = require('path');
const fs = require('fs');
const css = require('./cssCompile');
const js = require('./jsCompile');
const createCartridge = require('./createCartridge');
const deployData = require('./deployData');
const generateSystemObjectReports = require('./systemObjectsReport');
const Webdav = require('./util/webdav');
const chalk = require('chalk');
const chokidar = require('chokidar');
const os = require('os');
const util = require('util');

const cwd = process.cwd();
const pwd = __dirname;
const TEMP_DIR = path.resolve(cwd,'./tmp');

// Base Build Options
const optionator = require('optionator')({
    options: [{
        option: 'help',
        alias: 'h',
        type: 'Boolean',
        description: 'Generate help message'
    }, {
        option: 'upload',
        type: '[path::String]',
        description: 'Upload a file to a sandbox. Requires dw.json file in the build_tools directory.'
    }, {
        option: 'uploadCartridge',
        type: '[String]',
        description: 'Upload a cartridge. Requires dw.json file in the build_tools directory.'
    }, {
        option: 'test',
        type: '[path::String]',
        description: 'Run unittests on specified files/directories.'
    }, {
        option: 'cover',
        type: 'Boolean',
        description: 'Run all unittests with coverage report.'
    }, {
        option: 'compile',
        type: 'String',
        description: 'Compile css/js files.',
        enum: ['css', 'js']
    }, {
        option: 'lint',
        type: 'String',
        description: 'Lint scss/js files.',
        enum: ['js', 'server-js', 'css']
    }, {
        option: 'createCartridge',
        type: 'String',
        description: 'Create new cartridge structure'
    }, {
        option: 'watch',
        type: 'Boolean',
        description: 'Watch and upload files'
    }, {
        option: 'onlycompile',
        type: 'Boolean',
        description: 'Only compile during the watch option.'
    }, {
        option: 'deploy-data',
        type: 'Boolean',
        description: 'Deploy data using the settings in package.json',
        required: false
    }, {
        option: 'cartridge',
        type: '[String]',
        description: 'List of cartridges to be uploaded',
        required: false
    }, {
        option: 'username',
        type: 'String',
        description: 'Username to log into sandbox',
        required: false
    }, {
        option: 'password',
        type: 'String',
        description: 'Password to log into sandbox',
        required: false
    }, {
        option: 'hostname',
        type: '[String]',
        description: 'Sandbox URL(s) (without the "https://" prefix)',
        required: false
    }, {
        option: 'cert-hostname',
        type: '[String]',
        description: 'Certificate Sandbox URL(s) (without the "https://" prefix)',
        required: false
    }, {
        option: 'activation-hostname',
        type: '[String]',
        description: 'Activation Sandbox URL(s) (without the "https://" prefix)',
        required: false
    }, {
        option: 'code-version',
        type: 'String',
        description: 'Code version folder name',
        required: false
    }, {
        option: 'verbose',
        alias: 'v',
        type: 'Boolean',
        description: 'Activate verbose mode',
        required: false
    }, {
        option: 'skip-upload',
        type: 'Boolean',
        description: 'Skips the upload step',
        required: false,
        default: false
    }, {
        option: 'root',
        type: 'String',
        description: 'The root file path to resolve to relative to the actual file path on disk. This option is useful for deleting or uploading a file. Do not use this if uploading a cartridge, that is taken care of for you.',
        required: false,
        default: '.'
    }, {
        option: 'exclude',
        type: '[path::String]',
        description: 'Exclude patterns. This works for both files and folders. To exclude a folder, use `**/foldername/**`. The `**` after is important, otherwise child directories of `foldername` will not be excluded.',
        required: false
    }, {
        option: 'include',
        type: '[path::String]',
        description: 'Include paths.'
    }, {
        option: 'p12',
        type: 'path::String',
        description: 'The p12 file to be used for 2-factor authentication.',
        required: false
    }, {
        option: 'passphrase',
        type: 'String',
        description: 'The passphrase to be used for 2-factor authentication.',
        required: false
    }, {
        option: 'self-signed',
        type: 'Boolean',
        description: 'Stops the check for a signature on the SSL cert.',
        required: false,
        default: false
    }, {
        option: 'data-bundle',
        type: 'String',
        description: 'The data bundle that will be deployed. Data bundles are defined in package.json',
        required: false,
        default: 'core'
    }, {
        option: 'generate-object-report',
        type: 'Boolean',
        description: 'Generates a text file that contains HTML with a table of system objects',
        required: false
    }]
});

// Upload Cartridge Options
/* Likely remove since this is handled above?
const uploadCartridgeOptionator = require('optionator')({
    options: []
});
*/

function checkForDwJson() {
    return fs.existsSync(path.join(pwd, './build_tools/dw.json'));
}

function clearTmp() {
    if (options.verbose) {
        console.log(chalk.green('build.js:clearTmp()'));
    }
    shell.rm('-rf', TEMP_DIR);
}

function dwuploadModule() {

    let dwupload = fs.existsSync(path.resolve(cwd, './node_modules/.bin/dwupload')) ?
        path.resolve(cwd, './node_modules/.bin/dwupload') :
        path.resolve(pwd, './node_modules/.bin/dwupload');

    if (os.platform() === 'win32') {
        dwupload += '.cmd';
    }
    return dwupload;	
}

function shellCommands(param, fileOrCartridge) {
    const dwupload = dwuploadModule();

    if (os.platform() === 'win32') {
        return `cd ./cartridges && ${dwupload} ${param} ${fileOrCartridge} && cd..`;
    }
    return `cd ./cartridges && node ${dwupload} ${param} ${fileOrCartridge} && cd ..`;
}

function uploadFiles(files) {
    shell.cp('./build_tools/dw.json', './cartridges/'); // copy dw.json file into cartridges directory temporarily
    

    files.forEach(file => {
        const relativePath = path.relative(path.join(cwd, './cartridges/'), file);
        shell.exec(shellCommands('--file', relativePath));
        console.log(`Uploading ${file}`);
    });
    shell.rm('./cartridges/dw.json'); // remove dw.json file from cartridges directory
}

function camelCase(str) {
    return str.replace(/^.|-./g, function(letter, index) {
        return index == 0 ? letter.toLowerCase() : letter.substr(1).toUpperCase();
    });
}

function getDirectories(path) {
    return fs.readdirSync(path).filter(function (file) {
      return fs.statSync(path+'/'+file).isDirectory();
    });
}

function deleteFiles(files) {
    shell.cp("./build_tools/dw.json", './cartridges'); // copy dw.json file into cartridges directory temporarily

    files.forEach(file => {
            const realativePath = path.relative(path.join(cwd, './cartridges'), file);
            shell.exec(shellCommands('delete --file', relativePath));
    });
    shell.rm('./cartridges/dw.json'); // remove dw.json file from cartridges directory
}

function createIstanbulParameter(option, command) {
    let commandLine = ' ';
    if (option) {
            commandLine = option.split(',').map(commandPath => ' -' + command + ' ' + commandPath.join(' ') | ' ');
    }
    return commandLine;
}

/**
 * @function
 * @desc Builds the upload options based on the arguments passed in
 * @param {Boolean} isData - Is this is a data upload
 * @returns [String]
 */
function getUploadOptions(isData) {
    let uploadOptions = [
        'cartridge',
        'username',
        'password',
        'hostname',
        'cert-hostname',
        'activation-hostname',
        'code-version',
        'verbose',
        'skip-upload',
        'root',
        'exclude',
        'p12',
        'passphrase',
        'self-signed',
        'data-bundle'
    ],
    uploadArguments = {};

    // Create the argument list/object based on the dw.json file if present
    if (checkForDwJson()) {
        const localSettings = require(path.join(pwd, './dw.json'));

        Object.keys(localSettings).forEach(uploadOption => {
            if (localSettings[uploadOption]) {
                uploadArguments[uploadOption] = localSettings[uploadOption];
            }
        });
    }

    // Create the argument list/object based on the argv options if present and override any previous dw.json options
    uploadOptions.forEach(uploadOption => {
        if (options[camelCase(uploadOption)]) {
            if (uploadOption === 'code-version') {
                let versionName = 'version1';

                if (options['codeVersion']) {
                    versionName = options.codeVersion;
                } else if (process.env.BUILD_TAG) {
                    versionName = process.env.BUILD_TAG;
                }

                uploadArguments[camelCase(uploadOption)] = versionName;
            } else {
                uploadArguments[camelCase(uploadOption)] = options[camelCase(uploadOption)];
            }
        }
    });

    return uploadArguments;
}

const options = optionator.parse(process.argv);

if (options.help) {
    console.log(optionator.generateHelp());
    process.exit(0);
}

// upload a file
if (options.upload) {
    if (!checkForDwJson) {
        console.error(chalk.red('Could not find dw.json file in build_tools folder.'));
        process.exit(1);
    }

    uploadFiles(options.upload);

    process.exit(0);
}

// upload cartridge
if (options.uploadCartridge) {
    if (checkForDwJson()) {
        shell.cp(path.join(pwd, 'dw.json'), path.join(pwd, '../cartridges/'));
    } else {
        console.warn(chalk.yellow('Could not find dw.json file at the root of the project. Continuing with command line arguments only.'));
    }

    const dwupload = path.resolve(pwd, '../node_modules/.bin/dwupload');
    const uploadArguments = getUploadOptions();
    let cartridgesFound = false;
    let commandLineArgs = [];

    for (var myArgument in uploadArguments) {
        console.log(chalk.yellow(myArgument + " is " + uploadArguments[myArgument]));
    }

    Object.keys(uploadArguments).forEach((uploadOption) => {
        if (uploadOption !== 'hostname' && uploadOption !== 'activationHostname') {
            commandLineArgs.push('--' + uploadOption, options[camelCase(uploadOption)]);

            if (uploadOption === 'cartridge') {
                cartridgesFound = true;
            }
        }
    });

    // Get the cartridge list from the directory directly if no specific cartridges were provided
    if (!cartridgesFound) {
        const cartridges = getDirectories('../cartridges').join(',');
        commandLineArgs.push('--cartridge', cartridges);
    }

    uploadArguments['hostname'].forEach((hostname) => {
        let argsClone = commandLineArgs.slice(0);
        argsClone.push('--hostname', hostname);
        const dwuploadScript = 'cd ./cartridges && ' + dwupload + ' ' + argsClone.join(' ');

        console.log('Upload Commands: '+ dwuploadScript);

        shell.exec(dwuploadScript);
    });

    if (typeof uploadArguments.activationHostname != 'undefined' && uploadArguments.activationHostname.length > 0) {
        const activationHostnames = uploadArguments.activationHostname;
        delete uploadArguments.activationHostname;

        activationHostnames.forEach((activationHostname) => {
            uploadArguments['activationHostname'] = activationHostname;
            const webdav = new Webdav(uploadArguments);
            webdav.formLogin().then(() => {
                webdav.activateCode().then(() => {
                    if (checkForDwJson()) {
                        shell.rm(path.join(pwd, '../cartridges/dw.json'));
                    }

                    process.exit(0);
                });
            });
        });
    } else {
        if (checkForDwJson()) {
            shell.rm(path.join(pwd, '../cartridges/dw.json'));
        }

        process.exit(0);
    }
}

// run unit tests
if (options.test) {
    const mocha = fs.existsSync(path.resolve(cwd, './node_modules/.bin/_mocha')) ?
        path.resolve(cwd, './node_modules/.bin/_mocha') :
        path.resolve(pwd, './node_modules/.bin/_mocha');
    
    const subprocess = spawn(
        mocha +
        ' --reporter spec ' +
        options.test.join(' '), { stdio: 'inherit', shell: true, cwd });

    subprocess.on('exit', code => {
        process.exit(code);
    });
}

// run unit test coverage
if (options.cover) {
    const istanbul = fs.existsSync(path.resolve(cwd, './node_modules/.bin/istanbul')) ?
        path.resolve(cwd, '../node_modules/.bin/istanbul') :
        path.resolve(pwd, '../node_modules/.bin/istanbul');
        
    const mocha = fs.existsSync(path.resolve(cwd, './node_modules/.bin/_mocha')) ?
        path.resolve(cwd, './node_modules/mocha/bin/_mocha') :
        path.resolve(pwd, './node_modules/mocha/bin/_mocha');

    const subprocess = spawn(
        istanbul +
        ' cover ' +
        createIstanbulParameter(options.exclude, 'x') +
        createIstanbulParameter(options.include, 'i') +
        mocha +
        ' -- -R spec test/unit/**/*.js', { stdio: 'inherit', shell: true, cwd });

    subprocess.on('exit', code => {
        process.exit(code);
    });
}

// compile static assets
if (options.compile) {
    const packageFile = require(path.join(cwd, './package.json'));
    if (options.compile === 'js') {
        js(packageFile, pwd, code => {
            process.exit(code);
        });
    }
    if (options.compile === 'css') {
        // Customized to loop through each site and provide single site config for build
        // so this script should be the only "site aware" one
        Object.keys(packageFile.sites).forEach(siteIndex => {
            if (options.verbose) {
                for (var key in packageFile.sites[siteIndex]){
                    console.log(chalk.green('passing in ' + key + ' ' + packageFile.sites[siteIndex][key]));
                }
            }
            css(packageFile.sites[siteIndex], pwd, code => {
                process.exit(code);
            });
        });
    }
}

if (options.lint) {
    if (options.lint === 'js') {
        const subprocess = spawn(
            path.resolve(cwd, './node_modules/.bin/eslint') +
            ' .', { stdio: 'inherit', shell: true, cwd });

        subprocess.on('exit', code => {
            process.exit(code);
        });
    }

    if (options.lint === 'server-js') {
        const subprocess = spawn(
            path.resolve(pwd, '../node_modules/.bin/eslint') +
            ' ../cartridges/**/controllers/**/*.js' +
            ' ../cartridges/**/models/**/*.js' +
            ' ../cartridges/**/scripts/**/*.js' +
            ' ../cartridges/modules/server/*.js' +
            ' ../cartridges/modules/server.js' , { stdio: 'inherit', shell: true, cwd });

        subprocess.on('exit', code => {
            process.exit(code);
        });
    }

    if (options.lint === 'css') {
        const subprocess = spawn(
            path.resolve(pwd, '../node_modules/.bin/stylelint') +
            ' --syntax scss "../**/*.scss"', { stdio: 'inherit', shell: true, cwd: pwd });

        subprocess.on('exit', code => {
            process.exit(code);
        });
    }
}

if (options.createCartridge) {
    const cartridgeName = options.createCartridge;
    console.log('Created folders and files for cartridge ' + cartridgeName);
    createCartridge(cartridgeName, cwd);
}

if (options.watch) {
    const packageFile = require(path.join(cwd, './package.json'));

    const cartridgesPath = path.join(cwd, 'cartridges');

    const scssWatcher = chokidar.watch(
        cartridgesPath + '/**/*.scss', {
                persistent: true,
                ignoreInitial: true,
                followSymlinks: false,
                awaitWriteFinish: {
                    stabilityThreshold: 300,
                    pollInterval: 100
                }
    });

    const clientJSWatcher = chokidar.watch(
        cartridgesPath + '/**/client/**/*.js', {
            persistent: true,
            ignoreInitial: true,
            followSymlinks: flase,
            awaitWriteFinish: {
                    stabilityThreshold: 300,
                    pollInterval: 100
            }
        });

    if (!options.onlycompile) {

        const watcher = chokidar.watch(cartridgesPath, {
            ignored: [
                '**/cartridge/js/**',
                '**/cartridge/client/**',
                '**/*.scss'
            ],
            persistent: true,
            ignoreInitial: true,
            followSymlinks: false,
            awaitWriteFinish: {
                stabilityThreshold: 300,
                pollInterval: 100
            }
        });

        watcher.on('change', filename => {
            console.log('Detected change in file:', filename);
            uploadFiles([filename]);
        });

        watcher.on('add', filename => {
            console.log('Detected added file:', filename);
            uploadFiles([filename]);
        });

        watcher.on('unlink', filename => {
            console.log('Detected deleted file:', filename);
            deleteFiles([filename]);
        });
    }

    let jsCompilingInProgress = false;
            clientJSWatcher.on('change', filename => {
            console.log('Detected change in client JS file:', filename);
    	     if (!jsCompilingInProgress) {
    	            jsCompilingInProgress = true;
    	            js(packageFile, pwd, () => { jsCompilingInProgress = false; });
    	        } else {
    	            console.log('Compiling already in progress.');
    	        }
    	    });
    	
    	    let cssCompilingInProgress = false;
    	    scssWatcher.on('change', filename => {
    	        console.log('Detected change in SCSS file:', filename);
    	
    	        if (!cssCompilingInProgress) {
    	            cssCompilingInProgress = true;
    	            css(packageFile, options).then(() => {
    	                clearTmp();
    	                console.log(chalk.green('SCSS files compiled.'));
    	                cssCompilingInProgress = false;
    	            }).catch(error => {
    	                clearTmp();
    	                console.error(chalk.red('Could not compile css files.'), error);
    	                cssCompilingInProgress = false;
    	            });
    	        } else {
    	            console.log('Compiling already in progress.');
    	        }
    	    });
}

if (options.deployData) {
    console.log('Deploying data...');
    const uploadArguments = getUploadOptions();

    if (uploadArguments.hostname && uploadArguments.username && uploadArguments.password) {
        deployData(uploadArguments);
    } else if (!uploadArguments.hostname) {
        console.error('Error: Please provide a hostname to deploy data');
    } else if (!uploadArguments.username) {
        console.error('Error: Please provide a username to deploy data');
    } else if (!uploadArguments.password) {
        console.error('Error: Please provide a password to deploy data');
    }
}

if (options.generateObjectReport) {
    console.log('Generating Object Report');
    const uploadArguments = getUploadOptions();
    generateSystemObjectReports(uploadArguments);
}
