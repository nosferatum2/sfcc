'use strict';

/**
 * Account base controller overridden to prepend new middleware to all the existing routes
 * Middleware checks if ecommerce functionality is enabled for site then call next function in middleware chain otherwise redirect user to homepage
 *
 */


var server = require('server');
var cache = require('*/cartridge/scripts/middleware/cache');
var Site = require('dw/system/Site');

server.get('Start', cache.applyDefaultCache, function (req, res, next) {
    var template = '/hello/helloWorld';
    //res.setViewData({ param1: Site.current.name });
    //res.render(template);
    res.json({ param1: Site.current.name });
    next();
});

module.exports = server.exports();
