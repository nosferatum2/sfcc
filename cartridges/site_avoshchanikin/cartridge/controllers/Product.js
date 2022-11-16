'use strict';

var page = module.superModule;
var server = require('server');

server.extend(page);


server.append('Show', function (req, res, next) {
    var viewData = res.getViewData();

    viewData.currencyCode = req.locale.currency.currencyCode;

    res.setViewData(viewData);
    next();
});


module.exports = server.exports();
