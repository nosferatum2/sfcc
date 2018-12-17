'use strict';

const chalk = require('chalk');

module.exports = class LogCompilerEventsPlugin {
    constructor(options) {
        this.cartridges = options.cartridges || [];
        this.siteCartridge = this.cartridges[this.cartridges.findIndex(cartridge => cartridge.alias === 'site')];
        this.mode = (options.mode).charAt(0).toUpperCase() + (options.mode).slice(1);
    }
    apply(compiler) {
      compiler.hooks.thisCompilation.tap('LogCompilerEventsPlugin', (compilation) => {
        this.timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
        console.log(chalk.white(`[${this.timestamp}] ${this.mode} build ${chalk.yellow(`starting`)} for site "${chalk.bold(this.siteCartridge.name)}"`));
      })
      compiler.hooks.done.tap('LogCompilerEventsPlugin', (stats) => {
        // if verbose
            // list all emitted assets
            // console.log(chalk.white(`\tBuild time: ${((stats.endTime - stats.startTime)/1000).toFixed(2)} seconds`));
        console.log(chalk.white(`[${this.timestamp}] ${this.mode} build ${chalk.green(`successful`)} for site "${chalk.bold(this.siteCartridge.name)}"\n`));
        if (this.watch) {
            console.log(`Compiler for site "${this.siteCartridge.name}" is ${chalk.cyan(`ready`)} for changes\n`);
        }
      });
      compiler.hooks.watchRun.tap('LogCompilerEventsPlugin', (compiler) => {
          this.watch = true;
      });
    }
}
