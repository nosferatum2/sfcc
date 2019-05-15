# Deployment Build Properties

Below is a list of the properties that can be used as part of the build process. These properties can be defined in the Jenkins Ant properties section:

## Build Settings

**buildVersion** - the code version to use during deployment. Uses the Jenkins build date by default.

**versionCartridgeName** - the cartridge name that will contain the version.properies that will be replaced by Jenkins. This prints the build number in the html title tag. Please note that the file is completely overwritten and the only contents are "global.version.number={buildVersion}". You will need to make sure that "global.site.name" is still defined in a cartridge to the left of the cartridge name defined here. For example, set **versionCartridgeName** to "app_lyonscg_mfra" and make sure that "org_organizationid_mfra" has overwritten/contains "global.site.name"

## Two Factor Authentication Settings

**twoFactorp12** - path to the file that contains the key used for authentication.

**twoFactorPassword** - password to use with the key file.

**selfSigned** - allows for two factor auth to work with self-signed cert. Possible options are: 'true' or 'false' (without quotes).

## B2C Commerce Settings

**user** - username used to log into the B2C Commerce instances. ( **Required** )

**password** - password used to log into the B2C Commerce instances. ( **Required** )

**hostname** - string reference to a single instance to upload the code or data to
(e.g. `lyons1.evaluation.dw.demandware.net`). ( **Required, unless `deployHostname` is set** )

**deployHostname** - An array of hostnames to the instances you want to deploy to. Code and data deployment scripts
use this property first, if set, otherwise they will fall back to `hostname`. Can also be specified as a comma-delimited
string. (e.g. `['lyons1.evaluation.dw.demandware.net','lyons2.evaluation.dw.demandware.net']` or `lyons1.evaluation.dw.demandware.net,lyons2.evaluation.dw.demandware.net`).

**activationHostname** - An array of hostnames to the instances to activate the code on. Can also be specified as a
comma-delimited string. (e.g. `['lyons1.evaluation.dw.demandware.net','lyons2.evaluation.dw.demandware.net']` or `lyons1.evaluation.dw.demandware.net,lyons2.evaluation.dw.demandware.net`).

## Data Deploy

**dataBundle** - the data bundle name to deploy to the B2C Commerce instances (e.g. core). ( **Required** )

## Confluence Reporting

**atlassianUsername** - A valid Atlassian username for use in posting the reports via the Confluence REST API.

**atlassianApiKey** - A valid Atlassian API Key for use in posting the reports via the Confluence REST API.

**confluenceBaseUrl** - The base URL for the Confluence Space where reports will be posted. The default is
`https://lyonscg.atlassian.net/wiki` which is for all of the LyonsCG Confluence spaces. Only include this if posting
reports to a third-party Confluence space.

**confluenceSpaceKey** - Confluence Space Key for the space in which to post reports.

**confluenceSystemObjectsPage** - Confluence Page Title for the page in which to post the System Objects Report.

**confluenceBuildReportsPage** - Confluence Page Title for the page in which to post the Build Report.

**confluenceExpandMacroId** - A valid macro ID for the `expand` macro in Confluence. This is used in the Build Reports. The
default is `fdf003e7-3808-4493-9455-9252b3a56b4c` which is for the LyonsCG `expand` macro. Only include this if posting
reports to a third-party Confluence space.
