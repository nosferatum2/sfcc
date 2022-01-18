'use strict';

/**
 * Github User
 * @param {string} customerLogin - customer login
 * @returns {Object} - object
 */
function getGithubUser(customerLogin) {
    var CustomerMgr = require('dw/customer/CustomerMgr');
    var customer = CustomerMgr.getCustomerByLogin(customerLogin);
    if (!customer) {
        return {};
    }

    var customerProfile = customer.getProfile();

    return JSON.parse(customerProfile.custom.staszhalbaGithubUserJson);
}

module.exports = function (object, currentCustomer) {
    Object.defineProperty(object, 'githubUser', {
        enumerable: true,
        value: getGithubUser(currentCustomer.profile.email)
    });
};
