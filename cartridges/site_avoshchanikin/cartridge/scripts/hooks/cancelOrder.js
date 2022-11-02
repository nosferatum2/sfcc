/* eslint-disable require-jsdoc */
/* eslint-disable no-unused-vars */

'use strict';

var Status = require('dw/system/Status');
var Logger = require('dw/system/Logger');
var OrderMgr = require('dw/order/OrderMgr');

function cancelOrder(order, orderInput) {
    var Transaction = require('dw/system/Transaction');
    var CustomObjectMgr = require('dw/object/CustomObjectMgr');

    if (orderInput.c_AVoshchanikinStatus === 1) {
        try {
            Transaction.wrap(function () {
                var co = CustomObjectMgr.getCustomObject('AVoshchanikinRefunds', order.UUID);

                if (co !== null) {
                    CustomObjectMgr.remove(co);
                }

                var createCO = CustomObjectMgr.createCustomObject('AVoshchanikinRefunds', order.UUID);
                createCO.custom.c_orderNo = order.currentOrderNo;
                createCO.custom.c_totalRefund = order.getTotalGrossPrice().value;
                createCO.custom.c_customerNumber = order.getCustomerNo();
                createCO.custom.c_paymentToken = order.orderToken;

                var orderObject = OrderMgr.searchOrder('UUID = {0}', order.UUID);
                orderObject.custom.AVoshchanikinStatus = orderInput.c_AVoshchanikinStatus || 1;
                orderObject.custom.AVoshchanikinCancelReason = orderInput.c_AVoshchanikinCancelReason
                    || 'My custom cancel reason from vscode.';
            });
        } catch (error) {
            Logger.getLogger('avoshchanikin_scope').error(JSON.stringify(error));
        }

        OrderMgr.cancelOrder(order);
    }

    return new Status(Status.OK);
}

exports.afterPATCH = cancelOrder;
