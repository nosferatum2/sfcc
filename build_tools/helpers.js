'use strict';

/**
 * @name isBuildEnvironment
 * @description checks whether the build environment flag exists 
 * and is either equal to true or the passed value
 * @param {String} key
 * @param {String} value - optional
 * @returns {Boolean}
 */
function isBuildEnvironment(key, value) {
    return (value) ? (process.env.hasOwnProperty(key) && process.env[key] === value) : 
                     (process.env.hasOwnProperty(key) && process.env[key] === 'true')
}


module.exports = {
    isBuildEnvironment  
};

