'use strict';

/**
 * Reusable slick carousel configurations
 * @example - $('.product-carousel').slick(slickConfigs.pdp)
 */

module.exports = {
    hero: {
        autoplay: true,
        autoplaySpeed: 5000,
        easing: 'swing',
        infinite: true,
        speed: 800,
        dots: true,
        arrows: true,
        slidesToShow: 1,
        slidesToScroll: 1
    },

    productTiles: {
        infinite: true,
        speed: 300,
        dots: false,
        arrows: true,
        slidesToShow: 4,
        slidesToScroll: 1,
        responsive: [
            {
                breakpoint: 991,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1
                }
            }
        ]
    },

    pdp: {
        infinite: true,
        speed: 400,
        dots: false,
        arrows: true,
        slidesToShow: 1,
        slidesToScroll: 1
    }
};
