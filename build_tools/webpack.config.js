/* globals cat, cd, cp, echo, exec, exit, find, ls, mkdir, rm, target, test */
'use strict';
try {
    require('shelljs/make');
    const path = require('path');
    const webpack = require('webpack');
    const ExtractTextPlugin = require('extract-text-webpack-plugin');
    const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
    const MiniCssExtractPlugin = require("mini-css-extract-plugin");
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
        console.log(chalk.bgMagenta('Webpack config recieved for ' + packageName));
        
        const mode = process.env.mode;
        console.log(chalk.yellow('Using ' + mode + ' mode in webpack.config.js'));

        const jsFiles = require('./helpers').createJsPath(packageName);
        const scssFiles = require('./helpers').createScssPath(packageName);

        if (helpers.isBuildEnvironment('verbose')) {
            console.log(chalk.gray('Webpack(ing) js files'));
            if (jsFiles) {
                for (let key in jsFiles) {
                    console.log('   ' + chalk.gray(jsFiles[key]));
                }
            }

            console.log(chalk.gray('Webpack(ing) scss files'));
            if (scssFiles) {
                for (let key in scssFiles) {
                    console.log('    ' + chalk.gray(scssFiles[key]));
                }
            }
        }

        const webpackConfig = [];
        if (jsFiles) {
            webpackConfig.push({
                mode: mode.toString(),
                name: 'js',
                entry: jsFiles,
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
            });
        }

        if (scssFiles) {
            const plugins = [
                new MiniCssExtractPlugin({
                // Options similar to the same options in webpackOptions.output
                // both options are optional
                filename: "[name].css",
                chunkFilename: "[id].css"
              })];
            
            if (mode == 'production') {
                plugins.push(new OptimizeCssAssetsPlugin());
            }

            webpackConfig.push({
                mode: mode.toString(),
                name: 'scss',
                entry: scssFiles,
                output: {
                    path: path.resolve('./cartridges/' + packageName + '/cartridge/static'),
                    filename: '[name].css'
                },
                module: {
                    rules: [{
                        test: /\.scss$/,
                        use: [
                        {
                            loader: MiniCssExtractPlugin.loader,
                        },
                        {
                            loader: 'css-loader',
                            options: {
                                url: false,
                                sourceMap: true,
                                importLoader: 2
                            }
                        }, {
                            loader: 'postcss-loader',
                            options: {
                                sourceMap: true,
                                plugins: [
                                    require('autoprefixer')()
                                ]
                            }
                        }, {
                            loader: 'sass-loader',
                            options: {
                                sourceMap: true,
                                includePaths: [
                                    path.resolve('node_modules'),
                                    path.resolve('node_modules/flag-icon-css/sass')
                                ]
                            }
                        }]
                    }]
                },
                devtool: 'cheap-eval-source-map',
                plugins: plugins
            });
        }

        return webpackConfig;
    };
} catch (e) {
    console.log('... caught exception ' + e.toString());
}
