'use strict';

// eslint-disable-next-line valid-jsdoc
/**
 * Inputs data for rendering at the later time
 * @param {Object} data - Data to be passed to the string
 * @returns {string}
 */
function userTile(data) {
    var string = `<div class="user col-3 border m-1">
                        <div class="users-avatar">
                            <img src="${data.avatar}" alt="${data.id}" />
                        </div>
                        <div class="first-name">
                            ${data.first_name}
                        </div>
                        <div class="last-name">
                            ${data.last_name}
                        </div>
                        <div class="email border-top">
                            ${data.email}"
                        </div>
                    </div>`;
    return string;
}

$('#show_more').click(function (e) {
    e.preventDefault();

    var showMoreURL = $('#users').attr('data-users-get-url');
    var currentPage = Number($('#users').attr('data-page-number'));
    var nextPage = currentPage + 1;
    $.ajax({
        url: showMoreURL + nextPage,
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            if (response.total_pages <= response.page) {
                $('#show_more').toggle().prop('disabled', true);
            }

            response.data.forEach(user => {
                $('#users').append(userTile(user));
            });
            currentPage = $('#users').attr('data-page-number', nextPage);
        },
        error: function (error) {
            window.location.href = error.responseJSON.message;
        }
    });
});
