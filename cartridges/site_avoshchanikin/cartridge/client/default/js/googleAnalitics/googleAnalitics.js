/* eslint-disable require-jsdoc */
'use strict';

/**
 * Send product to a Google Analitics to track product impressions and product purchases.
 * @param {Object} data - Data that will be sent.
 */
function pushDataLayerInfo(data) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.length = 0;
    window.dataLayer.push(data);
}

/**
 * Generates the data model for a Google Analitics.
 */
function getDataLayer() {
    var dataLayer = {};
    var ecommerce = {};
    var impressions = [];

    var currencyCode = $('#product-search-results').data('currency');
    var productsData = $('.product-grid').find('.grid-tile, .product');

    productsData.each(function (idx, element) {
        var position = idx + 1;
        var product = $(element).data('product');

        product.position = position;

        impressions.push(product);
    });

    ecommerce.currencyCode = currencyCode;
    ecommerce.impressions = impressions;
    dataLayer.ecommerce = ecommerce;

    pushDataLayerInfo(dataLayer);
}
/**
 * Assumes details about the products displayed on a page.
 */
function getImpressions() {
    var productsData = $('.product-grid').find('.grid-tile, .product');

    if (productsData.length) {
        getDataLayer();
    }
}

/**
 * Shows more products displayed on a page.
 */
function getShowMore() {
    var button = $('.show-more button');

    button.on('click', function () {
        $(document).ajaxSuccess(function () {
            getDataLayer();
        });
    });
}
function click() {
    $('body').on('click', '#maincontent', function () {
        console.log('click');
    });
}
function detail() {
    $('#maincontent').on('click', function () {
        console.log('detail');
    });
}
function addToCart() {
    $('#maincontent').on('click', function () {
        console.log('addToCart');
    });
}

module.exports = {
    getImpressions: getImpressions,
    getShowMore: getShowMore,
    click: click,
    detail: detail,
    addToCart: addToCart
};
