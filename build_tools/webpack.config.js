/* globals cat, cd, cp, echo, exec, exit, find, ls, mkdir, rm, target, test */
'use strict';
try {
    require('shelljs/make');
    const path = require('path');
    const chalk = require('chalk');
    const helpers = require('./helpers');

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
                    rules: [{
                        test: /bootstrap(.)*\.js$/,
                        exclude: /(node_modules)/,
                        use: helpers.getJsLoaders(mode)

                    }]
                },
                plugins: helpers.getJsPlugins(mode)
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
                    rules: [{ 
                        test: /\.scss$/,
                        use: helpers.getCssLoaders(mode) 
                    }]
                },
                devtool: helpers.isBuildEnvironment('cssSourceMaps') ? 'cheap-eval-source-map' : 'none',
                plugins: helpers.getCssPlugins(mode),
            };
        }
    };
} catch (e) {
    console.log('... caught exception ' + e.toString());
}
