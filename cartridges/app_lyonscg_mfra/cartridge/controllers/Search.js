'use strict';

/**
 * Search base controller overridden to show breadcrumbs on product listing page
 *
 */

var page = module.superModule;
var server = require('server');
var cache = require('*/cartridge/scripts/middleware/cache');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');
var pageMetaData = require('*/cartridge/scripts/middleware/pageMetaData');

server.extend(page);

/**
 * Creates the breadcrumbs object
 * @param {string} cgid - category ID from navigation and search
 * @param {Array} breadcrumbs - array of breadcrumbs object
 * @returns {Array} an array of breadcrumb objects
 */
function getAllBreadcrumbs(cgid, breadcrumbs) {
    var category;
    if (cgid) {
        var URLUtils = require('dw/web/URLUtils');
        var CatalogMgr = require('dw/catalog/CatalogMgr');
        category = CatalogMgr.getCategory(cgid);
        breadcrumbs.push({
            htmlValue: category.displayName,
            url: URLUtils.url('Search-Show', 'cgid', category.ID)
        });
        if (category.parent && category.parent.ID !== 'root') {
            return getAllBreadcrumbs(category.parent.ID, breadcrumbs);
        }
    }
    return breadcrumbs;
}

server.replace('ShowAjax', cache.applyShortPromotionSensitiveCache, consentTracking.consent, function (req, res, next) {
    var searchHelper = require('*/cartridge/scripts/helpers/searchHelpers');

    var result = searchHelper.search(req, res);
    var template = 'search/searchResultsNoDecorator';

    if (result.searchRedirect) {
        res.redirect(result.searchRedirect);
        return next();
    }

    if (result.category && result.categoryTemplate) {
        template = result.categoryTemplate;
    }

    res.render(template, {
        productSearch: result.productSearch,
        category: result.category ? result.category : null,
        maxSlots: result.maxSlots,
        reportingURLs: result.reportingURLs,
        refineurl: result.refineurl
    });

    return next();
}, pageMetaData.computedPageMetaData);

server.append('Show', function (req, res, next) {
    if (req.querystring.cgid) {
        var viewData = res.getViewData();
        var breadcrumbs = getAllBreadcrumbs(req.querystring.cgid, []).reverse();
        viewData.breadcrumbs = breadcrumbs;
        res.setViewData(viewData);
    }
    next();
});

server.get('ShowContent', cache.applyPromotionSensitiveCache, function (req, res, next) {
    var searchHelper = require('*/cartridge/scripts/helpers/searchHelpers');

    var contentSearch = searchHelper.setupContentFolderSearch(req.querystring);

    res.render(contentSearch.template, {
        contentSearch: contentSearch
    });

    next();
});

module.exports = server.exports();
