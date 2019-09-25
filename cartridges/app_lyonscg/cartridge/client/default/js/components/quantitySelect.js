'use strict';

/*
    Not globally loaded with processInclude().
    Please call the initQuantitySelector function from this module as needed.

    This module sets up the Quantity Selector plus/minus widget to mirror existing quantity <select> elements, allowing change events
    bound to those existing elements to remain in tact.  Any change on those elements triggers this widget to update. However,
    note that any direct .val() updates on those elements will NOT trigger a change event and therefore won't automatically update
    this widget.  For this reason, please manually trigger the updateTextField function in this module anytime a select's .val()
    is manually changed.  See cart.js for an exmple of this.

    DOM dependencies: <select class="quantity-select"> field must be wrapped inside <div class="quantity-module"> along with
    the inputGroup from <isquantityselector>.
*/

var quantityModuleClass = '.quantity-module';
var quantitySelectClass = '.quantity-select';
var quantityInputClass = '.quantity-input';
var quantityPlusClass = '.quantity-increase';
var quantityMinusClass = '.quantity-decrease';

var qtySelector = {

    /**
     * Initialize the Quantity Selector widget and Query event handlers.
     */
    initQuantitySelector: function () {
        var qtySelectorInputHandler = function (e) {
            var $qty = $(this).parents(quantityModuleClass);
            var $select = $qty.find(quantitySelectClass);
            var $input = $qty.find(quantityInputClass);
            var $plus = $qty.find(quantityPlusClass);
            var $minus = $qty.find(quantityMinusClass);
            var quantities = qtySelector.getQtyArray($select);
            var currentIndex = quantities.indexOf($select.val());
            var newVal = null;
            var newIndex;

            // if the input field triggered the event but its value didn't change, EXIT
            if ($(this).is($input) && $input.data('previous-value').toString() === $input.val()) {
                return;
            }

            if ($(this).is($minus)) {
                // minus was clicked
                newIndex = currentIndex - 1;
                newVal = quantities[newIndex];
            } else if ($(this).is($plus)) {
                // plus was clicked
                newIndex = currentIndex + 1;
                newVal = quantities[newIndex];
            } else {
                // was updated via the input text field
                newVal = $(this).val();
                newIndex = quantities.indexOf(newVal);
            }
            if (typeof newVal === 'undefined') {
                return;
            }

            // attempt to change the <select> value
            $select.trigger({
                type: 'change',
                newVal: newVal
            });

            // if it did not work, reset input field to previous value and EXIT
            if ($select.val().toString() !== newVal.toString()) {
                e.preventDefault();
                $input.val($input.data('previous-value'));
                return;
            }

            // if it did work, update input field
            qtySelector.updateTextField($select);
        };

        var selectChangeHandler = function (e) {
            var newVal = e.newVal || $(this).val();
            var quantities = qtySelector.getQtyArray($(this));

            // check if the value exists as an option, and if not, EXIT
            if (quantities.indexOf(newVal) < 0) {
                e.preventDefault();
                return false;
            }
            // set the <select> value
            if ($(this).val() !== newVal) {
                $(this).val(newVal);
            }

            // update the <input> value
            qtySelector.updateTextField($(this));

            return $(this);
        };

        // init jQuery event handlers
        var plusSelector = quantityModuleClass + ' ' + quantityPlusClass + ':not(.disabled):not([disabled])';
        var minusSelector = quantityModuleClass + ' ' + quantityMinusClass + ':not(.disabled):not([disabled])';
        var inputSelector = quantityModuleClass + ' ' + quantityInputClass + ':not(.disabled):not([disabled])';
        var selectboxSelector = quantityModuleClass + ' ' + quantitySelectClass + ':not(.disabled):not([disabled])';

        $('body').on('change click', plusSelector + ', ' + minusSelector + ', ' + inputSelector, qtySelectorInputHandler);
        $('body').on('change', selectboxSelector, selectChangeHandler);
    },

    /**
     * Get the values of the quantity <select> field's <option>s, in a JS array format
     * @param {Object} $select - a jQuery object representing the <select> element to retrieve option values from
     * @return {Object} - Retruns the <option> values as an array.
     */
    getQtyArray: function ($select) {
        var qtys = [];
        $select.find('option').each(function () {
            qtys.push($(this).val());
        });
        return qtys;
    },

    /**
     * Updates the displayed value in the widget's text input field.
     * @param {Object} $scope - a jQuery object representing either parent .quantity-module wrapper, or one of its children
     * @return {Object} - Retruns the same object param for jQuery function chaining, if needed.
     */
    updateTextField: function ($scope) {
        if ($scope) {
            var $qty = $scope.is(quantityModuleClass) ? $scope : $scope.parents(quantityModuleClass);
            var $select = $qty.find(quantitySelectClass);
            var $input = $qty.find(quantityInputClass);
            var $plus = $qty.find(quantityPlusClass);
            var $minus = $qty.find(quantityMinusClass);
            var quantities = qtySelector.getQtyArray($select);
            var currentIndex = quantities.indexOf($select.val());

            // disable plus/minus buttons if nec
            if (currentIndex === 0) {
                $minus.addClass('disabled').attr('disabled', 'disabled');
            } else {
                $minus.removeClass('disabled').removeAttr('disabled');
            }
            if (currentIndex === quantities.length - 1) {
                $plus.addClass('disabled').attr('disabled', 'disabled');
            } else {
                $plus.removeClass('disabled').removeAttr('disabled');
            }

            // update the displayed value
            $input.val($select.val());

            // reset previous-value tracker
            $input.data('previous-value', $input.val());
        }
        return $scope;
    }
};

module.exports = qtySelector;
