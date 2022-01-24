
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

exports.githubRepositoriesService = LocalServiceRegistry.createService('github-repositories-staszhalba-g1', {
    createRequest: function (svc, params) {
        svc.setRequestMethod('GET');
        var urlQuery = '?q=language:' + params.lang;

        urlQuery = urlQuery + '&page=' + params.page + '&per_page=' + params.perPage;
        svc.setURL(svc.getURL() + urlQuery);
    },
    parseResponse: function (svc, response) {
        return JSON.parse(response.getText()).items.map(function (el) {
            return {
                name: el.name,
                fullName: el.full_name,
                url: el.html_url,
                description: el.description,
                owner: {
                    login: el.owner.login,
                    url: el.owner.html_url
                }
            };
        });
    }
});

