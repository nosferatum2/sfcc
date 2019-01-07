'use strict';

const chalk = require('chalk');
const path = require('path');
const glob = require("glob");
const CLIEngine = require("eslint").CLIEngine;

/**
 * A custom Webpack plugin to lint client-side JS files
 */
module.exports = class LintJsPlugin {
    constructor(options) {
        this.cartridges = options.cartridges;
        this.siteCartridgeName = options.siteCartridgeName;
        this.type = (options.type).toUpperCase();
    };

    lint(compiler) {
        const files = [].concat(...this.cartridges.map(cartridge =>  {
            return glob.sync(path.resolve(process.cwd(), "cartridges", cartridge.name, "cartridge/client", "*", "js", "*"));
        }));
        const eslint = new CLIEngine({
            cache: true
        });
        const report = eslint.executeOnFiles(files);
        const issueCount = report.errorCount + report.warningCount;
        
        if (issueCount > 0) {
            const formatter = eslint.getFormatter();
            console.log(chalk.yellow(`"${this.siteCartridgeName}" ${this.type} compiler has identified ${issueCount} linting issue(s)`));
            console.log(chalk.yellow(`The following issues should be resolved before committing`));
            console.log(formatter(report.results));
            compiler.lintingIssues = true;
        }
    };

    apply(compiler) {
        compiler.hooks.beforeRun.tap('LintJsPlugin', (compiler) => {
            this.lint(compiler);
        });
        
        compiler.hooks.watchRun.tap('LintJsPlugin', (compiler) => { 
            this.lint(compiler);
        });
    }
}
