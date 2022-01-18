'use strict';

module.exports = function (object, productSearch) {
    Object.defineProperty(object.category, 'slotTileOrder', {
        enumerable: true,
        value: productSearch.category.custom.staszhalbaSlotTileOrder
    });
};
