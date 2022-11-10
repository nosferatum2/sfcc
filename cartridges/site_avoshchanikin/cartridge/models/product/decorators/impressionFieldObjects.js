/* eslint-disable valid-jsdoc */
'use strict';

// dataLayer here

/**
 * Creates an object of the visible attributes for a product
 * @param {dw.catalog.Product} _____ - ____ for a given product.
 * @return {Object} an object containing the visible attribute 'ecommerce' for a product.
 */
function impressionModel(product, apiProduct) {
    var impressionFieldObjects = {};
    impressionFieldObjects.currencyCode = apiProduct.getPriceModel().price.currencyCode;
    impressionFieldObjects.impressions = [{
        name: product.productName,
        id: product.id,
        price: apiProduct.getPriceModel().price.value,
        brand: product.brand,
        category: product.id,
        variant: product.productType,
        list: 'Search Results',
        position: 1
    }];
    impressionFieldObjects.ecommerce = JSON.stringify(apiProduct.getPriceModel().price.currencyCode);
    // impressionFieldObjects.ecommerce.apiProduct = [apiProduct];
    // impressionFieldObjects.ecommerce.apiProduct = [apiProduct];
    // impressionFieldObjects.ecommerce.apiProduct = [apiProduct];
    // impressionFieldObjects.ecommerce.apiProduct = [apiProduct];
    // impressionFieldObjects.ecommerce.apiProduct = [apiProduct];
    // impressionFieldObjects.ecommerce.apiProduct = [apiProduct];
    // ATS.messages = [];
    // var inventoryRecord = availabilityModel.inventoryRecord;

    // if (inventoryRecord) {
    //     ATS.messages.push(
    //         Resource.msgf(
    //             'label.quantity.in.stock',
    //             'common',
    //             null,
    //             inventoryRecord.ATS.value
    //         )
    //     );
    // }

    return impressionFieldObjects;
}

module.exports = function (product, apiProduct) {
    Object.defineProperty(product, 'ecommerce', {
        enumerable: true,
        value: impressionModel(product, apiProduct)
    });
};
// Object.defineProperty(object, 'ats', {
//     enumerable: true,
//     value: getAtsValue(availabilityModel)
// });
