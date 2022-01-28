'use_strict';

/**
 * Display error
 * @param {string} errorMessage - errro message
 */
function displayError(errorMessage) {
    $('.cart-error-messaging').append(`
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
            ${errorMessage}
        </div>
    `);
}

module.exports = {
    addCustomerToProgram: function () {
        $('.container').on('submit', '.add-to-program-form', function (event) {
            event.preventDefault();

            var form = $(this);
            var addToProgramUrl = form.attr('action');

            $.spinner().start();
            $.ajax({
                url: addToProgramUrl,
                type: 'post',
                dataType: 'json',
                data: form.serialize(),
                success: function (response) {
                    if (response.errorMessage) {
                        displayError(response.errorMessage);
                    } else if (response.redirectUrl) {
                        location.href = response.redirectUrl;
                    }

                    $.spinner().stop();
                },
                error: function (err) {
                    if (err.responseJSON.errorMessage) {
                        displayError(err.responseJSON.errorMessage);
                    }
                }
            });
        });
    }
};
