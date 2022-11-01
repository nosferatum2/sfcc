/* eslint-disable require-jsdoc */
/* eslint-disable no-unused-vars */

'use strict';

var Site = require('dw/system/Site');
var Status = require('dw/system/Status');
var Logger = require('dw/system/Logger');

function beforePatchSendMail(basket) {
    var emailHelpers = require('*/cartridge/scripts/helpers/emailHelpers');
    var collections = require('*/cartridge/scripts/util/collections');

    var template = 'order/sendMailHook';
    var emailObj;
    var context = {};

    var productItems = [];
    collections.forEach(basket.productLineItems, function (productLineItem) {
        var productFirstImage = productLineItem.getProduct().getImage('small');
        productItems.push({
            id: productLineItem.product.ID,
            productName: productLineItem.productName,
            quantity: productLineItem.quantity.value,
            price: productLineItem.price.value,
            img: {
                alt: productFirstImage.alt,
                url: productFirstImage.getHttpsURL()
            }
        });
    });

    context.creationDate = basket.creationDate;
    context.total = basket.getTotalGrossPrice().value;
    context.totalShiping = basket.getShippingTotalPrice().value;
    context.totalTax = basket.getTotalTax().value;
    context.totalProducts = productItems.length;
    context.productsData = productItems;


    Logger.getLogger('avoshchanikin_scope').info(JSON.stringify(context));

    emailObj = {
        to: basket.customerEmail,
        subject: 'from avoshchanikin scope',
        from: Site.current.getCustomPreferenceValue('customerServiceEmail') || 'no-reply@salesforce.com'
    };

    emailHelpers.send(emailObj, template, {
        context: context
    });

    return new Status(Status.OK);
}

exports.beforePATCH = beforePatchSendMail;
