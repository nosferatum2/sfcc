'use strict';

module.exports = function () {
    const result = {};
    Array.prototype.forEach.call(arguments, function (argument) {
        if (typeof argument === 'object') {
            Object.keys(argument).forEach(function (key) {
                result[key] = argument[key];
            });
        }
    });
    return result;
};
