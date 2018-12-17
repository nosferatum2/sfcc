
'use strict';

const path = require('path');

module.exports = ((env, argv) => {
    const Compiler = require(`./configs/webpack.config.${argv.mode}`);
    const packageFile = require(path.join(process.cwd(), './package.json'));
    return packageFile.sites.map(site => {
        return new Compiler(site)
    })
});