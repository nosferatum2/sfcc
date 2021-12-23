'use strict';

/**
 * Display the returned message.
 * @param {string} data - data returned from the server's ajax call
 * @param {Object} button - button that was clicked for newsletter
 */
function displayMessage(data, button) {
    $.spinner().stop();
    var status;
    if (data.success) {
        status = 'alert-success';
    } else {
        status = 'alert-danger';
    }

    if ($('.newsletter-subscribe-message').length === 0) {
        $('.newsletter').append(
            '<div class="newsletter-subscribe-message"></div>'
        );
    }
    $('.newsletter-subscribe-message')
        .append('<div class="newsletter-subscribe-alert text-center ' + status + '" role="alert">' + data.msg + '</div>');

    setTimeout(function () {
        $('.newsletter-subscribe-message').remove();
        button.removeAttr('disabled');
    }, 3000);
}

module.exports = {
    subscribeNewsletter: function () {
        $('form.newsletter').submit(function (e) {
            e.preventDefault();
            var form = $(this);
            var button = $('.subscribe-newsletter');
            var url = form.attr('action');

            $.spinner().start();
            button.attr('disabled', true);
            $.ajax({
                url: url,
                type: 'post',
                dataType: 'json',
                data: form.serialize(),
                success: function (data) {
                    displayMessage(data, button);
                    if (data.success) {
                        $('.newsletter').trigger('reset');

                        if (data.redirectUrl) {
                            window.location.href = data.redirectUrl;
                        }
                    }
                },
                error: function (err) {
                    displayMessage(err.responseJSON, button);
                }
            });
        });
    }
};
