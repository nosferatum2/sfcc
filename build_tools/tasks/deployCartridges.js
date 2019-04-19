'use strict';

const chalk = require('chalk');
const cliSpinners = require('cli-spinners');
const ora = require('ora');

const authenticate = require('../lib/deploy/authenticate');
const zipCode = require('../lib/deploy/zip-code');
const deployCode = require('../lib/deploy/deploy-code');
const activateCode = require('../lib/deploy/activate-code');
const uploadUtils = require('../lib/util/upload-utils');

const spinner = new ora({ spinner: cliSpinners.simpleDotsScrolling });

/**
 * Deploy and activate code on Commerce Cloud instances.
 * @param {Object} cliArgs - An options object created optionator containing CLI arguments.
 */
module.exports = async (cliArgs) => {
    // Gather upload properties
    const {
        clientId, clientSecret,
        hostname, activationHostname, codeVersion,
        versionCartridgeName = null,
        certHostname = null, p12 = null, passphrase = null, selfSigned = null
    } = uploadUtils.mergeUploadProperties(cliArgs);

    try {
        // Check if 2FA is required
        uploadUtils.check2FA(hostname, certHostname, p12, passphrase);

        // Authenticate
        spinner.start(chalk.yellow('Authenticating'));
        const token = await authenticate(clientId, clientSecret);
        spinner.succeed(chalk.green('Authenticated'));

        // Delete the code version (if it exists)
        await uploadUtils.deleteFile(certHostname || hostname, codeVersion, token, { p12, passphrase, selfSigned });

        // Handle version properties file
        spinner.start('Creating version properties file');
        if (uploadUtils.createVersionPropertiesFile(versionCartridgeName, codeVersion)) {
            spinner.succeed(chalk.green('Created version properties file'));
        } else {
            spinner.warn(chalk.yellow('Version properties file not created. versionCartridgeName not defined.'));
        }

        // Create zip files
        spinner.start(chalk.yellow('Preparing cartridges for upload'));
        const code = await zipCode(codeVersion);
        spinner.succeed(chalk.green('Cartridges compressed'));

        // Deploy code
        spinner.start(chalk.yellow('Uploading cartridges'));
        await deployCode(certHostname || hostname, code, token, { p12, passphrase });
        spinner.succeed(chalk.green('Cartridges uploaded'));

        // Activate code version
        spinner.start(chalk.yellow('Activating code version'));
        await activateCode(activationHostname, codeVersion, token);
        spinner.succeed(chalk.green('Activated code version'));

        // Delete local zip files
        spinner.start(chalk.yellow('Deleting temporary code archives'));
        uploadUtils.deleteTempDirectory();
        spinner.succeed(chalk.green('Deleted temporary code archives'));
    } catch (error) {
        spinner.fail(chalk.red('An error occured!'));
        if (error && error.isCustomError) {
            console.log(chalk.red(error.message));
        } else {
            console.log(chalk.red(error));
            console.log(chalk.red('Please verify all credentials, upload arguments, and ocapi configurations'));
        }
        process.exit(1);
    }
};
