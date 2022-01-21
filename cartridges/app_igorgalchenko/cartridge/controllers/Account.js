'use strict';

var page = module.superModule;
var server = require('server');

server.extend(page);

var service = require('app_igorgalchenko/cartridge/services/githubservice');

server.prepend(
    'Show',
    function (req, res, next) {
        var CustomerMgr = require('dw/customer/CustomerMgr');

        var viewData = res.getViewData();
        var customer = CustomerMgr.getCustomerByCustomerNumber(
            req.currentCustomer.profile.customerNo
        );
        var profile = customer.getProfile();
        var isUserGitHubSet = true;

        if (req.querystring.args && req.querystring.args === 'userGitHubNotSet') {
            isUserGitHubSet = false;
        }

        if (customer && customer.profile) {
            viewData.userGitHub = {
                isUserGitHubSet: isUserGitHubSet,
                gitHubID: profile.custom.gitHubIDIgorGalchenko,
                gitHubLogin: profile.custom.gitHubLoginIgorGalchenko
            };
        }

        res.setViewData(viewData);

        next();
    }
);

server.prepend(
    'SubmitRegistration',
    function (req, res, next) {
        this.on('route:BeforeComplete', function (req, res) { // eslint-disable-line no-shadow
            var Resource = require('dw/web/Resource');

            var registrationForm = res.getViewData();
            registrationForm.isGitHubInfoChecked = registrationForm.form.customer.attachgithubinfo.checked;

            if (registrationForm.validForm && registrationForm.isGitHubInfoChecked) {
                var url = service.githubservice.getURL() + encodeURIComponent(registrationForm.email + ' in:email');
                var svcResult = service.githubservice.setURL(url).call();

                if (svcResult.status === 'OK') {
                    if (svcResult.object.total_count > 0) {
                        var user = svcResult.object.items[0];

                        registrationForm.githubId = user.id;
                        registrationForm.githubLogin = user.login;
                    } else {
                        registrationForm.validForm = false;

                        res.json({
                            success: false,
                            error: [Resource.msg('error.github.user.not.found', 'registration', null)]
                        });
                    }
                } else {
                    registrationForm.validForm = false;

                    res.setStatusCode(500);
                    res.json({
                        errorMessage: Resource.msgf('error.github.response', 'registration', null, svcResult.status, svcResult.errorMessage)
                    });
                }
            }

            res.setViewData(registrationForm);
        });

        return next();
    }
);

server.append(
    'SubmitRegistration',
    function (req, res, next) {
        this.on('route:BeforeComplete', function (req, res) { // eslint-disable-line no-shadow
            var Transaction = require('dw/system/Transaction');
            var Resource = require('dw/web/Resource');
            var Logger = require('dw/system/Logger');
            var accountHelpers = require('*/cartridge/scripts/helpers/accountHelpers');

            var registrationForm = res.getViewData();

            if (registrationForm.validForm && registrationForm.isGitHubInfoChecked) {
                var customer = registrationForm.authenticatedCustomer;

                if (!customer) {
                    return;
                }

                try {
                    Transaction.wrap(function () {
                        customer.profile.custom.gitHubIDIgorGalchenko = registrationForm.githubId;
                        customer.profile.custom.gitHubLoginIgorGalchenko = registrationForm.githubLogin;
                    });
                } catch (e) {
                    var warningMessage = Resource.msgf('warn.github.unable.set.customer.fields',
                                                            'registration', null, e.fileName, e.lineNumber, e.message, e.stack);

                    Logger.warn(warningMessage);

                    req.session.privacyCache.set('args', 'userGitHubNotSet');
                    res.setStatusCode(500);
                    res.json({
                        redirectUrl: accountHelpers.getLoginRedirectURL(req.querystring.rurl, req.session.privacyCache, true)
                    });
                }
            }
        });

        return next();
    }
);

module.exports = server.exports();
