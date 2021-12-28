'use strict';

var server = require('server');
var URLUtils = require('dw/web/URLUtils');

server.get('Show', function (req, res, next) {
    var actionUrl = URLUtils.url('Newsletter-Subscribe');
    var newsletterForm = server.forms.getForm('newsletter');

    newsletterForm.clear();

    res.render('newsletter', {
        actionUrl: actionUrl,
        newsletterForm: newsletterForm,
        formCssClass: 'newsletter-form'
    });

    next();
});

server.post('Subscribe', function (req, res, next) {
    var txn = require('dw/system/Transaction');
    var CustomObjectMgr = require('dw/object/CustomObjectMgr');

    var CO_TYPE = 'NewsletterSubscriptionIgorGalchenko';

    var successUrl = URLUtils.url('Home-Show');
    var errorUrl = URLUtils.url('Error-Start');
    var newsletterForm = server.forms.getForm('newsletter');
    var subscribtionCO;

    if (!newsletterForm.valid) {
        res.redirect(errorUrl);

        return next();
    }

    try {
        txn.wrap(function () {
            subscribtionCO = CustomObjectMgr.createCustomObject(CO_TYPE, newsletterForm.email.value);
            subscribtionCO.custom.firstName = newsletterForm.firstName.value;
            subscribtionCO.custom.lastName = newsletterForm.lastName.value;
            subscribtionCO.custom.email = newsletterForm.email.value;
        });
    } catch (err) {
        res.redirect(errorUrl);

        return next();
    }

    res.redirect(successUrl);

    return next();
});

module.exports = server.exports();
