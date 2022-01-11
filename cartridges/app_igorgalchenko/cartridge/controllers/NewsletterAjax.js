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
        var isSuccess = false;
        var errorFields = null;
        var msg;

        if (!newsletterForm.valid) {
            errorFields = formErrors.getFormErrors(newsletterForm);
            msg = Resource.msg('newsletter.error.message.form.invalid', 'forms', null);
        } else {
            try {
                txn.wrap(function () {
                    var subscribtionCO = CustomObjectMgr.createCustomObject(CO_TYPE, newsletterForm.email.value);
                    subscribtionCO.custom.firstName = newsletterForm.firstName.value;
                    subscribtionCO.custom.lastName = newsletterForm.lastName.value;
                    subscribtionCO.custom.email = newsletterForm.email.value;
                });

                isSuccess = true;
                msg = (Resource.msg('newsletter.error.message.form.submit.success', 'forms', null));
            } catch (err) {
                isSuccess = false;
                msg = (Resource.msg('error.message.custom.object.creation', 'training', null));
            }
        }

        res.json({
            success: isSuccess,
            fields: errorFields,
            msg: msg
        });
    });

    next();
});

module.exports = server.exports();
