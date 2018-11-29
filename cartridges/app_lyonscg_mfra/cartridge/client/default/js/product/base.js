'use strict';

var base = require('base/product/base');
var slickConfigs = require('../config/slickConfigs');

/**
 * Disable PDP Zoom
 */
function disableZoom() {
    $('.slide-link').trigger('zoom.destroy');
}

/**
 * Init PDP Zoom
 */
function initZoom() {
    disableZoom();

    var zoomMediaQuery = matchMedia('(min-width: 960px)');
    var $image = $('.slick-active .slide-link.zoom-hires');
    var url = $image.attr('href');

    if ($image.length > 0 && url && url !== 'null' && zoomMediaQuery.matches) {
        $image.zoom({
            url: url
        });
    }
}

/**
 * Init the product carousel using a predefined slick configuration
 */
function carouselInit() {
    var $carousel = $('.product-carousel');

    if ($carousel.length) {
        $carousel.on('afterChange', initZoom);
        $carousel.not('.slick-initialized').slick(slickConfigs.pdp);
    }
}

/**
 * Deconstruct (unslick) the carousel, removing classes and handlers added on slick initialize.
 */
function carouselUnslick() {
    var $carousel = $('.product-carousel');

    if ($carousel.length && $carousel.hasClass('slick-initialized')) {
        $carousel.off('afterChange', initZoom);
        $carousel.slick('unslick');
    }
}

/**
 * @param  {json} product - Product json
 */
function updateMainImages(product) {
    var images = product.images;
    var imagesZoom = product.imagesZoom['hi-res'];
    var htmlString = '<!-- Product Image slides -->';

    images.large.forEach(function (image, idx) {
        var zoomImage = imagesZoom[idx] ? imagesZoom[idx] : image;
        var zoomClass = imagesZoom[idx] ? 'zoom-hires' : 'zoom-disabled';

        var htmlSlide = '<div class="slide">'
            + '<a href="' + zoomImage.url + '" class="slide-link ' + zoomClass + '" title="' + zoomImage.title + '">'
                + '<img src="' + image.url + '" class="slide-img" alt="' + image.alt + '" />'
            + '</a>'
        + '</div>';

        htmlString += htmlSlide;
    });

    $('.product-carousel').html(htmlString);
}

var exportBase = $.extend({}, base, {
    carouselInit: carouselInit,
    carouselUnslick: carouselUnslick,
    zoomInit: initZoom,
    updateMainImages: updateMainImages
});

module.exports = exportBase;
