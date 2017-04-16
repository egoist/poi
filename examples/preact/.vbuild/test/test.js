module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
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
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
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
/******/ 	__webpack_require__.p = "/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

eval("module.exports = require(\"preact\");//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJwcmVhY3RcIj9mOTVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBIiwiZmlsZSI6IjAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJwcmVhY3RcIik7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gZXh0ZXJuYWwgXCJwcmVhY3RcIlxuLy8gbW9kdWxlIGlkID0gMFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiXSwic291cmNlUm9vdCI6IiJ9");

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar _preact = __webpack_require__(0);\n\nvar root = void 0;\nfunction init() {\n\tvar App = __webpack_require__(2).default;\n\troot = (0, _preact.render)((0, _preact.h)(App, null), document.body, root);\n}\n\n// in development, set up HMR:\nif (false) {\n\t//require('preact/devtools')   // turn this on if you want to enable React DevTools!\n\tmodule.hot.accept('./components/App', function () {\n\t\treturn requestAnimationFrame(init);\n\t});\n}\n\ninit();//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvaW5kZXguanM/OTU1MiJdLCJuYW1lcyI6WyJyb290IiwiaW5pdCIsIkFwcCIsInJlcXVpcmUiLCJkZWZhdWx0IiwiZG9jdW1lbnQiLCJib2R5IiwibW9kdWxlIiwiaG90IiwiYWNjZXB0IiwicmVxdWVzdEFuaW1hdGlvbkZyYW1lIl0sIm1hcHBpbmdzIjoiOzs7O0FBRUEsSUFBSUEsYUFBSjtBQUNBLFNBQVNDLElBQVQsR0FBZ0I7QUFDZixLQUFNQyxNQUFNLG1CQUFBQyxDQUFRLENBQVIsRUFBNEJDLE9BQXhDO0FBQ0FKLFFBQU8sb0JBQU8sZUFBQyxHQUFELE9BQVAsRUFBZ0JLLFNBQVNDLElBQXpCLEVBQStCTixJQUEvQixDQUFQO0FBQ0E7O0FBRUQ7QUFDQSxJQUFJLEtBQUosRUFBZ0I7QUFDZjtBQUNBTyxRQUFPQyxHQUFQLENBQVdDLE1BQVgsQ0FBa0Isa0JBQWxCLEVBQXNDO0FBQUEsU0FBTUMsc0JBQXNCVCxJQUF0QixDQUFOO0FBQUEsRUFBdEM7QUFDQTs7QUFFREEiLCJmaWxlIjoiMS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHJlbmRlciB9IGZyb20gJ3ByZWFjdCdcblxubGV0IHJvb3RcbmZ1bmN0aW9uIGluaXQoKSB7XG5cdGNvbnN0IEFwcCA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9BcHAnKS5kZWZhdWx0XG5cdHJvb3QgPSByZW5kZXIoPEFwcCAvPiwgZG9jdW1lbnQuYm9keSwgcm9vdClcbn1cblxuLy8gaW4gZGV2ZWxvcG1lbnQsIHNldCB1cCBITVI6XG5pZiAobW9kdWxlLmhvdCkge1xuXHQvL3JlcXVpcmUoJ3ByZWFjdC9kZXZ0b29scycpICAgLy8gdHVybiB0aGlzIG9uIGlmIHlvdSB3YW50IHRvIGVuYWJsZSBSZWFjdCBEZXZUb29scyFcblx0bW9kdWxlLmhvdC5hY2NlcHQoJy4vY29tcG9uZW50cy9BcHAnLCAoKSA9PiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoaW5pdCkgKVxufVxuXG5pbml0KClcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VSb290IjoiIn0=");

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\n\nvar _preact = __webpack_require__(0);\n\nexports.default = function () {\n  return (0, _preact.h)(\n    \"h1\",\n    null,\n    \"Hello Preact!!!!!\"\n  );\n};//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvY29tcG9uZW50cy9BcHAuanM/NjAyNiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztrQkFBZTtBQUFBLFNBQ2I7QUFBQTtBQUFBO0FBQUE7QUFBQSxHQURhO0FBQUEsQyIsImZpbGUiOiIyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgKCkgPT4gKFxuICA8aDE+SGVsbG8gUHJlYWN0ISEhISE8L2gxPlxuKVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2NvbXBvbmVudHMvQXBwLmpzIl0sInNvdXJjZVJvb3QiOiIifQ==");

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(1);


/***/ })
/******/ ]);