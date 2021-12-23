/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./cartridges/site_staszhalba/cartridge/client/default/js/newsletter.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./cartridges/app_storefront_base/cartridge/client/default/js/util.js":
/*!****************************************************************************!*\
  !*** ./cartridges/app_storefront_base/cartridge/client/default/js/util.js ***!
  \****************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

module.exports = function (include) {
  if (typeof include === 'function') {
    include();
  } else if (_typeof(include) === 'object') {
    Object.keys(include).forEach(function (key) {
      if (typeof include[key] === 'function') {
        include[key]();
      }
    });
  }
};

/***/ }),

/***/ "./cartridges/site_staszhalba/cartridge/client/default/js/newsletter.js":
/*!******************************************************************************!*\
  !*** ./cartridges/site_staszhalba/cartridge/client/default/js/newsletter.js ***!
  \******************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var processInclude = __webpack_require__(/*! base/util */ "./cartridges/app_storefront_base/cartridge/client/default/js/util.js");

$(document).ready(function () {
  processInclude(__webpack_require__(/*! ./newsletter/newsletter-form */ "./cartridges/site_staszhalba/cartridge/client/default/js/newsletter/newsletter-form.js"));
});

/***/ }),

/***/ "./cartridges/site_staszhalba/cartridge/client/default/js/newsletter/newsletter-form.js":
/*!**********************************************************************************************!*\
  !*** ./cartridges/site_staszhalba/cartridge/client/default/js/newsletter/newsletter-form.js ***!
  \**********************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Display the returned message.
 * @param {string} data - data returned from the server's ajax call
 * @param {Object} button - button that was clicked for newsletter
 */

function displayMessage(data, button) {
  $.spinner().stop();
  var status;

  if (data.success) {
    status = 'alert-success';
  } else {
    status = 'alert-danger';
  }

  if ($('.newsletter-subscribe-message').length === 0) {
    $('.newsletter').append('<div class="newsletter-subscribe-message"></div>');
  }

  $('.newsletter-subscribe-message').append('<div class="newsletter-subscribe-alert text-center ' + status + '" role="alert">' + data.msg + '</div>');
  setTimeout(function () {
    $('.newsletter-subscribe-message').remove();
    button.removeAttr('disabled');
  }, 3000);
}

module.exports = {
  subscribeNewsletter: function subscribeNewsletter() {
    $('form.newsletter').submit(function (e) {
      e.preventDefault();
      var form = $(this);
      var button = $('.subscribe-newsletter');
      var url = form.attr('action');
      $.spinner().start();
      button.attr('disabled', true);
      $.ajax({
        url: url,
        type: 'post',
        dataType: 'json',
        data: form.serialize(),
        success: function success(data) {
          displayMessage(data, button);

          if (data.success) {
            $('.newsletter').trigger('reset');

            if (data.redirectUrl) {
              window.location.href = data.redirectUrl;
            }
          }
        },
        error: function error(err) {
          displayMessage(err.responseJSON, button);
        }
      });
    });
  }
};

/***/ })

/******/ });
//# sourceMappingURL=newsletter.js.map