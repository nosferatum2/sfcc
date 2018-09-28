'use strict';

var page = module.superModule;
var server = require('server');

server.extend(page);

var ecommerce = require('*/cartridge/scripts/middleware/ecommerce');

server.prepend('Login', ecommerce.checkEcommerceEnabled, function (req, res, next) {
    next();
});

server.prepend('Begin', ecommerce.checkEcommerceEnabled, function (req, res, next) {
    next();
});

module.exports = server.exports();
