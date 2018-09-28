'use strict';

/**
 * CheckoutServices base controller overridden to prepend new middleware to all the existing routes
 * Middleware checks if ecommerce functionality is enabled for site then call next function in middleware chain otherwise redirect user to homepage
 *
 */

var page = module.superModule;
var server = require('server');

server.extend(page);

var ecommerce = require('*/cartridge/scripts/middleware/ecommerce');

server.prepend('Get', ecommerce.checkEcommerceEnabled, function (req, res, next) {
    next();
});

server.prepend('SubmitPayment', ecommerce.checkEcommerceEnabled, function (req, res, next) {
    next();
});

server.prepend('PlaceOrder', ecommerce.checkEcommerceEnabled, function (req, res, next) {
    next();
});

module.exports = server.exports();
