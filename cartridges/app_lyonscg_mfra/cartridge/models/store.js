'use strict';

/**
 * Base store model overridden to add SEO attributes to store object
 *
 */

var base = module.superModule;

/**
 * @constructor
 * @classdesc The stores model
 * @param {dw.catalog.Store} storeObject - a Store objects
 */
function store(storeObject) {
    base.call(this, storeObject);
    if (storeObject) {
        if (storeObject.custom.pageKeywords) {
            this.pageKeywords = storeObject.custom.pageKeywords;
        }

        if (storeObject.custom.pageTitle) {
            this.pageTitle = storeObject.custom.pageTitle;
        }

        if (storeObject.custom.pageDescription) {
            this.pageDescription = storeObject.custom.pageDescription;
        }

        if (storeObject.custom.pageURL) {
            this.pageURL = storeObject.custom.pageURL;
        }
    }
}

module.exports = store;
