'use strict';

const glob = require('../lib/util/glob');
const lintJs = require('../lib/lint/lint-js');
const lintScss = require('../lib/lint/lint-scss');
const lintJson = require('../lib/lint/lint-json');

/**
 * Lint client-side JS files
 * @returns {boolean} isSuccessful
 */
exports.lintClientJsFiles = () => {
    const fileTypeString = 'client-side JS files';
    console.log(`Linting ${fileTypeString}`);

    const files = glob.getClientJsFiles();
    const result = lintJs.lint(files);
    const { message, isSuccessful } = lintJs.formatResult(result, fileTypeString);
    console.log(message);

    return isSuccessful;
};

/**
 * Lint server-side JS files
 * @returns {boolean} isSuccessful
 */
exports.lintServerJsFiles = () => {
    const fileTypeString = 'server-side JS files';
    console.log(`Linting ${fileTypeString}`);

    const files = glob.getServerJsFiles();
    const result = lintJs.lint(files);
    const { message, isSuccessful } = lintJs.formatResult(result, fileTypeString);
    console.log(message);

    return isSuccessful;
};

/**
 * Lint Scss files
 * @returns {boolean} isSuccessful
 */
exports.lintScssFiles = async () => {
    console.log('Linting Scss files');

    const files = glob.getScssFiles();
    const result = await lintScss.lint(files);
    const { message, isSuccessful } = lintScss.formatResult(result);
    console.log(message);

    return isSuccessful;
};

/**
 * Lint JSON files
 * @returns {boolean} isSuccessful
 */
exports.lintJsonFiles = () => {
    console.log('Linting JSON files');

    const files = glob.getJsonFiles();
    const result = lintJson.lint(files);
    const { message, isSuccessful } = lintJson.formatResult(result);
    console.log(message);

    return isSuccessful;
};

/**
 * Lint JS files in the build_tools directory
 * @returns {boolean} isSuccessful
 */
exports.lintBuildTools = () => {
    const fileTypeString = 'Build Tools JS files';
    console.log(`Linting ${fileTypeString}`);

    const files = glob.getBuildToolsJsFiles();
    const result = lintJs.lint(files);
    const { message, isSuccessful } = lintJs.formatResult(result, fileTypeString);
    console.log(message);

    return isSuccessful;
};

/**
 * Runs the specified linting routines
 * @param {Array} types - the types of linters to run against the code base
 */
exports.run = async (types) => {
    // Maps command line arguments to functional linting routines
    const linters = {
        'client-js': this.lintClientJsFiles,
        'server-js': this.lintServerJsFiles,
        'scss': this.lintScssFiles, // eslint-disable-line quote-props
        'json': this.lintJsonFiles,  // eslint-disable-line quote-props
        'build-tools': this.lintBuildTools
    };

    const results = [];
    for (const type of types) {
        // Check that the linter is valid
        if (!linters[type]) {
            console.log(`"${type}" is not a valid argument!`);
            process.exit(1);
        }
        // Run the linter and return its result
        const result = await linters[type]();
        results.push(result);
    }

    // If one or more linters found issues, fail the process
    // (this prevents a git commit with the Husky git hooks enabled)
    if (results.includes(false)) {
        process.exit(1);
    }

    return;
};
