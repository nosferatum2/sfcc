'use strict';

const path = require('path');
const shell = require('shelljs');
const spawn = require('child_process').spawn;
const fs = require('fs');

const pwd = __dirname;

/**
 * @function
 * @desc Removes the given temporary directory
 * @param TEMP_DIR
 * @returns
 */
function clearTmp(TEMP_DIR) {
    shell.rm('-rf', TEMP_DIR);
}

module.exports = (packageFile, pwd, callback) => {
    const sites = packageFile.sites;

    for (var site in sites) {
        const modules = sites[site].paths;
        const currentCartridgeName = sites[site].packageName;
        const TEMP_DIR = path.resolve(pwd, './tmp/' + currentCartridgeName + '/');
        const TEMP_JS_DIR = path.join(TEMP_DIR, 'js');

        if (modules && currentCartridgeName) {
            // copy all nessessary js files from cartridges specified in package.json
            const currentJsDir = path.join(pwd, '../cartridges/' +
                currentCartridgeName + '/cartridge/', 'client/js/default');

            shell.mkdir('-p', TEMP_DIR);
            shell.cp('-r', currentJsDir, TEMP_JS_DIR);

            Object.keys(modules).forEach(key => {
                const currentPath = path.join(pwd, modules[key], 'cartridge/client/js/default/*');

                if (fs.existsSync(path.join(pwd, modules[key], 'cartridge/client/js/default')) && 
                        shell.ls(path.join(pwd, modules[key], 'cartridge/client/js/default')).length) {
                    shell.cp('-r', currentPath, TEMP_JS_DIR);
                }
            });
        }

        const webpack = path.resolve(pwd, '../node_modules/.bin/webpack');
        const webpackArgs = ['--env.cartridge', currentCartridgeName];
        const subprocess = spawn(webpack, webpackArgs , { stdio: 'inherit', shell: true, cwd: pwd });

        subprocess.on('exit', code => {
            clearTmp(TEMP_DIR);
        });
    }
};
