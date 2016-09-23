# Mobile First SiteGenesis

This is a repository for mobile first version of SiteGenesis. 

To install:

1. Clone this repository.
1. Upload the `modules` folder to the WebDav location for cartridges for your Sandbox through CyberDuck or any other WebDAV client. *Note:* you can't upload the modules folder through Studio. 
1. Upload the `app_storefront_base` cartridge via Studio or use a WebDAV client to upload it to the WebDAV Cartridge location.
1. Add app_storefront_base to your cartridge path.
1. Install npm modules for the project in the root directory of the project: `npm install'.

# NPM scripts
Use the provided NPM script to compile and upload changes to your Sandbox.
# Compilation

* `npm run compile:scss` - Compiles all scss files into css.
* `npm run compile:js` - Compiles all js files and aggregates them.
* `npm run compile:fonts` - Will copy all needed font files. Usually have to be run only once.

# Lint

`npm run lint` - Execute linting for all JavaScript and SCSS files in the project. You should run this command before committing your code.

# Watches

`npm run watch:static` - Watches js and scss files for changes, recompiles them and uploads result to the sandbox. Requires valid dw.json file at the root.
`npm run watch:cartridge` - Watches all cartridge files (except for static content) and uploads it to sandbox. Requires valid dw.json file at the root.
`npm run watch` - Watches everything and recompiles (if necessary) and uploads to the sandbox.

## Unit tests

You can run `npm test` to execute all unit tests in the project. Run `npm test --coverage` to get coverage information. Coverage will be available in `coverage` folder under root directory.

# Running Integration tests
Integration tests are located in .../mfsg/test/integration

to run individual test, i.e. test1.js in storeLocator sub-suite:
`npm run test:integration -- --baseUrl https://hostname/on/demandware.store/Sites-SiteGenesis-Site/en_US test/integration/storeLocator/test1.js`

to run tests in sub-suite, i.e. storeLocator sub-suite:
`npm run test:integration -- --baseUrl https://hostname/on/demandware.store/Sites-SiteGenesis-Site/en_US test/integration/storeLocator`

to run tests in integration suite:
`npm run test:integration -- --baseUrl https://hostname/on/demandware.store/Sites-SiteGenesis-Site/en_US test/integration/*`

# Running Appium UI tests:
Thse tests can only be run locally with Appium and Xcode installed; currently we have not configure for Jenkins to run these tests. Ideally we would like to use sourcelabs to run these tests instead of installing Appium on Jenkin machine. However, we are still waiting for a valid sourcelabs id. 
Follow this instruction to install Appium and Xcode:
[How to install Appium](https://intranet.demandware.com/confluence/display/ENG/How+to+Configure+Appium+for+MFSG)

Appium UI Tests are located at ../mfsg/test/Appium

`npm run test:appium -- --url http://dev02-lab03b-dw.demandware.net/on/demandware.store/Sites-SiteGenesis-Site/`