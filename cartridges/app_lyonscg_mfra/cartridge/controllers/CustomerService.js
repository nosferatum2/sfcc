'use strict';

/**
 * This controller handles customer service related pages, such as the contact us form
 *
 */

var server = require('server');
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var googleRecaptcha = require('*/cartridge/scripts/middleware/googleRecaptcha');
var HashMap = require('dw/util/HashMap');
var Mail = require('dw/net/Mail');
var Site = require('dw/system/Site');
var Template = require('dw/util/Template');

/**
 * Send confirmation email to customer support
 * @param {Object} contactFormData - Contact form data
 * @returns {void}
 *
 */
function sendConfirmationEmail(contactFormData) {
    var confirmationEmail = new Mail();
    var context = new HashMap();
    var template;
    var content;

    confirmationEmail.addTo(Site.current.getCustomPreferenceValue('customerServiceEmail'));
    confirmationEmail.setSubject(contactFormData.subject);
    confirmationEmail.setFrom('no-reply@salesforce.com');

    Object.keys(contactFormData).forEach(function (key) {
        var value = typeof contactFormData[key] !== 'undefined' ? contactFormData[key] : null;
        context.put(key, value);
    });

    template = new Template('mail/contactUs');
    content = template.render(context).text;
    confirmationEmail.setContent(content, 'text/html', 'UTF-8');
    confirmationEmail.send();
}

server.get('ContactUs', server.middleware.https, csrfProtection.generateToken, function (req, res, next) {
    var contactUsForm = server.forms.getForm('contactus');
    contactUsForm.clear();
    res.render('content/contactus', {
        contactUsForm: contactUsForm
    });
    next();
});

server.post('Submit',
	server.middleware.https,
	csrfProtection.validateRequest,
	googleRecaptcha.validateResponse,
	function (req, res, next) {
    var formData = {
        email: req.form.email,
        firstName: req.form.firstname,
        lastName: req.form.lastname,
        subject: req.form.myquestion,
        phone: req.form.phone,
        ordernumber: req.form.ordernumber,
        comment: req.form.comment
    };
    var contactUsForm = server.forms.getForm('contactus');
    sendConfirmationEmail(formData);
    res.render('content/contactus', {
        sucess: true,
        contactUsForm: contactUsForm
    });
    next();
});

module.exports = server.exports();
