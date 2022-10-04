'use strict';

var Resource = require('dw/web/Resource');

var base = module.superModule;

/**
 * Creates an object of the visible attributes for a product
 * @param {dw.catalog.Product} availabilityModel - availabilityModel for a given product.
 * @return {Object} an object containing the visible attribute 'ats' for a product.
 */
function getAtsValue(availabilityModel) {
    var ATS = {};
    ATS.messages = [];
    var inventoryRecord = availabilityModel.inventoryRecord;

    if (inventoryRecord) {
        ATS.messages.push(
            Resource.msgf(
                'label.quantity.in.stock',
                'common',
                null,
                inventoryRecord.ATS.value
            )
        );
    }

    return ATS;
}

module.exports = function (object, quantity, minOrderQuantity, availabilityModel) {
    base.call(this, object, quantity, minOrderQuantity, availabilityModel);


    Object.defineProperty(object, 'ats', {
        enumerable: true,
        value: getAtsValue(availabilityModel)
    });
};

