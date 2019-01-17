'use strict';

const path = require('path');
const stylelint = require('stylelint');
const chalk = require('chalk');

/**
 * Lint files using stylelint
 * https://github.com/stylelint/stylelint/blob/master/docs/user-guide/node-api.md
 * @param {Array} files - an array of files
 * @return {Promise} - stylelint results
 */
exports.lint = (files) => stylelint.lint(
    {
        configFile: path.resolve(process.cwd(), '.stylelintrc.json'),
        cache: !process.env.lintNoCache,
        files,
        syntax: 'scss',
        formatter: 'string'
    }
);

/**
 * Format the stylelint result object
 * https://github.com/stylelint/stylelint/blob/master/docs/user-guide/node-api.md
 * @param {Object} result - stylelint results object
 * @return {Object} - formatted results object
 */
exports.formatResult = (result) => {
    if (result.errored) {
        return {
            isSuccessful: false,
            message: chalk.red('Linting issues were found!\n') +
                             'The following issues need to be resolved prior to committing\n' +
                             `${(result.output)}`
        };
    }

    return {
        isSuccessful: true,
        message: `${chalk.green('Linted Scss files successfully\n')}`
    };
};
