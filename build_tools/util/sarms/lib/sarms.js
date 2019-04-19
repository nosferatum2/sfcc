const shell = require('shelljs');
const fs = require('fs');

const eh = require('./errorHandler');
const fileUtils = require('./fileUtils');
const fixRepoUrl = require('./fixRepoUrl');

/**
 * @function Return the contents of the 'npm audit' command output which includes any known vulnerabilities for node components
 * 
 * @param {string} auditReportPath - pathname of the temp file to use for the audit report output
 * @return {Object} JSON of dependencies.
 * 
 */
function getAuditReport(auditReportPath) {

  // Ensure the npm audit module has been installed - assumption is that the package-lock.json is in the current working folder 
  var result = shell.exec('npm audit ', {silent:true});

  // A little bit of a hack but trying to find the audit module locally is not as easy as it should be since it's 
  // not required to exist in package.json. 
  if ((result.stdout != undefined) && (result.stdout.includes("Usage: npm <command>"))) {
    eh.errorHandler('error', "Unable to find the npm audit module. Need to upgrade to npm v6.1.0 or higher and run 'npm install audit'.");
  }
  else {
    shell.exec('npm audit --json > ' + auditReportPath);
    try {
      return fileUtils.readJSONFromFile(auditReportPath);      
    } catch (e) {
      eh.errorHandler('error', e);
    }
  }
}


/**
 * @function Creates vulnerability descriptions for components
 * 
 * @param {Object} bomDependencyComponents - component objects created from package.json dependencies element
 * @param {Array} packageDependenciesKeys - array of keys for the package.json dependencies element
 * @param {Array} packageDevDependenciesKeys - array of keys for the package.json devDependencies element
 * @param {String} tempNpmReportPath - pathname to a temp file for use with npm 
 * 
 */
function createComponentVulnerabilityDescriptions(bomDependencyComponents, packageDependenciesKeys, packageDevDependenciesKeys, tempNpmReportPath) {

  // Read audit file
  var auditReport = getAuditReport(tempNpmReportPath),
      actions = auditReport.actions;

  // Delete temp file now that it's been read
  fs.unlinkSync(tempNpmReportPath);
  if (typeof actions == 'undefined') {
    eh.errorHandler('error', "Unable to read the npm audit report in JSON format. The 'npm audit' command may have failed to produce the report.");
  } else {
    // Loop for "actions" in the audit JSON
    for (let action of actions) {
      if (packageDependenciesKeys.includes(action.module) || packageDevDependenciesKeys.includes(action.module)) {
        var resolves = action.resolves,
        vulnerableDesc = "";
   
        // Loop for the resolves[] in the action
        for (let resolve of resolves) {
          var resolveID = resolve.id;
  
          vulnerableDesc += "Short Description: " + auditReport.advisories[resolveID].title + "\n" +
          "  Severity: " + auditReport.advisories[resolveID].severity + "\n" +
          "  More Info: " + auditReport.advisories[resolveID].url + "\n" +
          "  Dependancy Path: " + resolve.path + "\n\n";
  
        }
        bomDependencyComponents[action.module].vulnerableDesc = vulnerableDesc;
        (vulnerableDesc.length > 0) ?
          bomDependencyComponents[action.module].vulnerableChx = true :
          // Will likely never be false, but just in case, it will be set
          bomDependencyComponents[action.module].vulnerableChx = false; 
      }
    }
  }
}


/**
 * @function Builds list of components from node dependencies and devDependencies elements in package.json file
 * 
 * @param {Array} packageDependenciesKeys - array of package.json dependencies elements 
 * @param {Array} packageDevDependenciesKeys - array of package.json devDependencies elements 
 * @param {String} platformName - name of the e-commerce platform to use for components 
 * @param {String} categoryName - name of the component category to use for components
 * @param {String} tempNpmReportPath - pathname to a temp file for use with npm 
 * @return {Object} bomDependencyComponents
 *
 */
