'use strict';

var server = require('server');

server.extend(module.superModule);

server.replace('UpdateGrid', function (req, res, next) {
    var CatalogMgr = require('dw/catalog/CatalogMgr');
    var ProductSearchModel = require('dw/catalog/ProductSearchModel');
    var searchHelper = require('*/cartridge/scripts/helpers/searchHelpers');
    var ProductSearch = require('*/cartridge/models/search/productSearch');

    var apiProductSearch = new ProductSearchModel();
    apiProductSearch = searchHelper.setupSearch(apiProductSearch, req.querystring);
    var viewData = {
        apiProductSearch: apiProductSearch
    };
    res.setViewData(viewData);

    this.on('route:BeforeComplete', function (req, res) { // eslint-disable-line no-shadow
        var category = null;

        apiProductSearch.search();

        if (!apiProductSearch.personalizedSort) {
            searchHelper.applyCache(res);
        }
        var productSearch = new ProductSearch(
            apiProductSearch,
            req.querystring,
            req.querystring.srule,
            CatalogMgr.getSortingOptions(),
            CatalogMgr.getSiteCatalog().getRoot()
        );

        if (productSearch.category) {
            category = CatalogMgr.getCategory(productSearch.category.id);
        }

        res.render('/search/productGrid', {
            productSearch: productSearch,
            category: category
        });
    });

    next();
});

module.exports = server.exports();
