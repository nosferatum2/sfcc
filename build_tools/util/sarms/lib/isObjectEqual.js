/**
 * @function Compare two objects to see if they are equal
 *
 * @param {object} value - first object to compare
 * @param {object} other - second object to compare
 * @param {array} filters - attributes of objects to ignore
 * @param {integer} precision - the number of digits to the right of the decimal point to use when comparing floating point numbers. NOTE: Values may be rounded causing false differences so choose the least amount of precision needed.
 * @returns {boolean} Either true if objects are equal or false if not
 *
 */
exports.isObjectEqual = function isObjectEqual (value, other, filters = [], precision = 4) {
  // Get the value type
  var type = Object.prototype.toString.call(value);

  // If the two objects are not the same type, return false
  if (type !== Object.prototype.toString.call(other)) {
    return false;
  }
   
  // If items are not an object or array, return false
  if (['[object Array]', '[object Object]'].indexOf(type) < 0) {
    return false;
  }
  
  // Compare the length of the two items if the value is not null
  if ((value != null) && (other != null)) {
    var valueLen = (type === '[object Array]') ? value.length : Object.keys(value).length;
    var otherLen = (type === '[object Array]') ? other.length : Object.keys(other).length;
    if (valueLen !== otherLen) {
      return false;
    }
  }
  
  // Compare two items
  var compare = function (item1, item2, filters, precision) {
    // Get the object type
    var itemType = Object.prototype.toString.call(item1);
     
    // If an object or array, compare recursively
    if (['[object Array]', '[object Object]'].indexOf(itemType) >= 0) {
      if (!isObjectEqual(item1, item2, filters, precision)) {
        return false;
      }
    }
    // Otherwise, do a simple comparison
    else {
      // If the two items are not the same type, return false
      if (itemType !== Object.prototype.toString.call(item2)) return false;
      // Else if it's a function, convert to a string and compare
      // Otherwise, just compare
      if (itemType === '[object Function]') {
        if (item1.toString() !== item2.toString()) {
          return false;
        }
      } else if ((itemType === 'number') || (itemType === '[object Number]')) {
          // If both are Number type (which includes floats), compare using the precision param to avoid false
          // positives when the difference between them is very small (e.g. .000000000001)
          if (item1.toFixed(precision) != item2.toFixed(precision)) {
            return false;
          }
        } else {
          if (item1 !== item2) return false;
        }
    }
  };
   
  // Compare properties
  if (type === '[object Array]') {
    for (var i = 0; i < valueLen; i++) {
      if (compare(value[i], other[i], filters, precision) === false) {
        return false;
      }
    }
  } else {
    for (var key in value) {
      if (filters.indexOf(key) > -1) {
        continue;
      }
      if (value.hasOwnProperty(key)) {
        if (compare(value[key], other[key], filters, precision) === false) {
          return false;
        }
      }
    }
  }
  // If nothing failed, return true
  return true;
}
