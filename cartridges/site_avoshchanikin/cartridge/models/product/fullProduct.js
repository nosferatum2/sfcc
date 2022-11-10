'use strict';

/**
 * Base fullProduct model overridden to decorate additional product image type 'hi-res'
 * 'hi-res' product image type uses on PDP for zoom
 */
var base = module.superModule;

/**
 * Decorate product with full product information
 * @param {Object} product - Product Model to be decorated
 * @param {dw.catalog.Product} apiProduct - Product information returned by the script API
 * @param {string} options - Options passed in from the factory
 * @property {dw.catalog.ProductVarationModel} options.variationModel - Variation model returned by the API
 *
 * @returns {Object} - Decorated product model
 */
module.exports = function fullProduct(product, apiProduct, options) {
    var impressionFieldObjectsDecorator = require('*/cartridge/models/product/decorators/impressionFieldObjects');

    base.call(this, product, apiProduct, options);
    impressionFieldObjectsDecorator(product, apiProduct);

    return product;
};
