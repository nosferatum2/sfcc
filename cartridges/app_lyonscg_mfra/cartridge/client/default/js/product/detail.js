'use strict';

var base = require('./base');
var detail = require('base/product/detail');

/**
 * Update Main Image section
 * @param {json} - Product json
 */
function updateMainImages(product) {
    var images = product.images;
    var imagesZoom = product.imagesZoom['hi-res'];
    var htmlString = `<!-- Product Image slides -->`;

    images.large.forEach(function (image, idx) {
        var zoomImage = imagesZoom[idx] ? imagesZoom[idx] : image;
        var zoomClass = imagesZoom[idx] ? 'zoom-enabled' : 'zoom-disabled';

        var htmlSlide = `<div class="slide">
            <a href="${zoomImage.url}" class="slide-link ${zoomClass}" title="${zoomImage.title}">
                <img src="${image.url}" class="slide-img" alt="${image.alt}" />
            </a>
        </div>`;

        htmlString += htmlSlide;
    });

    $('.product-carousel').html(htmlString);
}

var exportDetail = $.extend({}, detail, {
    updateAttribute: function () {
        base.carouselInit();
        base.zoomInit();

        $('body').on('product:beforeAttributeSelect', function () {
            // Unslick the existing images to prepare them for direct js manipulation
            base.carouselUnslick();
        });

        $('body').on('product:afterAttributeSelect', function (e, response) {
            if ($('.product-detail>.bundle-items').length) {
                response.container.data('pid', response.data.product.id);
                response.container.find('.product-id').text(response.data.product.id);
            } else if ($('.product-set-detail').eq(0)) {
                response.container.data('pid', response.data.product.id);
                response.container.find('.product-id').text(response.data.product.id);
            } else {
                $('.product-id').text(response.data.product.id);
                $('.product-detail:not(".bundle-item")').data('pid', response.data.product.id);
            }

            updateMainImages(response.data.product);

            // Init slick and zoom
            base.carouselInit();
            base.zoomInit();
        });
    }
});

module.exports = exportDetail;
