window.jQuery = window.$ = require('jquery');
var processInclude = require('base/js/util');

$(document).ready(function () {
    processInclude(require('base/js/components/menu'));
    processInclude(require('base/js/components/cookie'));
    processInclude(require('base/js/components/consentTracking'));
    processInclude(require('./components/footer'));
    processInclude(require('./components/backtotop'));
    processInclude(require('base/js/components/miniCart'));
    processInclude(require('base/js/components/collapsibleItem'));
    processInclude(require('base/js/components/search'));
    processInclude(require('base/js/components/clientSideValidation'));
    processInclude(require('base/js/components/countrySelector'));
    processInclude(require('./components/carousels'));
    processInclude(require('./components/tooltips'));
});

require('base/js/thirdParty/bootstrap');
require('base/js/components/spinner');
require('svg4everybody');
require('slick-carousel');
