
'use strict';

const path = require('path');

module.exports = ((env, argv) => {
    const WebpackConfiguration = require('./webpack.config.js');
    const packageFile = require(path.join(process.cwd(), './package.json'));
    const options = (argv.mode === 'development') ? packageFile.buildEnvironment.development :
                                                    packageFile.buildEnvironment.production

    const configurations = new Array();                                            
    packageFile.sites.forEach((site) => {
        const siteConfiguration = new WebpackConfiguration(site, options);
        configurations.push(siteConfiguration.createJsConfiguration());
        configurations.push(siteConfiguration.createSassConfiguration());
    });
    return configurations;
});