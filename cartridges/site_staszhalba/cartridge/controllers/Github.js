'use strict';

var server = require('server');

/**
 * appends params to a url
 * @param {string} url - Original url
 * @param {Object} params - Parameters to append
 * @returns {string} result url with appended parameters
 */
function appendToUrl(url, params) {
    var newUrl = url;
    newUrl += (newUrl.indexOf('?') !== -1 ? '&' : '?') + Object.keys(params).map(function (key) {
        return key + '=' + encodeURIComponent(params[key]);
    }).join('&');

    return newUrl;
}

server.get('Show', function (req, res, next) {
    var Resource = require('dw/web/Resource');

    var languages = [
        Resource.msg('form.option.javascript.label', 'githubRepositories', null),
        Resource.msg('form.option.php.label', 'githubRepositories', null),
        Resource.msg('form.option.python.label', 'githubRepositories', null)
    ];

    res.render('github/repositories', { languages: languages });

    next();
});

server.get('Search', function (req, res, next) {
    var Resource = require('dw/web/Resource');
    var GithubServiceRegistry = require('*/cartridge/scripts/serviceregistry/GithubServiceRegistry');

    var serviceResponse = GithubServiceRegistry.githubRepositoriesService.call({
        lang: req.querystring.programmingLanguage,
        page: req.querystring.page,
        perPage: req.querystring.perPage
    });

    if (serviceResponse.object.empty === 'undefined' || serviceResponse.object.empty) {
        res.setStatusCode(500);
        res.json({
            success: false,
            errorMessage: Resource.msg('error.something.went.wrong', 'githubRepositories', null)
        });

        // eslint-disable-next-line consistent-return
        return;
    }

    var repositoriesSearch = {};
    repositoriesSearch.repositories = serviceResponse.object;
    repositoriesSearch.pageNumber = (++req.querystring.page).toString();
    repositoriesSearch.pageSize = req.querystring.perPage;

    var showMoreParams = req.querystring;
    showMoreParams.page = repositoriesSearch.pageNumber;
    showMoreParams.perPage = repositoriesSearch.pageSize;

    repositoriesSearch.showMoreUrl = appendToUrl(req.path, showMoreParams);

    res.render('github/repositoriesGrid', {
        repositoriesSearch: repositoriesSearch
    });

    next();
});

module.exports = server.exports();
