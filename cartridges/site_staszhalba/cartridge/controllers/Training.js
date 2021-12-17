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

module.exports = server.exports();
