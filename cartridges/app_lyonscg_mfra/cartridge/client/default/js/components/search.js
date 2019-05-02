'use strict';

var search = require('base/components/search');

module.exports = function () {
    search();

    $('.site-search .fa-search').click(function () {
        if ($('input.search-field').val() !== '') {
            $('input.search-field').attr('value', $('input.search-field').val());
            $('form[name="simpleSearch"]').submit();
        }
    });
};
