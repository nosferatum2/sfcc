'use strict';

const shell = require('shelljs');
const path = require('path');
const packageTemplate = require('./cartridgeTemplates/package');
const dw = require('./cartridgeTemplates/dw');
const dotProject = require('./cartridgeTemplates/dotProject');
const projectProperties = require('./cartridgeTemplates/projectProperties');

module.exports = (cartridgeName, cwd) => {
    // create folder structure
    shell.mkdir(path.join(cwd, '../cartridges'));
    shell.mkdir(path.join(cwd, '../cartridges', cartridgeName));
    const cartridgePath = path.join(cwd, '../cartridges', cartridgeName, 'cartridge');
    shell.mkdir(cartridgePath);
    shell.mkdir(path.join(cartridgePath, 'controllers'));
    shell.mkdir(path.join(cartridgePath, 'models'));
    shell.mkdir(path.join(cartridgePath, 'templates'));
    shell.mkdir(path.join(cartridgePath, 'templates', 'default'));
    shell.mkdir(path.join(cartridgePath, 'templates', 'resources'));
    shell.mkdir(path.join(cartridgePath, 'client'));
    shell.mkdir(path.join(cartridgePath, 'client', 'js'));
    shell.mkdir(path.join(cartridgePath, 'client', 'js', 'default'));
    shell.mkdir(path.join(cartridgePath, 'client', 'scss'));
    shell.mkdir(path.join(cartridgePath, 'client', 'scss', 'default'));

    // create .project file for cartrdige

    shell.ShellString(dotProject(cartridgeName))
        .to(path.join(cwd, '../cartridges', cartridgeName, '.project'));

    // create .properties file for cartridge

    shell.ShellString(projectProperties(cartridgeName))
        .to(path.join(cartridgePath, cartridgeName + '.properties'));
};
