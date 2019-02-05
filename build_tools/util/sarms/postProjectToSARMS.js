/**
 * @fileoverview This creates the bill-of-materials for a client project and sends it to the SARMS system. 
 *  
 * This is written for the Salesforce Commerce Cloud RefApp SiteGenesis style of 
 * build process as well as the SFCC SFRA build process. It would need significant
 * enhancements to support other platforms such as SAP Hybris, Magento or Magento 2.
 * 
 * To run the script, execute 'node postProjectToSARMS -h" to see the command line arguments.
 *
 **/

// Include local library functions
const eh = require('./lib/errorHandler');
const fileUtils = require('./lib/fileUtils');
const fixRepoUrl = require('./lib/fixRepoUrl');
const sarms = require('./lib/sarms');

// Include node modules
const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
const readline = require('readline');
const request = require('request');
const rp = require('request-promise');

function initOptions() {
  var appConfig = {}

  // The values below are used as defaults in optionator and are placed here for convenience and easier maintenance
  appConfig.appVersion = 'Version 2.1.0';
  
  var defaultPlatform = 'Salesforce Commerce Cloud';
  var defaultCategory = 'SFCC cartridge';
  // Default platform-specific security news url for projects
  var defaultPlatformSecurityNewsUrl = 'https://xchange.demandware.com/community/developer/security-notifications';
  var defaultVersionsFilePath = 'projectComponentVersions.json';
  var defaultConfigFilePath = 'config.json';
  var defaultPackageFilePath = 'package.json';
  // Pathname of folder containing api login credentials
  var defaultApiCredentialsPath = 'api_credentials.json';

  // URL for the node server which listens for service calls at this domain and port
  var sarmsServerUrl = 'http://localhost:1337';

  // Default value for the switch to create the project BOM object and display it on console but do not submit it to SARMS
  var testMode = false;

  // Path of temporary file containing output of 'npm audit' command
  var tempNpmReportPath = 'tmp_createProjectBOM_npm_audit.json';

  const optionator = require('optionator')({
    prepend: 'Usage: postProjectToSARMS [options]',
    append: appConfig.appVersion,
    options: [{
        option: 'help',
        overrideRequired: true,
        alias: 'h',
        type: 'Boolean',
        description: 'Generate help message',
        example: '-h'
      }, {
        option: 'version',
        overrideRequired: true,
        alias: 'v',
        type: 'Boolean',
        description: 'Display the version of this application.',
        example: '-v'
      }, {
        option: 'test-mode',
        default: testMode,
        type: 'Boolean',
        description: 'Create the project BOM object and display it on console but do not submit it to SARMS.',
        example: '--test-mode'
      }, {
        option: 'client-name',
        required: true,
        type: 'String',
        description: 'Name of the client for this project.',
        example: '--client-name "ABC, Inc."'
      }, {
        option: 'platform-name',
        default: defaultPlatform,
        type: 'String',
        description: 'Name of the platform for this project. Must be "Salesforce Commerce Cloud", "Salesforce Commerce Cloud SFRA", "Salesforce CloudCraze", "SAP Hybris", "Magento", "Magento 2", "NodeJS", "Jenkins", "Symfony", or "Zend".',
        example: '--platform-name ' + defaultPlatform
      }, {
        option: 'platform-category',
        default: defaultCategory,
        type: 'String',
        description: 'Name of the default category for project components.',
        example: '--platform-category ' + defaultCategory
      }, {
        option: 'platform-news',
        default: defaultPlatformSecurityNewsUrl,
        type: 'String',
        description: 'Platform-specific security news url for the project.',
        example: '--platform-news https://magento.com/security'
      }, {
        option: 'api-credentials-path',
        default: defaultApiCredentialsPath,
        type: 'path::String',
        description: 'Pathname to the file containing Atlassian access credentials used to retrieve user contact information.',
        example: '--api-credentials-path ' + defaultApiCredentialsPath
      }, {
        option: 'version-file',
        default: defaultVersionsFilePath,
        type: 'path::String',
        description: 'Pathname to the file containing component versions created by the "create-project-component-versions" script.',
        example: '--version-file ' + defaultVersionsFilePath
      }, {
        option: 'config-file',
        default: defaultConfigFilePath,
        type: 'path::String',
        description: 'Pathname to the config.json file. Used only for projects for the "Salesforce Commerce Cloud" platform',
        example: '--config-file ' + defaultConfigFilePath
      }, {
        option: 'package-file',
        default: defaultPackageFilePath,
        type: 'path::String',
        description: 'Pathname to the package.json file.',
        example: '--package-file ' + defaultPackageFilePath
      }, {
        option: 'temp-npm-report-path',
        default: tempNpmReportPath,
        type: 'path::String',
        description: 'Pathname of temp file used for storing npm output when running automated security reviews.',
        example: '--temp-npm-report-path'
      }, {
        option: 'sarms-server-url',
        default: sarmsServerUrl,
        type: 'String',
        description: 'url of the the SARMS server running services to receive the project BOM JSON object.',
        example: '--sarms-server-url ' + sarmsServerUrl
      }]
  });

  appConfig.options = optionator.parse(process.argv);
  if (appConfig.options.help) {
    console.log(optionator.generateHelp());
    process.exit(0);
  }
  if (appConfig.options.version) {
    console.log('postProjectToSARMS version ' + appConfig.appVersion);
    process.exit(0);
  }
  
  if (!appConfig.options.testMode) { appConfig.options.testMode = false; }

  if (appConfig.options.platformName == 'Salesforce Commerce Cloud') {
//    if (!fs.existsSync(appConfig.options.versionFile)) { eh.errorHandler('error', 'The ' + appConfig.options.versionFile + ' file does not exist.'); }
    if (!fs.existsSync(appConfig.options.configFile)) { eh.errorHandler('error', 'The ' + appConfig.options.configFile + ' file does not exist.'); }
  }
  if (!fs.existsSync(appConfig.options.packageFile)) {
    eh.errorHandler('error', 'The ' + appConfig.options.packageFile + ' file does not exist.');
  }

  if (!fs.existsSync(appConfig.options.apiCredentialsPath)) {
    eh.errorHandler('error', 'The ' + appConfig.options.apiCredentialsPath + ' file does not exist.');
  } else {
    try {
      appConfig.apiCredentials = fileUtils.readJSONFromFile(appConfig.options.apiCredentialsPath);
    } catch (e) {
      eh.errorHandler('error', 'Unable to open the api credentials file: ' + e);
    }
  }

  return appConfig
}

