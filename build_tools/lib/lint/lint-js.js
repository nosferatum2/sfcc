'use strict';

const CLIEngine = require('eslint').CLIEngine;
const chalk = require('chalk');

/**
 * Lint files using ESLint
 * https://eslint.org/docs/developer-guide/nodejs-api#cliengineexecuteonfiles
 * @param {Array} files - an array of files
 * @return {Object} - ESLint results object
 */
exports.lint = (files) => {
    const eslint = new CLIEngine({
        cache: !process.env.lintNoCache
    });
    return eslint.executeOnFiles(files);
};

/**
 * Format the ESLint report object
 * https://eslint.org/docs/developer-guide/nodejs-api#cliengineexecuteonfiles
 * @param {Object} result - ESLint results object
 * @param {string} fileTypeString - context / type of JS file
 * @return {Object} - formatted results object
 */
exports.formatResult = (result, fileTypeString) => {
    const formatter = new CLIEngine().getFormatter();

    if (result.errorCount) {
        return {
            isSuccessful: false,
            message: chalk.red('Linting issues were found!\n') +
                              'The following issues need to be resolved prior to committing\n' +
                              `${formatter(result.results)}`
        };
    }

    return {
        isSuccessful: true,
        message: `${chalk.green(`Linted ${fileTypeString} successfully\n`)}`
    };
};
