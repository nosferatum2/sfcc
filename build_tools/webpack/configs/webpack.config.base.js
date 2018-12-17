'use strict';

const path = require('path');
const glob = require("glob");
const webpack = require('webpack');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const MiniCssExtractPluginCleanup = require("../plugins/MiniCssExtractPluginCleanup");

module.exports = class Compiler {
    constructor(site) {
        this.stats = {
            all: false,
            errors: true,
            errorDetails: true,
        }
    }

    getEntries(cartridges) {
        const files = {};
        const cartridgesPath = path.resolve(process.cwd(), "cartridges");

        cartridges.forEach(cartridge => {
            const clientPath = path.resolve(cartridgesPath, cartridge.name, "cartridge/client");
            // Add entry points for JS files
            glob.sync(path.resolve(clientPath, "*", "js", "*.js")).forEach(file => {
                const key = path.join(path.dirname(path.relative(clientPath, file)), path.basename(file, ".js"));
                if (!files.hasOwnProperty(key)) {
                    files[key] = file;
                }
            });
            // Add entry points for Scss files
            glob.sync(path.resolve(clientPath, "*", "scss", "**", "*.scss"))
            .filter(file => !path.basename(file).startsWith("_"))
            .forEach(file => {
                let key = path.join(path.dirname(path.relative(clientPath, file)), path.basename(file, ".scss"));
                key = key.replace('scss', 'css');
                if (!files.hasOwnProperty(key)) {
                    files[key] = file;
                }
            });
        });
        return files;
    };
 
    getOutput(cartridges) {
        const cartridgesPath = path.resolve(process.cwd(), "cartridges");
        const siteCartridge = cartridges[cartridges.findIndex(cartridge => cartridge.alias === 'site')];
        return {
            path: path.resolve(cartridgesPath, siteCartridge.name, "cartridge/static"),
            filename: "[name].js"
        };
    };

    getModule() {
        return {
            rules: [
                {
                    test: /bootstrap(.)*\.js$/,
                    exclude: /(node_modules)/,
                    use: this.getJsLoaders()
                }, 
                {
                    test: /\.scss$/,
                    use: this.getSassLoaders()
                }
            ]
        }
    };

    getJsLoaders() {
        return [
            {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/env'],
                    plugins: ['@babel/plugin-proposal-object-rest-spread'],
                    cacheDirectory: true,
                    compact: false,
                    babelrc: false
                }
            }
        ];
    };

    getSassLoaders() {
        return [
            {   
                loader: MiniCssExtractPlugin.loader 
            },
            {   
                loader: 'css-loader',
                options: {
                    url: false,
                    sourceMap: true,
                    importLoader: 2
                }
            },
            {
                loader: 'postcss-loader',
                options: {
                    sourceMap: true,
                    plugins: [
                        require('autoprefixer')()
                    ]
                }
            },
            {
                loader: 'sass-loader',
                options: {
                    sourceMap: true,
                    includePaths: [
                        path.resolve('node_modules'),
                        path.resolve('node_modules/flag-icon-css/sass')
                    ]
                }
            }
        ];
    };

    getResolver(cartridges) {
        const cartridgesPath = path.resolve(process.cwd(), "cartridges");
        const aliases = {};
        cartridges.forEach(cartridge => {
            const clientPath = path.resolve(cartridgesPath, cartridge.name, "cartridge/client");
            aliases[cartridge.alias] = path.resolve(clientPath, "default");
        });
        return {
            modules: ["node_modules", path.resolve(__dirname, "cartridges")],
            alias: aliases,
        };
    };

    getPlugins(cartridges) {
        const bootstrapPackages = {
            Alert: 'exports-loader?Alert!bootstrap/js/src/alert',
            // Button: 'exports-loader?Button!bootstrap/js/src/button',
            Carousel: 'exports-loader?Carousel!bootstrap/js/src/carousel',
            Collapse: 'exports-loader?Collapse!bootstrap/js/src/collapse',
            // Dropdown: 'exports-loader?Dropdown!bootstrap/js/src/dropdown',
            Modal: 'exports-loader?Modal!bootstrap/js/src/modal',
            // Popover: 'exports-loader?Popover!bootstrap/js/src/popover',
            Scrollspy: 'exports-loader?Scrollspy!bootstrap/js/src/scrollspy',
            Tab: 'exports-loader?Tab!bootstrap/js/src/tab',
            Tooltip: 'exports-loader?Tooltip!bootstrap/js/src/tooltip',
            Util: 'exports-loader?Util!bootstrap/js/src/util'
        };
        
        return [
            new webpack.ProvidePlugin(bootstrapPackages),
            new MiniCssExtractPlugin({
                filename: "[name].css",
                chunkFilename: "[id].css"
            }),
            new MiniCssExtractPluginCleanup(),
        ];
    };   
};
