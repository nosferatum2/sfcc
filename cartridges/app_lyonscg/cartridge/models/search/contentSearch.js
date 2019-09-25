'use strict';

var base = module.superModule;

/**
 * Extends base content search model with folder page functionality
 * @constructor
 * @classdesc LyonsContentSearchModel class
 * @param {dw.util.Iterator<dw.content.Content>} contentSearchResult - content iterator
 * @param {number} count - number of contents in the results
 * @param {string} queryPhrase - request queryPhrase
 * @param {number} startingPage - The index for the start of the content page
 * @param {number | null} pageSize - The index for the start of the content page
 * @param {dw.content.Folder} folder - folder which the search is refined by
 */
function LyonsContentSearchModel(contentSearchResult, count, queryPhrase, startingPage, pageSize, folder) {
    base.call(this, contentSearchResult, count, queryPhrase, startingPage, pageSize);

    if (folder) {
        this.folder = folder;
        // use rendering template if set, else use default
        this.template = (!folder.template) ? '/search/contentResults' : folder.template;
    }
}

module.exports = LyonsContentSearchModel;
