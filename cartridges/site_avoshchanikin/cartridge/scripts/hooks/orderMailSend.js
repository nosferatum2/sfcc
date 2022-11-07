/* eslint-disable require-jsdoc */
/* eslint-disable no-unused-vars */

'use strict';

var Site = require('dw/system/Site');
var Status = require('dw/system/Status');
var Logger = require('dw/system/Logger');

function beforePatchSendMail(order, orderInput) {
    var Transaction = require('dw/system/Transaction');
    var OrderMgr = require('dw/order/OrderMgr');
    var emailHelpers = require('*/cartridge/scripts/helpers/emailHelpers');
    var collections = require('*/cartridge/scripts/util/collections');
    var template = 'order/sendMailHook';
    var emailObj;
    var context = {};

    // innitial default value for a custom attributes
    try {
        Transaction.wrap(function () {
            var orderObject = OrderMgr.searchOrder('orderNo = {0}', order.orderNo);
            orderObject.custom.AVoshchanikinStatus = orderInput.c_AVoshchanikinStatus || 0;
            orderObject.custom.AVoshchanikinCancelReason = orderInput.c_AVoshchanikinCancelReason
                || 'My custom cancel reason from vscode.';
        });
    } catch (error) {
        Logger.getLogger('avoshchanikin_scope').error(JSON.stringify(error.message));
    }

    var productItems = [];
    collections.forEach(order.productLineItems, function (productLineItem) {
        var productFirstImage = productLineItem.getProduct().getImage('small');
        productItems.push({
            id: productLineItem.product.ID,
            productName: productLineItem.productName,
            quantity: productLineItem.quantity.value,
            price: productLineItem.price.value,
            img: {
                alt: productFirstImage.alt,
                url: productFirstImage.getHttpsURL().toString()
            }
        });
    });

    context.oderNumber = order.orderNo;
    context.creationDate = order.creationDate.toUTCString();
    context.subTotal = order.getMerchandizeTotalNetPrice().value;
    context.total = order.getTotalGrossPrice().value;
    context.totalShiping = order.getShippingTotalPrice().value;
    context.totalTax = order.getTotalTax().value;
    context.productsData = productItems;

    emailObj = {
        to: order.customerEmail,
        subject: 'from avoshchanikin scope',
        from: Site.current.getCustomPreferenceValue('customerServiceEmail') || 'no-reply@salesforce.com'
    };

    emailHelpers.send(emailObj, template, context);

    return new Status(Status.OK);
}

exports.beforePATCH = beforePatchSendMail;
