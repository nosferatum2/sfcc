'use strict';

const shell = require('shelljs');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const cwd = process.cwd();

/**
 * @function
 * @desc Creates the aliases for the JS/Sass file directories for each cartridge in the project
 * https://webpack.js.org/configuration/resolve/#resolve-alias
 * @param {String} packageFile - reference to package.json file for the project
 * @param {String} pwd - reference to working directory of the project
 * @param {Boolean} returnSass - determines if the aliases should be Sass directories instead of JS directories
 */
const createAliases = (packageFile, pwd, returnSass) => {
    const convertToSass = returnSass || false;
    let aliases = {};

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
                        .filter(folder => { fs.lstatSync(folder).isDirectory });

                    locales.forEach(locale => {
                        const name = path.basename(locale);

                        if (name !== 'default') {
                            aliases[`${item}/${name}`] = path.join(locale, 'js');
                        }
                    });
                }
                
                if (isBuildEnvironment('verbose')) {
                    console.log('Created aliases: ');
                    Object.keys(aliases).forEach(key => {
                        console.log('    ' + key + ' is ' + aliases[key]);
                    });
                    console.log(chalk.gray('Looking for inner packages...'));
                }

                /**
                 * I think this is for stitching together all of the paths for the plugin architecture.
                 * Not sure if we should expect inner Packages to be "Site" aware with our custom package.json configuration
                 */
                try {
                    const innerPackage = require(path.join(cartridge, '../..', 'package.json'));

                    if (innerPackage.paths) {
                        if (isBuildEnvironment('verbose')) {
                            console.log(chalk.green('    Inner package found.'));
                        }

                        const newAliases = createAliases(innerPackage, pwd);

                        Object.keys(newAliases).forEach(key => {
                            if (!aliases[key]) {
                                aliases[key] = newAliases[key];
                            }
                        });
                    } else if (isBuildEnvironment('verbose')) {
                        console.log(chalk.gray('    No inner package found.'));
                    }
                } catch (e) {
                    if (isBuildEnvironment('verbose')) {
                        console.log(chalk.red('    ' + e));
                        console.log(chalk.gray('    No inner package found.'));
                    }
                }
            }

        });
    }

    // Convert the JS directories to Sass directories if requested
    if (convertToSass) {
        // Just replacing the js with a scss, as long as there are no combinations of letters with js next to each other this will work?
        const cssAliases = {};

        Object.keys(aliases).forEach(key => {
            cssAliases[key] = aliases[key].replace(path.sep + 'js', path.sep + 'scss');
        });

        aliases = cssAliases;
    }

                    
    if (isBuildEnvironment('verbose')) {
        console.log(chalk.black.bgGreen('Generated aliases:'));
        for (let name in aliases) {
            console.log(chalk.blue(name) + ' is ' + chalk.gray(aliases[name]));
        }
    }

    return aliases;
};

/**
 * @function
 * @desc Creates the Javascript file paths for each given cartridge
 * @param {String} packageName - reference to cartridge to create Javascript paths for
 */
function createJsPath(packageName) {
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
}

/**
 * @function
 * @desc Creates the Sass file paths for each given cartridge
 * @param {String} packageName - reference to cartridge to create Sass paths for
 */
function createScssPath(packageName) {
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
}

/**
 * @name isBuildEnvironment
 * @description checks whether the build environment flag exists 
 * and is either equal to true or the passed value
 * @param {String} key
 * @param {String} value - optional
 * @returns {Boolean}
 */
function isBuildEnvironment(key, value) {
    return (value) ? (process.env.hasOwnProperty(key) && process.env[key] === value) : 
                     (process.env.hasOwnProperty(key) && process.env[key] === 'true')
}

module.exports = {
    /** updated packageName as a parameter so we can build multiple sites */
    createJsPath,
    /** updated packageName as a parameter so we can build multiple sites */
    createScssPath,
    isBuildEnvironment,
    createAliases,
};

