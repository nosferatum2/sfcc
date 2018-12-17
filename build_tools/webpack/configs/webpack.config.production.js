'use strict';

const path = require('path');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CleanWebpackPlugin = require("clean-webpack-plugin");
const LogCompilerEventsPlugin = require('../plugins/LogCompilerEventsPlugin');
const Compiler = require('./webpack.config.base');

module.exports = class ProductionCompiler extends Compiler {
    constructor(site) {
        super(site);
        this.mode = 'production';
        this.devtool = false;
        this.entry = super.getEntries(site.cartridges);
        this.output = super.getOutput(site.cartridges);
        this.module = super.getModule()
        this.resolve = super.getResolver(site.cartridges);
        this.plugins = this.getPlugins(site.cartridges);
    };
    
    getPlugins(cartridges) {
        const plugins = super.getPlugins(cartridges);
        plugins.unshift(new CleanWebpackPlugin([`${this.output.path}/*/css`, `${this.output.path}/*/js`, ".cache-loader"], {
            root: process.cwd(),
            verbose: false
        }));
        plugins.push(new OptimizeCssAssetsPlugin());
        plugins.push(new LogCompilerEventsPlugin({
            cartridges: cartridges,
            mode: 'production'
        }));
        return plugins;
    }
};