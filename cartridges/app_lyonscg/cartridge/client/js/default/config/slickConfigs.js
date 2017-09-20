'use strict';

/**
 * Reusable slick carousel configurations
 * @example - $('.product-carousel').slick(slickConfigs.pdp)
 */

module.exports = {
    hero: {
        infinite: true,
        speed: 200,
        dots: true,
        arrows: true,
        slidesToShow: 1,
        slidesToScroll: 1
    },

    pdp: {
        infinite: true,
        speed: 300,
        dots: false,
        arrows: true,
        slidesToShow: 1,
        slidesToScroll: 1
    }
};
