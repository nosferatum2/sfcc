'use strict';

var server = require('server');

server.get('Isml', function (req, res, next) {
    var template = 'training';
    var viewData = res.getViewData();

    viewData.booleanFlag = true;
    viewData.arrayToIterate = ['apple', 'banana', 'kiwi'];
    viewData.objectToIterate = { one: 1, two: 2, three: 3 };

    res.setViewData(viewData);
    res.render(template);

    next();
});

server.get('Decorated', function (req, res, next) {
    var template = 'decorated';
    var viewData = res.getViewData();

    viewData.booleanFlag = true;
    viewData.arrayToIterate = ['apple', 'banana', 'kiwi'];
    viewData.objectToIterate = { one: 1, two: 2, three: 3 };

    res.setViewData(viewData);
    res.render(template);

    next();
});

server.get('QueryString', function (req, res, next) {
    var viewData = res.getViewData();

    viewData.myParam = req.querystring.myParam;

    res.setViewData(viewData);
    res.render('queryString');

    next();
});

module.exports = server.exports();
