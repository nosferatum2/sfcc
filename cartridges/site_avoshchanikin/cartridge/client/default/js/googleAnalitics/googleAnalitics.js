'use strict';

/**
 * Send product to a Google Analitics to track product impressions and product purchases.
 * @param {Object} data - Data that will be sent.
 */
function pushDataLayerInfo(data) {
    window.dataLayer = window.dataLayer || [];

    if (window.dataLayer.length) {
        window.dataLayer.length = 0;
    }

    window.dataLayer.push(data);
}

/**
 * Generates the PLP data model.
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
 * Assumes details about the products displayed on a page
 * are known at the time the page loads.
 */
function getImpressions() {
    var productsData = $('.product-grid').find('.grid-tile, .product');

    if (productsData.length) {
        getDataLayer();
    }
}

/**
 * Assumes details about Show more products displayed on a page.
 */
function getShowMore() {
    var button = $('.show-more button');

    button.on('click', function () {
        $(document).ajaxSuccess(function () {
            getDataLayer();
        });
    });
}
/**
 * Assumes the detail view occurs on pageload,
 * and also tracks a standard pageview of the details page.
 */
function getProductDetail() {
    var dataLayer = {};
    var ecommerce = {};
    var products = [];
    var productsData = $('.product-detail').data('product');
    var actionField = { list: window.pageContext.title };

    if (productsData) {
        products.push(productsData);
        ecommerce.detail = { actionField, products };
        dataLayer.ecommerce = ecommerce;

        pushDataLayerInfo(dataLayer);
    }
}
/**
 * Measure additions from a shopping cart using an Add To Cart
 * @param {Object} response - response from Ajax call
 * @param {Object} response.product - Product object
 * @param {Object} response.product.ecommerce - productFieldObjects
 */
function getAddToCart(response) {
    var dataLayer = {};
    var ecommerce = {};
    var products = [];

    if (response) {
        products.push(response.product.ecommerce);
    }

    $(document).on('click', 'button.add-to-cart, button.add-to-cart-global', function () {
        var event = 'addToCart';
        var currencyCode = $('.product-detail').data('currency');

        ecommerce.add = { products };
        ecommerce.currencyCode = currencyCode;

        dataLayer.event = event;
        dataLayer.ecommerce = ecommerce;

        pushDataLayerInfo(dataLayer);
    });
}
/**
 * Measure the removal of a product from a shopping cart.
 */
function getRemoveFromCart() {
    var dataLayer = {};
    var ecommerce = {};
    var products = [];
    var event = 'removeFromCart';
    var currencyCode = $('.card').data('currency');

    $(document).on('click', 'button.remove-product', function (e) {
        var product = $(e.target).closest('.card').data('product');

        if (products.length) {
            products.length = 0;
        }
        products.push(product);

        $('button.cart-delete-confirmation-btn').on('click', function () {
            ecommerce.remove = { products };
            ecommerce.currencyCode = currencyCode;

            dataLayer.event = event;
            dataLayer.ecommerce = ecommerce;

            pushDataLayerInfo(dataLayer);
        });
    });
}

$(window).on('load', getProductDetail);

module.exports = {
    getImpressions: getImpressions,
    getShowMore: getShowMore,
    getAddToCart: getAddToCart,
    getRemoveFromCart: getRemoveFromCart
};
