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
const util = require('util');

const pwd = __dirname;

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
        option: 'upload-cartridge',
        type: 'Boolean',
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
        option: 'create-cartridge',
        type: 'String',
        description: 'Create new cartridge structure'
    }, {
        option: 'watch',
        type: 'Boolean',
        description: 'Watch and upload files'
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
const uploadCartridgeOptionator = require('optionator')({
    options: []
});

function checkForDwJson() {
    return fs.existsSync(path.join(pwd, 'dw.json'));
}

function uploadFiles(files) {
    if (checkForDwJson()) {
        shell.cp('dw.json', '../cartridges/'); // copy dw.json file into cartridges directory temporarily
    }

    const dwupload = path.resolve(pwd, '../node_modules/.bin/dwupload');

    files.forEach(file => {
        const relativePath = path.relative(path.join(pwd, '../cartridges/'), file);
        shell.exec('cd ../cartridges && node ' +
            dwupload +
            ' --file ' + relativePath);
        console.log(`Uploading ${file}`);
    });

    if (checkForDwJson()) {
        shell.rm('../cartridges/dw.json'); // remove dw.json file from cartridges directory
    }
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
    if (!checkForDwJson()) {
        console.error(chalk.red('Could not find dw.json file at the root of the project.'));
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
        const dwuploadScript = 'cd ../cartridges && ' + dwupload + ' ' + argsClone.join(' ');

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
    const mocha = path.resolve(pwd, '../node_modules/.bin/_mocha');
    const subprocess = spawn(
        mocha +
        ' --reporter spec ' +
        options.test.join(' '), { stdio: 'inherit', shell: true, cwd: pwd });

    subprocess.on('exit', code => {
        process.exit(code);
    });
}

// run unit test coverage
if (options.cover) {
    const istanbul = path.resolve(pwd, '../node_modules/.bin/istanbul');
    const mocha = '../node_modules/mocha/bin/_mocha';

    const subprocess = spawn(
        istanbul +
        ' cover ' +
        mocha +
        ' -- -R spec ../test/unit/**/*.js', { stdio: 'inherit', shell: true, cwd: pwd });

    subprocess.on('exit', code => {
        process.exit(code);
    });
}

// compile static assets
if (options.compile) {
    const packageFile = require(path.join(pwd, '../package.json'));
    if (options.compile === 'js') {
        js(packageFile, pwd, code => {
            process.exit(code);
        });
    }
    if (options.compile === 'css') {
        css(packageFile);
    }
}

if (options.lint) {
    if (options.lint === 'js') {
        const subprocess = spawn(
            path.resolve(pwd, '../node_modules/.bin/eslint') +
            ' ../cartridges/client/**/js/**/*.js', { stdio: 'inherit', shell: true, cwd: pwd });

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
            ' ../cartridges/modules/server.js' , { stdio: 'inherit', shell: true, cwd: pwd });

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
    createCartridge(cartridgeName, pwd);
}

if (options.watch) {
    const packageFile = require(path.join(pwd, '../package.json'));
    fs.watch(path.join(pwd, '../cartridges'), { recursive: true }, (event, filename) => {
        if ([
            '.scss',
            '.js',
            '.properties',
            '.isml',
            '.xml',
            '.jpeg',
            '.jpg',
            '.svg',
            '.gif',
            '.png'
        ].includes(path.extname(filename))) {
            if (filename.includes('cartridge/client')) {
                // recompile client-side js and scss and upload results
                if (path.extname(filename) === '.scss') {
                    css(packageFile).then(changedFiles => {
                        uploadFiles(changedFiles.map(file => `cartridges/${file}`));
                    });
                }
                if (path.extname(filename) === '.js') {
                    js(packageFile, pwd, () => {});
                }
            } else {
                uploadFiles([`cartridges/${filename}`]);
            }
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
