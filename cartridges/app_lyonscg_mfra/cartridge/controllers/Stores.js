'use strict';

/**
 * Stores base controller overridden to show store details page
 *
 */

var page = module.superModule;
var server = require('server');

server.extend(page);

var StoreMgr = require('dw/catalog/StoreMgr');

server.get('Details', function (req, res, next) {
    var storeID = req.querystring.storeID;
    var store = StoreMgr.getStore(storeID);
    res.render('storeLocator/storeInfo', {
        Store: store
    });
    next();
});

module.exports = server.exports();
