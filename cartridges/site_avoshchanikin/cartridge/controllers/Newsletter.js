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
        var CustomObjectMgr = require('dw/object/CustomObjectMgr');
        var Transaction = require('dw/system/Transaction');
        var Logger = require('dw/system/Logger');
        var CUSTOM_OBJECT_NAME = 'NewsletterSubscriptionAVoshchanikin';

        var newsletterForm = server.forms.getForm('newsletter');

        // form validation
        if (newsletterForm.email.value.toLowerCase()
            !== newsletterForm.emailconfirm.value.toLowerCase()
        ) {
            newsletterForm.email.valid = false;
            newsletterForm.emailconfirm.valid = false;

            newsletterForm.valid = false;
        }

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
                var err = e;
                if (err.javaName === 'MetaDataException') {
                    /* Duplicate primary key on CO: send back message to client-side, but don't log error.
                    This is possible if the user tries to subscribe with the same email multiple times */
                    res.json({
                        success: false,
                        error: [Resource.msg('error.subscriptionexists', 'newsletter', null)]
                    });
                } else {
                    /* Missing CO definition: Log error with message for site admin, set the response to error,
                    and send error page URL to client-side */
                    Logger.getLogger('newsletter_subscription').error(Resource.msg('error.customobjectmissing', 'newsletter', null));
                    // Show general error page: there is nothing else to do
                    res.setStatusCode(500);
                    res.json({
                        error: true,
                        redirectUrl: URLUtils.url('Error-Start').toString()
                    });
                }
            }
        } else {
            // Handle server-side validation errors here
            res.json({
                success: false,
                error: [Resource.msg('error.crossfieldvalidation', 'newsletter', null)]
            });
        }
        next();
    });

module.exports = server.exports();
