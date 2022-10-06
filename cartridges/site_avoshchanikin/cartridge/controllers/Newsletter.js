'use strict';

var server = require('server');
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');

server.get('Show',
    server.middleware.https,
    csrfProtection.generateToken,
    function (req, res, next) {
        var URLUtils = require('dw/web/URLUtils');

        var actionUrl = URLUtils.url('Newsletter-Handler').toString();
        var newsletterForm = server.forms.getForm('newsletter'); // creates empty JSON object using the form definition
        newsletterForm.clear();

        res.render('/newsletter/newslettersignup', {
            actionUrl: actionUrl,
            newsletterForm: newsletterForm
        });
        next();
    });

server.get('Success',
    server.middleware.https,
    csrfProtection.generateToken,
    function (req, res, next) {
        var URLUtils = require('dw/web/URLUtils');

        var continueUrl = URLUtils.url('Newsletter-Show').toString();
        var newsletterForm = server.forms.getForm('newsletter'); // creates empty JSON object using the form definition

        res.render('/newsletter/newslettersuccess', {
            continueUrl: continueUrl,
            newsletterForm: newsletterForm
        });
        next();
    });

server.post('Handler',
    server.middleware.https,
    csrfProtection.validateAjaxRequest,
    function (req, res, next) {
        var Resource = require('dw/web/Resource');
        var URLUtils = require('dw/web/URLUtils');

        var continueUrl = URLUtils.url('Newsletter-Show').toString();
        var successUrl = URLUtils.url('Newsletter-Success').toString();
        var newsletterForm = server.forms.getForm('newsletter');
        var errorMsg;

        // newsletterForm.valid = false;

        if (!newsletterForm.valid) {
            errorMsg = Resource.msg('error.message.something.goes.wrone', 'forms', null);

            res.setStatusCode(500);
            res.json({
                error: true,
                errorMsg: errorMsg,
                continueUrl: continueUrl
            });
        } else {
            res.json({
                success: true,
                redirectUrl: successUrl
            });
        }
        next();
    });

module.exports = server.exports();
