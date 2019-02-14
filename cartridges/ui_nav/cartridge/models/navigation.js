'use strict';

var ArrayList = require('dw/util/ArrayList');
var Category = require('dw/catalog/Category');
var Content = require('dw/content/Content');
var Folder = require('dw/content/Folder');
var URLUtils = require('dw/web/URLUtils');

/* Allow use of TopLevel empty() */
/* global empty */

/**
 * Model to handle the navigation data.
 * @module models/navigation
 * @returns {Object} navigation object
 */
function NavigationModel() {
    /**
     * The object representing the navigation data structure.
     * @type {ArrayList}
     */
    this.navigationObject = new ArrayList();

    this.buildColumnStructure();

    return this.navigationObject;
}

/**
 * Builds the top-level items and adds them to the menu navigation data
 * structure. Also adds the banner to the items, if configured.
 */
NavigationModel.prototype.buildTopItems = function () {
    var rootCategory = this.getRootCategory();
    var rootFolder = this.getRootFolder();

    if (!empty(rootCategory)) {
        this.navigationObject = this.getSubItems(rootCategory);
    }

    if (!empty(rootFolder)) {
        this.navigationObject = this.navigationObject.concat(this.getSubItems(rootFolder));
    }

    var navObj = this.navigationObject;
    Object.keys(navObj).forEach(function (i) {
        var topItem = navObj[i];
        topItem.banner = ('headerMenuBanner' in topItem.object.custom && !empty(topItem.object.custom.headerMenuBanner)) ? topItem.object.custom.headerMenuBanner : null;
    });
};

/**
 * Builds the lists of secondary and tertiary navigation items associated with
 * each top nav item and adds them to the navigation data structure.
 */
NavigationModel.prototype.buildItemLists = function () {
    this.buildTopItems();
    var listObject = this;
    var navObj = this.navigationObject;

    // build lists of secondary items
    Object.keys(navObj).forEach(function (i) {
        var topItem = navObj[i];
        topItem.items = listObject.getSubItems(topItem.object);

        // build lists of tertiary items
        Object.keys(topItem.items).forEach(function (j) {
        // for (var j in topItem.items) {
            var listItem = topItem.items[j];
            listItem.items = listObject.getSubItems(listItem.object);
            // length of tertiary items + secondary item for each list
            listItem.itemLength = listItem.items.length + 1;
        });

        // add "View All" as secondary item
        if ('showNavViewAll' in topItem.object.custom && topItem.object.custom.showNavViewAll) {
            topItem.items.push(listObject.buildViewAllItemObject(topItem.object));
        }
    });
};

/**
 * Builds the columns for the menu navigation based on the configuration in
 * BM, and adds to the navigation data structure.
 */
NavigationModel.prototype.buildColumnStructure = function () {
    var Site = require('dw/system/Site');
    var spacing = Site.getCurrent().getCustomPreferenceValue('secondaryCategorySpacing');
    var col;
    var colLength;
    var list;
    var maxLength;
    var topItem;
    var viewAllLength;

    /**
     * Initializes a new column as an ArrayList and prepares a list of
     * links to be inserted into it.
     */
    function prepareListForNewColumn() {
        // make the new column an ArrayList
        topItem.columns[col] = new ArrayList();
        // adjust target length to accommodate the "View All" link
        var targetLength = maxLength - viewAllLength;

        // the list of links is too big for the new column
        if (list.itemLength > targetLength) {
            // remove the last item in the list until we get to the desired length
            while (list.itemLength > targetLength) {
                list.items.removeAt(list.items.length - 1);
                list.itemLength--;
            }
        }
    }

    this.buildItemLists();

    var navObj = this.navigationObject;
    var listObject = this;

    Object.keys(navObj).forEach(function (i) { // building columns
        topItem = navObj[i];
        maxLength = ('navColumnLength' in topItem.object.custom && topItem.object.custom.navColumnLength > 1) ? topItem.object.custom.navColumnLength : 10;
        col = 0;
        colLength = 0;
        topItem.columns = new ArrayList();

        Object.keys(topItem.items).forEach(function (j) {
        // for (var j in topItem.items) {
            list = topItem.items[j];
            var showViewAll = 'showNavViewAll' in list.object.custom && list.object.custom.showNavViewAll;
            viewAllLength = (showViewAll) ? 1 : 0;

            if (colLength === 0) {
                // it's a new column
                prepareListForNewColumn();
            } else if ((colLength + spacing + list.itemLength + viewAllLength) > maxLength) {
                // it's too big for the current column, so we start a new one
                col++;
                colLength = 0;
                prepareListForNewColumn();
            }

            if (showViewAll && list.items) {
                list.items.push(listObject.buildViewAllItemObject(list.object));
                list.itemLength++;
            }

            topItem.columns[col].push(list);
            colLength += (colLength > 0) ? list.itemLength + spacing : list.itemLength;
        });
    });
};

