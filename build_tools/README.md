# LYONSCG Build Scripts

This repository contains a collection of scrips that are useful for creating a new Reference Architecture overlay cartridge. All of the scripts are executable through CLI.

## Available commands

Please notes all of these commands should be run from the project root directory.

`node build_tools/build --help` - Generate help message

`--upload [path::String]` - Upload a file to a sandbox. Requires dw.json file at the root directory.

For example:
`node build_tools/build --upload cartridges/app_lyonscg_mfra/cartridge/templates/resources/version.properties`

`node build_tools/build --uploadCartridge String` - Upload a cartridge.

For example:
`node build_tools/build --uploadCartridge app_lyonscg_mfra`

`node build_tools/build --test [path::String]` - Run unittests on specified files/directories.

`node build_tools/build --cover` - Run all unittests with coverage report.

`node build_tools/build --compile --compile String` - Compile css/js files. - either: css or js

For example:
`node build_tools/build --compile css`

`node build_tools/build --lint String` - Lint scss/js files. - either: js or css

For example:
`node build_tools/build --lint css`

`node build_tools/build --createCartridge String` - Create new cartridge structure

For example:
`node build_tools/build --createCartridge plugin_myplugin`

`node build_tools/build --watch` - Watch and upload files

`node build_tools/build --deployCartridges` - Uploads all cartridges defined in package.json to the SFCC server. Requires dw.json file in build_tools or command line arguments.

For example:
`node build_tools/build --deployCartridges --code-version=version1 --activation-hostname=dev01-na01-hostname.demandware.net --hostname=dev01-na01-hostname.demandware.net --username=myusername --password=mypassword`

`node build_tools/build --deploy-data`- Deploys data_impex metadata to SFCC server. Requires dw.json file in build_tools or command line arguments.

For example:
`node build_tools/build --deploy-data --hostname=dev01-na01-hostname.demandware.net --username=myusername --password=mypassword --data-bundle=core`

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
