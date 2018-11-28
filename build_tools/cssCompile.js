'use strict';

const path = require('path');
const webpack = require('webpack');
const helpers = require('./helpers');
const util = require('./util');
const chalk = require('chalk');

const cwd = process.cwd();

module.exports = (sitePackageConfig, cartridgeName, pwd, aliases, callback) => {
    
    const webpackConfig = require(path.join(cwd, './build_tools/webpack.config.js'))(cartridgeName);

    if (helpers.isBuildEnvironment('verbose')) {
        console.log(chalk.green('Success. Loaded '+ path.join(cwd, './build_tools/webpack.config.js')));
        console.log(chalk.cyan('Note:') + ' You may see Webpack complain about no such target: --compile or css / js etc. That is safe to ignore.');
    }

    if (webpackConfig) {
        let newResolve = {
            alias: aliases,
            extensions: ['.scss']
        };

        if (webpackConfig.resolve) {
            newResolve = util.mergeDeep(webpackConfig.resolve, newResolve);
        }

        webpackConfig.resolve = newResolve;

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
            }

            callback(0);
            return;
        });
    } else {
        callback(0);
        return;
    }
};