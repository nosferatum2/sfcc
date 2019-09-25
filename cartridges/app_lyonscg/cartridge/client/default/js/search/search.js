'use strict';

var base = require('base/search/search');

/**
 * Update DOM elements with Ajax results
 *
 * @param {Object} $results - jQuery DOM element
 * @param {string} selector - DOM element to look up in the $results
 * @return {undefined}
 */
function updateDom($results, selector) {
    var $updates = $results.find(selector);
    $(selector).empty().html($updates.html());
}

/**
 * Keep refinement panes expanded/collapsed after Ajax refresh
 *
 * @param {Object} $results - jQuery DOM element
 * @return {undefined}
 */
function handleRefinements($results) {
    $('.refinement.active').each(function () {
        $(this).removeClass('active');
        var activeDiv = $results.find('.' + $(this)[0].className.replace(/ /g, '.'));
        activeDiv.addClass('active');
        activeDiv.find('button.title').attr('aria-expanded', 'true');
    });

    updateDom($results, '.refinements');
}

/**
 * Parse Ajax results and updated select DOM elements
 *
 * @param {string} response - Ajax response HTML code
 * @return {undefined}
 */
function parseResults(response) {
    var $results = $(response);
    var specialHandlers = {
        '.refinements': handleRefinements
    };

    // Update DOM elements that do not require special handling
    [
        '.search-banner:first-of-type',
        '.grid-header',
        '.header-bar',
        '.header.page-title',
        '.product-grid',
        '.show-more',
        '.filter-bar'
    ].forEach(function (selector) {
        updateDom($results, selector);
    });

    Object.keys(specialHandlers).forEach(function (selector) {
        specialHandlers[selector]($results);
    });
}

module.exports = $.extend(base, {
    applyFilter: function () {
        // Handle refinement value selection and reset click
        $('.container').on(
            'click',
            '.refinements li button, .refinement-bar button.reset, .filter-value button, .swatch-filter button',
            function (e) {
                e.preventDefault();
                e.stopPropagation();

                $.spinner().start();
                $(this).trigger('search:filter', e);
                $.ajax({
                    url: $(this).data('href'),
                    data: {
                        page: $('.grid-footer').data('page-number'),
                        selectedUrl: $(this).data('href')
                    },
                    method: 'GET',
                    success: function (response) {
                        parseResults(response);
                        $.spinner().stop();
                    },
                    error: function () {
                        $.spinner().stop();
                    }
                });
            });
    },
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
