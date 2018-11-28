/* globals cat, cd, cp, echo, exec, exit, find, ls, mkdir, rm, target, test */
'use strict';
try {
    require('shelljs/make');
    const path = require('path');
    const webpack = require('webpack');
    const ExtractTextPlugin = require('extract-text-webpack-plugin');
    const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
    const MiniCssExtractPlugin = require("mini-css-extract-plugin");
    const FixStyleOnlyEntriesPlugin = require("webpack-fix-style-only-entries");
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
        
        console.log(chalk.bgMagenta('Creating Webpack configuration for ' + packageName));
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
            const plugins = [
                new MiniCssExtractPlugin({
                    filename: "[name].css",
                    chunkFilename: "[id].css"
              })];
            
            if (mode == 'production') {
                plugins.push(new OptimizeCssAssetsPlugin());
            }

            return {
                mode: mode.toString(),
                name: 'scss',
                entry: entryFiles,
                output: {
                    path: path.resolve('./cartridges/' + packageName + '/cartridge/static'),
                    filename: '[name].js'
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
                plugins: plugins,
            };
        }
    };
} catch (e) {
    console.log('... caught exception ' + e.toString());
}
