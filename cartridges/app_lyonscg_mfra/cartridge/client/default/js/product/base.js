'use strict';

var base = require('base/product/base');
var slickConfigs = require('../config/slickConfigs');

/**
 * Init the product carousel using a predefined slick configuration
 */
function carouselInit() {
    if($('.product-carousel').length > 0) {
      $('.product-carousel').not('.slick-initialized').slick(slickConfigs.pdp);
    }
}

/**
 * Deconstruct (unslick) the carousel, removing classes and handlers added on slick initialize.
 */
function carouselUnslick() {
    if ($('.product-carousel').length && $('.product-carousel').hasClass('slick-initialized')) {
        $('.product-carousel').slick('unslick');
    }
}

var exportBase = $.extend({}, base, {
    carouselInit: carouselInit,
    carouselUnslick: carouselUnslick
});

module.exports = exportBase;
