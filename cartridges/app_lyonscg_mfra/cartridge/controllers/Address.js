'use strict';

var page = module.superModule;
var server = require('server');

server.extend(page);

var ecommerce = require('*/cartridge/scripts/middleware/ecommerce');

server.prepend('List', ecommerce.checkEcommerceEnabled, function(req, res, next) {
    next();
});

server.prepend('AddAddress', ecommerce.checkEcommerceEnabled, function(req, res, next) {
    next();
});

server.prepend('EditAddress', ecommerce.checkEcommerceEnabled, function(req, res, next) {
    next();
});

server.prepend('SaveAddress', ecommerce.checkEcommerceEnabled, function(req, res, next) {
    next();
});

server.prepend('DeleteAddress', ecommerce.checkEcommerceEnabled, function(req, res, next) {
    next();
});

server.prepend('SetDefault', ecommerce.checkEcommerceEnabled, function(req, res, next) {
    next();
});

server.prepend('Header', ecommerce.checkEcommerceEnabled, function(req, res, next) {
    next();
});

module.exports = server.exports();