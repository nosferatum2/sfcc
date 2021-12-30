'use strict';

module.exports = {
    execute: function (params) {
        var CustomObjectMgr = require('dw/object/CustomObjectMgr');
        var Transaction = require('dw/system/Transaction');
        var Mail = require('dw/net/Mail');

        var NEWSLETTER_CUSTOM_OBJ = 'NewsletterSubscriptionStasZhalba';

        var queryNewsletterCreationDate = new Date(Date.now() - (60 * 60 * 1000 * params.Hours));
        var queryNewsletter = 'creationDate > {0} AND custom.isSent != {1}';

        var newsletters = CustomObjectMgr.queryCustomObjects(NEWSLETTER_CUSTOM_OBJ, queryNewsletter, null, queryNewsletterCreationDate, true);
        var newslettersArray = newsletters.asList().toArray();

        newslettersArray.forEach(function (newsletterObj) {
            var sendEmail = new Mail();
            sendEmail.addTo(newsletterObj.custom.email);
            sendEmail.setSubject('Simple email');
            sendEmail.setFrom('szhalba@speroteck.com');
            sendEmail.setContent('Simple email text');
            sendEmail.send();

            Transaction.wrap(function () {
                var newsletterCustomObj = CustomObjectMgr.getCustomObject(NEWSLETTER_CUSTOM_OBJ, newsletterObj.custom.email);
                if (newsletterCustomObj === null) {
                    return;
                }

                newsletterCustomObj.custom.isSent = true;
            });
        });
    }
};
