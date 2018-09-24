'use strict';

/**
 * The onSession hook is called for every new session in a site. This hook can be used for initializations,
 * like to prepare promotions or pricebooks based on source codes or affiliate information in
 * the initial URL. For performance reasons the hook function should be kept short.
 *
 * @module  request/OnSession
 */

var Status = require('dw/system/Status');

/**
 * The onSession hook function.
 */
exports.onSession = function () {
    // Updated the HTML element to contain a dynamic locale instead of a static 'en' (LRA-23)
    var locale = !empty(request.locale) ? request.locale : 'en';
    session.custom.currentLocale = !empty(locale) && locale != 'default' ? locale.replace(/_/g, '-').toLowerCase() : 'en';

    return new Status(Status.OK);
};
