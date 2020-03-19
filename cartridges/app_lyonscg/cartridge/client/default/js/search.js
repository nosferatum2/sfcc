'use strict';

var processInclude = require('base/util');

$(document).ready(function () {
    processInclude(require('base/search/search'));
    processInclude(require('base/product/quickView'));
    processInclude(require('lyonscg/product/wishlistHeart'));
    processInclude(require('productcompare/product/compare'));
    processInclude(require('wishlists/product/wishlistHeart'));
    processInclude(require('app_lyonscg/cartridge/client/default/js/search/search'));
});

