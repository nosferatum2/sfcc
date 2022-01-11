'use strict';

var formValidation = require('base/components/formValidation');
var emailSignupT = null;

/**
 * Display message
 * @param {string} data - data returned from the server's ajax call
 * @param {Object} button - button that was clicked for email sign-up
 */
function displayMessage(data, button) {
    var status;
    if (data.success) {
        status = 'alert-success';
    } else {
        status = 'alert-danger';
    }

    if ($('.email-signup-message').length === 0) {
        $('body').append(
           '<div class="email-signup-message"></div>'
        );
    }
    $('.email-signup-message')
        .append('<div class="email-signup-alert text-center ' + status + '">' + data.msg + '</div>');

    clearTimeout(emailSignupT);

    emailSignupT = setTimeout(function () {
        $('.email-signup-message').remove();
        button.removeAttr('disabled');
    }, 5000);
}

$('form.newsletter-form-ajax').submit(function (e) {
    e.preventDefault();

    var $form = $(this);
    var url = $form.attr('action');
    var $submitBtn = $form.find('.newsletter-submit-btn');

    $form.spinner().start();
    $submitBtn.attr('disabled', true);

    $.ajax({
        url: url,
        type: 'post',
        dataType: 'json',
        data: $form.serialize(),
        success: function (data) {
            $form.spinner().stop();
            if (!data.success) {
                formValidation($form, data);
            }

            displayMessage(data, $submitBtn);
        },
        error: function (err) {
            $form.spinner().stop();
            if (err.responseJSON) {
                if (err.responseJSON.message) {
                    displayMessage({ success: false, msg: err.responseJSON.message }, $submitBtn);
                }
            }
            $form.spinner().stop();
        }
    });
    return false;
});

