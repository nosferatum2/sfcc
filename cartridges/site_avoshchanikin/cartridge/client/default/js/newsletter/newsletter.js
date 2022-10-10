'use strict';

var formValidation = require('base/components/formValidation');

module.exports = {
    subscribe: function () {
        $('form.newsletter-form').submit(function (e) {
            e.preventDefault();
            var form = $(this);
            var url = form.attr('action');
            form.spinner().start();
            $('form.newsletter-form').trigger('newsletter-form:submit', e);
            $.ajax({
                url: url,
                type: 'post',
                dataType: 'json',
                data: form.serialize(),
                success: function (data) {
                    form.spinner().stop();
                    if (!data.success) {
                        formValidation(form, data);
                        $('form.newsletter-form').trigger('newsletter-form:error', data);
                    } else {
                        $('form.newsletter-form').trigger('newsletter-form:success', data);
                        window.location.href = data.redirectUrl;
                    }
                },
                error: function (data) {
                    if (data.responseJSON.redirectUrl) {
                        window.location.href = data.responseJSON.redirectUrl;
                    } else {
                        $('form.newsletter-form').trigger('newsletter-form:error', data);
                        form.spinner().stop();
                    }
                }
            });
            return false;
        });
    }
};
