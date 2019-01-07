'use strict';

const chalk = require('chalk');
const path = require('path');
const glob = require("glob");
const stylelint = require("stylelint");

/**
 * A custom Webpack plugin to lint client-side Sass files
 */
module.exports = class LintSassPlugin {
    constructor(options) {
        this.cartridges = options.cartridges;
        this.siteCartridgeName = options.siteCartridgeName;
        this.type = (options.type).toUpperCase();
    };

    lint(compiler) {
        const files = [].concat(...this.cartridges.map(cartridge =>  {
            return glob.sync(path.resolve(process.cwd(), "cartridges", cartridge.name, "cartridge/client", "*", "scss", "**", "*.scss"))
        }));

        stylelint.lint({
            configFile: path.resolve(process.cwd(), '.stylelintrc.json'),
            cache: true,
            files: files,
            syntax: "scss", 
            formatter: "string"
        }).then((data) => {
            if (data.errored) {
                console.log(chalk.yellow(`"${this.siteCartridgeName}" ${this.type} compiler has identified linting issue(s)`));
                console.log(chalk.yellow(`The following issues should be resolved before committing`));
                console.log(data.output);
                compiler.lintingIssues = true;
            }
        })
    };

    apply(compiler) {
        compiler.hooks.beforeRun.tap('LintSassPlugin', (compiler) => {
            this.lint(compiler);
        });

        compiler.hooks.watchRun.tap('LintSassPlugin', (compiler) => { 
            this.lint(compiler);
        });
    }
}
