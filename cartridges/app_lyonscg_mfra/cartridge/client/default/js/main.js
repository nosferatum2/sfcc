window.jQuery = window.$ = require('jquery');
var processInclude = require('base/util');

$(document).ready(function () {
    processInclude(require('base/components/menu'));
    processInclude(require('base/components/cookie'));
    processInclude(require('base/components/consentTracking'));
    processInclude(require('./components/footer'));
    processInclude(require('./components/backtotop'));
    processInclude(require('base/components/minicart'));
    processInclude(require('base/components/collapsibleItem'));
    processInclude(require('base/components/search'));
    processInclude(require('base/components/clientSideValidation'));
    processInclude(require('base/components/countryselector'));
    processInclude(require('./components/carousels'));
});

require('base/thirdparty/bootstrap');
require('base/components/spinner');
require('svg4everybody');
require('slick-carousel');
