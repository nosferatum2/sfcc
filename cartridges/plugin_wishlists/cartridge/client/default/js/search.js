'use strict';

var processInclude = require('base/util');

$(document).ready(function () {
    processInclude(require('lyonscg/search'));
    processInclude(require('./product/wishlistHeart'));
});
