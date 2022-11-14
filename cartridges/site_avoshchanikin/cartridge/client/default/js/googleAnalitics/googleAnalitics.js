/* eslint-disable require-jsdoc */
'use strict';

window.dataLayer = window.dataLayer || [];
function pushDataLayerInfo(data) {
    window.dataLayer.push(data);
}

function getImpressions() {
    var dataLayer = {};
    var ecommerce = {};
    var impressions = [];

    var productsData = $('.product-grid').find('.grid-tile, .product');
    var currencyCode = $('#product-search-results').data('currency');

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
    click: click,
    detail: detail,
    addToCart: addToCart
};
