'use strict';
/* global request, session, empty */

/**
 * The onSession hook is called for every new session in a site. This hook can be used for initializations,
 * like to prepare promotions or pricebooks based on source codes or affiliate information in
 * the initial URL. For performance reasons the hook function should be kept short.
 *
 * @module  request/OnSession
 */

var Status = require('dw/system/Status');
var Locale = require('dw/util/Locale');

/**
 * @function
 * @desc The onSession hook function.
 * @return {Object} - Status object with an OK status
 */
exports.onSession = function () {
    // Updated the HTML element to contain a dynamic ISO 639 language code instead of a static 'en' (LRA-23)
    var locale = !empty(request.locale) ? request.locale : 'en_US';
    session.custom.currentLang = !empty(locale) && locale !== 'default' ? Locale.getLocale(locale).language : 'en';

    return new Status(Status.OK);
};
