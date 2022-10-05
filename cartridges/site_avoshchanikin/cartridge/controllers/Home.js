'use strict';

var page = module.superModule;
var server = require('server');
var URLUtils = require('dw/web/URLUtils');

server.extend(page);

var cache = require('*/cartridge/scripts/middleware/cache');

/**
 * Any customization on this endpoint, also requires update for Default-Start endpoint
 */
server.prepend('Show', cache.applyDefaultCache, function (req, res, next) {
    var viewData = res.getViewData();
    viewData.param1 = 'This is from prepend';
    res.setViewData(viewData);
    next();
});

server.append('Show', cache.applyDefaultCache, function (req, res, next) {
    var viewData = res.getViewData();
    var basketShowUrl = URLUtils.url('Basket-Show').toString();
    var NewsletterShowUrl = URLUtils.url('Newsletter-Show').toString();

    // declare param1 as a variable that equals 'General company details.’
    var appendParam = 'This is from append';
    var queryparam = req.querystring.param ? req.querystring.param : 'no parameter was passed';

    // Here grab whatever prepend added to viewData + the message here + the optional query string param
    res.setViewData({
        param1: viewData.param1 + ' AND ' + appendParam + ' AND querystring param = ' + queryparam,
        basketShowUrl: basketShowUrl,
        NewsletterShowUrl: NewsletterShowUrl
    });
    next();
});

// server.replace('Show', cache.applyCustomCache, function (req, res, next) {
//     var viewData = res.getViewData();
//     var appendParam = 'This is from append';
//     var replaceParam = 'This is from replace';
//     var queryparam = req.querystring.param ? req.querystring.param : 'no parameter was passed(replace)';
//     // viewData = undefined, because we have replaced block of code higher(lines 13-31)
//     // other params triggered by this methos and work fine.
//     res.setViewData({
//         param1: viewData.param1 + ' AND ' + appendParam + ' AND ' + replaceParam + ' AND queryparam ' + queryparam,
//         param2: res.cachePeriod + ' ' + res.cachePeriodUnit
//     });
//     res.render('/home/homePage');
//     next();
// });


module.exports = server.exports();
