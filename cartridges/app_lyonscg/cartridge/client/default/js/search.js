'use strict';

var processInclude = require('base/util');

$(document).ready(function () {
    processInclude(require('./search/search'));
    processInclude(require('base/product/quickView'));
    processInclude(require('wishlists/product/wishlistHeart'));
    processInclude(require('productcompare/product/compare'));
});
