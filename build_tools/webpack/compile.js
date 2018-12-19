
'use strict';

const path = require('path');
const chalk = require('chalk');

module.exports = ((env, argv) => {
    const WebpackConfigurator = require('./webpack.config.js');
    const packageFile = require(path.join(process.cwd(), './package.json'));
    const options = (argv.mode === 'development') ? packageFile.buildEnvironment.development :
                                                    packageFile.buildEnvironment.production
    
    console.log(chalk.white(`Initializing compiler in ${chalk.yellow(argv.mode)} mode\n`));
    
    // return an array of configuration objects per site to Webpack's compiler
    return packageFile.sites.reduce((configurations, site) => {
        let configurator = new WebpackConfigurator(site, options);
        configurations.push(...configurator.create());
        return configurations;
    }, [])
});