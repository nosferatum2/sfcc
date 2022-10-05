'use strict';

var server = require('server');


server.get('Show',
    server.middleware.https,
    function (req, res, next) {
        var URLUtils = require('dw/web/URLUtils');

        var actionUrl = URLUtils.url('Newsletter-Subscribe').toString();
        var newsletterForm = server.forms.getForm('newsletter'); // creates empty JSON object using the form definition
        newsletterForm.clear();

        res.render('/newsletter/newslettersignup', {
            actionUrl: actionUrl,
            newsletterForm: newsletterForm
        });
        next();
    });

server.post('Subscribe',
    server.middleware.https,
    function (req, res, next) {
        var Resource = require('dw/web/Resource');
        var URLUtils = require('dw/web/URLUtils');

        var continueUrl = URLUtils.url('Newsletter-Show').toString();
        var newsletterForm = server.forms.getForm('newsletter');
        var errorTemplate = '/newsletter/newslettererror';
        var successTemplate = '/newsletter/newslettersuccess';
        var errorMsg;

        // newsletterForm.valid = false;

        if (!newsletterForm.valid) {
            errorMsg = Resource.msg('error.message.something.goes.wrone', 'forms', null);

            res.setStatusCode(500);
            res.render(errorTemplate, {
                errorMsg: errorMsg,
                continueUrl: continueUrl
            });
        } else {
            res.render(successTemplate, {
                newsletterForm: newsletterForm,
                continueUrl: continueUrl
            });
        }
        next();
    });

module.exports = server.exports();
