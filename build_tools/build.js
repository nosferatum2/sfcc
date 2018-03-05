#!/usr/bin/env node

'use strict';

const shell = require('shelljs');
const spawn = require('child_process').spawn;
const path = require('path');
const fs = require('fs');
const css = require('./cssCompile');
const js = require('./jsCompile');
const createCartridge = require('./createCartridge');
const chalk = require('chalk');

const pwd = __dirname;
const TEMP_DIR = path.resolve(pwd, './tmp');

// Base Build Options
const optionator = require('optionator')({
    options: [{
        option: 'help',
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
        type: 'String',
        description: 'Sandbox URL (without the "https://" prefix)',
        required: false
    }, {
        option: 'code-version',
        type: 'String',
        description: 'Code version folder name',
        default: 'version1',
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
    }]
});

// Upload Cartridge Options
const uploadCartridgeOptionator = require('optionator')({
    options: []
});

function checkForDwJson() {
    return fs.existsSync(path.join(pwd, 'dw.json'));
}

function clearTmp() {
    shell.rm('-rf', TEMP_DIR);
}

function uploadFiles(files) {
    shell.cp('dw.json', '../cartridges/'); // copy dw.json file into cartridges directory temporarily

    const dwupload = path.resolve(pwd, '../node_modules/.bin/dwupload');

    files.forEach(file => {
        const relativePath = path.relative(path.join(pwd, '../cartridges/'), file);
        shell.exec('cd ../cartridges && node ' +
            dwupload +
            ' --file ' + relativePath);
        console.log(`Uploading ${file}`);
    });

    shell.rm('../cartridges/dw.json'); // remove dw.json file from cartridges directory
}

function camelCase(str) {
    return str.replace(/^.|-./g, function(letter, index) {
        return index == 0 ? letter.toLowerCase() : letter.substr(1).toUpperCase();
    });
}

const options = optionator.parse(process.argv);

if (options.help) {
    console.log(optionator.generateHelp());
    process.exit(0);
}

// upload a file
if (options.upload) {
    if (!checkForDwJson) {
        console.error(chalk.red('Could not find dw.json file at the root of the project.'));
        process.exit(1);
    }

    uploadFiles(options.upload);

    process.exit(0);
}

// upload cartridge
if (options.uploadCartridge) {
    if (checkForDwJson) {
        shell.cp(path.join(pwd, 'dw.json'), path.join(pwd, '../cartridges/'));
    } else {
        console.warn(chalk.yellow('Could not find dw.json file at the root of the project. Continuing with command line arguments only.'));
    }

    let uploadOptions = [
            'cartridge', 
            'username',
            'password',
            'hostname',
            'code-version',
            'verbose',
            'skip-upload',
            'root',
            'exclude',
            'p12',
            'passphrase',
            'self-signed'
        ],
        uploadArguments = [];

    uploadOptions.forEach(uploadOption => {
        if (options[camelCase(uploadOption)]) {
            uploadArguments.push('--' + uploadOption, options[camelCase(uploadOption)]);
        }
    });

    const dwupload = path.resolve(pwd, '../node_modules/.bin/dwupload');

    const dwuploadScript = 'cd ../cartridges && ' + dwupload + ' ' + uploadArguments.join(' ');
    console.log(dwuploadScript);

    shell.exec(dwuploadScript);

    shell.rm(path.join(pwd, '../cartridges/dw.json'));
    process.exit(0);
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
        css(packageFile).then(() => {
            clearTmp();
            console.log(chalk.green('SCSS files compiled.'));
        }).catch(error => {
            clearTmp();
            console.error(chalk.red('Could not compile css files.'), error);
        });
    }
}

if (options.lint) {
    if (options.lint === 'js') {
        const subprocess = spawn(
            path.resolve(pwd, '../node_modules/.bin/eslint') +
            ' ../cartridges/**/client/js/**/*.js', { stdio: 'inherit', shell: true, cwd: pwd });

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
