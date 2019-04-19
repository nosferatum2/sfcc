/**
* @function Return a clickable link given a repo url which can be in different styles
*
* @param {string} urlString - The source url string to process (e.g. git@bitbucket.org:lyonsconsultinggroup/blu-dot-m2.git)
* @return {string} If no changes, will be the urlString param value. Otherwise, will contain modified url
* 
*/
exports.fixRepoUrl = function fixRepoUrl(urlString) {
  var result = urlString;
  
  // Try to extract valid url from url string
  var pos = urlString.indexOf('http');
  if (pos >= 0) {
    // Contains 'http' but may not be at the beginning - strip off leading chars
    result = urlString.substr(pos);
  } else {
      // Handle cases like git+ssh://git@github.com/lipis/flag-icon-css.git
      pos = urlString.indexOf('@');
      if (pos >= 0) {
        result = urlString.substr(pos + 1);
        result = 'https://' + result.replace(':', '/');
      } else {
          // Handle if it contains // but not http
          pos = urlString.indexOf('//');
          if (pos >= 0) {
            result = 'https:' + urlString.substr(pos);
          } else {
            // Check for a bitbucket: link
            if (urlString.search(/^bitbucket:/) >= 0) {
              result = urlString.replace('bitbucket:', 'https://bitbucket.org/')
            }
          }
      }
  }
  return result;
}
