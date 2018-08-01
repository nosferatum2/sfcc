'use strict';

const path = require('path');
const webpack = require('webpack');
const helpers = require('./helpers');
const util = require('./util');
const chalk = require('chalk');

const cwd = process.cwd();

module.exports = (verbose, sitePackageConfig, pwd, callback) => {
    const jsAliases = helpers.createAliases(sitePackageConfig, pwd, verbose);
    if (verbose) {
        console.log(chalk.gray('Loading Webpack config '+ path.join(cwd, './build_tools/webpack.config.js')) + ' with parameter '  + sitePackageConfig.packageName);
    }
    const webpackConfig = require(path.join(cwd, './build_tools/webpack.config.js'))(sitePackageConfig.packageName, verbose);
    if (verbose) {
        console.log(chalk.green('Success. Loaded '+ path.join(cwd, './build_tools/webpack.config.js')));
        console.log(chalk.cyan('Note:') + ' You may see Webpack complain about no such target: --compile or css / js etc. That is safe to ignore.');
    }
    const jsConfig = webpackConfig.find(item => item.name === 'js');

    if (jsConfig) {
        let newResolve = {
            alias: jsAliases,
            extensions: ['.js']
        };
        if (jsConfig.resolve) {
            newResolve = util.mergeDeep(jsConfig.resolve, newResolve);
        }
        jsConfig.resolve = newResolve;
    }

    webpack(jsConfig, (err, stats) => {
        if (err) {
            console.error(err);
            callback(1);
            return;
        }
        console.log(stats.toString({
            chunks: false,
            colors: true
        }));
        callback(0);
    });
};