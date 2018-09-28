'use strict';

var page = module.superModule;
var server = require('server');

server.extend(page);

var ecommerce = require('*/cartridge/scripts/middleware/ecommerce');

server.prepend('Show', ecommerce.checkEcommerceEnabled, function (req, res, next) {
    next();
});

server.get('Logout', ecommerce.checkEcommerceEnabled, function (req, res, next) {
    next();
});

server.prepend('OAuthLogin', ecommerce.checkEcommerceEnabled, function (req, res, next) {
    next();
});

server.prepend('OAuthReentry', ecommerce.checkEcommerceEnabled, function (req, res, next) {
    next();
});

module.exports = server.exports();
