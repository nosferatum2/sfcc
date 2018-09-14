'use strict';

const path = require('path');
const webpack = require('webpack');
const helpers = require('./helpers');
const util = require('./util');
const chalk = require('chalk');

const cwd = process.cwd();
const verbose = false;

module.exports = (sitePackageConfig, cartridgeName, pwd, callback) => {
    // adjusted to pwd for LyonsCG folder structure
    const cssAliases = helpers.createAliases(sitePackageConfig, pwd, true);

    if (verbose) {
        console.log(chalk.black.bgGreen('Recieved cssAliases object from helpers.js'));
        for(var name in cssAliases ){
            console.log(chalk.blue(name) + ' is ' + chalk.gray(cssAliases[name]));
        }
    }

    if (verbose) {
        console.log(chalk.gray('Loading Webpack config '+ path.join(cwd, './build_tools/webpack.config.js')) + ' with parameter '  + sitePackageConfig.packageName);
    }

    // passing webpackConfig the name of the package we are compiling to
    const webpackConfig = require(path.join(cwd, './build_tools/webpack.config.js'))(cartridgeName);

    if (verbose) {
        console.log(chalk.green('Success. Loaded '+ path.join(cwd, './build_tools/webpack.config.js')));
        console.log(chalk.cyan('Note:') + ' You may see Webpack complain about no such target: --compile or css / js etc. That is safe to ignore.');
    }

    const scssConfig = webpackConfig.find(item => item.name === 'scss');

    if (scssConfig) {
        let newResolve = {
            alias: cssAliases,
            extensions: ['.scss']
        };

        if (scssConfig.resolve) {
            newResolve = util.mergeDeep(scssConfig.resolve, newResolve);
        }

        scssConfig.resolve = newResolve;

        webpack(scssConfig, (err, stats) => {
            if (err) {
                console.error(err);
                callback(1);
                return;
            }

            if (verbose) {
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