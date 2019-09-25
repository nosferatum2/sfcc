'use strict';

var cart = require('base/cart/cart');
var base = require('../product/base');
var qtySelect = require('../components/quantitySelect');

base.carouselInit();

if ($('.minicart').data('enablequantityselector') === true) {
    qtySelect.initQuantitySelector();
}

$('body').on('product:beforeAttributeSelect', function () {
    // Unslick the existing images to prepare them for direct js manipulation
    base.carouselUnslick();
    base.carouselUnslickBonus();
});

$('body').on('product:afterAttributeSelect', function (e, response) {
    base.updateMainImages(response.data.product);
    base.carouselInit();
});

$('body').on('shown.bs.modal', '#editProductModal, #quickViewModal, #chooseBonusProductModal', function () {
    base.carouselInit();
    base.carouselInitBonus();
});


module.exports = cart;
