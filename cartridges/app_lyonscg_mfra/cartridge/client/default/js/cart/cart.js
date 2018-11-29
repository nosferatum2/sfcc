'use strict';

var cart = require('base/cart/cart');
var base = require('../product/base');

$('body').on('shown.bs.modal', '#editProductModal', function () {
    base.carouselInit();
});

module.exports = cart;