/**
 * @function Get cartridges and version attributes from versionPath file
 *
 * @param {array} obj - Array of cartridges versions used in a project, pulled from versionPath file
 * @param {string} platform - String representation of platform project is on. 
 * @param {string} category - String representation of category component falls into. 
 * @param {array} components - Components array for pushing data to.
 * @returns {object} - JSON array of objects containing all the projects components attributes
 * 
 */
function getComponentsFromVersions(obj, platformName, category, components=[]) {
  
  if (typeof obj == 'undefined' || obj.length == 0 ) {
      eh.errorHandler('error', 'Data for project components and versions from version file undefined or empty in getComponentsFromVersions.')
  } else {
    for (let key of Object.keys(obj)) {
      var entries = obj[key][1][1].entries;
      for (let entry of Object.keys(entries) ) {
        components.push(
          {
            "name" : entries[entry].filename, 
            "version" : entries[entry].version,
            "platform" : platformName,
            "category" : category
          }
        );
      }
    }
  }
  return components;
}


/**
 * @function Create components for SFRA cartridges in the package.json sites element
 *
 * @param {string} version - Version number to use for cartridges found in the sites element 
 * @param {array} obj - Sites element of the package.json file
 * @returns {object} - JSON array of objects containing the components 
 * 
 */
function createComponentsFromSFCCConfig(version, sitesObj, platformName, components=[]) {
  
  if ((typeof version == 'undefined' || version.length == 0 ) || (typeof sitesObj == 'undefined' || sitesObj.length == 0 )) {
      eh.errorHandler('error', 'Data for project site components undefined or empty in createComponentsFromSFCCConfig.')
  } else {
    for (var i = 0; i < sitesObj.length; i++) {
      for (let key of Object.keys(sitesObj[i].cartridges)) {
          components.push(
            {
              "name"     : path.basename(sitesObj[i].cartridges[key]),  // Just take the leaf element of the path 
              "version"  : version,
              "platform" : platformName,
              "category" : 'SFCC cartridge'
            }
          );
      }
    }
    
    for (var i = 0; i < sitesObj.length; i++) {
      for (let key of Object.keys(sitesObj[i].javascriptPluginPaths)) {
          components.push(
            {
              "name"     : path.basename(sitesObj[i].javascriptPluginPaths[key]),  // Just take the leaf element of the path 
              "version"  : 'not specified',
              "platform" : platformName,
              "category" : 'NodeJS module: project source'
            }
          );
      }
    }
  }
  return components;
}


