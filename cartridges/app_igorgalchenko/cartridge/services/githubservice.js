var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');

var githubservice = LocalServiceRegistry.createService('github-igorgalchenko-g1', {
    createRequest: function (svc, params) {
        svc.setRequestMethod('GET');
        svc.addHeader('Accept', 'application/vnd.github.v3+json');

        return params;
    },
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
    githubservice: githubservice
};
