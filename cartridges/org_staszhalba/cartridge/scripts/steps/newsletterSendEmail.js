'use strict';

module.exports = {
    execute: function (params) {
        var CustomObjectMgr = require('dw/object/CustomObjectMgr');
        var Mail = require('dw/net/Mail');

        var NEWSLETTER_CUSTOM_OBJ = 'NewsletterSubscriptionStasZhalba';

        var queryNewsletterCreationDate = new Date(Date.now() - (60 * 60 * 1000 * params.Hours));

        var newsletters = CustomObjectMgr.queryCustomObjects(NEWSLETTER_CUSTOM_OBJ, 'creationDate > {0}', null, queryNewsletterCreationDate);
        var newslettersArray = newsletters.asList().toArray();

        newslettersArray.forEach(function (newsletterObj) {
            var sendEmail = new Mail();
            sendEmail.addTo(newsletterObj.custom.email);
            sendEmail.setSubject('Simple email');
            sendEmail.setFrom('szhalba@speroteck.com');
            sendEmail.setContent('Simple email text');
            sendEmail.send();
        });
    }
};
