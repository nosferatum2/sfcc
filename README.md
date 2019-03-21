# Storefront Reference Architecture (SFRA)

This is a repository for the customized LyonsCG version of the Storefront Reference Architecture reference application.

Storefront Reference Architecture has a base cartridge (`app_storefront_base`) provided by Commerce Cloud that is never directly customized or edited. Instead, customization cartridges are layered on top of the base cartridge. This change is intended to allow for easier adoption of new features and bug fixes.

Please refer to our Confluence documentation for information and best practices regarding the new archtecture and how to override/extend server side and client side code.

SFRA Essentials Guide - https://lyonscg.atlassian.net/wiki/spaces/Intranet/pages/637372481/SFRA+Essentials+Guide+Draft

Client Side JavaScript Stack - https://lyonscg.atlassian.net/wiki/spaces/Intranet/pages/646985985/Client+Side+JavaScript+Stack+SFRA+Draft


The functional requrements for our LyonsCG version of SFRA are being maintained here - https://lyonscg.atlassian.net/wiki/spaces/SRV/pages/513802942/Functional+Requirements

# What's New

We keep our SFRA copy periodically updated with whatever version Salesforce considers "released". That version number is in our package.json file. You will see a "version" attribute near the top that indicates the Salesforce release we are in sync with, and an "lcgversion" which is our LyonsCG release number that will correspond with the list of tickets in the CHANGES.md file.

The CHANGES.md file offers an itemized list of internal ticket numbers that have been worked on for any particular release.

New features that we've added get a high level discription and are maintained here - https://lyonscg.atlassian.net/wiki/spaces/Intranet/pages/568494465/SFRA+Finish+Grades+Features+Roadmap

# Getting Started

SFRA Setup Guide - https://lyonscg.atlassian.net/wiki/spaces/Intranet/pages/647171135/SFCC+Setup+Guide+SFRA+Under+Review

# Node version
The package.json file now specifies which version of node you should be running for installing our build tools.

## Linting your code

`npm run lint` - Execute linting for all JavaScript and SCSS files in the project. You should run this command before committing your code.

### ESLint

ESLint is the linter of choice for JavaScript. It can be configured in two primary ways:

1. Configuration Comments (should rarely be used)
2. Configuration Files (primary method for configuring ESLint)

The configuration file used by LYONSCG (and the SFCC community) are `.eslintrc.json` files (not YAML, etc).

Searching through the codebase you'll note a number of `.eslintrc.json` files. Configuration files located higher in the file tree are extended by files lower in the tree.

When adding a LINK Cartridge (or other 3rd party cartridge) to the codebase: if the cartridge does not pass linting out-of-the-box and does not include it's own `.eslintrc.json` configuration file, add a suitable one to the cartridge root. It should stay as close as possible to the rules defined by LYONSCG (see the configuration file located in the root of this repo).

See the [ESLint user-guide](https://eslint.org/docs/user-guide/configuring) for more info.

## Git Hooks

This application ships with a set if git hooks used to ensure standards (code and otherwise) are followed. Please see [husky](https://github.com/typicode/husky) for more info.

In the case of an **_emergency_**, you can bypass a git hook by passing the `--no-verify` flag. For example:

`git commit --no-verify`

## Watching for changes

`npm run watch` - Watch and recompile both .js and .scss files on changes (this is more performant than the individual compile scripts).

## Uploading

It is highly reccomended that you use your IDE tools to handle the cartridge uploading. VSCode's Prophet Debugger and the Eclipse server connection are going to be way more efficient at uploading code to your sandbox. The various upload commands included with our build tools are intended for a Jenkins server to be able to deploy code.

#Testing
## Running unit tests

You can run `npm test` to execute all unit tests in the project. Run `npm run cover` to get coverage information. Coverage will be available in `coverage` folder under root directory.

* UNIT test code coverage:
1. Open a terminal and navigate to the root directory of the mfsg repository.
2. Enter the command: `npm run cover`.
3. Examine the report that is generated. For example: `Writing coverage reports at [/Users/yourusername/SCC/sfra/coverage]`
3. Navigate to this directory on your local machine, open up the index.html file. This file contains a detailed report.

## Running integration tests
Integration tests are located in the `sfra/test/integration` directory.

To run all integration tests you can use the following command:

```
npm run test:integration
```

**Note:** Please note that short form of this command will try to locate URL of your sandbox by reading `dw.json` file in the root directory of your project. If you don't have `dw.json` file, integration tests will fail.
sample dw.json file (this file needs to be in the root of your project)
{
    "hostname": "dev03-automation02-qa.demandware.net"
}

```
npm run test:integration test/integration/storeLocator
```

You can also supply URL of the sandbox on the command line:

```
npm run test:integration -- --baseUrl https://hostname/on/demandware.store/Sites-RefArch-Site/en_US
```

To run individual tests, such as the `test1.js` in the `storeLocator` subsuite:

```
npm run test:integration -- --baseUrl https://hostname/on/demandware.store/Sites-RefArch-Site/en_US test/integration/storeLocator/test1.js
```

To run tests in a subsuite, such as the storeLocator subsuite:

```
npm run test:integration -- --baseUrl https://hostname/on/demandware.store/Sites-RefArch-Site/en_US test/integration/storeLocator
```

## Envrionment Variables and Flags

Environment variables and flags are located in the "buildEnvironment" object in the root package.json file

The "development" settings object allows developers to change build configuration during development tasks.

The "production" settings object should only be modified by the TA, TL, or other lead developer designated to do production builds on Jenkins.

Name | Description | Accepted Values
--- | --- | --- | ---
mode | Set the build / compilation mode | "development", "production" |
verbose | Verbose logging | "true", "false" |
cssSourceMaps | CSS source mapping | "true", "false" |
cssAutoPrefixer | Automatically add vendor prefixes to CSS rules  | "true", "false" |
jsSourceMaps | JS source mapping | "true", "false" |
notifications | Native system notifications for compiler events | "true", "false" |

### Performance Considerations

- **mode**: Setting to "development" will significantly reduce compile times as this tells webpack when / how to use its built-in optimizations.
- **cssSourceMaps**: If your development task doesn't require the use of css source maps, consider disabling them. This will significantly reduce compile times.
- **cssAutoPrefixer**: Adding vendor prefixes for CSS rules to ensure stable browser support may not be needed while in development. Disabling this will reduce compile times.
- **jsSourceMaps**: If your development task doesn't require the use of js source maps, consider disabling them. This will significantly reduce compile times.
  
