'use strict';

var server = require('server');
var URLUtils = require('dw/web/URLUtils');

server.get('Show', function (req, res, next) {
    var actionUrl = URLUtils.url('Newsletter-SubscribeAjax');
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

/**
 * Creates a list of address model for the logged in user
 * @param {string} email - Email
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 */
function addNewsletterCustomObject(email, firstName, lastName) {
    var CustomObjectMrg = require('dw/object/CustomObjectMgr');
    var Transaction = require('dw/system/Transaction');

    Transaction.wrap(function () {
        var CustomObject = CustomObjectMrg.createCustomObject('NewsletterSubscriptionStasZhalba', email);
        CustomObject.custom.firstName = firstName;
        CustomObject.custom.lastName = lastName;
    });
}

server.post('Subscribe', function (req, res, next) {
    try {
        addNewsletterCustomObject(req.form.email, req.form.firstName, req.form.lastName);

        res.redirect(URLUtils.url('Home-Show'));
    } catch (error) {
        res.redirect(URLUtils.url('Newsletter-Error'));
    }
    next();
});

server.post('SubscribeAjax', function (req, res, next) {
    var Resource = require('dw/web/Resource');
    var formErrors = require('*/cartridge/scripts/formErrors');
    var newsletterForm = server.forms.getForm('newsletter');

    try {
        if (!newsletterForm.valid) {
            res.json({
                success: false,
                fields: formErrors.getFormErrors(newsletterForm)
            });
        }

        addNewsletterCustomObject(req.form.email, req.form.firstName, req.form.lastName);

        res.json({
            success: true,
            msg: Resource.msg('success.subscribed', 'newsletter', null),
            redirectUrl: URLUtils.url('Home-Show').toString()
        });
    } catch (error) {
        res.setStatusCode(500);
        res.json({
            success: false,
            msg: Resource.msg('error.something.went.wrong', 'newsletter', null)
        });
    }

    next();
});

module.exports = server.exports();
