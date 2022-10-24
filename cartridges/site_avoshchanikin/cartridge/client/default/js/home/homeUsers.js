'use strict';

console.log('Hello from homeusers');

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
            console.log('response.page ' + response.page);
            if (response.total_pages <= response.page) {
                response.data.forEach(user => {
                    $('#users').append(userTile(user));
                });
                console.log(response);
                currentPage = $('#users').attr('data-page-number', nextPage);
                $('#show_more').toggle();
            }
        },
        error: function (status, error) {
            console.log(status);
            console.log(error);
        }
    });
});
