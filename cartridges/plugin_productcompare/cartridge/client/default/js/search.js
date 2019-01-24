'use strict';

var processInclude = require('base/util');

$(document).ready(function () {
    processInclude(require('lyonscg/search'));
    processInclude(require('wishlist/product/wishlistHeart'));
    processInclude(require('./product/compare'));
});
