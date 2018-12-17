'use strict';

var processInclude = require('base/js/util');

$(document).ready(function () {
    processInclude(require('./search/search'));
    processInclude(require('base/js/product/quickView'));
});
