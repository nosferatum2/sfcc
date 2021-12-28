'use strict';

var server = require('server');
var URLUtils = require('dw/web/URLUtils');

server.get('Show', function (req, res, next) {
    var actionUrl = URLUtils.url('NewsletterAjax-Subscribe');
    var newsletterForm = server.forms.getForm('newsletter');

    newsletterForm.clear();

    res.render('newsletter', {
        actionUrl: actionUrl,
        newsletterForm: newsletterForm,
        formCssClass: 'newsletter-form-ajax'
    });

    next();
});

server.post('Subscribe', function (req, res, next) {
    this.on('route:BeforeComplete', function (req, res) { // eslint-disable-line no-shadow
        var txn = require('dw/system/Transaction');
        var CustomObjectMgr = require('dw/object/CustomObjectMgr');
        var formErrors = require('*/cartridge/scripts/formErrors');
        var Resource = require('dw/web/Resource');

        var CO_TYPE = 'NewsletterSubscriptionIgorGalchenko';

        var newsletterForm = server.forms.getForm('newsletter');
        var successUrl = URLUtils.url('Home-Show').toString();
        var errorUrl = URLUtils.url('Error-Start').toString();
        var isSuccess = false;
        var redirectUrl = errorUrl;
        var fields = null;
        var errorMsg;

        if (!newsletterForm.valid) {
            fields = formErrors.getFormErrors(newsletterForm);
            errorMsg = Resource.msg('newsletter.error.message.form.invalid', 'forms', null);
        } else {
            try {
                txn.wrap(function () {
                    var subscribtionCO = CustomObjectMgr.createCustomObject(CO_TYPE, newsletterForm.email.value);
                    subscribtionCO.custom.firstName = newsletterForm.firstName.value;
                    subscribtionCO.custom.lastName = newsletterForm.lastName.value;
                    subscribtionCO.custom.email = newsletterForm.email.value;
                });

                isSuccess = true;
                redirectUrl = successUrl;
                errorMsg = (Resource.msg('newsletter.error.message.form.submit.success', 'forms', null));
            } catch (err) {
                isSuccess = false;
                redirectUrl = errorUrl;
                errorMsg = (Resource.msg('error.message.custom.object.creation', 'training', null));
            }
        }

        res.json({
            success: isSuccess,
            fields: fields,
            redirectUrl: redirectUrl,
            msg: errorMsg
        });
    });

    next();
});

module.exports = server.exports();
