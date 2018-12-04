'use strict';

const shell = require('shelljs');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const cwd = process.cwd();

const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const FixStyleOnlyEntriesPlugin = require("webpack-fix-style-only-entries");

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
                
                if (isBuildEnvironment('verbose')) {
                    console.log('Creating aliases for cartridge ' + cartridge);
                }

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
 * @name getJsLoaders
 * @description builds the loaders object for the JS Webpack configuration
 * @param {String} mode - the build mode; 'development or 'production'
 * @returns {Array} loaders
 */
function getJsLoaders(mode) {
    const loaders = new Array();

    // Transpile ES6 into a backwards compatible version of JavaScript in current and older browsers or environments
    loaders.unshift({
        loader: 'babel-loader',
        options: {
            presets: ['@babel/env'],
            plugins: ['@babel/plugin-proposal-object-rest-spread'],
            cacheDirectory: true
        }
    });

    // Caches the result of following loaders on disk (default) or in the database
    if (mode === 'development') {
        loaders.unshift({ loader: 'cache-loader' });
    }

    return loaders;
}

/**
 * @name getJsPlugins
 * @description generates an array of plugins for the JS Webpack configuration
 * @param {String} mode - the build mode; 'development or 'production'
 * @returns {Array} plugins
 */
function getJsPlugins(mode) {
    const bootstrapPackages = {
        Alert: 'exports-loader?Alert!bootstrap/js/src/alert',
        // Button: 'exports-loader?Button!bootstrap/js/src/button',
        Carousel: 'exports-loader?Carousel!bootstrap/js/src/carousel',
        Collapse: 'exports-loader?Collapse!bootstrap/js/src/collapse',
        // Dropdown: 'exports-loader?Dropdown!bootstrap/js/src/dropdown',
        Modal: 'exports-loader?Modal!bootstrap/js/src/modal',
        // Popover: 'exports-loader?Popover!bootstrap/js/src/popover',
        Scrollspy: 'exports-loader?Scrollspy!bootstrap/js/src/scrollspy',
        Tab: 'exports-loader?Tab!bootstrap/js/src/tab',
        Tooltip: 'exports-loader?Tooltip!bootstrap/js/src/tooltip',
        Util: 'exports-loader?Util!bootstrap/js/src/util'
    };

    const plugins = [
        // Automatically load modules (i.e Boostrap modules) instead of having to import or require them everywhere
        new webpack.ProvidePlugin(bootstrapPackages)
    ];

    return plugins;
}


/**
 * @name getCssLoaders
 * @description builds the loaders object for the CSS Webpack configuration
 * @param {String} mode - the build mode; 'development or 'production'
 * @returns {Object} loaders
 */
function getCssLoaders(mode) {
    const sourceMap = isBuildEnvironment('cssSourceMaps', 'true');
    const autoPrefixer = isBuildEnvironment('cssAutoPrefixer', 'true');
    
    const loaders = new Array();
     
    // Compile Sass to CSS
    loaders.unshift({
        loader: 'sass-loader',
        options: {
            sourceMap: sourceMap,
            includePaths: [
                path.resolve('node_modules'),
                path.resolve('node_modules/flag-icon-css/sass')
            ]
        }
    });

    // Automatically add vendor prefixes to CSS rules
    // This increases build time; thus, we can optionally include this loader with the 'cssAutoPrefixer' flag
    if (autoPrefixer) {
        loaders.unshift({
            loader: 'postcss-loader',
            options: {
                sourceMap: sourceMap,
                plugins: [
                    require('autoprefixer')()
                ]
            }, 
        });
    }

    // Intrepret @import and url() like import/require() and will resolve them
    // This loader converts the CSS to a CommonJS JavaScript module
    loaders.unshift({
        loader: 'css-loader',
        options: {
            url: false,
            sourceMap: sourceMap,
            importLoader: loaders.length
        }
    });

    // Extracts CSS from the generated CommonJS JavaScript modules into separate files. 
    loaders.unshift({ loader: MiniCssExtractPlugin.loader });

    // Caches the result of following loaders on disk (default) or in the database
    if (mode === 'development') {
        loaders.unshift({ loader: 'cache-loader' });
    }

    return loaders;
}  

/**
 * @name getCssPlugins
 * @description generates an array of plugins for the CSS Webpack configuration
 * @param {String} mode - the build mode; 'development or 'production'
 * @returns {Array} plugins
 */
function getCssPlugins(mode) {
    const plugins = [
        // Remove generated the unused JS files from our style only entry points
        new FixStyleOnlyEntriesPlugin({
            silent: true
        }),
        // Extracts CSS from the generated CommonJS JavaScript modules into separate files. 
        // Supports MiniCssExtractPlugin.loader
        new MiniCssExtractPlugin({
            filename: "[name].css",
            chunkFilename: "[id].css"
        })
    ];

    if (mode === 'production') {
        // A Webpack plugin to optimize and minimize CSS assets
        // Uses cssnano by default for minification
        plugins.push(new OptimizeCssAssetsPlugin());
    }

    return plugins;
}

module.exports = {
    isBuildEnvironment,
    createAliases,
    createJsPath,
    createScssPath,
    getCssLoaders,
    getCssPlugins    
};

