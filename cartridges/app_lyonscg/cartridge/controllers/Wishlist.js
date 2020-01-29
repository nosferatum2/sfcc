'use strict';

/**
 * Wishlist base controller overridden to add a customization to our ref app
 * so that the button is actually a toggle, and when you click the heart again
 * on the CLP or PDP, it would remove an item from your wishlist and notify you.
  *
 */
var page = module.superModule;
var server = require('server');
server.extend(page);

var wishlist = require('*/cartridge/scripts/middleware/wishlist');
var Resource = require('dw/web/Resource');
var productListHelper = require('*/cartridge/scripts/productList/productListHelpers');

server.replace('AddProduct', wishlist.checkEnabled, function (req, res, next) {
    var list = productListHelper.getList(req.currentCustomer.raw, { type: 10 });
    var pid = req.form.pid;
    var optionId = req.form.optionId || null;
    var optionVal = req.form.optionVal || null;

    var config = {
        qty: 1,
        optionId: optionId,
        optionValue: optionVal,
        req: req,
        type: 10
    };

    var itemExist = productListHelper.itemExists(list, pid, config);

    // Toggle customization
    if (itemExist) {
        var result = productListHelper.removeItem(req.currentCustomer.raw, pid, config);
        if (!result.error) {
            res.json({
                success: true,
                pid: pid,
                msg: Resource.msg('wishlist.addtowishlist.remove.msg', 'wishlist', null)
            });
        }
        next();
    } else {
        var errMsg = productListHelper.itemExists(list, pid, config) ? Resource.msg('wishlist.addtowishlist.exist.msg', 'wishlist', null) :
            Resource.msg('wishlist.addtowishlist.failure.msg', 'wishlist', null);
        var success = productListHelper.addItem(list, pid, config);
        if (success) {
            res.json({
                success: true,
                pid: pid,
                msg: Resource.msg('wishlist.addtowishlist.success.msg', 'wishlist', null)
            });
        } else {
            res.json({
                error: true,
                pid: pid,
                msg: errMsg
            });
        }
        next();
    }
});

module.exports = server.exports();
