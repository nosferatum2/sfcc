'use strict';

var server = require('server');
var service = require('app_igorgalchenko/cartridge/services/githubRepositoriesService');
var renderTemplateHelper = require('*/cartridge/scripts/renderTemplateHelper');

server.get('Show', function (req, res, next) {
    var URLUtils = require('dw/web/URLUtils');

    res.render('github/languages', {
        actionUrl: URLUtils.url('GitHubLanguages-LangProjectsSearch')
    });

    next();
});

server.get('LangProjectsSearch', function (req, res, next) {
    var PER_PAGE = 10;
    var language = req.querystring.language;
    var pageNumber = Number(req.querystring.pageNumber) + 1;
    var template = '';
    var svcResult = service.githubRepoService
                    .addParam('q', 'language:' + language)
                    .addParam('page', pageNumber)
                    .addParam('per_page', PER_PAGE)
                    .call();

    if (svcResult.status === 'OK') {
        template = renderTemplateHelper.getRenderedHtml({ repositories: svcResult.object.items }, 'github/repositoriesList');
    }

    res.json({
        success: !(svcResult.status === 'ERROR'),
        template: template,
        pageNumber: pageNumber,
        msg: svcResult.msg ? svcResult.msg : ''
    });

    next();
});

module.exports = server.exports();
