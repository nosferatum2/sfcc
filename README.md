# Storefront Reference Architecture (SFRA)

This is a repository for the customized LyonsCG version of the Storefront Reference Architecture reference application.

Storefront Reference Architecture has a base cartridge (`app_storefront_base`) provided by Commerce Cloud that is never directly customized or edited. Instead, customization cartridges are layered on top of the base cartridge. This change is intended to allow for easier adoption of new features and bug fixes.
Storefront Reference Architecture supplies an [plugin_applepay](https://github.com/SalesforceCommerceCloud/plugin-applepay) plugin cartridge to demonstrate how to layer customizations for the reference application.

Please refer to our Confluence documentation for information and best practices regarding the new archtecture and how to override/extend server side and client side code.

SFRA Essentials Guide - https://lyonscg.atlassian.net/wiki/spaces/Intranet/pages/637372481/SFRA+Essentials+Guide+Draft

Client Side JavaScript Stack - https://lyonscg.atlassian.net/wiki/spaces/Intranet/pages/646985985/Client+Side+JavaScript+Stack+SFRA+Draft


The functional requirements for our LyonsCG version of SFRA are being maintained here - https://lyonscg.atlassian.net/wiki/spaces/SRV/pages/513802942/Functional+Requirements

## What's New

We keep our SFRA copy periodically updated with whatever version Salesforce considers "released". That version number is in our package.json file. You will see a "version" attribute near the top that indicates the Salesforce release we are in sync with, and an "lcgversion" which is our LyonsCG release number that will correspond with the list of tickets in the CHANGES.md file.

The CHANGES.md file offers an itemized list of internal ticket numbers that have been worked on for any particular release.

New features that we've added get a high level description and are maintained here - https://lyonscg.atlassian.net/wiki/spaces/Intranet/pages/568494465/SFRA+Finish+Grades+Features+Roadmap

## Getting Started

SFRA Setup Guide - https://lyonscg.atlassian.net/wiki/spaces/Intranet/pages/647171135/SFCC+Setup+Guide+SFRA+Under+Review

## Node version

The package.json file now specifies which version of node you should be running for installing our build tools.

---

## Quick Start

**A detailed setup guide is available! See [SFCC Setup Guide (SFRA)](https://lyonscg.atlassian.net/wiki/spaces/Intranet/pages/647171135?atlOrigin=eyJpIjoiYmJjYWNhNDdmYmUwNDE5Njg1YjE1YTg0NGIzYzJiNzAiLCJwIjoiYyJ9) on Confluence.**

**Complete documentation on SFRA npm scripts found in this Quick Start and the project is available in the [Build Tools README](./build_tools/README.md)**

### 1. Clone this repository.

```bash
git clone https://[YOUR-BITBUCKET-USERNAME]@bitbucket.org/lyonsconsultinggroup/reference-application-sfra.git
```

### 2. Install Project Dependencies

```bash
# move into root of project
cd reference-application-sfra

# install dependencies
npm install
```

### 3. Configure Upload Settings

Open [the dw.json example file](./dw.json.example)

You should see this JSON object:
```json
{
  "username": "myLogin",
  "password": "mySecretPassword",
  "clientId": "myClientIdApikey",
  "clientSecret": "myClientSecretPass",
  "hostname": ["dev01-na01-evaluation.demandware.net"],
  "activationHostname": ["dev01-na01-evaluation.demandware.net"],
  "code-version": "sfra",
  "dataBundle": "core"
}
```
Create a new dw.json file in the root directory by copying this example file.

The dw.json setup of the "username" and "password" depends on whether your environment has **Unified Authentication** enabled or not.

#### "Unified Authentication" Sandbox dw.json Settings

- `"username"`: Your Salesforce account manager username (email) i.e myUsername@lyonscg.com.
- `"password"`: Your Salesforce account manager password.

#### "No Unified Authentication" Sandbox dw.json Settings

- `"username"`: Your username to the specific sandbox instances i.e myUsername.
- `"password"`: The password set for the user on the specific sandbox instance.

#### Common dw.json Settings

- `"clientId"`: A valid Commerce Cloud API key which will be administered by the TA, TL, or lead developer. This is **required** for code-activation and site-import scripts; however, it is not required to upload code via VS Code's prophet debugger, Eclipse's digital server connection, or dwupload.
- `"clientSecret"`: A valid Commerce Cloud API secret which will be administered by the TA, TL, or lead developer. This is **required** for code-activation and site-import scripts; however, it is not required to upload code via VS Code's prophet debugger, Eclipse's digital server connection, or dwupload.
- `"hostname"`: An string hostname to the instance you are assigned. Code and data deployment scripts use this property 
    unless `deployHostname` has been set.
- `"deployHostname"`: An array of hostnames to the instances you want to deploy to. Code and data deployment scripts
    use this property first, if set, otherwise they will fall back to `hostname`. Can also be specified as a
    comma-delimited string.
- `"activationHostname"`: An array of hostnames to the instances you are assigned. Code version activation scripts use this property. Can also be specified as a comma-delimited string.
- `"code-version"`: The code version to deploy and activate code on.
- `"dataBundle"`: The data bundle(s) to deploy


### 4. OCAPI and WebDAV Settings

If you do not have a valid Commerce Cloud API key and secret (the `"clientId"` and `"clientSecret"` set in the dw.json), you can skip this step.

The code and deployment scripts depend on certain OCAPI and WebDav settings / permissions.

#### OCAPI

1. Navigate to Administration > Site Development > Open Commerce API Settings
2. Select the Data API (use the "Select type" drop-down)
3. Setup or confirm that a client object is setup with the following configuration:
```json
{
  "clients" : [ {
    "client_id" : "myClientIdApikey",
    "resources" : [ {
      "methods" : [ "get" ],
      "read_attributes" : "(**)",
      "write_attributes" : "(**)",
      "resource_id" : "/code_versions"
    }, {
      "methods" : [ "patch" ],
      "read_attributes" : "(**)",
      "write_attributes" : "(**)",
      "resource_id" : "/code_versions/*"
    }, {
      "methods" : [ "post" ],
      "read_attributes" : "(**)",
      "write_attributes" : "(**)",
      "resource_id" : "/jobs/*/executions"
    }, {
      "methods" : [ "get" ],
      "read_attributes" : "(**)",
      "write_attributes" : "(**)",
      "resource_id" : "/jobs/*/executions/*"
    } ]
  } ]
}
```

#### Webdav

1. Navigate to Adminstration > Organization > WebDAV Client Permissions
2. Setup of confirm that a client object is setup with the following configuration: 

```json
{
  "clients" : [ {
    "client_id" : "myClientIdApikey",
    "permissions" : [ {
      "path" : "/impex",
      "operations" : [ "read_write" ]
    }, {
      "path" : "/cartridges",
      "operations" : [ "read_write" ]
    } ]
  } ]
}

```

### 5. Sites and Cartridge Path Configuration

Open [the package.json file](./package.json)

Verify that the `"sites"` array property and the cartridge array per site object is properly configured. OOTB this property is configured correctly.  
If you're setting up a new project implementation see the [Build Tools README's](./build_tools/README.md) **Sites and Cartridge Path Configuration** section.


### 6. Compile Front-End Assets

```bash
# Compile fonts
npm run compile:fonts

# Compile client-side Js files
npm run compile:js

# Compile client-side Scss files
npm run compile:scss

# Compile the SVG sprite file
npm run compile:svg
```

You can verify the compilation of the Js and Css files by navigating to `cartridges/site_siteid/cartridge/static/default`

#### Pro front-end development tip: use the watcher!

```bash
# Watch for and compile any changes made to client-side JS or Sass files
npm run watch
```

### 7. Upload Code

It is highly recommended that you use your IDE tools to handle the cartridge uploading. VSCode's Prophet Debugger and the Eclipse server connection are going to be way more efficient at uploading code to your sandbox. The various upload commands included with our build tools are intended for a Jenkins server to be able to deploy code.

#### VS Code + Prophet Debugger Extension

Prophet Debugger uses your dw.json upload code (you do **not** need a clientId and/or clientSecret configured). It will watch for any file changes and upload automatically.

[Install Prophet Debugger](https://marketplace.visualstudio.com/items?itemName=SqrTT.prophet)

Additional documentation and setup for using VS Code as your IDE is available. See [Visual Studio Code - SFCC](https://lyonscg.atlassian.net/wiki/spaces/Intranet/pages/206670879/Visual+Studio+Code+-+SFCC?atlOrigin=eyJpIjoiNDU0N2U5YWJkMTc0NDkwOThhNmE2MzJmOWE0N2YwMWUiLCJwIjoiYyJ9) on confluence.

#### Eclipse Digital Server Connection

You can use Eclipse's digital server connection to upload your code. See the official [Salesforce B2C Docs](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/SiteDevelopment/UploadCartridges.html?resultof=%22%64%69%67%69%74%61%6c%22%20%22%64%69%67%69%74%22%20%22%73%65%72%76%65%72%22%20) on uploading cartridges.

#### LYONSCG deployCartridges script

If you have a valid Commerce Cloud API key and secret (the `"clientId"` and `"clientSecret"` set in the dw.json), you can run:

```bash
# Upload all cartridges and activate the code version that is specified in the dw.json
npm run deployCartridges
```

#### dwupload

The dwupload cli may be used to upload your code. See [dwupload on npm](https://www.npmjs.com/package/dwupload) for documentation.


### 8. Deploy Data

If you have a valid Commerce Cloud API key and secret (the `"clientId"` and `"clientSecret"` set in the dw.json), you can run:

```bash
# Deploy the data bundle that is specified in the dw.json
npm run deployData

```

Visit [the LYONSCG SFRA Data repository](https://bitbucket.org/lyonsconsultinggroup/sfra-storefront-data/) if you need a full set of static content (images), as that was omitted from this repository.

---

## NPM Scripts

**See the [Build Tools README](./build_tools/README.md)** for complete documentation on all the npm scripts available to aid in your development.

## Git Hooks

This application ships with a set if git hooks used to ensure standards (code and otherwise) are followed. Please see [husky](https://github.com/typicode/husky) for more info.

In the case of an **_emergency_**, you can bypass a git hook by passing the `--no-verify` flag. For example:

`git commit --no-verify`

## ESLint

ESLint is the linter of choice for JavaScript. It can be configured in two primary ways:

1. Configuration Comments (should rarely be used)
2. Configuration Files (primary method for configuring ESLint)

The configuration file used by LYONSCG (and the SFCC community) are `.eslintrc.json` files (not YAML, etc).

Searching through the codebase you'll note a number of `.eslintrc.json` files. Configuration files located higher in the file tree are extended by files lower in the tree.

When adding a LINK Cartridge (or other 3rd party cartridge) to the codebase: if the cartridge does not pass linting out-of-the-box and does not include it's own `.eslintrc.json` configuration file, add a suitable one to the cartridge root. It should stay as close as possible to the rules defined by LYONSCG (see the configuration file located in the root of this repo).

See the [ESLint user-guide](https://eslint.org/docs/user-guide/configuring) for more info.

#Page Designer Components for Storefront Reference Architecture
See: [Page Desinger Components](./page-designer-components.md)
