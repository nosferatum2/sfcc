'use strict';

var server = require('server');
server.extend(module.superModule);
var CatalogMgr = require('dw/catalog/CatalogMgr');
var Site = require('dw/system/Site');

/**
 * Climb up the category tree to see if any parents have the enable compare turned on
 *
 * @param {Object} productSearch - product search result model
 * @return {boolean} - boolean to determine if the template should display the compare checkbox
 */
function getCategoryCompareStatus(productSearch) {
    var compareBooleanValue = false;
    var enableProductCompare = Site.getCurrent().getCustomPreferenceValue('enableProductCompare');
    if (productSearch && productSearch.category && enableProductCompare !== null && enableProductCompare) {
        var currentCategory;
        var selectedCategory;
        compareBooleanValue = true;
        selectedCategory = CatalogMgr.getCategory(productSearch.category.id);
        compareBooleanValue = selectedCategory.custom.enableCompare;

        if (selectedCategory.parent) {
            currentCategory = selectedCategory.parent;
            while (currentCategory.ID !== 'root') {
                compareBooleanValue = compareBooleanValue || currentCategory.custom.enableCompare;
                currentCategory = currentCategory.parent;
            }
        }
    }
    return compareBooleanValue;
}

server.append('ShowAjax', function (req, res, next) {
    var viewData = res.getViewData();
    viewData.compareEnabled = getCategoryCompareStatus(viewData.productSearch);
    res.setViewData(viewData);
    next();
});

server.append('Show', function (req, res, next) {
    var oldHandler = this.listeners('route:BeforeComplete'); // eslint-disable-line no-shadow
    this.off('route:BeforeComplete');

    this.on('route:BeforeComplete', (function (req, res) { // eslint-disable-line no-shadow
        if (oldHandler[0]) {
            oldHandler[0].call(this, req, res);
            var viewData = res.getViewData();
            viewData.compareEnabled = getCategoryCompareStatus(viewData.productSearch);
            res.setViewData(viewData);
        }
    }).bind(this));
    next();
});

server.append('UpdateGrid', function (req, res, next) {
    var viewData = res.getViewData();
    viewData.compareEnabled = getCategoryCompareStatus(viewData.productSearch);
    res.setViewData(viewData);
    next();
});

module.exports = server.exports();
