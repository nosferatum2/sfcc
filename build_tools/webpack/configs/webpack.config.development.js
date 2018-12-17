'use strict';

const Compiler = require('./webpack.config.base');
const WebpackNotifierPlugin = require('webpack-notifier');
const LogCompilerEventsPlugin = require('../plugins/LogCompilerEventsPlugin');

module.exports = class DevelopmentCompiler extends Compiler {
    constructor(site) {
        super(site.cartridges);
        this.mode = 'development';
        this.devtool = 'cheap-module-source-map';
        this.entry = super.getEntries(site.cartridges);
        this.output = super.getOutput(site.cartridges);
        this.module = this.getModule();
        this.resolve = super.getResolver(site.cartridges);
        this.plugins = this.getPlugins(site.cartridges);
    }; 

    getModule() {
        const module = super.getModule();
        module.rules[1].use.unshift({ loader: 'cache-loader' }); 
        return module;
    };

    getPlugins(cartridges) {
        const plugins = super.getPlugins(cartridges);
        plugins.push(new WebpackNotifierPlugin({title: 'Webpack'}));
        plugins.push(new LogCompilerEventsPlugin({
            cartridges: cartridges,
            mode: 'development'
        }));
        return plugins;
    }
};