/**
 * Returns ArrayList of sub navigation items for a given item.
 * @param {Object} obj navigation object
 * @return {Array} returns ArrayList of sub navigation items
 */
NavigationModel.prototype.getSubItems = function (obj) {
    if (empty(obj)) {
        return null;
    }

    var items = new ArrayList();
    var listObject = this;

    if (obj instanceof Category) {
        var onlineSubCategories = obj.getOnlineSubCategories();
        Object.keys(onlineSubCategories).forEach(function (i) {
            var subCat = onlineSubCategories[i];
            if ('showInMenu' in subCat.custom && subCat.custom.showInMenu && (subCat.hasOnlineProducts() || subCat.hasOnlineSubCategories())) {
                items.push(listObject.buildItemObject(subCat));
            }
        });
    } else if (obj instanceof Folder) {
        var onlineSubFolders = obj.getOnlineSubFolders();
        Object.keys(onlineSubFolders).forEach(function (j) {
            var subFolder = onlineSubFolders[j];
            if ('showInMenu' in subFolder.custom && subFolder.custom.showInMenu) {
                items.push(listObject.buildItemObject(subFolder));
            }
        });

        var onlineContent = obj.getOnlineContent();
        Object.keys(onlineContent).forEach(function (k) {
            var contentAsset = onlineContent[k];
            if ('showInMenu' in contentAsset.custom && contentAsset.custom.showInMenu) {
                items.push(listObject.buildItemObject(contentAsset));
            }
        });
    }

    return items;
};

/**
 * Returns an object that contains the base data for each item in the navigation list.
 * @param {Object} obj navigation list object
 * @return {Object} returns an object that contains the base data for each item in the navigation list
 */
NavigationModel.prototype.buildItemObject = function (obj) {
    var navListObj = {
        object: obj,
        name: this.getDisplayName(obj),
        url: this.getURL(obj)
    };

    return navListObj;
};

/**
 * Creates and returns an object that contains the data for the "View All" item in the navigation list
 * @param {Object} obj navigation object
 * @return {Object} returns and option that contains data for the "View All" item in the navigation list
 */
NavigationModel.prototype.buildViewAllItemObject = function (obj) {
    var Resource = require('dw/web/Resource');
    var viewAllObj = {
        object: obj,
        name: Resource.msg('navigation.viewall', 'navigation', null),
        url: this.getURL(obj)
    };

    return viewAllObj;
};

/**
 * Return the root category for the site catalog.
 * @return {Category} returns the root category for the site catalog
 */
NavigationModel.prototype.getRootCategory = function () {
    var CatalogMgr = require('dw/catalog/CatalogMgr');
    var catalog = CatalogMgr.getSiteCatalog();
    return !empty(catalog) ? catalog.getRoot() : null;
};

/**
 * Return the root folder for the site library.
 * @return {Folder} returns root folder for the site library
 */
NavigationModel.prototype.getRootFolder = function () {
    var ContentMgr = require('dw/content/ContentMgr');
    var library = ContentMgr.getSiteLibrary();
    return !empty(library) ? library.getRoot() : null;
};

/**
 * Returns URL for provided object otherwise empty string.
 * @param {Object} obj navigation object
 * @return {string} returns URL string for provided object otherwise empty string
 */
NavigationModel.prototype.getURL = function (obj) {
    var contentID;
    if (obj instanceof Category) {
        if (('alternativeUrl' in obj.custom) && !empty(obj.custom.alternativeUrl)) {
            return obj.custom.alternativeUrl;
        }
        return URLUtils.http('Search-Show', 'cgid', obj.getID());
    } else if (obj instanceof Folder) {
        if ('defaultContentAssetID' in obj.custom && !empty(obj.custom.defaultContentAssetID)) {
            contentID = obj.custom.defaultContentAssetID;
        } else {
            contentID = (obj.content.length > 0) ? obj.content[0].ID : null;
        }
        return !empty(contentID) ? URLUtils.url('Page-Show', 'cid', contentID) : '';
    } else if (obj instanceof Content) {
        return !empty(obj.ID) ? URLUtils.url('Page-Show', 'cid', obj.ID) : '';
    }

    return '';
};

/**
 * Returns display name for provided object otherwise empty string.
 * @param {Object} obj navigation object
 * @returns {string} returns display name for provided object otherwise empty string
 */
NavigationModel.prototype.getDisplayName = function (obj) {
    if (obj instanceof Category) {
        var cat = obj;
        return cat.getDisplayName();
    } else if (obj instanceof Folder) {
        var folder = obj;
        return folder.getDisplayName();
    } else if (obj instanceof Content) {
        var content = obj;
        return content.getName();
    }

    return '';
};

module.exports = NavigationModel;
