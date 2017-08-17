'use strict';

const path = require('path');
const shell = require('shelljs');
const spawn = require('child_process').spawn;
const fs = require('fs');

const pwd = __dirname;
const TEMP_DIR = path.resolve(pwd, './tmp');

function clearTmp() {
    shell.rm('-rf', TEMP_DIR);
}

module.exports = (packageFile, pwd, callback) => {
    const modules = packageFile.paths;
    const TEMP_JS_DIR = path.join(TEMP_DIR, 'js');
    const currentCartridgeName = packageFile.packageName || packageFile.name;

    if (modules) {
        // copy all nessessary js files from cartridges specified in package.json
        const currentJsDir = path.join(pwd, '../cartridges/' +
            currentCartridgeName + '/cartridge/', 'client/js/default');
        shell.mkdir('-p', TEMP_DIR);
        shell.cp('-r', currentJsDir, TEMP_JS_DIR);
        Object.keys(modules).forEach(key => {
            const currentPath = path.join(pwd, modules[key], 'cartridge/client/js/default/*');
            shell.cp('-R', currentPath, TEMP_JS_DIR);
        });
    }
    const webpack = path.resolve(pwd, '../node_modules/.bin/webpack');

    const subprocess = spawn(webpack, { stdio: 'inherit', shell: true, cwd: pwd });

    subprocess.on('exit', code => {
        clearTmp();
        callback(code);
    });
};
