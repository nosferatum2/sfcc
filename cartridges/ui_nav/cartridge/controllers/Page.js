'use strict';

var server = require('server');
var cache = require('*/cartridge/scripts/middleware/cache');

// Reference to Page controller higher in cartridge path

var page = module.superModule; // eslint-disable-line no-unused-vars

server.replace(
    'IncludeHeaderMenu',
    server.middleware.get,
    server.middleware.include,
    cache.applyDefaultCache,
    function (req, res, next) {
        var Navigation = require('*/cartridge/models/navigation');
        res.render('/components/header/menu', {
            Navigation: new Navigation()
        });
        next();
    }
);

module.exports = server.exports();
