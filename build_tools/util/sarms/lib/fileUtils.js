
/**
 * @function Check that pathnames exist and are readable
 * 
 * @param {string} path - array of pathnames to check
 * @returns {boolean} true if all paths are readable. Otherwise returns exception raised for first found
 * 
 * Dependencies:
 * - 'fs' to be defined as npm fs module 
 *
 */
exports.checkFileExistence = function checkFileExistence(paths) {
  const fs = require('fs');
  var fd = 0;
  
  for (let path of paths) {
    try {
      fd = fs.openSync(path, "r");
    } catch (e) {
      return e;
    } 
    fs.closeSync(fd);
  }
  return(true);
}


/**
 * @function Reads a JSON object from the specified file
 * 
 * @param {String} filePath - Pathname to the file to read
 * @return {Object} JSON object or exception raised if one was raised by fs.readFileSync

 * 
 * Dependencies:
 * - 'fs' to be defined as npm fs module 
 * 
 */
exports.readJSONFromFile = function readJSONFromFile(filePath) {
  const fs = require('fs');
  
  try {
    var fileData = fs.readFileSync(filePath, "utf8");
  } catch (e) {
    return e;
  }
  return JSON.parse(fileData);
}


