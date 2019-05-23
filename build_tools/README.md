# LYONSCG Build Tools

This README provides documentation on all NPM scripts, environment settings, and Jenkins setup.

## Installation and Usage

You can install the dependencies for these build tools using the following command in the project root directory

```sh
npm install
```

In order for all npm commands to work verify that:

* There is a valid [dw.json](../dw.json) file in the root directory. See the [dw.json.example](../dw.json.example)
for an example of a valid file.
* There is a `cartridges` top level folder that contains your cartridge(s).
* The `sites` array within the root `package.json` is configured correctly. See the **Sites and Cartridge Path
Configuration** section below.
* Your `package.json` file contains `browserslist` key that specifies which browsers you are targeting, to compile SCSS
files with correct prefixes. See <https://github.com/ai/browserslist> for more details

## Upload

It is **highly** recommended that you use VS Code's Prophet Debugger extension or Eclipse's Digital Server connection
for auto-upload of files; however, the deployCartridges script or [dwupload](https://www.npmjs.com/package/dwupload) can
be used if you choose to develop outside of these IDEs.

If you'd like information on how to setup VS Code and the Prophet Debugger extension for Salesforce B2C Commerce
development see [Visual Studio Code - SFCC](https://lyonscg.atlassian.net/wiki/spaces/Intranet/pages/206670879/Visual+Studio+Code+-+SFCC)

### Upload Cartridges

Uploads all cartridge (folders) within the `sfra-reference-application/cartridges` directory to the specified B2C
Commerce instance.

```sh
npm run deployCartridges
```

This script also supports passing `dw.json` properties as command line arguments (arguments passed via the CLI take
precedence over dw.json properties).

```sh
npm run deployCartridges -- --client-id=${clientId} --client-secret=${clientSecret} --hostname=${hostname}  --activationHostname=${activationHostname} --code-version=${versionname}

#example
npm run deployCartridges -- --client-id=myClientId --client-secret=myClientSecret --hostname=dev01-na01-hostname.demandware.net --activationHostname=dev01-na01-hostname.demandware.net --code-version=version01
```

## Code Activation

Activate a code version.

```sh
npm run activateCodeVersion
```

This script also supports passing `dw.json` properties as command line arguments (arguments passed via the CLI take
precedence over dw.json properties).

```sh
npm run activateCodeVersion -- --code-version=${versionname}

#example
npm run activateCodeVersion -- --code-version=version01

#example
npm run activateCodeVersion -- --code-version=version01 --client-id=myClientId --client-secret=myClientSecret --activation-hostname=dev01-na01-hostname.demandware.net
```

## Data Deployment

Deploy a data bundle. Data bundles are defined by the `"dataBundles"` property in the [package.json]('../package.json).

```sh
npm run deployData
```

This script also supports passing `dw.json` properties as command line arguments (arguments passed via the CLI take
precedence over dw.json properties).

```sh
npm run deployData -- --client-id=${clientId} --client-secret=${clientSecret} --hostname=${hostname} --data-bundle=${bundlename}

#example
npm run deployData -- --client-id=${clientId} --client-secret=${clientSecret} --hostname=dev01-na01-hostname.demandware.net --data-bundle=core
```

> Note: the latest version of the build tools uses OCAPI to trigger data deploys instead of BM Pipelines (the legacy
> method). As such, you will **not** see the Site Imports in Business Manager's "Site Imports & Exports" module. You
> will see real-time feedback provided by the build tools as to the import log for that data deployment, and whether
> there were any critical errors.

```stdout
Last Deployment Timestamp: Thu Apr 04 2019 18:13:31 GMT-0400 (EDT)
✔ Authenticated
✔ Data compressed
✔ Data uploaded
✔ Data imported
✔ Deleted temporary data archives

Instance dev03-eu01-merchant.demandware.net imported data bundles:
  core - https://dev03-eu01-merchant.demandware.net/on/demandware.servlet/webdav/Sites/Impex/log/Job-sfcc-site-archive-import-20190404230012202.log
```

## Compile

Build environment variables and compilation settings can be set by the `buildEnvironment` object in root `package.json`.
See the **Build Environment Variables** section below.

### Compiling for Development

#### Scss

```sh
npm run compile:scss
```

#### JS

```sh
npm run compile:js
```

#### Watch

This script will automatically re-compile any changes made to JS or Scss files. Utilizing the watcher significantly
reduces compile times; therefore, it is recommended that you run the watcher in the background while working on a
front-end development task.

```sh
npm run watch
```

### Compiling for Production

These scripts minify and optimize assets for Production builds.

#### Scss Production

```sh
npm run compile:scss:prod
```

#### JS Production

```sh
npm run compile:js:prod
```

### Compiling for Production and Development

These scripts are run in production and development.

#### SVG Builder

```sh
npm run compile:svg
```

## Linting

The linting of client-side Js files, server-side Js files, Scss files, JSON files, and build tools JS files is
supported. The script accepts an array of positional arguments. If no arguments are provided, all linting routines will
run. The following values for `type` (as seen below) are valid: client-js, server-js, scss, json, build-tools

```sh
npm run lint ${type1} ${type2} ${typeN}

# examples
npm run lint

npm run lint client-js scss json
```

## Testing

### Running unit tests

You can run `npm test` to execute all unit tests in the project. Run `npm run cover` to get coverage information.
Coverage will be available in `coverage` folder under root directory.

**UNIT test code coverage:**

1. Open a terminal and navigate to the root directory of the mfsg repository.
2. Enter the command: `npm run cover`.
3. Examine the report that is generated. For example: `Writing coverage reports at [/Users/yourusername/SCC/sfra/coverage]`
4. Navigate to this directory on your local machine, open up the index.html file. This file contains a detailed report.

### Running integration tests

Integration tests are located in the `sfra/test/integration` directory.

To run all integration tests you can use the following command:

```sh
npm run test:integration
```

**Note:** Please note that short form of this command will try to locate URL of your sandbox by reading `dw.json` file
in the root directory of your project. If you don't have `dw.json` file, integration tests will fail.

Sample dw.json file (this file needs to be in the root directory):

```json
{
    "hostname": "dev03-automation02-qa.demandware.net"
}
```

```sh
npm run test:integration test/integration/storeLocator
```

You can also supply URL of the sandbox on the command line:

```sh
npm run test:integration -- --baseUrl https://hostname/on/demandware.store/Sites-RefArch-Site/en_US
```

To run individual tests, such as the `test1.js` in the `storeLocator` subsuite:

```sh
npm run test:integration -- --baseUrl https://hostname/on/demandware.store/Sites-RefArch-Site/en_US test/integration/storeLocator/test1.js
```

To run tests in a subsuite, such as the storeLocator subsuite:

```sh
npm run test:integration -- --baseUrl https://hostname/on/demandware.store/Sites-RefArch-Site/en_US test/integration/storeLocator
```

## Scaffolding

### Create a New Cartridge

```sh
npm run createCartridge ${cartridgeName}

# example
npm run createCartridge plugin_myplugin
```

## Confluence Reporting

You can configure the reports to run using [Confluence Reporting deployment properties](DeployProperties.md) and the
below examples.

### Post a System Objects Report to Confluence

These reports are intended to be used alongside data deployments to B2C Commerce instances.

System Object Reports display information about the System Objects within the configured data bundle. All the system
objects metadata xml files are parsed and their data combined to display in the same way they are imported.

The page contents are compared for each report to ensure a new update needs to be published. This is to prevent
unnecessary additional page versions. If differences are found, the old content is replaced entirely with the new in
the new version.

Run via CLI:

```sh
npm run systemObjectReport
```

Jenkins ANT Target:

```txt
system-object-report
```

### Post a Build Report to Confluence

These reports are intended to be used alongside code deployments to B2C Commerce instances.

Build Reports display a list of changes for each build; what has changed since the last build's git commit. For first
time builds, the change list will contain everything since the **last tag** of the deployed branch. (For this reason,
it makes sense to create an initial tag, such as release-0.0.0, on new projects, representing the initial codebase,
prior to any feature development.)

For each build, the report content is prepended to any existing content for each additional page version.

Run via CLI:

```sh
npm run buildReport
```

Jenkins ANT Target:

```txt
build-report
```

## Clean

Clean the project of untracked build artifact files (caches, compiled assets, etc). This can be useful to reset
the project to a blank slate if you experience any compilation or upload issues.

```sh
npm run clean
```

## Sites and Cartridge Path Configuration

The compiler and other build tools scripts are dependent on the `sites` array defined in the root `package.json`.
This `sites` array defines the sites within the project and the cartridge path of each site.

Following B2C Commerce convention, cartridges at the beginning of the `cartridges` array take precedence over the
cartridges at the end of the array.

Each cartridge object is required to have an `alias` and `name` property specified. The `name` property must match the
cartridge's folder name. The `alias` property may be any short-hand name to represent the cartridge.

Each site needs to have exactly one cartridge with an `alias` set to "site". This determines the output location of the
static folder that contains the compiled JS and Css.

An example of the `sites` array is provided below:

```json
{
  "sites": [
  {
    "cartridges": [
      {
        "alias": "site",
        "name": "site_siteid_mfra"
      },
      {
        "alias": "org",
        "name": "org_organizationid_mfra"
      },
      {
        "alias": "lyonscg",
        "name": "app_lyonscg_mfra"
      },
      {
        "alias": "base",
        "name": "app_storefront_base"
      }
    ]
  }
}
```

## Overriding Client-side SCSS and JS Files

### JS Include Path Example

The SFRA builders work differently than LYONSCG Gulp builders. When overriding JS files, you will need to include the
correct path to JS module(s) if the module is not in the same cartridge as the overriden file. For example if you've
pulled `main.js` into your org_organizationid_mfra cartridge and `main.js` includes the `util.js` module and the
`util.js` module still lives in app_storefront_base, your path would look like this where `base` is the alias defined
for app_storefront_base cartridge

```js
var processInclude = require('base/util');
```

## SCSS Include Path Example

SCSS paths will work similar to the JavaScript paths above. If you are importing a file that does not live in the same
cartridge as the file you are working on, you will need to set the alias for the cartridge where the file exists.
For example, if `homePage.scss` needs to include the `categoryTiles.scss` from app_storefront_base, it would look like
this where `base` is the alias defined for app_storefront_base cartridge.

```scss
@import "~base/components/categoryTiles";
```

## Build Environment Variables

Environment variables and flags are located in the "buildEnvironment" object in the root package.json file

The "development" settings object allows developers to change build configuration during development tasks.

The "production" settings object should only be modified by the TA, TL, or other lead developer designated to do
production builds on Jenkins.

Name | Description | Accepted Values
--- | --- | --- | ---
mode | Set the build / compilation mode | "development", "production" |
verbose | Verbose logging | "true", "false" |
cssSourceMaps | CSS source mapping | "true", "false" |
cssAutoPrefixer | Automatically add vendor prefixes to CSS rules  | "true", "false" |
cssLinting | Lint client-side Scss files during compilation | "true", "false"
jsSourceMaps | JS source mapping | "true", "false" |
jsLinting | Lint client-side JS files during compilation | "true", "false"
notifications | Native system notifications for compiler events | "true", "false" |

### Performance Considerations

* **mode**: Setting to "development" will significantly reduce compile times as this tells webpack when / how to use
its built-in optimizations.
* **cssSourceMaps**: If your development task doesn't require the use of css source maps, consider disabling them. This
will significantly reduce compile times.
* **cssAutoPrefixer**: Adding vendor prefixes for CSS rules to ensure stable browser support may not be needed while in
development. Disabling this will reduce compile times.
* **jsSourceMaps**: If your development task doesn't require the use of js source maps, consider disabling them. This
will significantly reduce compile times.

## Help and Troubleshooting

Running `npm run help` will generate  help messaging regarding the scripts and allowed arguments.

### My Js and/or Scss isn't generating compiled files

* If you manually touched the static folder, it's possible that the compiler's cache was not properly invalidated. Run
`npm run clean`.
* Ensure that you have the correct configuration of the "sites" array in the package.json. The compiler is dependent on
the cartridge path.
* SCSS partials (any file that begins with an underscore i.e `_productCard.scss` ) are not compiled to stand-alone
  CSS files. SCSS partials are meant to be "@imported" into other non-partial SCSS files.
* Any JS file placed in a sub-directory of the client/default/js directory
  (i.e. `app_lyonscg_mfra/cartridge/client/default/js/product/base.js`) are not compiled to stand-alone JS files.
  These files are meant to be require()'d by files in the `client/default/js` directory.

## Setting up environments for Continuous Integration

### Provisioning API Clients

> Note: This guide assumes that you have Administrator access to your client's organization. If you do not, please work with your TA and PM to get this access, or to have them set the API Clients up.

The recommended setup is to create three API Clients for:

* Staging
* Development
* Sandboxes

To provision an API Client:

1. Go to <https://account.demandware.com>
2. Click API Client
3. Click Add API Client

Fill out the resulting form and take note of your configuration.

> Note: the API "password" you enter in Account Manager is referenced as the Client Secret in the rest of this guide, and elsewhere.

1. Select your corresponding Organization
2. Access Control should be Enabled
3. In Default Scopes:

        roles
        tenantFilter
        profile

4. In Redirect URIs:

        http://localhost:8080

5. All other values left default.

![Account Manager][account-manager]

[account-manager]: images/account-manager.png

## Business Manager Configurations

### OCAPI

On each environment, we need to ensure we have the correct OCAPI configurations.

1. Go to Administration >  Site Development >  Open Commerce API Settings
2. Select type Data and context Global
3. Paste in the following configuration, making sure to replace <client_id> with the client ID you've designated for
that environment.

```json
{
    "_v": "18.1",
    "clients": [{
        "client_id": "<client_id>",
        "resources": [{
            "methods": ["get"],
            "read_attributes": "(**)",
            "write_attributes": "(**)",
            "resource_id": "/code_versions"
        }, {
            "methods": ["patch"],
            "read_attributes": "(**)",
            "write_attributes": "(**)",
            "resource_id": "/code_versions/*"
        }, {
            "methods": ["post"],
            "read_attributes": "(**)",
            "write_attributes": "(**)",
            "resource_id": "/jobs/*/executions"
        }, {
            "methods": ["get"],
            "read_attributes": "(**)",
            "write_attributes": "(**)",
            "resource_id": "/jobs/*/executions/*"
        }]
    }]
}
```

> Tip: instead of manually configuring this on all sandboxes, you can set it up on one and export a Global Site Export
that can be imported to each environment

### WebDav Permissions

On each environment, we need to ensure we have the correct WebDav configurations.

1. Go to Administration >  Organization >  WebDAV Client Permissions
2. Paste in the following configuration, making sure to replace <client_id> with the client ID you've designated for
that environment.

```json
{
    "clients": [{
        "client_id": "<client_id>",
        "permissions": [{
            "path": "/impex",
            "operations": ["read_write"]
        }, {
            "path": "/cartridges",
            "operations": ["read_write"]
        }]
    }]
}
```

> Tip: instead of manually configuring this on all sandboxes, you can set it up on one and export a Global Site Export
> that can be imported to each environment.

## Setting up the deployment project in Jenkins

> Note: This guide assumes that the Jenkins server has already been set up by the AH team. The `sfcc-ci` node package
> is hosted in Bitbucket so the AH team will need to install an SSH key for your Jenkins to be able to pull it in.

### Add the new project to the Jenkins server

On the Jenkins server, you will start at the dashboard and it should look something like this:

![Jenkins Dashboard][jenkins-dashboard]

[jenkins-dashboard]: images/jenkins-dashboard.png

Please choose the "New Item" link in the top left to continue.

On the "New Item" page you will have several options to choose from. You should see a screen similar to the one below:

![Jenkins New Item][jenkins-new-item]

[jenkins-new-item]: images/jenkins-new-item.png

If this is a new server with no projects on it, please use the "Freestyle Project" option. Otherwise, if this server
already has several projects setup it may be faster to use the "Copy existing Item" option to reduce setup time. This
option will copy over all of the settings from the chosen project into your new project. After choosing one of these
options make sure to enter a name for your project in the "Item name" field, preferably using dashes instead of spaces
between words. After this click the "OK" button at the bottom of the form.

On the next page you should see a screen similar to the one below:

![Jenkins Project Configuration][jenkins-project-config]

[jenkins-project-config]: images/jenkins-project-config.png

To continue the setup please choose either the "Git" option for Git repositories or the "Subversion" option for SVN
repositories. Older Jenkins servers may have "Multiple SCMs" as an option here, which can also be used for Git
repositories.

If you are setting up Git repositories please read the following instructions. If not please skip below to the section
on Subversion.

### Git Repository Setup

To setup a Git repositories in Jenkins for use with our build script please choose the "Git" option under "Source
Code Management".

When the option has been chosen you should see a screen similar to the one below:

![Git Options][git-options]

[git-options]: images/git-options.png

Add the SSH Git url (e.g. `git@bitbucket.org:lyonsconsultinggroup/reference-application-sfra.git`) to the "Repository
URL" field.

Then click the "Add" button next to the "Credentials" drop down to add a set of credentials to log into the Git server.

In the field "Branch Specifier (blank for 'any')" specify the branch name if you decide to use one other than master
(e.g. */develop, */release, etc.)

### Build Options Setup

To setup the build options to allow for deployment to the servers scroll to the bottom of the Jenkins project settings.
There is a section called "Build" where the final part of the setup will occur.

In the Build section click th "Add build step" button and select "Invoke Ant"

![Invoke Ant][invoke-ant]

[invoke-ant]: images/jenkins-invoke-ant.png

Enter build options:

![Build Options][build-options]

[build-options]: images/build-options.png

This section will allow you to enter the build file and the properties for the build.

In the "Targets" field, enter all Ant targets you wish to use (e.g. deploy, deploy-data, system-object-report).

In the "Build File" field enter the path relative to the Jenkins workspace to your deployment script. This should be
similar to what is in the path in the image above.

In the "Properties" field enter all of the properties needed for this project. For an explanation of all of the
properties please refer to the [Deploy Properties](DeployProperties.md) document.

After all of the properties have been entered click the "Apply" button at the bottom of the screen. This will save your
project options.

To test out the build, scroll to the top of the configuration and click the "Build Now" option in the upper left. If
everything was setup correctly the build should complete successfully.

### Staging build options

In addition to the other properties above, there are 3 additional options for the Staging build to support 2-factor
authentication:

`twoFactorp12=/var/lib/jenkins/keys/jenkins.p12`

`twoFactorPassword=YOURPASS`

These can be set after generating and uploading the p12 file to Jenkins.

`certHostname=cert.staging.na01.orgname.demandware.net`

Also, the `certHostname` property should begin with `cert` like `cert.staging.na01.orgname.demandware.net`. The
`activationHostname`, `deployHostname` and `hostname` properties will **not** use the prefix (ex. they will use: `staging-na01-orgname.demandware.net`).

### Jenkins Dependencies

#### NPM Modules

The builders.xml Ant task includes the `run npm install.xml` task that utilizes npm to automatically install the package.json specified node modules. The installation task may install tens of thousands of files and thus, on initial run, may take as long as ten minutes to complete. Subsequent runs are exponentially quicker as npm will only update those modules requiring an update. Additionally, the `run npm install.xml` Ant task may be run on independently of builders.xml.
