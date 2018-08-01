# LYONSCG Build Scripts

This repository contains a collection of scrips that are useful for creating a new Reference Architecture overlay cartridge. All of the scripts are executable through CLI.

## Available commands

`--help` - Generate help message

`--upload [path::String]` - Upload a file to a sandbox. Requires dw.json file at the root directory.

`--upload-cartridge` - Upload a cartridge. Requires dw.json file in build_tools or command line arguments.

`--test [path::String]` - Run unittests on specified files/directories.

`--cover` - Run all unittests with coverage report.

`--compile String` - Compile css/js files. - either: css or js

`--lint String` - Lint scss/js files. - either: js or css

`--create-cartridge String` - Create new cartridge structure

`--watch` - Watch and upload files

## Installation and Usage

You can install the dependencies for these build tools using the following command in the project root directory:

```sh
npm install
```

In order for all commands to work, this script makes a few assumptions:

* There's a `dw.json` file at the root of your repository, that contains information with the path to your sandbox, as well as username and password. --upload-cartridge will also work with command line arguments
* There's a `cartridges` top level folder that contains your cartridge
* `name` property in `package.json` matches the name of your cartridge, or if it doesn't, there's a `packageName` property with the name of the cartridge
* If this an overlay cartridge, `package.json` contains `paths` property, that's of type `Array` and contains key/value pairs with name/path to all cartridges that will come below yours. For example, if you are creating a cartridge that will be overlayed on top of `app_storefront_base` `paths` property will look something like this: `[{ "base": "../sgmf/cartridges/app_storfront_base"}]`
* ESLint and Stylelint are dev-dependancies of your cartridge. You have all required plugins and configs installed as well.
* There's a webpack.config.js in build_tools that specifies how to compile client-side JavaScript files.
* Your `package.json` file contains `browserslist` key that specifies which browsers you are targeting, to compile SCSS files with correct prefixes. See https://github.com/ai/browserslist for more details

##Examples

Uploading individual cartridges to your sandbox/instance

1. Configure dw.json file with your username, password, activation instance (sandbox URL) and currently active code version
2. Configure the package.json file at the root directory level for the cartridges you want to upload (see "uploadCartridge")
3. Navigate to the command line tool (CMD for Windows, Terminal for OSX)
4. OSX/MAC
		"cd <path to your build tools>"   Sample -> cd /Users/testuser/git/reference-application-sfra
		"npm run uploadCartridge"  
		
##Notes

Verbose Logging -> handled via the "verboseLogging" option in the dw.json file
	Example: "verboseLogging": "true"



