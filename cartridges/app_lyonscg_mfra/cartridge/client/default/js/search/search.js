'use strict';

var base = require('base/search/search');

module.exports = $.extend(base, {
    colorAttribute: function () {
        $(document).on('click', '.color-swatches a:not(.swatch-ellipsis)', function (e) {
            e.preventDefault();

            var swatchImg = $(e.currentTarget).data('swatchimg');
            var swatchUrl = $(e.currentTarget).attr('href');
            var $productContainer = $(this).closest('.set-item'); // Need to check and see what classes a product set tile has if any?

            if (!$productContainer.length) {
                $productContainer = $(this).closest('.grid-tile');
            }

            var currentImg = $($productContainer).find('.tile-image').attr('src');

            if ($(this).attr('disabled') || currentImg === swatchImg) {
                return;
            }

            $($productContainer).find('.tile-image').attr('src', swatchImg);
            $($productContainer).find('.pdp-link a').attr('href', swatchUrl);
            $($productContainer).find('.image-container > a:not(.quickview)').attr('href', swatchUrl);
            $($productContainer).find('.swatch-ellipsis').attr('href', swatchUrl);
        });
    }
});
