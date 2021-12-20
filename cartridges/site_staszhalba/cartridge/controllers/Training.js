var server = require('server');

server.get('IsmlTags', function (req, res, next) {
    var template = 'training';
    var viewData = {
        booleanFlag: !!req.querystring.booleanFlag,
        arrayToIterate: ['Apple', 'Samsung', 'Xiaomi'],
        objectToIterate: {
            name: 'John',
            surname: 'Doe',
            phone: 1111111111
        }
    };

    res.render(template, viewData);
    next();
});

server.get('Decorate', function (req, res, next) {
    var viewData = {
        booleanFlag: !!req.querystring.booleanFlag,
        arrayToIterate: ['Apple', 'Samsung', 'Xiaomi'],
        objectToIterate: {
            name: 'John',
            surname: 'Doe',
            phone: 1111111111
        }
    };

    res.render('decorate', viewData);
    next();
});

server.get('SimpleRequest', function (req, res, next) {
    var queryMyParam = req.querystring.myParam;

    res.render('simple-request', {
        queryMyParam: queryMyParam
    });
    next();
});

module.exports = server.exports();
