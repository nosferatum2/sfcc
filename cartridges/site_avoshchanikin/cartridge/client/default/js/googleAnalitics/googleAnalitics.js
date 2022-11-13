/* eslint-disable require-jsdoc */
'use strict';

// function pushDataLayerInfo(data) {
//     var dataLayer = [];
//     dataLayer.push(data);

//     window.dataLayer = dataLayer;
// }

function impressions() {
    var products = [];
    $('.product-grid').find('.grid-tile, .product').each(function () {
        products.push($(this).data('product'));
    });
    console.log(products);
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
    impressions: impressions,
    click: click,
    detail: detail,
    addToCart: addToCart
};
