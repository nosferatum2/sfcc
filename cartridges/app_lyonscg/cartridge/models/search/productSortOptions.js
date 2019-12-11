'use strict';

var base = module.superModule;

/**
 * Retrieves refined or default category sort ID. Note: this function is not exported
 * by base so it is copied verbatim.
 *
 * @param {dw.catalog.ProductSearchModel} productSearch - Product search instance
 * @param {dw.catalog.Category} rootCategory - Catalog's root category
 * @return {string} - Sort rule ID or null if no default sorting rule specified
 */
function getSortRuleDefault(productSearch, rootCategory) {
    var category = productSearch.category ? productSearch.category : rootCategory;
    return category.defaultSortingRule ? category.defaultSortingRule.ID : null;
}

/**
 * Returns a sorting rule ID if the rule is included in sortingOptions
 *
 * @param {dw.util.List.<dw.catalog.SortingOption>} sortingOptions - Sorting rule options
 * @param {dw.catalog.ProductSearchModel} productSearch - Product search instance
 * @param {dw.catalog.Category} rootCategory - Catalog's root category
 * @returns {boolean} the sorting rule ID if the rule is included in sortingOptions or null
 */
function setRuleId(sortingOptions, productSearch, rootCategory) {
    // use search sortingOptions with Keyword Search default sorting rule if current search is a keyword search else use category default
    var ruleId = !productSearch.categorySearch ? productSearch.effectiveSortingRule.ID : getSortRuleDefault(productSearch, rootCategory);
    for (var i = 0; i < sortingOptions.length; i++) {
        if (sortingOptions[i].ID === ruleId) {
            return sortingOptions[i].ID;
        }
    }
    return null;
}

/**
 * @constructor
 * @classdesc Model that encapsulates product sort options
 *
 * @param {dw.catalog.ProductSearchModel} productSearch - Product search instance
 * @param {string|null} sortingRuleId - HTTP Param srule value
 * @param {dw.util.List.<dw.catalog.SortingOption>} sortingOptions - Sorting rule options
 * @param {dw.catalog.Category} rootCategory - Catalog's root category
 * @param {dw.web.PagingModel} pagingModel - The paging model for the current search context
 */
function ProductSortOptions(
    productSearch,
    sortingRuleId,
    sortingOptions,
    rootCategory,
    pagingModel
) {
    base.call(this, productSearch, sortingRuleId, sortingOptions, rootCategory, pagingModel);
    this.ruleId = sortingRuleId || setRuleId(sortingOptions, productSearch, rootCategory);
}

module.exports = ProductSortOptions;