function buildListOfComponentsFromPackage(dependencies, dependenciesKeys, platformName, categoryName, tempNpmReportPath) {
  var re = /(\d+\.)(\d+)(\..*)?/g,
      versionString = '',
      bomDependencyComponents = {},
      moduleInfo = {};

  for (let dependencyKey of dependenciesKeys) {
    versionString = dependencies[dependencyKey].match(re);
    versionString == null ? versionString = '' : versionString = versionString[0] + ''; 
    bomDependencyComponents[dependencyKey] = {
      "name" : dependencyKey,
      "version" : versionString,
      "platform" : 'NodeJS',
      "category" : categoryName,
    }
    // If the version in the package.json is not in the semver format (e.g. bitbucket:lyonsconsultinggroup/sfcc-ci.git#master)
    // but appears to look like a url (contains :// or bitbucket:), treat the string like a repo url and set a default version string
    if (versionString == '') {
      bomDependencyComponents[dependencyKey].version = 'not specified';
      if ((dependencies[dependencyKey].search(/^.+:\/\//) >= 0) || (dependencies[dependencyKey].search(/^bitbucket:/) >= 0)) {
        bomDependencyComponents[dependencyKey].repository = fixRepoUrl.fixRepoUrl(dependencies[dependencyKey]);
      }
    } else
      // Otherwise, try to get the details using npm view
      if (shell.exec('npm view ' 
                      + bomDependencyComponents[dependencyKey].name 
                      + '@' + bomDependencyComponents[dependencyKey].version
                      + ' name description homepage repository bugs license gitHead _id --json > '
                      + tempNpmReportPath).code == 0) {
        try {
          moduleInfo = fileUtils.readJSONFromFile(tempNpmReportPath);
        } catch (e) {
          eh.errorHandler('error', e);
        }
        
        fs.unlinkSync(tempNpmReportPath);
        bomDependencyComponents[dependencyKey].description = moduleInfo.description
        if (typeof moduleInfo.bugs != 'undefined') {
          bomDependencyComponents[dependencyKey].description += '\n\nBugs:' + moduleInfo.bugs.url;
        }
        if (typeof moduleInfo.gitHead != 'undefined') {
          bomDependencyComponents[dependencyKey].description += '\n\ngitHead:' + moduleInfo.gitHead;
        }
        if (typeof moduleInfo.repository != 'undefined') {
          bomDependencyComponents[dependencyKey].repository = fixRepoUrl.fixRepoUrl(moduleInfo.repository.url);
        }
        if (typeof moduleInfo.homepage != 'undefined') {
          bomDependencyComponents[dependencyKey].news = moduleInfo.homepage;
        }
      } else {
          eh.errorHandler('warn', 'Unable to execute the ‘npm view’ command for the \'' + dependencyKey + '\' module.');
      }
  }

  return bomDependencyComponents;
}

/**
 * @function Get components (dependency and devDependency node modules) from package.json file
 * 
 * @param {String} packagePath - pathname of the package.json file
 * @param {String} platformName - name of the e-commerce platform to use for components 
 * @param {String} tempNpmReportPath - pathname to a temp file for use with npm 
 * @return {Object} bomDependencyComponents
 *
 */
exports.getComponentsFromPackage =
function getComponentsFromPackage(packagePath, platformName, tempNpmReportPath) {
  
  try {
    var packageObject = fileUtils.readJSONFromFile(packagePath);
  } catch (e) {
    eh.errorHandler('error', e);
  }

  var packageDependencies = packageObject.dependencies ? packageObject.dependencies : {},
      packageDevDependencies = packageObject.devDependencies ? packageObject.devDependencies : {},
      packageDependenciesKeys = packageDependencies ? Object.keys(packageDependencies) : [],
      packageDevDependenciesKeys = packageDevDependencies ? Object.keys(packageDevDependencies) : [],
      bomDependencyComponents = {};

  if (packageDependencies) {    
      Object.assign(bomDependencyComponents, buildListOfComponentsFromPackage(packageDependencies, packageDependenciesKeys, platformName, "NodeJS module: project build", tempNpmReportPath));
  }
  if (packageDevDependencies) {    
      Object.assign(bomDependencyComponents, buildListOfComponentsFromPackage(packageDevDependencies, packageDevDependenciesKeys, platformName, "NodeJS module: project build", tempNpmReportPath));
  }
  createComponentVulnerabilityDescriptions(bomDependencyComponents, packageDependenciesKeys, packageDevDependenciesKeys, tempNpmReportPath);

  return bomDependencyComponents;
}

