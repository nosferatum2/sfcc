'use strict';

var page = module.superModule;
var server = require('server');

server.extend(page);

function isAddedToProgram() {
    return 'addToProgram' in session.custom ? session.custom.addToProgram : false; 
}

server.append('Show', function (req, res, next) {
    res.setViewData({isAddedToProgram: isAddedToProgram()});
    
    next();
});

server.append('MiniCartShow', function (req, res, next) {
    res.setViewData({isAddedToProgram: isAddedToProgram()});
    
    next();
});

server.get('AddToProgram', function (req, res, next) {
    var URLUtils = require('dw/web/URLUtils');

    session.custom.addToProgram = true;

    res.redirect(URLUtils.url('Cart-Show'));

    next();
});

module.exports = server.exports();
