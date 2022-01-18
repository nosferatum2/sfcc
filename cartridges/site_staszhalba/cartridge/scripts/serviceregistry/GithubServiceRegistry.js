
'use strict';

var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');

exports.githubService = LocalServiceRegistry.createService('github-staszhalba-g1', {
    createRequest: function (svc, params) {
        svc.setEncoding('UTF-8');
        svc.setRequestMethod('GET');
        svc.addHeader('Content-Type', 'application/json');

        // var serviceUrl = svc.getConfiguration().getCredential().getURL();

        var url = encodeURI(svc.getURL() + params.email + ' in:email type:user');
        svc.setURL(url);

        return svc;
    },
    parseResponse: function (svc, client) {
        var jsonResponse = JSON.parse(client.text);

        if (jsonResponse.total_count > 0) {
            return {
                success: true,
                data: {
                    user: {
                        id: jsonResponse.items[0].id,
                        login: jsonResponse.items[0].login
                    }
                }
            };
        }

        return {
            success: false
        };
    }
});
