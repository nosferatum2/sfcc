# SGMF Scripts

This repository contains a collection of scrips that are useful for creating a new SiteGenesis overlay cartridges. All of the scripts are executable through CLI.

## Available commands

`--help` - Generate help message

`--upload [path::String]` - Upload a file to a sandbox. Requires dw.json file at the root directory.

`--uploadCartridge [String]` - Upload a cartridge. Requires dw.json file at the root directory.

`--test [path::String]` - Run unittests on specified files/directories.

`--cover` - Run all unittests with coverage report.

`--compile String` - Compile css/js files. - either: css or js

`--lint String` - Lint scss/js files. - either: js or css

`--createCartridge String` - Create new cartridge structure

`--watch` - Watch and upload files

## Installation and usage

You can install this module from NPM command:

```sh
npm install sgmf-scripts --save-dev
```

In order for all commands to work, this script makes a few assumptions:

* There's a `dw.json` file at the root of your repository, that contains information with the path to your sandbox, as well as username and password
* There's a `cartridges` top level folder that contains your cartridge
* `name` property in `package.json` matches the name of your cartridge, or if it doesn't, there's a `packageName` property with the name of the cartridge
* If this an overlay cartridge, `package.json` contains `paths` property, that's of type `Array` and contains key/value pairs with name/path to all cartridges that will come below yours. For example, if you are creating a cartridge that will be overlayed on top of `app_storefront_base` `paths` property will look something like this: `[{ "base": "../sgmf/cartridges/app_storfront_base"}]`
* ESLint and Stylelint are dev-dependancies of your cartridge. You have all required plugins and configs installed as well.
* There's a webpack.config.js at the top of your project that specifies how to compile client-side JavaScript files.
* Your `package.json` file contains `browserslist` key that specifies which browsers you are targeting, to compile SCSS files with correct prefixes. See https://github.com/ai/browserslist for more details