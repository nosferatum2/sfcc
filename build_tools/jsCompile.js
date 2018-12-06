'use strict';

const path = require('path');
const webpack = require('webpack');
const helpers = require('./helpers');
const util = require('./util');
const chalk = require('chalk');

const cwd = process.cwd();
const WebpackConfiguration = require('./webpack.config');

module.exports = (cartridgeName, aliases, callback) => {
    // Retrieve Webpack configuration object 
    const webpackConfig = WebpackConfiguration(cartridgeName);

    if (helpers.isBuildEnvironment('verbose')) {
        console.log(chalk.green('Success. Loaded '+ path.join(cwd, './build_tools/webpack.config.js')));
        console.log(chalk.cyan('Note:') + ' You may see Webpack complain about no such target: --compile or css / js etc. That is safe to ignore.');
    }

    // The Webpack configuration object can be empty if no entry points (sass files) are found for the current cartridge
    if (webpackConfig) {
         // Merge the passed aliases with retrieved Webpack configuration
        // @TODO move this logic into webpack.config.js; it should be in the actual creattion of the config object itself
        let resolve = {
            alias: aliases,
            extensions: ['.js']
        };
        if (webpackConfig.resolve) {
            resolve = util.mergeDeep(webpackConfig.resolve, resolve);
        }
        webpackConfig.resolve = resolve;

        webpack(webpackConfig, (err, stats) => {
            if (err) {
                console.error(chalk.red(err));
                callback(0);
                return;
            }

            if (stats.compilation.errors && stats.compilation.errors.length) {
                console.error(chalk.red(stats.compilation.errors));
                callback(0);
                return;
            }

            if (helpers.isBuildEnvironment('verbose')) {
                console.log(stats.toString({
                    chunks: false,
                    colors: true
                }));
            } else {
                console.log(chalk.green('Webpack successfully compiled JS files found in ' + cartridgeName));
                console.log(stats.toString({
                    chunks: false,
                    colors: true
                }));
            }
        
            callback(0);
            return;
        });
    } else {
        callback(0);
        return;
    }
};