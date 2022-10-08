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
        var URLUtils = require('dw/web/URLUtils');
        var CustomObjectMgr = require('dw/object/CustomObjectMgr');
        var Transaction = require('dw/system/Transaction');
        var CUSTOM_OBJECT_NAME = 'NewsletterSubscriptionAVoshchanikin';

        var newsletterForm = server.forms.getForm('newsletter');

        // newsletterForm.valid = false;
        if (newsletterForm.valid) {
            try {
                Transaction.wrap(function () {
                    var co = CustomObjectMgr.createCustomObject(CUSTOM_OBJECT_NAME, newsletterForm.email.value);
                    co.custom.firstName = newsletterForm.firstname.value;
                    co.custom.lastName = newsletterForm.lastname.value;

                    res.json({
                        success: true,
                        redirectUrl: URLUtils.url('Newsletter-Success').toString()
                    });
                });
            } catch (e) {
                // eslint-disable-next-line no-unused-vars
                var err = e;
                res.setStatusCode(500);
                res.json({
                    error: true,
                    redirectUrl: URLUtils.url('Error-Start').toString()
                });
            }
        } else {
            // keep existing code
            // eslint-disable-next-line no-lonely-if
            if (!newsletterForm.valid) {
                res.setStatusCode(500);
                res.json({
                    error: true,
                    redirectUrl: URLUtils.url('Error-Start').toString()
                });
            } else {
                res.json({
                    success: true,
                    redirectUrl: URLUtils.url('Newsletter-Success').toString()
                });
            }
        }
        next();
    });

module.exports = server.exports();
