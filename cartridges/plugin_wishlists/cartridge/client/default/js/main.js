window.jQuery = window.$ = require('jquery');
var processInclude = require('base/util');

$(document).ready(function () {
    processInclude(require('base/components/menu'));
    processInclude(require('base/components/cookie'));
    processInclude(require('base/components/consentTracking'));
    processInclude(require('lyonscg/components/footer'));
    processInclude(require('lyonscg/components/backtotop'));
    processInclude(require('./components/miniCart'));
    processInclude(require('base/components/collapsibleItem'));
    processInclude(require('base/components/search'));
    processInclude(require('base/components/clientSideValidation'));
    processInclude(require('base/components/countrySelector'));
    processInclude(require('lyonscg/components/carousels'));
    processInclude(require('lyonscg/components/tooltips'));
});

require('base/thirdParty/bootstrap');
require('base/components/spinner');
require('svg4everybody');
require('slick-carousel');
