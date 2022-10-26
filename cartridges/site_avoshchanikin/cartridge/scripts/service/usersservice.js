
var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');

/**
 * UsersServiceAVoshchanikin
 * @param {Object} data Inputs data from controller
 * @returns {Object} UsersServiceAVoshchanikin Service Result
 */
function getUsersService(data) {
    var result;
    var callGet = LocalServiceRegistry.createService('UsersServiceAVoshchanikin', {
        createRequest: function (svc, args) {
            svc.setRequestMethod('GET');
            svc.URL += 'users';
            svc.addHeader('Content-Type', 'application/json')
                .addParam(args.paramName, args.pageNumber);

            return args;
        },
        parseResponse: function (svc, client) {
            var parse = JSON.parse(client.text);
            return parse;
        }
    });

    /**
     * Executes the request on the service configuration
     * @param {Object} args Inputs data from controller
     */
    function makeCall(args) {
        result = callGet.call(args);
    }

    // Make the service call here
    makeCall(data);

    return result;
}

// export
module.exports = {
    getUsersService: getUsersService

};

