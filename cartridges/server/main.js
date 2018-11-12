'use strict';

var Server = require('modules/server');
var Site = require('dw/system/Site');

var CustomServer = Object.create(Server);

CustomServer.get = function () {
    var args = Array.prototype.slice.call(arguments);
    args.splice(1, 0, this.middleware.get);
    var returnedRoute = this.use.apply(this, args);
    returnedRoute.on('route:Start', function onRouteStartHandler(req, res) {
        var pageContextMapPref = Site.getCurrent().getCustomPreferenceValue('pageContextMap');
        if (pageContextMapPref != null) {
            var pageContextMap = JSON.parse(pageContextMapPref);
            var actions = req.path.split('/');
            if (actions.length > 0) {
                var action = actions[actions.length - 1];
                if (action != null && (action in pageContextMap)) {
                    var pageContext = {};
                    pageContext.title = ('title' in pageContextMap[action]) && pageContextMap[action].title != null ? pageContextMap[action].title : '';
                    pageContext.type = ('type' in pageContextMap[action]) && pageContextMap[action].type != null ? pageContextMap[action].type : '';
                    pageContext.ns = ('ns' in pageContextMap[action]) && pageContextMap[action].ns != null ? pageContextMap[action].ns : '';
                    res.setViewData({ pageContext: pageContext });
                }
            }
        }
    });
    return returnedRoute;
};

module.exports = CustomServer;
