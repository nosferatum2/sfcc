'use strict';

const path = require('path');
const shell = require('shelljs');
const spawn = require('child_process').spawn;
const fs = require('fs');

const cwd = process.cwd();
const TEMP_DIR = path.resolve(cwd, './tmp');

function clearTmp() {
    shell.rm('-rf', TEMP_DIR);
}

module.exports = (packageFile, pwd, callback) => {
    const modules = packageFile.paths;
    const TEMP_JS_DIR = path.join(TEMP_DIR, 'js');
    const currentCartridgeName = packageFile.packageName || packageFile.name;

    if (modules) {
        // copy all nessessary js files from cartridges specified in package.json
        const currentJsDir = path.join(cwd, 'cartridges/' +
            currentCartridgeName + '/cartridge/', 'client/js/default');
        shell.mkdir('-p', TEMP_DIR);
        shell.cp('-r', currentJsDir, TEMP_JS_DIR);
        Object.keys(modules).forEach(key => {
            const currentPath = path.join(cwd, modules[key], 'cartridge/client/js/default');
            const target = path.join(TEMP_JS_DIR, key);
            shell.cp('-r', currentPath, target);
        });
    }
    const webpack = fs.existsSync(path.resolve(cwd, '../node_modules/.bin/webpack')) ?
        path.resolve(cwd, '../node_modules/.bin/webpack') :
        path.resolve(pwd, '../node_modules/.bin/webpack');

    const subprocess = spawn(webpack, { stdio: 'inherit', shell: true, cwd });

    subprocess.on('exit', code => {
        clearTmp();
        callback(code);
    });
};
