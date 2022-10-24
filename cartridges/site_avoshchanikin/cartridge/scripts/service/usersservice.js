
var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');

// eslint-disable-next-line valid-jsdoc
/**
 * UsersServiceAVoshchanikin
 * @param args Inputs data from controller
 * @returns {Object} UsersServiceAVoshchanikin Service
 */
function getUsersService(args) {
    var service;
    var result;
    var callGet = LocalServiceRegistry.createService('UsersServiceAVoshchanikin', {
        // eslint-disable-next-line no-shadow, no-unused-vars
        createRequest: function (svc, args) {
            svc.setRequestMethod('GET');
        },
        parseResponse: function (svc, client) {
            return client.text;
        }
    });

    /**
     * Executes the request on the service configuration
     */
    function makeCall() {
        result = service.call();

        // args.svcConfig = svcConfig;
        // args.httpResult = result;
    }

    service = callGet;
    service.URL += 'users';
    service.addHeader('Content-Type', 'application/json')
        .addParam(args.paramName, args.pageNumber);


    // Make the service call here
    makeCall();

    return result;
}

// export
module.exports = {
    getUsersService: getUsersService

};

