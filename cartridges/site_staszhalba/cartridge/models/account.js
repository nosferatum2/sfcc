'use strict';

var base = module.superModule;
var githubUserDecorator = require('*/cartridge/models/decorators/githubUser');

/**
 * Account class that represents the current customer's profile dashboard
 * @param {Object} currentCustomer - Current customer
 * @param {Object} addressModel - The current customer's preferred address
 * @param {Object} orderModel - The current customer's order history
 * @constructor
 */
function account(currentCustomer, addressModel, orderModel) {
    base.call(this, currentCustomer, addressModel, orderModel);

    githubUserDecorator(this, currentCustomer);
}

module.exports = account;
