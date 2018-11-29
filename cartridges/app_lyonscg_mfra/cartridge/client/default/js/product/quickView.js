'use strict';

var base = require('./base');
var quickView = require('base/product/quickView');

$('body').on('shown.bs.modal', '#quickViewModal', function () {
    base.carouselInit();
    base.zoomInit();
});

module.exports = quickView;
