/* eslint-disable valid-jsdoc */
'use strict';

// dataLayer here

/**
 * Creates an object of the visible attributes for a product
 * @param {dw.catalog.Product} _____ - ____ for a given product.
 * @return {Object} an object containing the visible attribute 'ecommerce' for a product.
 */
function productFieldObjects(product, apiProduct) {
    var fieldObject = {};
    fieldObject.name = product.productName;
    fieldObject.id = product.id;
    fieldObject.price = apiProduct.getPriceModel().price.value;
    fieldObject.brand = product.brand;
    fieldObject.variant = product.productType;

    return fieldObject;
}

module.exports = function (product, apiProduct) {
    Object.defineProperty(product, 'ecommerce', {
        enumerable: true,
        value: productFieldObjects(product, apiProduct)
    });
};

