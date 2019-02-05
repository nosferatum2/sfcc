/**
 * @function Error handler for all messages
 * @param {string} severity - If 'error', will throw an error. Should be one of the values in winston's config.npm.levels list (which are also node default levels)
 * @param {string} message - Error message text
 * @param {function} logger - Logging function. Defaults to console but winston node module also supported if .warn function is defined
 * @throws {object} e - If severity is 'FATAL', error is thrown
 *
 */
exports.errorHandler = function errorHandler(severity, message, logger = console) {
  var useConsole = (typeof logger.warn == 'undefined');
  
  switch (severity) {
    case 'warn'    : 
    case 'info'    :
    case 'verbose' :
    case 'debug'   :
    case 'silly'   : useConsole ? console.log(severity + ': ' + message) : logger.log(severity, message);
                     break;
    case 'error'   : var errorObj = new Error(message).stack;
                     useConsole ? console.log(severity + ': ' + errorObj) : logger.error(errorObj);
                     throw errorObj;
                     break;
    default        : useConsole ? console.log('Unrecognized severity ('+ severity + '): ' + message) : logger.warn('Unrecognized severity ('+ severity + '): ' + message); 
                     break;
  } 
}
