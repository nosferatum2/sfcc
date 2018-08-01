'use strict';

const path = require('path');
const webpack = require('webpack');
const helpers = require('./helpers');
const util = require('./util');
const chalk = require('chalk');

const cwd = process.cwd();

module.exports = (verbose, sitePackageConfig, pwd, callback) => {
    // adjusted to pwd for LyonsCG folder structure
    const jsAliases = helpers.createAliases(sitePackageConfig, pwd, verbose);
    if (verbose) {
        console.log(chalk.black.bgGreen('Recieved jsAliases object from helpers.js'));
        for(var name in jsAliases ){
            console.log(chalk.blue(name) + ' is ' + chalk.gray(jsAliases[name]));
        }
    }
    
    // Just replacing the js with a scss, as long as there are no combinations of letters with js next to each other this will work?
    const cssAliases = {};
    Object.keys(jsAliases).forEach(key => {
        cssAliases[key] = jsAliases[key].replace(path.sep + 'js', path.sep + 'scss');
    });
    if (verbose) {
        console.log(chalk.gray('Loading Webpack config '+ path.join(cwd, './build_tools/webpack.config.js')) + ' with parameter '  + sitePackageConfig.packageName);
    }
    // passing webpackConfig the name of the package we are compiling to
    const webpackConfig = require(path.join(cwd, './build_tools/webpack.config.js'))(sitePackageConfig.packageName, verbose);
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
    }

    webpack(scssConfig, (err, stats) => {
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