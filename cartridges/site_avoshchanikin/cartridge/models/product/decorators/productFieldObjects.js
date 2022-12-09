'use strict';


/**
 * Creates an object of the visible attributes for a product
 * @param {dw.catalog.Product} apiProduct - Product information returned by the script API
 * @param {Object} options - Options passed in from the factory
 * @return {Object} an object containing the visible attribute 'ecommerce' for a product.
 */
function productFieldObjects(apiProduct, options) {
    var fieldObject = {};
    fieldObject.name = apiProduct.name;
    fieldObject.id = apiProduct.ID;
    fieldObject.price = apiProduct.getPriceModel().price.value;
    fieldObject.brand = apiProduct.getBrand();
    fieldObject.category = apiProduct.getPrimaryCategory() ? apiProduct.getPrimaryCategory().displayName : apiProduct.getMasterProduct().getPrimaryCategory().displayName;

    if (options) {
        fieldObject.variant = options.productType || null;
    }

    return fieldObject;
}

module.exports = function (product, apiProduct, options) {
    Object.defineProperty(product, 'ecommerce', {
        enumerable: true,
        value: productFieldObjects(apiProduct, options)
    });
};

