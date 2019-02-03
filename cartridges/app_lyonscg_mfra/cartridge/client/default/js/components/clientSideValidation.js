'use strict';

var baseClientSideValidation = require('base/components/clientSideValidation');

module.exports = $.extend(baseClientSideValidation, {
    /**
     * Clears the validation errors of an invalidated form element after a change occurs
     */
    clearErrorsOnChange: function () {
        $(':input, .form-control').on('change input', function () {
            if ($(this).hasClass('is-invalid')) {
                $(this).removeClass('is-invalid');
                $(this).closest('.invalid-feedback').remove();
            }
        });
    }
});
