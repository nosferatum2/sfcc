/* globals cat, cd, cp, echo, exec, exit, find, ls, mkdir, rm, target, test */
'use strict';

require('shelljs/make');
var path = require('path');
var webpack = require('webpack');

var createJSPath = function (cartridge) {
    var result = {};

    var jsFiles = ls('./tmp/'+ cartridge +'/js/*.js');

    jsFiles.forEach(function (filePath) {
        var name = path.basename(filePath, '.js');
        result[name] = filePath;
    });

    return result;
};

module.exports = function(env) {
    return {
        name: 'js',
        entry: createJSPath(env.cartridge),
        output: {
            path: path.resolve('../cartridges/'+ env.cartridge +'/cartridge/static/default/js/'),
            filename: '[name].js'
        },
        module: {
            loaders: [
                {
                    test: /bootstrap(.)*\.js$/,
                    loader: 'babel-loader',
                    query: {
                        presets: ['es2015']
                    }
                }
            ]
        },
        plugins: [new webpack.optimize.UglifyJsPlugin({
            minimize: true,
            sourceMap: true,
            compress: {
                drop_console: true
            },
            mangle: {
                except: ['$', 'exports', 'require']
            }
        })]
    };
};
