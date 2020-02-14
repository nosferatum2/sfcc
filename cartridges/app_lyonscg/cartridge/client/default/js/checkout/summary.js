'use strict';

var base = require('base/checkout/summary');

/**
 * updates the totals summary
 * @param {Array} totals - the totals data
 */
function updateTotals(totals) {
    $('.shipping-total-cost').text(totals.totalShippingCost);
    $('.shipping-total-surcharge-cost').text(totals.shippingSurcharge);
    $('.shipping-total-method-amount').text(totals.shippingAmount);
    $('.tax-total').text(totals.totalTax);
    $('.sub-total').text(totals.subTotal);
    $('.grand-total-sum').text(totals.grandTotal);

    if (totals.orderLevelDiscountTotal.value > 0) {
        $('.order-discount').show();
        $('.order-discount-total').text('- ' + totals.orderLevelDiscountTotal.formatted);
    } else {
        $('.order-discount').hide();
    }

    if (totals.shippingLevelDiscountTotal.value > 0) {
        $('.shipping-discount').show();
        $('.shipping-discount-total').text('- ' +
            totals.shippingLevelDiscountTotal.formatted);
    } else {
        $('.shipping-discount').hide();
    }
}


module.exports = {
    updateTotals: updateTotals,
    updateOrderProductSummaryInformation: base.updateOrderProductSummaryInformation
};
