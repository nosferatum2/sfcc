'use strict';

var page = module.superModule;
var server = require('server');

server.extend(page);

server.append('Show', function (req, res, next) {
    var ProductSearchModel = require('dw/catalog/ProductSearchModel');
    var searchHelper = require('*/cartridge/scripts/helpers/searchHelpers');
    var isAjax = Object.hasOwnProperty.call(req.httpHeaders, 'x-requested-with')
        && req.httpHeaders['x-requested-with'] === 'XMLHttpRequest';
    var resultsTemplate = isAjax ? 'search/searchResultsNoDecorator' : 'search/searchResults';
    var apiProductSearch = new ProductSearchModel();
    apiProductSearch = searchHelper.setupSearch(apiProductSearch, req.querystring);
    var categoryTemplate = '';

    if (apiProductSearch.category) {
        categoryTemplate = apiProductSearch.category.template ? apiProductSearch.category.template : '';
        var viewData = res.getViewData();
        viewData.category = apiProductSearch.category;
        res.setViewData(viewData);
    }

    if (
        apiProductSearch.categorySearch
        && !apiProductSearch.refinedCategorySearch
        && categoryTemplate
    ) {
        if (isAjax) {
            res.render(resultsTemplate);
        } else {
            res.render(categoryTemplate);
        }
    } else {
        res.render(resultsTemplate);
    }

    return next();
});

module.exports = server.exports();
