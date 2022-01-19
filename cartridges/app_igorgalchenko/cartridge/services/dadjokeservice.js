var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');

var dadJokeAPIService = LocalServiceRegistry.createService('MagicCartridge.Dad.Service', {
    createRequest: function (svc, params) {
        svc.setRequestMethod('GET');
        svc.addHeader('Accept', 'application/json');
        return params;
    },
    /*
    executeOverride: true,
    execute: function (service, request) {
        var httpClient = service.getClient();

        httpClient.open(service.getRequestMethod(), service.getURL());
        httpClient.setTimeout(service.getConfiguration().getProfile().getTimeoutMillis());
        httpClient.send();

        return httpClient;
    },
    */
    parseResponse: function (svc, httpClient) {
        var result;

        try {
            result = JSON.parse(httpClient.text);
        } catch (e) {
            result = httpClient.text;
        }
        return result;
    }
});

module.exports = {
    dadJokeAPIService: dadJokeAPIService
};