/**
 * @function Create components for SFRA cartridges in the package.json sites element
 *
 * @param {string} version - Version number to use for cartridges found in the sites element 
 * @param {array} obj - Sites element of the package.json file
 * @returns {object} - JSON array of objects containing the components 
 * 
 */
function createComponentsFromSFRASites(version, defaultDescription, sitesObj, platformName, category, components=[]) {
  
  if ((typeof version == 'undefined' || version.length == 0 ) || (typeof sitesObj == 'undefined' || sitesObj.length == 0 )) {
      eh.errorHandler('error', 'Data for project site components undefined or empty in createComponentsFromSFRASites.')
  } else {
    var description = '';
    if (typeof defaultDescription != 'undefined') description = 'From ' + defaultDescription;
    for (var i = 0; i < sitesObj.length; i++) {
      for (var j = 0; j < sitesObj[i].cartridges.length; j++) {
        components.push(
          {
            "name"     : sitesObj[i].cartridges[j].name, 
            "version"  : version,
            "platform" : platformName,
            "category" : category,
            "description": description
          }
        );
      }
    }
  }
  return components;
}


/**
 * @function Create project description using sites info 
 *
 * @param {object} obj - Object containing all sites for a project.
 * @returns {string} sites - Returns a new line separated list of sites in a project
 * 
 */
function getSiteList(obj) {
  
  if (!obj) {
      eh.errorHandler('error', 'Object containing project sites undefined in getSiteList');
  }

  var sites = 'Sites:\n';
  for (var i = 0; i < obj.length; i++) {
    // SFCC RefApp project info comes from config.json sites array name element
    // SFCC SFRA project info comes from package.json sites array packageName element
    if (typeof obj[i].name == 'string') {
      sites += obj[i].name + "\n";
    } else if (typeof obj[i].packageName == 'string') {
      sites += obj[i].packageName + "\n";      
    }
  }
  return sites.trim();
}


/**
 * @function Create the project-level data for an SFCC client project
 *
 * @param {string} clientName - Name of the client for this project
 * @param {string} platformName - e-commerce platform for the project
 * @param {string} category - Category for the component(s)
 * @param {string} versionPath - Pathname of version json file
 * @param {string} configPath - Pathname of config.json file
 * @param {string} packagePath - Pathname of package.json file
 * @returns {object} newJSON - Returns a JSON object suitable for persisting to SARMS services
 * 
 */
function getProjectInfo(clientName, platformName, category, versionPath, configPath, packagePath) {
  var components = [];
  var sites = {};

  try {
      var packageData = fs.readFileSync(packagePath);
  } catch (e) {
      eh.errorHandler('error', e, packagePath);
  }
  var packageObj  = JSON.parse(packageData);
  
  var projectAttributesData = {
      name: clientName,
      version: packageObj.version,
      client: clientName,
      news: APP_CONFIG.options.platformNews,
      platform: platformName
  }
  // Set the start of the description to use as the default for SFRA cartridges
  if (typeof packageObj.description != 'undefined') { projectAttributesData.description = packageObj.description; }
  if (typeof packageObj.lcgversion != 'undefined') { projectAttributesData.description += ' ' + packageObj.lcgversion; }
    
  if (platformName == 'Salesforce Commerce Cloud') {
    try {
      var configData = fs.readFileSync(configPath);
    } catch (e) {
      eh.errorHandler('error', e, configPath);
    }
    var configObj = JSON.parse(configData);
    sites = configObj.sites;
    
    // The versionPath file is only for SFCC projects (not SFRA) and is optional. If not provided, the components that are
    // included in the base refapp in the javascriptPluginPaths element will be given a default "not specified" version string
    if (fs.existsSync(versionPath)) { 
      try {
        var versionData = fs.readFileSync(versionPath);
      } catch (e) {
          eh.errorHandler('error', e, versionPath);
      }
      var versionObj = JSON.parse(versionData);
      components = getComponentsFromVersions(versionObj['Version Data'], platformName, 'NodeJS module: project source');
    } else {
      components = createComponentsFromSFCCConfig(packageObj.version, sites, platformName);
    } 
  } else if (platformName == 'Salesforce Commerce Cloud SFRA') {
      sites = packageObj.sites;
      components = createComponentsFromSFRASites(packageObj.version, projectAttributesData.description, sites, platformName, category);
    }
  
  projectAttributesData.description += '\n\n' + getSiteList(sites);
  if (typeof packageObj.bugs != 'undefined') { projectAttributesData.description += '\n\nBugs: ' + packageObj.bugs.url; }
  if (typeof packageObj.repository != 'undefined') { projectAttributesData.repository = fixRepoUrl.fixRepoUrl(packageObj.repository.url); }

  var newJSON = Object.assign({}, projectAttributesData, {components: components});

  return newJSON;
}


