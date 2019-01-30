/**
 * @function Return name of caller
 * 
 * @return {string} Name of the function which called this function
 * 
 */
exports.getFunctionName = function getFunctionName() {
  return getFunctionName.caller.name
}
