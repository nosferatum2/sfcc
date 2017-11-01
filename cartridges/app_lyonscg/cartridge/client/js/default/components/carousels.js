'use strict';
var slickConfigs = require('../config/slickConfigs');

/**
 * Init globally reusable carousels
 */

module.exports = {
    heroCarousels: function () {
        $('.hero-caro').slick(slickConfigs.hero);
    },
    productTileCarousels: function () {
        $('.product-tile-caro').slick(slickConfigs.productTiles);
    }
};
