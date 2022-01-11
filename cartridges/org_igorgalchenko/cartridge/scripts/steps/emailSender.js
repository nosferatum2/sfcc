/**
 * Script queries all newsletter subscriptions for last [args_param] hours (args.Hours), and sends a simple email to them.
 * @param {dw.util.HashMap} args - Job's properties
 *
 * @returns {dw.system.Status} - Exit status
 */
function send(args) {
    var system = require('dw/system');
    var txn = require('dw/system/Transaction');
    var Resource = require('dw/web/Resource');
    var CustomObjectMgr = require('dw/object/CustomObjectMgr');
    var Mail = require('dw/net/Mail');

    var MILLISECONDS_IN_HOUR = 3600000;

    var sinceDate = new Date(Date.now() - (args.Hours * MILLISECONDS_IN_HOUR));
    var newsletterSubscriptions = CustomObjectMgr.queryCustomObjects('NewsletterSubscriptionIgorGalchenko', 'creationDate >= {0}', 'creationDate', sinceDate);

    while (newsletterSubscriptions.hasNext()) {
        var ns = newsletterSubscriptions.next();

        if (!ns.custom.isEmailSent) {
            var sendEmail = new Mail();

            sendEmail.addTo(ns.custom.email);
            sendEmail.setSubject(Resource.msg('emailSubject', 'sampleEmail', null));
            sendEmail.setFrom(Resource.msg('emailFrom', 'sampleEmail', null));
            sendEmail.setContent(Resource.msg('emailContent', 'sampleEmail', null));
            sendEmail.send();

            try {
                // eslint-disable-next-line no-loop-func
                txn.wrap(function () {
                    ns.custom.isEmailSent = true;
                });
            } catch (err) {
                var errorMessage = Resource.msgf('errorIsEmailSentFlag', 'jobs', null, ns.custom.email);

                newsletterSubscriptions.close();

                return new system.Status(system.Status.ERROR, 'ERROR', errorMessage);
            }
        }
    }

    newsletterSubscriptions.close();

    return new system.Status(system.Status.OK);
}

module.exports = {
    send: send
};
