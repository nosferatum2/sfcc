'use strict';

var Site = require('dw/system/Site');

/**
 * Middleware to check if product compare feature is enabled or disabled for site
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next call in the middleware chain
 * @returns {void}
 */
function checkEnabled(req, res, next) {
    var enableProductCompare = Site.getCurrent().getCustomPreferenceValue('enableProductCompare');
    if (enableProductCompare !== null && enableProductCompare) {
        next();
    } else {
        next(new Error('Params do not match route'));
    }
}

module.exports = {
    checkEnabled: checkEnabled
};
