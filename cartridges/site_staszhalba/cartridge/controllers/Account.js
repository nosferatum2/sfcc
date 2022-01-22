'use strict';

/**
 * Account base controller overridden to prepend new middleware to all the existing routes
 * Middleware checks if ecommerce functionality is enabled for site then call next function in middleware chain otherwise redirect user to homepage
 *
 */

var page = module.superModule;
var server = require('server');

server.extend(page);

// eslint-disable-next-line consistent-return
server.prepend('SubmitRegistration', function (req, res, next) {
    var viewData = res.getViewData();
    var registrationForm = server.forms.getForm('profile');

    if (!registrationForm.customer.attachgithubinfo.checked) {
        return next();
    }

    var Resource = require('dw/web/Resource');
    var GithubServiceRegistry = require('*/cartridge/scripts/serviceregistry/GithubServiceRegistry');

    var serviceResponse = GithubServiceRegistry.githubService.call({
        email: registrationForm.customer.email.value
    });

    if (serviceResponse.object.success !== true) {
        res.setStatusCode(500);
        res.json({
            success: false,
            errorMessage: Resource.msg('error.github.account.not.found', 'account', null)
        });

        this.emit('route:Complete', req, res);
        // eslint-disable-next-line consistent-return
        return;
    }

    viewData.githubUser = {
        id: serviceResponse.object.data.user.id,
        login: serviceResponse.object.data.user.login
    };

    res.setViewData(viewData);

    next();
});

server.append('SubmitRegistration', function (req, res, next) {
    var viewData = res.getViewData();
    var registrationForm = server.forms.getForm('profile');
    if (!registrationForm.valid || !registrationForm.customer.attachgithubinfo.checked || !viewData.githubUser) {
        return next();
    }

    this.on('route:BeforeComplete', function () { // eslint-disable-line no-shadow
        var Transaction = require('dw/system/Transaction');
        if (!viewData.validForm) {
            return;
        }

        var profile = viewData.authenticatedCustomer.profile;

        Transaction.wrap(function () {
            profile.custom.staszhalbaGithubUserJson = JSON.stringify(viewData.githubUser);
        });
    });

    return next();
});

module.exports = server.exports();
