'use strict';

var URLUtils = require('dw/web/URLUtils');
var Site = require('dw/system/Site');
var net = require('dw/net');

/**
 * Middleware to validate Google recaptcha response if Google recaptcha is enabled for site
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next call in the middleware chain
 * @returns {Function} next - Next call in the middleware chain
 */
function validateResponse(req, res, next) {
    var enableGoogleRecaptcha = Site.getCurrent().getCustomPreferenceValue('enableGoogleRecaptcha');
    if (enableGoogleRecaptcha !== null && enableGoogleRecaptcha) {
        var googleRecaptchaSecretKey = Site.getCurrent().getCustomPreferenceValue('googleRecaptchaSecretKey');
        if (googleRecaptchaSecretKey !== null) {
            var googleRecaptchaResponse = req.form['g-recaptcha-response'];
            if (googleRecaptchaResponse !== null) {
				// ToDo : Refactor the recpatcha verification POST service call as per Lyons Service Framework Design
                var postData = '';
                postData += ('secret=' + encodeURIComponent(googleRecaptchaSecretKey));
                postData += ('&response=' + encodeURIComponent(googleRecaptchaResponse));
                postData += ('&remoteip=' + encodeURIComponent(req.httpHeaders['x-is-remote_addr']));

                var httpClient = new net.HTTPClient();
                httpClient.open('POST', 'https://www.google.com/recaptcha/api/siteverify');
                httpClient.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset=UTF-8');
                httpClient.send(postData);

                if (httpClient.statusCode === 200) {
                    var respose = JSON.parse(httpClient.text);
                    if (respose != null && respose.success != null && respose.success === true) {
                        return next();
                    }
                    res.redirect(URLUtils.url('CustomerService-ContactUs'));
                } else {
                    res.redirect(URLUtils.url('CustomerService-ContactUs'));
                }
            }
        }
    }
    return next();
}

module.exports = {
    validateResponse: validateResponse
};
