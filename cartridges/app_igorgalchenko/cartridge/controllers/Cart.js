'use strict';

var page = module.superModule;
var server = require('server');

server.extend(page);

/**
 * Checks if session has custom attribute 'addToProgram'(boolean) and return it's value or false
 * @param {dw.system.Session} session - global session object
 * @returns {boolean} value of attribute 'addToProgram'(boolean) or false
 */
function isAddedToProgram(session) {
    return 'addToProgram' in session.custom ? session.custom.addToProgram : false;
}

server.append('Show', function (req, res, next) {
    res.setViewData({ isAddedToProgram: isAddedToProgram(req.session.raw) });

    next();
});

server.append('MiniCartShow', function (req, res, next) {
    res.setViewData({ isAddedToProgram: isAddedToProgram(req.session.raw) });

    next();
});

server.get('AddToProgram', function (req, res, next) {
    var URLUtils = require('dw/web/URLUtils');

    req.session.raw.custom.addToProgram = true;

    res.redirect(URLUtils.url('Cart-Show'));

    next();
});

module.exports = server.exports();
