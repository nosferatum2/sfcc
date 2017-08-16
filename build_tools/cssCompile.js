'use strict';

const autoprefixer = require('autoprefixer');
const sass = require('node-sass');
const shell = require('shelljs');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');

const cwd = process.cwd();
const TEMP_DIR = path.resolve(cwd, './tmp');
const TEMP_SCSS_LIBRARY_DIR = path.join(TEMP_DIR, 'scss', 'libraries');
const TEMP_SCSS_SOURCE_DIR = path.join(TEMP_DIR, 'scss', 'source');

const allPaths = new Set();
let baseCartridgePath = '';

function getPaths(packagePath) {
    console.log(packagePath);
    const packageText = shell.cat(path.join(packagePath, '../..', 'package.json'));
    if (packageText) {
        const paths = JSON.parse(packageText).paths;
        if (paths) {
            Object.keys(paths).forEach(name => {
                allPaths.add(name);
            });
        }
        return paths;
    }
    return null;
}

function getDirectories(srcpath) {
    return fs.readdirSync(srcpath)
        .filter(file => fs.lstatSync(path.join(srcpath, file)).isDirectory());
}

function copyOneProject(basePath, destinationPath) {
    const locales = getDirectories(basePath);
    locales.forEach(locale => {
        const resolvedDestination = path.join(destinationPath, locale);
        shell.mkdir('-p', resolvedDestination);
        shell.cp('-r', path.join(basePath, locale), destinationPath);
    });
}

function copyDependancies(basePath, destinationPath, items) {
    if (!items) {
        copyOneProject(basePath, destinationPath);
    } else {
        Object.keys(items).forEach(item => {
            if (item === 'base') {
                baseCartridgePath = items[item];
            }
            copyOneProject(basePath, destinationPath);
            copyDependancies(
                path.join(items[item], 'cartridge/client/scss'),
                path.join(TEMP_SCSS_LIBRARY_DIR, item),
                getPaths(items[item])
            );
        });
    }
}

module.exports = function compileCss(packageFile) {
    const modules = packageFile.paths;
    const currentCartridgeName = packageFile.packageName || packageFile.name;
    const libraries = [];
    let sourceDir = path.join(cwd, '../cartridges/' + currentCartridgeName + '/cartridge/client/scss');
    let filePattern = '';

    copyDependancies(sourceDir, TEMP_SCSS_SOURCE_DIR, modules);

    if (modules) {
        Object.keys(modules).forEach(key => {
            if (key === 'base') {
                libraries.push(
                    path.join(cwd, modules[key], '../..', 'node_modules'));
                libraries.push(
                    path.join(cwd, modules[key], '../..', 'node_modules/flag-icon-css/sass'));
            }
            allPaths.add(key);
        });

        if (baseCartridgePath) {
            libraries.push(
                path.join(cwd, baseCartridgePath, '../..', 'node_modules'));
            libraries.push(
                path.join(cwd, baseCartridgePath, '../..', 'node_modules/flag-icon-css/sass'));
        }
        libraries.push(TEMP_SCSS_LIBRARY_DIR);
        console.log(libraries);
        sourceDir = TEMP_SCSS_SOURCE_DIR;
        filePattern = TEMP_SCSS_SOURCE_DIR + '/**/*.scss';
    } else {
        // assume that this is a base module and add libraries
        libraries.push(path.join(cwd, '../node_modules'));
        libraries.push(path.join(cwd, '../node_modules/flag-icon-css/sass'));
        sourceDir =
            path.join(cwd,
                '../cartridges/'
                + currentCartridgeName
                + '/cartridge/client/scss/');
        filePattern = sourceDir + '/**/*.scss';
    }

    const sassRenderer = filePath =>
        (resolve, reject) => {
            sass.render({
                file: filePath,
                includePaths: libraries,
                outputStyle: 'compressed',
                importer: (url) => {
                    let resultUrl = url;
                    const pathParts = url.split(path.sep);
                    let modulesCondition = false;
                    if (modules) {
                        modulesCondition = allPaths.has(pathParts[0]);
                    }
                    if (modulesCondition && pathParts.length > 1
                        && !(/^[a-z]{2}_[A-Z]{2}$/gm.test(pathParts[1]))
                    ) {
                        pathParts.splice(1, 0, 'default');
                        resultUrl = path.join.apply(null, pathParts);
                    }
                    return { file: resultUrl };
                }
            }, (error, result) => {
                if (error) {
                    reject({ file: filePath, error });
                } else {
                    resolve({ file: filePath, css: autoprefixer.process(result.css).css });
                }
            });
        };

    const compilationArray = shell.find(filePattern).filter(file => {
        const lastDir = file.lastIndexOf('/');
        return file[lastDir + 1] !== '_';
    });

    return new Promise((resolve, reject) => {
        Promise.all(compilationArray.map(filePath => new Promise(sassRenderer(filePath))))
            .then(values => {
                const changedFiles = [];
                console.log('Files written:');
                values.forEach(value => {
                    const fileName = value.file.replace('.scss', '.css');
                    const offsetPath = path.relative(sourceDir, fileName);
                    const pathParts = offsetPath.split(path.sep);
                    let locale = '';
                    if (pathParts.length > 0
                        && (pathParts[0] === 'default'
                        || /^[a-z]{2}_[A-Z]{2}$/gm.test(pathParts[0]))
                    ) {
                        locale = pathParts[0];
                    }
                    const targetDirectory = path.join(
                        cwd,
                        '../cartridges/'
                        + currentCartridgeName
                        + '/cartridge/static/'
                        + locale
                        + '/css');
                    const offsetPathFile = offsetPath.substring(offsetPath.indexOf(path.sep) + 1);
                    const targetFile = path.join(targetDirectory, offsetPathFile);
                    if (!fs.existsSync(path.dirname(targetFile))) {
                        shell.mkdir('-p', path.dirname(targetFile));
                    }
                    if (fs.existsSync(targetFile)) {
                        const fileContent = shell.cat(targetFile);
                        if (fileContent.toString() !== value.css) {
                            changedFiles.push(targetFile);
                        }
                    }
                    fs.writeFileSync(targetFile, value.css);
                    console.log(offsetPathFile);
                });
                resolve(changedFiles);
            }).catch(error => {
                console.error(chalk.red('Failed to compile scss files. ' + error));
                reject(error);
            });
    });
};
