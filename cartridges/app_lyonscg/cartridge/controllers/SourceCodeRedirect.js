'use strict';

var server = require('server');

server.get('Start', function (req, res, next) {
    var URLUtils = require('dw/web/URLUtils');

    var sourceCodeRedirectURL = req.session.raw.sourceCodeInfo ? req.session.raw.sourceCodeInfo.redirect : null;

    if (!sourceCodeRedirectURL) {
        res.redirect(URLUtils.url('Home-Show'));
    } else {
        var location = sourceCodeRedirectURL.location;
        // Replacing Legacy Link Controller redirect
        if (location.indexOf('Link-Product') >= 0) {
            location = location.replace('Link-Product', 'Product-Show');
        } else if (location.indexOf('Link-Category') >= 0) {
            location = location.replace('Link-Category', 'Search-Show');
        } else if (location.indexOf('Link-CategoryProduct') >= 0) {
            location = location.replace('Link-CategoryProduct', 'Product-Show');
        } else if (location.indexOf('Link-Page') >= 0) {
            location = location.replace('Link-Page', 'Page-Show');
        }
        res.redirect(location);
    }
    next();
});

module.exports = server.exports();