/**
 * @function Creates project/component object for SFCC projects
 * 
 * @param {string} clientName - Name of the client for this project
 * @param {string} platformName - e-commerce platform for the project
 * @param {string} versionPath - Pathname of version json file
 * @param {string} configPath - Pathname of config.json file
 * @param {string} packagePath - Pathname of package.json file
 * @return {Object} JSON object of project BOM.
 * 
 */
function createProjectBOM_SFCC(clientName, platformName, versionFilePath, configPath, packagePath) {
  var bomObject = getProjectInfo(clientName, platformName, APP_CONFIG.options.platformCategory, versionFilePath, configPath, packagePath),
      projectDependencies = sarms.getComponentsFromPackage(packagePath, platformName, APP_CONFIG.options.tempNpmReportPath),
      components = bomObject.components;

  //Adding project dependencies to components array
  for (let key in projectDependencies) {
    components.push(projectDependencies[key]);
  }
  return bomObject;
}


/**
 * @function Post BOM object to SARMS services
 * 
 * @param {object} bomObject - project/component object to post
 * 
 */
async function postToSARMS(bomObject) {
  var options = {
        method: 'POST',
        url: APP_CONFIG.options.sarmsServerUrl + '/token?user=build_script&api=insertOrUpdateProjectWithComponents&param1=null',
        headers: { 
          'token' : APP_CONFIG.apiCredentials.token,
          'Content-Type': 'application/json' },
        body: JSON.stringify(bomObject)
      }

  if (APP_CONFIG.options.testMode) {
    console.log('Test mode active: this project BOM object will NOT be submitted to SARMS.\n' + JSON.stringify(bomObject)); 
    return true;    
  } else {
    return await rp(options)
      .then(function (response) {
          return true;
        })
      .catch(function (err) {
        eh.errorHandler('error', 'Exception occurred while sending BOM object to services: ' + err);
        return false;
      });
  }
}

/**
 * @function Driver to create the project/component object (aka bill-of-materials or BOM)
 *
 * @param {string} clientName - Name of the client for this project
 * @param {string} platformName - e-commerce platform for the project
 * @param {string} versionFilePath - Pathname of version json file
 * @param {string} configFilePath - Pathname of config.json file
 * @param {string} packageFilePath - Pathname of package.json file
 * @return {Object} project/component object ready to send to the SARMS system
 * 
 */
function createBOM(clientName, platformName, versionFilePath, configFilePath, packageFilePath) {
  var bomObject = {};

  switch (platformName) {
    case 'Salesforce Commerce Cloud': 
    case 'Salesforce Commerce Cloud SFRA': 
      bomObject = createProjectBOM_SFCC(clientName, platformName, versionFilePath, configFilePath, packageFilePath);
      break;
    default: eh.errorHandler('error', 'The \'' + platformName + '\' platform is not currently supported.')
  }
  
  return bomObject;
}


/**
 * @function Main driver to create and post the project/component object (aka bill-of-materials or BOM)
 *
 */

var APP_CONFIG = initOptions();

// Create the project/component object for the current platform
var bomObject = createBOM(APP_CONFIG.options.clientName, APP_CONFIG.options.platformName,  
                          APP_CONFIG.options.versionFile, APP_CONFIG.options.configFile, 
                          APP_CONFIG.options.packageFile);

// Post the resulting object to the SARMS system
postToSARMS(bomObject);

console.log('Project \'' + bomObject.name + '\' (v' + bomObject.version + ') with ' + bomObject.components.length + ' components was sent for processing');

