'use strict';

var server = require('server');
var URLUtils = require('dw/web/URLUtils');

server.get('Show', function (req, res, next) {
    var actionUrl = URLUtils.url('Newsletter-Subscribe');
    var newsletterForm = server.forms.getForm('newsletter');
    newsletterForm.clear();

    res.render('newsletter/newsletter', {
        actionUrl: actionUrl,
        newsletterForm: newsletterForm
    });
    next();
});

server.get('Error', function (req, res, next) {
    res.render('newsletter/error');
    next();
});

server.post('Subscribe', function (req, res, next) {
    var CustomObjectMrg = require('dw/object/CustomObjectMgr');
    var Transaction = require('dw/system/Transaction');

    try {
        Transaction.wrap(function () {
            var CustomObject = CustomObjectMrg.createCustomObject('NewsletterSubscriptionStasZhalba', req.form.email);
            CustomObject.custom.firstName = req.form.firstName;
            CustomObject.custom.lastName = req.form.lastName;
            res.redirect(URLUtils.url('Home-Show'));
        });
    } catch (error) {
        res.redirect(URLUtils.url('Newsletter-Error'));
    }
    next();
});

module.exports = server.exports();
