/* eslint-disable require-jsdoc */
/* eslint-disable no-unused-vars */
'use strict';

var OrderMgr = require('dw/order/OrderMgr');
var Site = require('dw/system/Site');
var Logger = require('dw/system/Logger');

function beforePatchSendMail(basket) {
    var emailHelpers = require('*/cartridge/scripts/helpers/emailHelpers');
    var iterator = require('dw/util/Iterator');

    var template = 'order/sendMailHook';
    var emailObj;
    var context = {};
    // var order;

    // Logger.info(basket);
    emailObj = {
        to: 'avoshchanikin@speroteck.com',
        subject: 'test',
        from: Site.current.getCustomPreferenceValue('customerServiceEmail') || 'no-reply@salesforce.com'
    };

    context.data = 'basket';

    emailHelpers.send(emailObj, template, {
        context: context
    });
}

exports.beforePATCH = beforePatchSendMail;
