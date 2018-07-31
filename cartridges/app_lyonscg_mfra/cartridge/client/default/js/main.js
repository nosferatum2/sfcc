window.jQuery = window.$ = require('jquery');

var processInclude = require('./util');

$(document).ready(function () {
    processInclude(require('./components/menu'));
    processInclude(require('./components/footer'));
    processInclude(require('./components/backtotop'));
    processInclude(require('./components/minicart'));
    processInclude(require('./components/collapsibleItem'));
    processInclude(require('./components/search'));
    processInclude(require('./components/clientSideValidation'));
    processInclude(require('./components/countryselector'));
    processInclude(require('./components/carousels'));
});

require('./thirdparty/bootstrap');
require('./components/spinner');
require('svg4everybody');
require('slick-carousel');
