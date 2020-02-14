'use strict';

/**
 * Account base controller overridden to prepend new middleware to all the existing routes
 * Middleware checks if ecommerce functionality is enabled for site then call next function in middleware chain otherwise redirect user to homepage
 *
 */

var page = module.superModule;
var server = require('server');

server.extend(page);

var ecommerce = require('*/cartridge/scripts/middleware/ecommerce');

server.prepend('Show', ecommerce.checkEcommerceEnabled, function (req, res, next) {
    next();
});

server.prepend('Login', ecommerce.checkEcommerceEnabled, function (req, res, next) {
    next();
});

/**
 * Account base controller appended to add hook for account locked email template which is missing in SFRA base.
 *
 */
server.append('Login', ecommerce.checkEcommerceEnabled, function (req, res, next) {
    var CustomerMgr = require('dw/customer/CustomerMgr');
    var Resource = require('dw/web/Resource');
    var Site = require('dw/system/Site');
    var Transaction = require('dw/system/Transaction');

    var emailHelpers = require('*/cartridge/scripts/helpers/emailHelpers');
    var hooksHelper = require('*/cartridge/scripts/helpers/hooks');

    var URLUtils = require('dw/web/URLUtils');

    var email = req.form.loginEmail;
    var password = req.form.loginPassword;
    var rememberMe = req.form.loginRememberMe
        ? (!!req.form.loginRememberMe)
        : false;

    var customerLoginResult = Transaction.wrap(function () {
        var authenticateCustomerResult = CustomerMgr.authenticateCustomer(email, password);

        if (authenticateCustomerResult.status !== 'AUTH_OK') {
            var errorCodes = {
                ERROR_CUSTOMER_DISABLED: 'error.message.account.disabled',
                ERROR_CUSTOMER_LOCKED: 'error.message.account.locked',
                ERROR_CUSTOMER_NOT_FOUND: 'error.message.login.form',
                ERROR_PASSWORD_EXPIRED: 'error.message.password.expired',
                ERROR_PASSWORD_MISMATCH: 'error.message.password.mismatch',
                ERROR_UNKNOWN: 'error.message.error.unknown',
                default: 'error.message.login.form'
            };

            var errorMessageKey = errorCodes[authenticateCustomerResult.status] || errorCodes.default;
            var errorMessage = Resource.msg(errorMessageKey, 'login', null);

            return {
                error: true,
                errorMessage: errorMessage,
                status: authenticateCustomerResult.status,
                authenticatedCustomer: null
            };
        }

        return {
            error: false,
            errorMessage: null,
            status: authenticateCustomerResult.status,
            authenticatedCustomer: CustomerMgr.loginCustomer(authenticateCustomerResult, rememberMe)
        };
    });

    if (customerLoginResult.error) {
        if (customerLoginResult.status === 'ERROR_CUSTOMER_LOCKED') {
            var context = {
                customer: CustomerMgr.getCustomerByLogin(email) || null,
                url: URLUtils.https('Login-Show')
            };

            var emailObj = {
                to: email,
                subject: Resource.msg('subject.account.locked.email', 'login', null),
                from: Site.current.getCustomPreferenceValue('customerServiceEmail') || 'no-reply@salesforce.com',
                type: emailHelpers.emailTypes.accountLocked
            };

            // this sends an email to the customer. This will only get called if the hook handler is account locked
            hooksHelper('app.customer.email', 'sendEmail', [emailObj, 'account/accountLockedEmail', context], function (sendEmailObj, template, sendContext) {
                var Mail = require('dw/net/Mail');
                var renderTemplateHelper = require('*/cartridge/scripts/renderTemplateHelper');

                var sendEmail = new Mail();
                sendEmail.addTo(emailObj.to);
                sendEmail.setSubject(emailObj.subject);
                sendEmail.setFrom(emailObj.from);
                sendEmail.setContent(renderTemplateHelper.getRenderedHtml(sendContext, template), 'text/html', 'UTF-8');
                sendEmail.send();
            });
        }

        res.json({
            error: [customerLoginResult.errorMessage || Resource.msg('error.message.login.form', 'login', null)]
        });

        return next();
    }
    return next();
});

server.prepend('SubmitRegistration', ecommerce.checkEcommerceEnabled, function (req, res, next) {
    next();
});

server.append('SubmitRegistration', ecommerce.checkEcommerceEnabled, function (req, res, next) {
    var CustomerMgr = require('dw/customer/CustomerMgr');
    var Resource = require('dw/web/Resource');
    var formErrors = require('*/cartridge/scripts/formErrors');
    var registrationForm = server.forms.getForm('profile');
    if (!CustomerMgr.isAcceptablePassword(registrationForm.login.password.value)) {
        registrationForm.login.password.valid = false;
        registrationForm.login.password.error =
            Resource.msg('error.message.password.constraints.not.matched', 'forms', null);
        registrationForm.valid = false;
    }
    if (!CustomerMgr.isAcceptablePassword(registrationForm.login.passwordconfirm.value)) {
        registrationForm.login.passwordconfirm.valid = false;
        registrationForm.login.passwordconfirm.error =
            Resource.msg('error.message.password.constraints.not.matched', 'forms', null);
        registrationForm.valid = false;
    }
    if (!registrationForm.valid) {
        res.json({
            fields: formErrors.getFormErrors(registrationForm)
        });
    }
    return next();
});

server.prepend('EditProfile', ecommerce.checkEcommerceEnabled, function (req, res, next) {
    var ContentMgr = require('dw/content/ContentMgr');
    var content = ContentMgr.getContent('tracking_hint');
    var viewData = res.getViewData();
    viewData.caOnline = content.online;
    res.setViewData(viewData);
    next();
});

server.prepend('SaveProfile', ecommerce.checkEcommerceEnabled, function (req, res, next) {
    next();
});

server.prepend('EditPassword', ecommerce.checkEcommerceEnabled, function (req, res, next) {
    next();
});

server.prepend('SavePassword', ecommerce.checkEcommerceEnabled, function (req, res, next) {
    next();
});

server.prepend('PasswordResetDialogForm', ecommerce.checkEcommerceEnabled, function (req, res, next) {
    next();
});

server.prepend('PasswordReset', ecommerce.checkEcommerceEnabled, function (req, res, next) {
    next();
});

server.prepend('SetNewPassword', ecommerce.checkEcommerceEnabled, function (req, res, next) {
    next();
});

server.prepend('SaveNewPassword', ecommerce.checkEcommerceEnabled, function (req, res, next) {
    next();
});

server.prepend('Header', ecommerce.checkEcommerceEnabled, function (req, res, next) {
    next();
});

module.exports = server.exports();
