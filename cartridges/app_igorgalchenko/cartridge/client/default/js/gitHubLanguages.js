'use strict';

var createErrorNotification = require('base/components/errorNotification');

var $form = $('#languages');
var $showMoreButton = $('.show-more');
var $results = $('.results');
var $inputGiHubPage = $('input#giHubPage');

/**
 * Remove results, hide buttom 'show more', reset pagination
 */
function resetResults() {
    $results.html('');
    $showMoreButton.hide();
    $inputGiHubPage.val(0);
}

/**
 * Load Repositories by language using pagination
 * @param {string} callbackAction - action name for embedding data to page: 'replace' or 'append'(by default)
 * @param {boolean} resetPagination - whether reset pagination to 0 or not
 */
function ajaxLoadRepositories(callbackAction, resetPagination) {
    var language = $("input[name='languageRadio']:checked").val();
    var pageNumber = resetPagination ? 0 : Number($inputGiHubPage.val());

    $results.spinner().start();

    $.ajax({
        url: $form.attr('action'),
        type: 'get',
        dataType: 'json',
        data: {
            language: language,
            pageNumber: pageNumber
        },
        success: function (data) {
            if (data.success) {
                var template = data.template;

                switch (callbackAction) {
                    case 'replace':
                        $results.html(template);
                        break;
                    default:
                        $results.append(template);
                        break;
                }

                if (template.trim().length !== 0) {
                    $showMoreButton.show();
                } else {
                    $showMoreButton.hide();
                }

                $inputGiHubPage.val(data.pageNumber);
            } else {
                resetResults();
                if (data.msg) {
                    createErrorNotification($results, data.msg);
                }
            }

            $results.spinner().stop();
        },
        error: function (err) {
            var response = err.responseText ? JSON.parse(err.responseText) : {};

            resetResults();
            if (response.message) {
                createErrorNotification($results, response.message);
            }

            $results.spinner().stop();
        }
    });
}

$(document).ready(function () {
    $form.change(function () {
        ajaxLoadRepositories('replace', true);
        return false;
    });

    $showMoreButton.click(function () {
        ajaxLoadRepositories();
        return false;
    });
});
