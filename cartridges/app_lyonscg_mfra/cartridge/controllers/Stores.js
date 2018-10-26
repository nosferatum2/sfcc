'use strict';

/**
 * Stores base controller overridden to show store details page
 *
 */

var page = module.superModule;
var server = require('server');

server.extend(page);

var StoreMgr = require('dw/catalog/StoreMgr');
var pageMetaData = require('*/cartridge/scripts/middleware/pageMetaData');
var StoreModel = require('*/cartridge/models/store');

server.get('Details', function (req, res, next) {
    var pageMetaHelper = require('*/cartridge/scripts/helpers/pageMetaHelper');
    var storeID = req.querystring.storeID;
    var store = StoreMgr.getStore(storeID);
    var storeModel = new StoreModel(store);
    pageMetaHelper.setPageMetaData(req.pageMetaData, storeModel);
    pageMetaHelper.setPageMetaTags(req.pageMetaData, storeModel);
    res.render('storeLocator/storeInfo', {
        Store: storeModel
    });
    next();
}, pageMetaData.computedPageMetaData);

module.exports = server.exports();
