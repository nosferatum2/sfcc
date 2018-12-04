/* globals cat, cd, cp, echo, exec, exit, find, ls, mkdir, rm, target, test */
'use strict';
try {
    require('shelljs/make');
    const path = require('path');
    const webpack = require('webpack');
    const chalk = require('chalk');
    const helpers = require('./helpers');

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

    module.exports = function (packageName) {        
        const mode = process.env.mode;
        console.log(chalk.yellow('Using ' + mode + ' mode'));

        const entryFiles = (helpers.isBuildEnvironment('compile', 'css')) ? helpers.createScssPath(packageName) : helpers.createJsPath(packageName);

        if (!entryFiles) { 
            return false;
        }

        if (helpers.isBuildEnvironment('verbose')) {
            console.log(chalk.gray('Webpack(ing) entry files'));
            for (let key in entryFiles) {
                console.log('   ' + chalk.gray(entryFiles[key]));
            }
        }

        const webpackConfig = [];
        if (helpers.isBuildEnvironment('compile', 'js')) {
            return {
                mode: mode.toString(),
                name: 'js',
                entry: entryFiles,
                output: {
                    path: path.resolve('./cartridges/' + packageName + '/cartridge/static'),
                    filename: '[name].js'
                },
                module: {
                    rules: [
                        {
                            test: /bootstrap(.)*\.js$/,
                            use: {
                                loader: 'babel-loader',
                                options: {
                                    presets: ['@babel/env'],
                                    plugins: ['@babel/plugin-proposal-object-rest-spread'],
                                    cacheDirectory: true
                                }
                            }
                        }
                    ]
                },
                plugins: [
                    new webpack.ProvidePlugin(bootstrapPackages)
                ]
            };
        }

        if (helpers.isBuildEnvironment('compile', 'css')) {
            return {
                mode: mode.toString(),
                name: 'scss',
                entry: entryFiles,
                output: {
                    path: path.resolve('./cartridges/' + packageName + '/cartridge/static'),
                    filename: '[name].js'
                },
                module: {
                    rules: [
                        helpers.getCssLoaders(mode)
                    ]
                },
                plugins: helpers.getCssPlugins(mode),
                devtool: helpers.isBuildEnvironment('cssSourceMaps') ? 'cheap-module-source-map' : 'none'
            };
        }
    };
} catch (e) {
    console.log('... caught exception ' + e.toString());
}
