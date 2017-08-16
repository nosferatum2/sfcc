window.jQuery = window.$ = require('jquery');
// Activate SVG4Everybody
var svg4everybody = require('svg4everybody');
svg4everybody();
require('slick-carousel');

var processInclude = require('./util');

$(document).ready(function () {
    processInclude(require('./components/menu'));
    processInclude(require('./components/footer'));
    processInclude(require('./components/minicart'));
    processInclude(require('./components/collapsable-item'));
    processInclude(require('./components/search'));
    processInclude(require('./components/client-side-validation'));
    processInclude(require('./components/countryselector'));
});

require('./thirdparty/bootstrap');
require('./components/spinner');
