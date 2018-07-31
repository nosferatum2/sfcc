/* globals cat, cd, cp, echo, exec, exit, find, ls, mkdir, rm, target, test */
'use strict';
try{
require('shelljs/make');
var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
const chalk = require('chalk');
const verbose = true;

var bootstrapPackages = {
    Alert: 'exports-loader?Alert!bootstrap/js/src/alert',
    // Button: 'exports-loader?Button!bootstrap/js/src/button',
    Carousel: 'exports-loader?Carousel!bootstrap/js/src/carousel',
    Collapse: 'exports-loader?Collapse!bootstrap/js/src/collapse',
    // Dropdown: 'exports-loader?Dropdown!bootstrap/js/src/dropdown',
    Modal: 'exports-loader?Modal!bootstrap/js/src/modal',
    // Popover: 'exports-loader?Popover!bootstrap/js/src/popover',
    Scrollspy: 'exports-loader?Scrollspy!bootstrap/js/src/scrollspy',
    Tab: 'exports-loader?Tab!bootstrap/js/src/tab',
    // Tooltip: 'exports-loader?Tooltip!bootstrap/js/src/tooltip',
    Util: 'exports-loader?Util!bootstrap/js/src/util'
};


module.exports = function (packageName) { 
    console.log(chalk.bgMagenta('Webpack config recieved for ' + packageName));
    var jsFiles = require('./helpers').createJsPath(packageName);
    var scssFiles = require('./helpers').createScssPath(packageName);
    if (verbose) {
        console.log(chalk.gray('Webpack(ing) js files'));
        for (var key in jsFiles){
            console.log('   ' + chalk.gray(jsFiles[key]));
        }
        console.log(chalk.gray('Webpack(ing) scss files'));
        
        for (var key in scssFiles){
          console.log('    ' + chalk.gray(scssFiles[key]));
        }
    }
    
var webpackConfig;
return webpackConfig = 
 [{
    mode: 'production',
    name: 'js',
    entry: jsFiles,
    output: {
        path: path.resolve('./cartridges/' + packageName + '/cartridge/static'),
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                test: /bootstrap(.)*\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/env'],
                        plugins: ['@babel/plugin-proposal-object-rest-spread'],
                        cacheDirectory: true
                    }
                }
            }
        ]
    },
    plugins: [new webpack.ProvidePlugin(bootstrapPackages)]
}, {
    mode: 'none',
    name: 'scss',
    entry: scssFiles,
    output: {
        path: path.resolve('./cartridges/' + packageName + '/cartridge/static'),
        filename: '[name].css'
    },
    module: {
        rules: [{
            test: /\.scss$/,
            use: ExtractTextPlugin.extract({
                use: [{
                    loader: 'css-loader',
                    options: {
                        url: false,
                        minimize: true
                    }
                }, {
                    loader: 'postcss-loader',
                    options: {
                        plugins: [
                            require('autoprefixer')()
                        ]
                    }
                }, {
                    loader: 'sass-loader',
                    options: {
                        includePaths: [
                            path.resolve('node_modules'),
                            path.resolve('node_modules/flag-icon-css/sass')
                        ]
                    }
                }]
            })
        }]
    },
    plugins: [
        new ExtractTextPlugin({ filename: '[name].css' })
    ]
}];
}

}
catch(e){
    console.log('... caught exception ' + e.toString());
}