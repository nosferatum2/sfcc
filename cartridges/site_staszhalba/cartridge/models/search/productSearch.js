'use strict';

var base = module.superModule;
var slotTileOrderDecorator = require('*/cartridge/models/search/decorators/slotTileOrder');

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

    slotTileOrderDecorator(this, productSearch, httpParams, sortingRule, sortingOptions, rootCategory);
}

module.exports = ProductSearch;
