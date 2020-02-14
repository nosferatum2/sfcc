'use strict';
var formatMoney = require('dw/util/StringUtils').formatMoney;

/**
 * Base totals model overridden to add surcharge and shipping method cost to checkout
 *
 */

var base = module.superModule;

/**
 * @constructor
 * @classdesc totals class that represents the order totals of the current line item container
 *
 * @param {dw.order.lineItemContainer} lineItemContainer - The current user's line item container
 */
function totals(lineItemContainer) {
    base.call(this, lineItemContainer);
    if (lineItemContainer) {
        var Site = require('dw/system/Site');
        var defaultCurrency = Site.current.defaultCurrency;
        var Money = require('dw/value/Money');
        var shippingSurcharge = new Money(0, defaultCurrency);
        var shippingAmount = new Money(0, defaultCurrency);
        for (var i = 0; i < lineItemContainer.allLineItems.length; i++) {
            var nextLineItem = lineItemContainer.allLineItems[i];
            if (Object.hasOwnProperty.call(nextLineItem, 'surcharge')) {
                shippingSurcharge = shippingSurcharge.add(nextLineItem.adjustedPrice);
            } else if (Object.hasOwnProperty.call(nextLineItem, 'ID')) {
                shippingAmount = shippingAmount.add(nextLineItem.adjustedPrice);
            }
        }
        this.shippingSurcharge = formatMoney(shippingSurcharge);
        this.shippingAmount = formatMoney(shippingAmount);
    }
}

module.exports = totals;
