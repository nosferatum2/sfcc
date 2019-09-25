'use strict';

var formValidation = require('base/components/formValidation');
var baseProfile = require('base/profile/profile');

module.exports = $.extend(baseProfile, {
    submitProfile: function () {
        $('form.edit-profile-form').submit(function (e) {
            var $form = $(this);
            e.preventDefault();
            var url = $form.attr('action');
            $form.spinner().start();
            $('form.edit-profile-form').trigger('profile:edit', e);
            $.ajax({
                url: url,
                type: 'post',
                dataType: 'json',
                data: $form.serialize(),
                success: function (data) {
                    $form.spinner().stop();
                    if (!data.success) {
                        formValidation($form, data);
                    } else {
                        location.href = data.redirectUrl;
                    }
                },
                error: function (err) {
                    if (err.responseJSON.redirectUrl) {
                        window.location.href = err.responseJSON.redirectUrl;
                    }
                    $form.spinner().stop();
                }
            });
            return false;
        });

        $('#confirmEmail').val($('#email').val());

        $('#email').change(function () {
            $('#confirmEmail').attr('type', 'email');
            $('#confirmEmail').val('');
            $('.form-control-label[for="confirmEmail"]').removeClass('d-none');
        });
    }
});

