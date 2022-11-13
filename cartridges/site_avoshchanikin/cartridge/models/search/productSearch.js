'use strict';

var base = module.superModule;
var Logger = require('dw/system/Logger');
// eslint-disable-next-line require-jsdoc
function categoryFieldObjects(productSearch, rootCategory) {
    var fieldObject = {};
    fieldObject.currencyCode = 'rootCategory.getPriceModel().price.currencyCode';
    fieldObject.customRoot = 'rootCategory';
    Logger.getLogger('avoshchanikin_scope').info(JSON.stringify(rootCategory));
    // fieldObject.ecommerce = JSON.stringify(apiProduct.getPriceModel().price.currencyCode);

    return fieldObject;
}

/**
 * @constructor
 * @classdesc ProductSearch class
 *
 * @param {dw.catalog.ProductSearchModel} productSearch - Product search object
 * @param {Object} httpParams - HTTP query parameters
 * @param {string} sortingRule - Sorting option rule ID
 * @param {dw.util.ArrayList.<dw.catalog.SortingOption>} sortingOptions - Options to sort search
 *     results
 * @param {dw.catalog.Category} rootCategory - Search result's root category if applicable
 */
function ProductSearch(productSearch, httpParams, sortingRule, sortingOptions, rootCategory) {
    base.call(this, productSearch, httpParams, sortingRule, sortingOptions, rootCategory);
}

ProductSearch.prototype = Object.create(base.prototype);

Object.defineProperty(ProductSearch.prototype, 'ecommerce', {
    get: function () {
        return categoryFieldObjects();
    }

});

module.exports = ProductSearch;
