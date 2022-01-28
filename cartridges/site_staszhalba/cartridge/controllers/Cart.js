'use strict';

var page = module.superModule;
var server = require('server');

server.extend(page);

var csrfProtection = require('*/cartridge/scripts/middleware/csrf');

/**
 * Is customer added to program
 * @param {Object} session - Session object
 * @returns {boolean} - true | false
 */
function isCustomerAddedToProgram(session) {
    var customerProgram = session.raw.custom.isCustomerAddedToProgram;
    if (customerProgram === 'undefined') {
        throw new Error();
    }

    return !!customerProgram;
}

server.append('MiniCartShow', function (req, res, next) {
    var viewData = res.getViewData();
    var session = req.session;

    if (!session) {
        return next();
    }

    try {
        viewData.isCustomerAddedToProgram = isCustomerAddedToProgram(session);
    } catch (e) {
        return next();
    }

    res.setViewData(viewData);

    return next();
});

server.append('Show', function (req, res, next) {
    var viewData = res.getViewData();
    var session = req.session;

    if (!session) {
        return next();
    }

    try {
        viewData.isCustomerAddedToProgram = isCustomerAddedToProgram(session);
    } catch (e) {
        return next();
    }

    res.setViewData(viewData);

    return next();
});

server.post(
    'AddToProgramAjax',
    server.middleware.https,
    csrfProtection.validateAjaxRequest,
    function (req, res, next) {
        var URLUtils = require('dw/web/URLUtils');
        var Resource = require('dw/web/Resource');

        var currentCustomer = req.currentCustomer || {};
        var session = req.session || {};

        if (!currentCustomer || !session) {
            res.json({
                success: false,
                errorMessage: Resource.msg('error.something.went.wrong', 'githubRepositories', null)
            });
            return next();
        }

        session.raw.custom.isCustomerAddedToProgram = true;

        res.json({
            success: true,
            redirectUrl: URLUtils.url('Cart-Show').toString()
        });

        return next();
    }
);

module.exports = server.exports();
