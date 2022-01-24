'use strict';

module.exports = {
    searchRepositories: function () {
        $('#github-repositories').on('submit', function (event) {
            event.preventDefault();
            var jqueryForm = $(this);
            var actionUrl = jqueryForm.attr('action');

            // console.log(actionUrl + '?' + jqueryForm.serialize());

            $.spinner().start();
            $.ajax({
                url: actionUrl + '?' + jqueryForm.serialize() + '&page=1&perPage=10',
                type: 'get',
                dataType: 'html',
                success: function (response) {
                    $('.repository-grid').empty().html(response);
                    $.spinner().stop();
                }
            });
        });
    },

    showMore: function () {
        $('.container').on('click', '.show-more button', function (e) {
            e.stopPropagation();
            var showMoreUrl = $(this).data('url');

            e.preventDefault();

            $.spinner().start();
            $.ajax({
                url: showMoreUrl,
                type: 'get',
                dataType: 'html',
                success: function (response) {
                    $('.grid-footer').replaceWith(response);
                    $.spinner().stop();
                }
            });
        });
    }
};
