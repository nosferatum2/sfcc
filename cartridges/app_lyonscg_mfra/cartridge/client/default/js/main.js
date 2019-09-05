require('@babel/polyfill');
window.jQuery = window.$ = require('jquery');
var processInclude = require('base/util');

$(document).ready(function () {
    processInclude(require('base/components/menu'));
    processInclude(require('base/components/cookie'));
    processInclude(require('base/components/consentTracking'));
    processInclude(require('./components/footer'));
    processInclude(require('./components/backtotop'));
    processInclude(require('./components/miniCart'));
    processInclude(require('base/components/collapsibleItem'));
    processInclude(require('./components/search'));
    processInclude(require('./components/clientSideValidation'));
    processInclude(require('base/components/countrySelector'));
    processInclude(require('./components/carousels'));
    processInclude(require('./components/tooltips'));
});

require('./thirdParty/bootstrap');
require('base/components/spinner');
require('svg4everybody');
require('slick-carousel');
