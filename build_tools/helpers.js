'use strict';

const shell = require('shelljs');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const cwd = process.cwd();

const createAliases = (packageFile, pwd) => {
    const aliases = {};
    if (packageFile.paths) {
        Object.keys(packageFile.paths).forEach(item => {
            if (!aliases[item]) {
                const cartridge = path.resolve(pwd, packageFile.paths[item]);
                console.log('Creating aliases for cartridge ' + cartridge);
                aliases[item] = path.join(cartridge, 'cartridge/client/default/js');
                const clientFolder = path.join(cartridge, 'cartridge/client');
                if (fs.existsSync(clientFolder)) {
                    const locales = fs.readdirSync(clientFolder)
                        .filter(folder => folder.charAt(0) != '.') // added a filter to block hidden folders, like .DS_Store
                        .map(name => path.join(clientFolder, name))
                        .filter(folder => { fs.lstatSync(folder).isDirectory
                        });
                    locales.forEach(locale => {
                        const name = path.basename(locale);
                        if (name !== 'default') {
                            aliases[`${item}/${name}`] = path.join(locale, 'js');
                        }
                    });
                }

                const verbose = process.env.verbose;
                
                if (verbose) {
                    console.log('Created aliases: ');
                    Object.keys(aliases).forEach(key => {
                        console.log( '    ' + key + ' is ' + aliases[key]);
                    });
                    console.log(chalk.gray('Looking for inner packages...'));
                }

                /**
                 * I think this is for stitching together all of the paths for the plugin architecture.
                 * Not sure if we should expect inner Packages to be "Site" aware with our custom package.json configuration
                 */
                const innerPackage = require(path.join(cartridge, '../..', 'package.json'));
                if (innerPackage.paths) {
                    if (verbose) {
                        console.log(chalk.green('    Inner package found.'));
                    }
                    const newAliases = createAliases(innerPackage, pwd, verbose);
                    Object.keys(newAliases).forEach(key => {
                        if (!aliases[key]) {
                            aliases[key] = newAliases[key];
                        }
                    });
                }
                else {
                    if (verbose) {
                        console.log(chalk.gray('    No inner package found.'));
                    }
                }
            }

        });
    }

    return aliases;
};

module.exports = {
    /** updated packageName as a parameter so we can build multiple sites */
    createJsPath: (packageName) => {
        let result = null;
        let jsFiles;

        try {
            jsFiles = shell.ls(path.join(cwd, `./cartridges/${packageName}/cartridge/client/**/js/**/*.js`));
        } catch(e) {
            result = null;
        }

        if (jsFiles) {
            result = {};
            jsFiles.forEach(filePath => {
                let location = path.relative(path.join(cwd, `./cartridges/${packageName}/cartridge/client`), filePath);
                if (location) {
                    location = location.substr(0, location.length - 3);
                    result[location] = filePath;
                }
            });
        }

        return result;
    },
    /** updated packageName as a parameter so we can build multiple sites */
    createScssPath: (packageName) => {
        let result = null;
        let cssFiles;

        try {
            cssFiles = shell.ls(path.join(cwd, `./cartridges/${packageName}/cartridge/client/**/scss/**/*.scss`));
        } catch(e) {
            result = null;
        }

        if (cssFiles) {
            result = {};
            cssFiles.forEach(filePath => {
                const name = path.basename(filePath, '.scss');
                if (name.indexOf('_') !== 0) {
                    let location = path.relative(path.join(cwd, `./cartridges/${packageName}/cartridge/client`), filePath);
                    if (location) {
                        location = location.substr(0, location.length - 5).replace('scss', 'css');
                        result[location] = filePath;
                    }
                }
            });
        }

        return result;
    },
    createAliases
};