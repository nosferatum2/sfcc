'use strict';

var base = module.superModule;
var lyonsSearchHelpers = base;

/**
 * Set folder search configuration values
 *
 * @param {Object} params - Provided HTTP query parameters
 * @return {Object} - content search instance
 */
lyonsSearchHelpers.setupContentFolderSearch = function (params) {
    var ContentSearchModel = require('dw/content/ContentSearchModel');
    var ContentSearch = require('*/cartridge/models/search/contentSearch');
    var apiContentSearchModel = new ContentSearchModel();

    apiContentSearchModel.setRecursiveFolderSearch(true);
    apiContentSearchModel.setFolderID(params.fdid);
    apiContentSearchModel.search();
    var contentSearchResult = apiContentSearchModel.getContent();
    var count = Number(apiContentSearchModel.getCount());
    var contentSearch = new ContentSearch(contentSearchResult, count, null, params.startingPage, null, apiContentSearchModel.folder);

    return contentSearch;
};

module.exports = lyonsSearchHelpers;
