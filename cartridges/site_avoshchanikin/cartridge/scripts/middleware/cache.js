'use strict';

var base = module.superModule;

/**
 * Applies the custom expiration value for the page cache.
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next call in the middleware chain
 * @returns {void}
*/
function applyCustomCache(req, res, next) {
    res.cachePeriod = 6; // eslint-disable-line no-param-reassign
    res.cachePeriodUnit = 'hours'; // eslint-disable-line no-param-reassign
    next();
}

base.applyCustomCache = applyCustomCache;
module.exports = base;
