'use strict';

var Server = require('modules/server');
var Site = require('dw/system/Site');

var CustomServer = Object.create(Server);

/**
 * Validate that first item is a string and all of the following items are functions
 * @param {string} name - Arguments that were passed into function
 * @param {Array} middlewareChain - middleware chain
 * @returns {void}
 */
function checkParams(name, middlewareChain) {
    if (typeof name !== 'string') {
        throw new Error('First argument should be a string');
    }

    if (!middlewareChain.every(function (item) { return typeof item === 'function'; })) {
        throw new Error('Middleware chain can only contain functions');
    }
}

/**
 * On Route Start Handler
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {void}
 */
function onRouteStartHandler(req, res) {
    var pageContextMapPref = Site.getCurrent().getCustomPreferenceValue('pageContextMap');
    if (pageContextMapPref != null) {
        var pageContextMap = JSON.parse(pageContextMapPref);
        var actions = req.path.split('/');
        if (actions.length > 0) {
            var action = actions[actions.length - 1];
            // get controller name in case global pageContextMap fallback
            var controllerName = action.split('-')[0];
            if (action != null && (action in pageContextMap || controllerName in pageContextMap)) {
                var pageContext = {};
                // create variable to hold pageContentMap lookup id and use in pageContext value assignments
                var routeMap;
                // assign value to routeMap based on values in pageContextMap
                if (action in pageContextMap) {
                    routeMap = action;
                } else if (controllerName in pageContextMap) {
                    routeMap = controllerName;
                }
                // assign values to pageContext with routeMap variable
                pageContext.title = ('title' in pageContextMap[routeMap]) && pageContextMap[routeMap].title != null ? pageContextMap[routeMap].title : '';
                pageContext.type = ('type' in pageContextMap[routeMap]) && pageContextMap[routeMap].type != null ? pageContextMap[routeMap].type : '';
                pageContext.ns = ('ns' in pageContextMap[routeMap]) && pageContextMap[routeMap].ns != null ? pageContextMap[routeMap].ns : '';
                res.setViewData({ pageContext: pageContext });
            }
        }
    }
}

CustomServer.get = function () {
    var args = Array.prototype.slice.call(arguments);
    args.splice(1, 0, this.middleware.get);
    var returnedRoute = this.use.apply(this, args);
    returnedRoute.on('route:Start', onRouteStartHandler);
    return returnedRoute;
};

CustomServer.replace = function (name) {
    var args = Array.prototype.slice.call(arguments);
    var middlewareChain = Array.prototype.slice.call(arguments, 1);
    checkParams(args[0], middlewareChain);

    if (!this.routes[name]) {
        throw new Error('Route with this name does not exist');
    }

    delete this.routes[name];

    var returnedRoute = this.use.apply(this, arguments);
    returnedRoute.on('route:Start', onRouteStartHandler);
    return returnedRoute;
};

module.exports = CustomServer;
