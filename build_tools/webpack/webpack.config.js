'use strict';

const path = require('path');
const fs = require('fs');
const glob = require("glob");
const webpack = require('webpack');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const MiniCssExtractPluginCleanup = require("./plugins/MiniCssExtractPluginCleanup");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const WebpackNotifierPlugin = require('webpack-notifier');
const LogCompilerEventsPlugin = require('./plugins/LogCompilerEventsPlugin');

module.exports = class WebpackConfigurator {
    constructor(site, options) {
        this.site = site;
        this.options = options;
        this.cartridges = site.cartridges;
        this.cartridgesPath = path.resolve(process.cwd(), "cartridges");
        this.siteCartridge = this.cartridges[this.cartridges.findIndex(cartridge => cartridge.alias === 'site')];
    };

    create() {
        return [
            this.createJsConfiguration(),
            this.createScssConfiguration()
        ];
    };

    createJsConfiguration() {
        return Object.assign(this.getCommonConfigurationOptions(), {
            name    : 'js',
            entry   : this.getJsFiles(),
            module  : this.handleJsModules(),
            resolve : this.getResolver('js'),
            plugins : this.getJsPlugins(),
            devtool : this.isOption('jsSourceMaps') ? 'cheap-module-source-map' : 'none'
        });
    };    

    createScssConfiguration() {
        return Object.assign(this.getCommonConfigurationOptions(), {
            name    : 'scss',
            entry   : this.getScssFiles(),
            module  : this.handleScssModules(),
            resolve : this.getResolver('scss'),
            plugins : this.getScssPlugins(),
            devtool : this.isOption('cssSourceMaps') ? 'cheap-module-source-map' : 'none'
        });
    };

    getCommonConfigurationOptions() {
        return {
            mode   : this.getOption('mode'),
            output : this.getOutput(),
            stats  : this.getStats()
        };
    };

    getOutput() {
        return {
            path: path.resolve(this.cartridgesPath, this.siteCartridge.name, "cartridge/static"),
            filename: "[name].js"
        };
    };

    getJsFiles() {
        const files = new Object();

        this.cartridges.forEach(cartridge => {
            const clientPath = path.resolve(this.cartridgesPath, cartridge.name, "cartridge/client");
            glob.sync(path.resolve(clientPath, "*", "js", "*.js")).forEach(file => {
                const key = path.join(path.dirname(path.relative(clientPath, file)), path.basename(file, ".js"));
                if (!files.hasOwnProperty(key)) {
                    files[key] = file;
                }
            });
        });
        return files;
    };

    getScssFiles() {
        const files = new Object();

        this.cartridges.forEach(cartridge => {
            const clientPath = path.resolve(this.cartridgesPath, cartridge.name, "cartridge/client");
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

    handleJsModules() {
        return {
            rules: [
                {
                    test: /bootstrap(.)*\.js$/,
                    exclude: /(node_modules)/,
                    use: this.getJsLoaders()
                }
            ]
        }
    };

    handleScssModules() {
        return {
            rules: [
                {
                    test: /\.scss$/,
                    use: this.getScssLoaders()
                }
            ]
        }
    };

    getJsLoaders() {
        const loaders = new Array();

        // Transpile ES6 into a backwards compatible version of JavaScript in current and older browsers or environments
        loaders.unshift({
            loader: 'babel-loader',
            options: {
                presets: ['@babel/env'],
                plugins: ['@babel/plugin-proposal-object-rest-spread'],
                cacheDirectory: true,
                compact: false,
                babelrc: false
            }
        });

        if (this.isOption('mode', 'development')) {
            // Caches the result of following loaders on disk (default) or in the database
            loaders.unshift({ loader: 'cache-loader' });
        }

        return loaders;
    };

    getScssLoaders() {
        const sourceMap = this.isOption('cssSourceMaps');
        const loaders = new Array();

        // Compile Sass to CSS
        loaders.unshift({
            loader: 'sass-loader',
            options: {
                sourceMap: sourceMap,
                includePaths: [
                    path.resolve('node_modules'),
                    path.resolve('node_modules/flag-icon-css/sass')
                ]
            }
        });

        // Automatically add vendor prefixes to CSS rules
        // This increases build time; thus, we can optionally include this loader with the 'cssAutoPrefixer' flag
        if (this.isOption('cssAutoPrefixer')) {
            loaders.unshift({
                loader: 'postcss-loader',
                options: {
                    sourceMap: sourceMap,
                    plugins: [
                        require('autoprefixer')()
                    ]
                }, 
            });
        }
    
        // Intrepret @import and url() like import/require() and will resolve them
        // This loader converts the CSS to a CommonJS JavaScript module
        loaders.unshift({
            loader: 'css-loader',
            options: {
                url: false,
                sourceMap: sourceMap,
                importLoader: loaders.length
            }
        });
    
        // Extracts CSS from the generated CommonJS JavaScript modules into separate files. 
        loaders.unshift({ loader: MiniCssExtractPlugin.loader });
    
        if (this.isOption('mode', 'development')) {
            // Caches the result of following loaders on disk (default) or in the database
            loaders.unshift({ loader: 'cache-loader' });
        }
    
        return loaders;
    };

    getResolver(type) {
        const aliases = new Object();

        this.cartridges.forEach(cartridge => {
            const clientPath = path.resolve(this.cartridgesPath, cartridge.name, "cartridge/client");
            aliases[cartridge.alias] = path.join(clientPath, 'default', type);
            
            if (fs.existsSync(clientPath)) {
                const locales = fs.readdirSync(clientPath)
                    .map(name => path.join(clientPath, name))
                    .filter(folder => fs.lstatSync(folder).isDirectory())
                    .filter(folder => folder.charAt(0) !== '.')
                    .filter(folder => path.basename(folder) !== 'default') // added a filter to block hidden folders, like .DS_Store
                
                for (let locale in locales) {
                    const name = path.basename(locales[locale]);
                    aliases[path.join(cartridge.alias, name)] = path.join(clientPath, name, type);
                }
            }
        });

        return {
            modules: ["node_modules", path.resolve(__dirname, "cartridges")],
            alias: aliases,
        };
    };

    getJsPlugins() {
        const plugins = new Array();
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

        plugins.push(new webpack.ProvidePlugin(bootstrapPackages));
        
        plugins.push(new LogCompilerEventsPlugin({
            cartridges: this.cartridges,
            type: 'js'
        }))
        
        if (this.isOption('notifications')) {
            plugins.push(new WebpackNotifierPlugin({
                title: `${this.siteCartridge.name} JS Compiler`,
                alwaysNotify: true
            }));
        }

        return plugins;
    };

    getScssPlugins() {
        const plugins = new Array();

        if (this.isOption('mode', 'production')) {
            plugins.push(new CleanWebpackPlugin([
                `${this.output.path}/*/css`, 
                `${this.output.path}/*/js`, 
                ".cache-loader"
            ], {
                root: process.cwd(),
                verbose: false
            }));

            plugins.push(new OptimizeCssAssetsPlugin());
        }
        
        plugins.push(new MiniCssExtractPlugin({
            filename: "[name].css",
            chunkFilename: "[id].css"
        }));
        
        plugins.push(new MiniCssExtractPluginCleanup());
        
        plugins.push(new LogCompilerEventsPlugin({
            cartridges: this.cartridges,
            type: 'scss'
        }));

        if (this.isOption('notifications')) {
            plugins.push(new WebpackNotifierPlugin({
                title: `${this.siteCartridge.name} SCSS Compiler`,
                alwaysNotify: true
            }));
        }

        return plugins;
    };

    getStats() {
        return (this.isOption('verbose')) ? "normal" : 'errors-only';
    }

    isOption(key, value) {
        return (value) ? (this.options.hasOwnProperty(key) && this.options[key] === value) :
                         (this.options.hasOwnProperty(key) && this.options[key] === 'true');
    };

    getOption(key) {
        return this.options[key];
    };
};
