'use strict';

const fs = require('fs');
const jsonlint = require('jsonlint');
const chalk = require('chalk');

/**
 * Lint files using jsonlint
 * https://github.com/zaach/jsonlint
 * @param {Array} files - an array of files
 * @return {Array} - An array of errors
 */
exports.lint = (files) => {
    const results = files.reduce((errors, file) => {
        try {
            jsonlint.parse(fs.readFileSync(file, 'utf8'));
            return errors;
        } catch (error) {
            errors.push({ file, msg: error });
            return errors;
        }
    }, []);
    return results;
};

/**
 * Format the result of any invalid JSON files
 * @param {Array} errors - An array of errors
 * @return {Object} - formatted results object
 */
exports.formatResult = (errors) => {
    if (errors.length) {
        let message = `${chalk.red('Linting JSON files failed!\n')}` +
                  'The following issues need to be resolved prior to committing:\n\n';

        for (const error of errors) {
            message += `${chalk.red('Error in file:')} ${chalk.underline(`${error.file}\n`)}`;
            message += `${error.msg}\n\n`;
        }

        return {
            isSuccessful: false,
            message
        };
    }

    return {
        isSuccessful: true,
        message: `${chalk.green('Linted JSON files successfully\n')}`
    };
};
