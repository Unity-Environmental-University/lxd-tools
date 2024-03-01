/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/assert/build/assert.js":
/*!*********************************************!*\
  !*** ./node_modules/assert/build/assert.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/* provided dependency */ var process = __webpack_require__(/*! process/browser */ "./node_modules/process/browser.js");
// Currently in sync with Node.js lib/assert.js
// https://github.com/nodejs/node/commit/2a51ae424a513ec9a6aa3466baa0cc1d55dd4f3b

// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.



function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
var _require = __webpack_require__(/*! ./internal/errors */ "./node_modules/assert/build/internal/errors.js"),
  _require$codes = _require.codes,
  ERR_AMBIGUOUS_ARGUMENT = _require$codes.ERR_AMBIGUOUS_ARGUMENT,
  ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE,
  ERR_INVALID_ARG_VALUE = _require$codes.ERR_INVALID_ARG_VALUE,
  ERR_INVALID_RETURN_VALUE = _require$codes.ERR_INVALID_RETURN_VALUE,
  ERR_MISSING_ARGS = _require$codes.ERR_MISSING_ARGS;
var AssertionError = __webpack_require__(/*! ./internal/assert/assertion_error */ "./node_modules/assert/build/internal/assert/assertion_error.js");
var _require2 = __webpack_require__(/*! util/ */ "./node_modules/util/util.js"),
  inspect = _require2.inspect;
var _require$types = (__webpack_require__(/*! util/ */ "./node_modules/util/util.js").types),
  isPromise = _require$types.isPromise,
  isRegExp = _require$types.isRegExp;
var objectAssign = __webpack_require__(/*! object.assign/polyfill */ "./node_modules/object.assign/polyfill.js")();
var objectIs = __webpack_require__(/*! object-is/polyfill */ "./node_modules/object-is/polyfill.js")();
var RegExpPrototypeTest = __webpack_require__(/*! call-bind/callBound */ "./node_modules/call-bind/callBound.js")('RegExp.prototype.test');
var errorCache = new Map();
var isDeepEqual;
var isDeepStrictEqual;
var parseExpressionAt;
var findNodeAround;
var decoder;
function lazyLoadComparison() {
  var comparison = __webpack_require__(/*! ./internal/util/comparisons */ "./node_modules/assert/build/internal/util/comparisons.js");
  isDeepEqual = comparison.isDeepEqual;
  isDeepStrictEqual = comparison.isDeepStrictEqual;
}

// Escape control characters but not \n and \t to keep the line breaks and
// indentation intact.
// eslint-disable-next-line no-control-regex
var escapeSequencesRegExp = /[\x00-\x08\x0b\x0c\x0e-\x1f]/g;
var meta = ["\\u0000", "\\u0001", "\\u0002", "\\u0003", "\\u0004", "\\u0005", "\\u0006", "\\u0007", '\\b', '', '', "\\u000b", '\\f', '', "\\u000e", "\\u000f", "\\u0010", "\\u0011", "\\u0012", "\\u0013", "\\u0014", "\\u0015", "\\u0016", "\\u0017", "\\u0018", "\\u0019", "\\u001a", "\\u001b", "\\u001c", "\\u001d", "\\u001e", "\\u001f"];
var escapeFn = function escapeFn(str) {
  return meta[str.charCodeAt(0)];
};
var warned = false;

// The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;
var NO_EXCEPTION_SENTINEL = {};

// All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided. All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function innerFail(obj) {
  if (obj.message instanceof Error) throw obj.message;
  throw new AssertionError(obj);
}
function fail(actual, expected, message, operator, stackStartFn) {
  var argsLen = arguments.length;
  var internalMessage;
  if (argsLen === 0) {
    internalMessage = 'Failed';
  } else if (argsLen === 1) {
    message = actual;
    actual = undefined;
  } else {
    if (warned === false) {
      warned = true;
      var warn = process.emitWarning ? process.emitWarning : console.warn.bind(console);
      warn('assert.fail() with more than one argument is deprecated. ' + 'Please use assert.strictEqual() instead or only pass a message.', 'DeprecationWarning', 'DEP0094');
    }
    if (argsLen === 2) operator = '!=';
  }
  if (message instanceof Error) throw message;
  var errArgs = {
    actual: actual,
    expected: expected,
    operator: operator === undefined ? 'fail' : operator,
    stackStartFn: stackStartFn || fail
  };
  if (message !== undefined) {
    errArgs.message = message;
  }
  var err = new AssertionError(errArgs);
  if (internalMessage) {
    err.message = internalMessage;
    err.generatedMessage = true;
  }
  throw err;
}
assert.fail = fail;

// The AssertionError is defined in internal/error.
assert.AssertionError = AssertionError;
function innerOk(fn, argLen, value, message) {
  if (!value) {
    var generatedMessage = false;
    if (argLen === 0) {
      generatedMessage = true;
      message = 'No value argument passed to `assert.ok()`';
    } else if (message instanceof Error) {
      throw message;
    }
    var err = new AssertionError({
      actual: value,
      expected: true,
      message: message,
      operator: '==',
      stackStartFn: fn
    });
    err.generatedMessage = generatedMessage;
    throw err;
  }
}

// Pure assertion tests whether a value is truthy, as determined
// by !!value.
function ok() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }
  innerOk.apply(void 0, [ok, args.length].concat(args));
}
assert.ok = ok;

// The equality assertion tests shallow, coercive equality with ==.
/* eslint-disable no-restricted-properties */
assert.equal = function equal(actual, expected, message) {
  if (arguments.length < 2) {
    throw new ERR_MISSING_ARGS('actual', 'expected');
  }
  // eslint-disable-next-line eqeqeq
  if (actual != expected) {
    innerFail({
      actual: actual,
      expected: expected,
      message: message,
      operator: '==',
      stackStartFn: equal
    });
  }
};

// The non-equality assertion tests for whether two objects are not
// equal with !=.
assert.notEqual = function notEqual(actual, expected, message) {
  if (arguments.length < 2) {
    throw new ERR_MISSING_ARGS('actual', 'expected');
  }
  // eslint-disable-next-line eqeqeq
  if (actual == expected) {
    innerFail({
      actual: actual,
      expected: expected,
      message: message,
      operator: '!=',
      stackStartFn: notEqual
    });
  }
};

// The equivalence assertion tests a deep equality relation.
assert.deepEqual = function deepEqual(actual, expected, message) {
  if (arguments.length < 2) {
    throw new ERR_MISSING_ARGS('actual', 'expected');
  }
  if (isDeepEqual === undefined) lazyLoadComparison();
  if (!isDeepEqual(actual, expected)) {
    innerFail({
      actual: actual,
      expected: expected,
      message: message,
      operator: 'deepEqual',
      stackStartFn: deepEqual
    });
  }
};

// The non-equivalence assertion tests for any deep inequality.
assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (arguments.length < 2) {
    throw new ERR_MISSING_ARGS('actual', 'expected');
  }
  if (isDeepEqual === undefined) lazyLoadComparison();
  if (isDeepEqual(actual, expected)) {
    innerFail({
      actual: actual,
      expected: expected,
      message: message,
      operator: 'notDeepEqual',
      stackStartFn: notDeepEqual
    });
  }
};
/* eslint-enable */

assert.deepStrictEqual = function deepStrictEqual(actual, expected, message) {
  if (arguments.length < 2) {
    throw new ERR_MISSING_ARGS('actual', 'expected');
  }
  if (isDeepEqual === undefined) lazyLoadComparison();
  if (!isDeepStrictEqual(actual, expected)) {
    innerFail({
      actual: actual,
      expected: expected,
      message: message,
      operator: 'deepStrictEqual',
      stackStartFn: deepStrictEqual
    });
  }
};
assert.notDeepStrictEqual = notDeepStrictEqual;
function notDeepStrictEqual(actual, expected, message) {
  if (arguments.length < 2) {
    throw new ERR_MISSING_ARGS('actual', 'expected');
  }
  if (isDeepEqual === undefined) lazyLoadComparison();
  if (isDeepStrictEqual(actual, expected)) {
    innerFail({
      actual: actual,
      expected: expected,
      message: message,
      operator: 'notDeepStrictEqual',
      stackStartFn: notDeepStrictEqual
    });
  }
}
assert.strictEqual = function strictEqual(actual, expected, message) {
  if (arguments.length < 2) {
    throw new ERR_MISSING_ARGS('actual', 'expected');
  }
  if (!objectIs(actual, expected)) {
    innerFail({
      actual: actual,
      expected: expected,
      message: message,
      operator: 'strictEqual',
      stackStartFn: strictEqual
    });
  }
};
assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (arguments.length < 2) {
    throw new ERR_MISSING_ARGS('actual', 'expected');
  }
  if (objectIs(actual, expected)) {
    innerFail({
      actual: actual,
      expected: expected,
      message: message,
      operator: 'notStrictEqual',
      stackStartFn: notStrictEqual
    });
  }
};
var Comparison = /*#__PURE__*/_createClass(function Comparison(obj, keys, actual) {
  var _this = this;
  _classCallCheck(this, Comparison);
  keys.forEach(function (key) {
    if (key in obj) {
      if (actual !== undefined && typeof actual[key] === 'string' && isRegExp(obj[key]) && RegExpPrototypeTest(obj[key], actual[key])) {
        _this[key] = actual[key];
      } else {
        _this[key] = obj[key];
      }
    }
  });
});
function compareExceptionKey(actual, expected, key, message, keys, fn) {
  if (!(key in actual) || !isDeepStrictEqual(actual[key], expected[key])) {
    if (!message) {
      // Create placeholder objects to create a nice output.
      var a = new Comparison(actual, keys);
      var b = new Comparison(expected, keys, actual);
      var err = new AssertionError({
        actual: a,
        expected: b,
        operator: 'deepStrictEqual',
        stackStartFn: fn
      });
      err.actual = actual;
      err.expected = expected;
      err.operator = fn.name;
      throw err;
    }
    innerFail({
      actual: actual,
      expected: expected,
      message: message,
      operator: fn.name,
      stackStartFn: fn
    });
  }
}
function expectedException(actual, expected, msg, fn) {
  if (typeof expected !== 'function') {
    if (isRegExp(expected)) return RegExpPrototypeTest(expected, actual);
    // assert.doesNotThrow does not accept objects.
    if (arguments.length === 2) {
      throw new ERR_INVALID_ARG_TYPE('expected', ['Function', 'RegExp'], expected);
    }

    // Handle primitives properly.
    if (_typeof(actual) !== 'object' || actual === null) {
      var err = new AssertionError({
        actual: actual,
        expected: expected,
        message: msg,
        operator: 'deepStrictEqual',
        stackStartFn: fn
      });
      err.operator = fn.name;
      throw err;
    }
    var keys = Object.keys(expected);
    // Special handle errors to make sure the name and the message are compared
    // as well.
    if (expected instanceof Error) {
      keys.push('name', 'message');
    } else if (keys.length === 0) {
      throw new ERR_INVALID_ARG_VALUE('error', expected, 'may not be an empty object');
    }
    if (isDeepEqual === undefined) lazyLoadComparison();
    keys.forEach(function (key) {
      if (typeof actual[key] === 'string' && isRegExp(expected[key]) && RegExpPrototypeTest(expected[key], actual[key])) {
        return;
      }
      compareExceptionKey(actual, expected, key, msg, keys, fn);
    });
    return true;
  }
  // Guard instanceof against arrow functions as they don't have a prototype.
  if (expected.prototype !== undefined && actual instanceof expected) {
    return true;
  }
  if (Error.isPrototypeOf(expected)) {
    return false;
  }
  return expected.call({}, actual) === true;
}
function getActual(fn) {
  if (typeof fn !== 'function') {
    throw new ERR_INVALID_ARG_TYPE('fn', 'Function', fn);
  }
  try {
    fn();
  } catch (e) {
    return e;
  }
  return NO_EXCEPTION_SENTINEL;
}
function checkIsPromise(obj) {
  // Accept native ES6 promises and promises that are implemented in a similar
  // way. Do not accept thenables that use a function as `obj` and that have no
  // `catch` handler.

  // TODO: thenables are checked up until they have the correct methods,
  // but according to documentation, the `then` method should receive
  // the `fulfill` and `reject` arguments as well or it may be never resolved.

  return isPromise(obj) || obj !== null && _typeof(obj) === 'object' && typeof obj.then === 'function' && typeof obj.catch === 'function';
}
function waitForActual(promiseFn) {
  return Promise.resolve().then(function () {
    var resultPromise;
    if (typeof promiseFn === 'function') {
      // Return a rejected promise if `promiseFn` throws synchronously.
      resultPromise = promiseFn();
      // Fail in case no promise is returned.
      if (!checkIsPromise(resultPromise)) {
        throw new ERR_INVALID_RETURN_VALUE('instance of Promise', 'promiseFn', resultPromise);
      }
    } else if (checkIsPromise(promiseFn)) {
      resultPromise = promiseFn;
    } else {
      throw new ERR_INVALID_ARG_TYPE('promiseFn', ['Function', 'Promise'], promiseFn);
    }
    return Promise.resolve().then(function () {
      return resultPromise;
    }).then(function () {
      return NO_EXCEPTION_SENTINEL;
    }).catch(function (e) {
      return e;
    });
  });
}
function expectsError(stackStartFn, actual, error, message) {
  if (typeof error === 'string') {
    if (arguments.length === 4) {
      throw new ERR_INVALID_ARG_TYPE('error', ['Object', 'Error', 'Function', 'RegExp'], error);
    }
    if (_typeof(actual) === 'object' && actual !== null) {
      if (actual.message === error) {
        throw new ERR_AMBIGUOUS_ARGUMENT('error/message', "The error message \"".concat(actual.message, "\" is identical to the message."));
      }
    } else if (actual === error) {
      throw new ERR_AMBIGUOUS_ARGUMENT('error/message', "The error \"".concat(actual, "\" is identical to the message."));
    }
    message = error;
    error = undefined;
  } else if (error != null && _typeof(error) !== 'object' && typeof error !== 'function') {
    throw new ERR_INVALID_ARG_TYPE('error', ['Object', 'Error', 'Function', 'RegExp'], error);
  }
  if (actual === NO_EXCEPTION_SENTINEL) {
    var details = '';
    if (error && error.name) {
      details += " (".concat(error.name, ")");
    }
    details += message ? ": ".concat(message) : '.';
    var fnType = stackStartFn.name === 'rejects' ? 'rejection' : 'exception';
    innerFail({
      actual: undefined,
      expected: error,
      operator: stackStartFn.name,
      message: "Missing expected ".concat(fnType).concat(details),
      stackStartFn: stackStartFn
    });
  }
  if (error && !expectedException(actual, error, message, stackStartFn)) {
    throw actual;
  }
}
function expectsNoError(stackStartFn, actual, error, message) {
  if (actual === NO_EXCEPTION_SENTINEL) return;
  if (typeof error === 'string') {
    message = error;
    error = undefined;
  }
  if (!error || expectedException(actual, error)) {
    var details = message ? ": ".concat(message) : '.';
    var fnType = stackStartFn.name === 'doesNotReject' ? 'rejection' : 'exception';
    innerFail({
      actual: actual,
      expected: error,
      operator: stackStartFn.name,
      message: "Got unwanted ".concat(fnType).concat(details, "\n") + "Actual message: \"".concat(actual && actual.message, "\""),
      stackStartFn: stackStartFn
    });
  }
  throw actual;
}
assert.throws = function throws(promiseFn) {
  for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    args[_key2 - 1] = arguments[_key2];
  }
  expectsError.apply(void 0, [throws, getActual(promiseFn)].concat(args));
};
assert.rejects = function rejects(promiseFn) {
  for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
    args[_key3 - 1] = arguments[_key3];
  }
  return waitForActual(promiseFn).then(function (result) {
    return expectsError.apply(void 0, [rejects, result].concat(args));
  });
};
assert.doesNotThrow = function doesNotThrow(fn) {
  for (var _len4 = arguments.length, args = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
    args[_key4 - 1] = arguments[_key4];
  }
  expectsNoError.apply(void 0, [doesNotThrow, getActual(fn)].concat(args));
};
assert.doesNotReject = function doesNotReject(fn) {
  for (var _len5 = arguments.length, args = new Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
    args[_key5 - 1] = arguments[_key5];
  }
  return waitForActual(fn).then(function (result) {
    return expectsNoError.apply(void 0, [doesNotReject, result].concat(args));
  });
};
assert.ifError = function ifError(err) {
  if (err !== null && err !== undefined) {
    var message = 'ifError got unwanted exception: ';
    if (_typeof(err) === 'object' && typeof err.message === 'string') {
      if (err.message.length === 0 && err.constructor) {
        message += err.constructor.name;
      } else {
        message += err.message;
      }
    } else {
      message += inspect(err);
    }
    var newErr = new AssertionError({
      actual: err,
      expected: null,
      operator: 'ifError',
      message: message,
      stackStartFn: ifError
    });

    // Make sure we actually have a stack trace!
    var origStack = err.stack;
    if (typeof origStack === 'string') {
      // This will remove any duplicated frames from the error frames taken
      // from within `ifError` and add the original error frames to the newly
      // created ones.
      var tmp2 = origStack.split('\n');
      tmp2.shift();
      // Filter all frames existing in err.stack.
      var tmp1 = newErr.stack.split('\n');
      for (var i = 0; i < tmp2.length; i++) {
        // Find the first occurrence of the frame.
        var pos = tmp1.indexOf(tmp2[i]);
        if (pos !== -1) {
          // Only keep new frames.
          tmp1 = tmp1.slice(0, pos);
          break;
        }
      }
      newErr.stack = "".concat(tmp1.join('\n'), "\n").concat(tmp2.join('\n'));
    }
    throw newErr;
  }
};

// Currently in sync with Node.js lib/assert.js
// https://github.com/nodejs/node/commit/2a871df3dfb8ea663ef5e1f8f62701ec51384ecb
function internalMatch(string, regexp, message, fn, fnName) {
  if (!isRegExp(regexp)) {
    throw new ERR_INVALID_ARG_TYPE('regexp', 'RegExp', regexp);
  }
  var match = fnName === 'match';
  if (typeof string !== 'string' || RegExpPrototypeTest(regexp, string) !== match) {
    if (message instanceof Error) {
      throw message;
    }
    var generatedMessage = !message;

    // 'The input was expected to not match the regular expression ' +
    message = message || (typeof string !== 'string' ? 'The "string" argument must be of type string. Received type ' + "".concat(_typeof(string), " (").concat(inspect(string), ")") : (match ? 'The input did not match the regular expression ' : 'The input was expected to not match the regular expression ') + "".concat(inspect(regexp), ". Input:\n\n").concat(inspect(string), "\n"));
    var err = new AssertionError({
      actual: string,
      expected: regexp,
      message: message,
      operator: fnName,
      stackStartFn: fn
    });
    err.generatedMessage = generatedMessage;
    throw err;
  }
}
assert.match = function match(string, regexp, message) {
  internalMatch(string, regexp, message, match, 'match');
};
assert.doesNotMatch = function doesNotMatch(string, regexp, message) {
  internalMatch(string, regexp, message, doesNotMatch, 'doesNotMatch');
};

// Expose a strict only variant of assert
function strict() {
  for (var _len6 = arguments.length, args = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
    args[_key6] = arguments[_key6];
  }
  innerOk.apply(void 0, [strict, args.length].concat(args));
}
assert.strict = objectAssign(strict, assert, {
  equal: assert.strictEqual,
  deepEqual: assert.deepStrictEqual,
  notEqual: assert.notStrictEqual,
  notDeepEqual: assert.notDeepStrictEqual
});
assert.strict.strict = assert.strict;

/***/ }),

/***/ "./node_modules/assert/build/internal/assert/assertion_error.js":
/*!**********************************************************************!*\
  !*** ./node_modules/assert/build/internal/assert/assertion_error.js ***!
  \**********************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/* provided dependency */ var process = __webpack_require__(/*! process/browser */ "./node_modules/process/browser.js");
// Currently in sync with Node.js lib/internal/assert/assertion_error.js
// https://github.com/nodejs/node/commit/0817840f775032169ddd70c85ac059f18ffcc81c



function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }
function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct.bind(); } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
var _require = __webpack_require__(/*! util/ */ "./node_modules/util/util.js"),
  inspect = _require.inspect;
var _require2 = __webpack_require__(/*! ../errors */ "./node_modules/assert/build/internal/errors.js"),
  ERR_INVALID_ARG_TYPE = _require2.codes.ERR_INVALID_ARG_TYPE;

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith
function endsWith(str, search, this_len) {
  if (this_len === undefined || this_len > str.length) {
    this_len = str.length;
  }
  return str.substring(this_len - search.length, this_len) === search;
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/repeat
function repeat(str, count) {
  count = Math.floor(count);
  if (str.length == 0 || count == 0) return '';
  var maxCount = str.length * count;
  count = Math.floor(Math.log(count) / Math.log(2));
  while (count) {
    str += str;
    count--;
  }
  str += str.substring(0, maxCount - str.length);
  return str;
}
var blue = '';
var green = '';
var red = '';
var white = '';
var kReadableOperator = {
  deepStrictEqual: 'Expected values to be strictly deep-equal:',
  strictEqual: 'Expected values to be strictly equal:',
  strictEqualObject: 'Expected "actual" to be reference-equal to "expected":',
  deepEqual: 'Expected values to be loosely deep-equal:',
  equal: 'Expected values to be loosely equal:',
  notDeepStrictEqual: 'Expected "actual" not to be strictly deep-equal to:',
  notStrictEqual: 'Expected "actual" to be strictly unequal to:',
  notStrictEqualObject: 'Expected "actual" not to be reference-equal to "expected":',
  notDeepEqual: 'Expected "actual" not to be loosely deep-equal to:',
  notEqual: 'Expected "actual" to be loosely unequal to:',
  notIdentical: 'Values identical but not reference-equal:'
};

// Comparing short primitives should just show === / !== instead of using the
// diff.
var kMaxShortLength = 10;
function copyError(source) {
  var keys = Object.keys(source);
  var target = Object.create(Object.getPrototypeOf(source));
  keys.forEach(function (key) {
    target[key] = source[key];
  });
  Object.defineProperty(target, 'message', {
    value: source.message
  });
  return target;
}
function inspectValue(val) {
  // The util.inspect default values could be changed. This makes sure the
  // error messages contain the necessary information nevertheless.
  return inspect(val, {
    compact: false,
    customInspect: false,
    depth: 1000,
    maxArrayLength: Infinity,
    // Assert compares only enumerable properties (with a few exceptions).
    showHidden: false,
    // Having a long line as error is better than wrapping the line for
    // comparison for now.
    // TODO(BridgeAR): `breakLength` should be limited as soon as soon as we
    // have meta information about the inspected properties (i.e., know where
    // in what line the property starts and ends).
    breakLength: Infinity,
    // Assert does not detect proxies currently.
    showProxy: false,
    sorted: true,
    // Inspect getters as we also check them when comparing entries.
    getters: true
  });
}
function createErrDiff(actual, expected, operator) {
  var other = '';
  var res = '';
  var lastPos = 0;
  var end = '';
  var skipped = false;
  var actualInspected = inspectValue(actual);
  var actualLines = actualInspected.split('\n');
  var expectedLines = inspectValue(expected).split('\n');
  var i = 0;
  var indicator = '';

  // In case both values are objects explicitly mark them as not reference equal
  // for the `strictEqual` operator.
  if (operator === 'strictEqual' && _typeof(actual) === 'object' && _typeof(expected) === 'object' && actual !== null && expected !== null) {
    operator = 'strictEqualObject';
  }

  // If "actual" and "expected" fit on a single line and they are not strictly
  // equal, check further special handling.
  if (actualLines.length === 1 && expectedLines.length === 1 && actualLines[0] !== expectedLines[0]) {
    var inputLength = actualLines[0].length + expectedLines[0].length;
    // If the character length of "actual" and "expected" together is less than
    // kMaxShortLength and if neither is an object and at least one of them is
    // not `zero`, use the strict equal comparison to visualize the output.
    if (inputLength <= kMaxShortLength) {
      if ((_typeof(actual) !== 'object' || actual === null) && (_typeof(expected) !== 'object' || expected === null) && (actual !== 0 || expected !== 0)) {
        // -0 === +0
        return "".concat(kReadableOperator[operator], "\n\n") + "".concat(actualLines[0], " !== ").concat(expectedLines[0], "\n");
      }
    } else if (operator !== 'strictEqualObject') {
      // If the stderr is a tty and the input length is lower than the current
      // columns per line, add a mismatch indicator below the output. If it is
      // not a tty, use a default value of 80 characters.
      var maxLength = process.stderr && process.stderr.isTTY ? process.stderr.columns : 80;
      if (inputLength < maxLength) {
        while (actualLines[0][i] === expectedLines[0][i]) {
          i++;
        }
        // Ignore the first characters.
        if (i > 2) {
          // Add position indicator for the first mismatch in case it is a
          // single line and the input length is less than the column length.
          indicator = "\n  ".concat(repeat(' ', i), "^");
          i = 0;
        }
      }
    }
  }

  // Remove all ending lines that match (this optimizes the output for
  // readability by reducing the number of total changed lines).
  var a = actualLines[actualLines.length - 1];
  var b = expectedLines[expectedLines.length - 1];
  while (a === b) {
    if (i++ < 2) {
      end = "\n  ".concat(a).concat(end);
    } else {
      other = a;
    }
    actualLines.pop();
    expectedLines.pop();
    if (actualLines.length === 0 || expectedLines.length === 0) break;
    a = actualLines[actualLines.length - 1];
    b = expectedLines[expectedLines.length - 1];
  }
  var maxLines = Math.max(actualLines.length, expectedLines.length);
  // Strict equal with identical objects that are not identical by reference.
  // E.g., assert.deepStrictEqual({ a: Symbol() }, { a: Symbol() })
  if (maxLines === 0) {
    // We have to get the result again. The lines were all removed before.
    var _actualLines = actualInspected.split('\n');

    // Only remove lines in case it makes sense to collapse those.
    // TODO: Accept env to always show the full error.
    if (_actualLines.length > 30) {
      _actualLines[26] = "".concat(blue, "...").concat(white);
      while (_actualLines.length > 27) {
        _actualLines.pop();
      }
    }
    return "".concat(kReadableOperator.notIdentical, "\n\n").concat(_actualLines.join('\n'), "\n");
  }
  if (i > 3) {
    end = "\n".concat(blue, "...").concat(white).concat(end);
    skipped = true;
  }
  if (other !== '') {
    end = "\n  ".concat(other).concat(end);
    other = '';
  }
  var printedLines = 0;
  var msg = kReadableOperator[operator] + "\n".concat(green, "+ actual").concat(white, " ").concat(red, "- expected").concat(white);
  var skippedMsg = " ".concat(blue, "...").concat(white, " Lines skipped");
  for (i = 0; i < maxLines; i++) {
    // Only extra expected lines exist
    var cur = i - lastPos;
    if (actualLines.length < i + 1) {
      // If the last diverging line is more than one line above and the
      // current line is at least line three, add some of the former lines and
      // also add dots to indicate skipped entries.
      if (cur > 1 && i > 2) {
        if (cur > 4) {
          res += "\n".concat(blue, "...").concat(white);
          skipped = true;
        } else if (cur > 3) {
          res += "\n  ".concat(expectedLines[i - 2]);
          printedLines++;
        }
        res += "\n  ".concat(expectedLines[i - 1]);
        printedLines++;
      }
      // Mark the current line as the last diverging one.
      lastPos = i;
      // Add the expected line to the cache.
      other += "\n".concat(red, "-").concat(white, " ").concat(expectedLines[i]);
      printedLines++;
      // Only extra actual lines exist
    } else if (expectedLines.length < i + 1) {
      // If the last diverging line is more than one line above and the
      // current line is at least line three, add some of the former lines and
      // also add dots to indicate skipped entries.
      if (cur > 1 && i > 2) {
        if (cur > 4) {
          res += "\n".concat(blue, "...").concat(white);
          skipped = true;
        } else if (cur > 3) {
          res += "\n  ".concat(actualLines[i - 2]);
          printedLines++;
        }
        res += "\n  ".concat(actualLines[i - 1]);
        printedLines++;
      }
      // Mark the current line as the last diverging one.
      lastPos = i;
      // Add the actual line to the result.
      res += "\n".concat(green, "+").concat(white, " ").concat(actualLines[i]);
      printedLines++;
      // Lines diverge
    } else {
      var expectedLine = expectedLines[i];
      var actualLine = actualLines[i];
      // If the lines diverge, specifically check for lines that only diverge by
      // a trailing comma. In that case it is actually identical and we should
      // mark it as such.
      var divergingLines = actualLine !== expectedLine && (!endsWith(actualLine, ',') || actualLine.slice(0, -1) !== expectedLine);
      // If the expected line has a trailing comma but is otherwise identical,
      // add a comma at the end of the actual line. Otherwise the output could
      // look weird as in:
      //
      //   [
      //     1         // No comma at the end!
      // +   2
      //   ]
      //
      if (divergingLines && endsWith(expectedLine, ',') && expectedLine.slice(0, -1) === actualLine) {
        divergingLines = false;
        actualLine += ',';
      }
      if (divergingLines) {
        // If the last diverging line is more than one line above and the
        // current line is at least line three, add some of the former lines and
        // also add dots to indicate skipped entries.
        if (cur > 1 && i > 2) {
          if (cur > 4) {
            res += "\n".concat(blue, "...").concat(white);
            skipped = true;
          } else if (cur > 3) {
            res += "\n  ".concat(actualLines[i - 2]);
            printedLines++;
          }
          res += "\n  ".concat(actualLines[i - 1]);
          printedLines++;
        }
        // Mark the current line as the last diverging one.
        lastPos = i;
        // Add the actual line to the result and cache the expected diverging
        // line so consecutive diverging lines show up as +++--- and not +-+-+-.
        res += "\n".concat(green, "+").concat(white, " ").concat(actualLine);
        other += "\n".concat(red, "-").concat(white, " ").concat(expectedLine);
        printedLines += 2;
        // Lines are identical
      } else {
        // Add all cached information to the result before adding other things
        // and reset the cache.
        res += other;
        other = '';
        // If the last diverging line is exactly one line above or if it is the
        // very first line, add the line to the result.
        if (cur === 1 || i === 0) {
          res += "\n  ".concat(actualLine);
          printedLines++;
        }
      }
    }
    // Inspected object to big (Show ~20 rows max)
    if (printedLines > 20 && i < maxLines - 2) {
      return "".concat(msg).concat(skippedMsg, "\n").concat(res, "\n").concat(blue, "...").concat(white).concat(other, "\n") + "".concat(blue, "...").concat(white);
    }
  }
  return "".concat(msg).concat(skipped ? skippedMsg : '', "\n").concat(res).concat(other).concat(end).concat(indicator);
}
var AssertionError = /*#__PURE__*/function (_Error, _inspect$custom) {
  _inherits(AssertionError, _Error);
  var _super = _createSuper(AssertionError);
  function AssertionError(options) {
    var _this;
    _classCallCheck(this, AssertionError);
    if (_typeof(options) !== 'object' || options === null) {
      throw new ERR_INVALID_ARG_TYPE('options', 'Object', options);
    }
    var message = options.message,
      operator = options.operator,
      stackStartFn = options.stackStartFn;
    var actual = options.actual,
      expected = options.expected;
    var limit = Error.stackTraceLimit;
    Error.stackTraceLimit = 0;
    if (message != null) {
      _this = _super.call(this, String(message));
    } else {
      if (process.stderr && process.stderr.isTTY) {
        // Reset on each call to make sure we handle dynamically set environment
        // variables correct.
        if (process.stderr && process.stderr.getColorDepth && process.stderr.getColorDepth() !== 1) {
          blue = "\x1B[34m";
          green = "\x1B[32m";
          white = "\x1B[39m";
          red = "\x1B[31m";
        } else {
          blue = '';
          green = '';
          white = '';
          red = '';
        }
      }
      // Prevent the error stack from being visible by duplicating the error
      // in a very close way to the original in case both sides are actually
      // instances of Error.
      if (_typeof(actual) === 'object' && actual !== null && _typeof(expected) === 'object' && expected !== null && 'stack' in actual && actual instanceof Error && 'stack' in expected && expected instanceof Error) {
        actual = copyError(actual);
        expected = copyError(expected);
      }
      if (operator === 'deepStrictEqual' || operator === 'strictEqual') {
        _this = _super.call(this, createErrDiff(actual, expected, operator));
      } else if (operator === 'notDeepStrictEqual' || operator === 'notStrictEqual') {
        // In case the objects are equal but the operator requires unequal, show
        // the first object and say A equals B
        var base = kReadableOperator[operator];
        var res = inspectValue(actual).split('\n');

        // In case "actual" is an object, it should not be reference equal.
        if (operator === 'notStrictEqual' && _typeof(actual) === 'object' && actual !== null) {
          base = kReadableOperator.notStrictEqualObject;
        }

        // Only remove lines in case it makes sense to collapse those.
        // TODO: Accept env to always show the full error.
        if (res.length > 30) {
          res[26] = "".concat(blue, "...").concat(white);
          while (res.length > 27) {
            res.pop();
          }
        }

        // Only print a single input.
        if (res.length === 1) {
          _this = _super.call(this, "".concat(base, " ").concat(res[0]));
        } else {
          _this = _super.call(this, "".concat(base, "\n\n").concat(res.join('\n'), "\n"));
        }
      } else {
        var _res = inspectValue(actual);
        var other = '';
        var knownOperators = kReadableOperator[operator];
        if (operator === 'notDeepEqual' || operator === 'notEqual') {
          _res = "".concat(kReadableOperator[operator], "\n\n").concat(_res);
          if (_res.length > 1024) {
            _res = "".concat(_res.slice(0, 1021), "...");
          }
        } else {
          other = "".concat(inspectValue(expected));
          if (_res.length > 512) {
            _res = "".concat(_res.slice(0, 509), "...");
          }
          if (other.length > 512) {
            other = "".concat(other.slice(0, 509), "...");
          }
          if (operator === 'deepEqual' || operator === 'equal') {
            _res = "".concat(knownOperators, "\n\n").concat(_res, "\n\nshould equal\n\n");
          } else {
            other = " ".concat(operator, " ").concat(other);
          }
        }
        _this = _super.call(this, "".concat(_res).concat(other));
      }
    }
    Error.stackTraceLimit = limit;
    _this.generatedMessage = !message;
    Object.defineProperty(_assertThisInitialized(_this), 'name', {
      value: 'AssertionError [ERR_ASSERTION]',
      enumerable: false,
      writable: true,
      configurable: true
    });
    _this.code = 'ERR_ASSERTION';
    _this.actual = actual;
    _this.expected = expected;
    _this.operator = operator;
    if (Error.captureStackTrace) {
      // eslint-disable-next-line no-restricted-syntax
      Error.captureStackTrace(_assertThisInitialized(_this), stackStartFn);
    }
    // Create error message including the error code in the name.
    _this.stack;
    // Reset the name.
    _this.name = 'AssertionError';
    return _possibleConstructorReturn(_this);
  }
  _createClass(AssertionError, [{
    key: "toString",
    value: function toString() {
      return "".concat(this.name, " [").concat(this.code, "]: ").concat(this.message);
    }
  }, {
    key: _inspect$custom,
    value: function value(recurseTimes, ctx) {
      // This limits the `actual` and `expected` property default inspection to
      // the minimum depth. Otherwise those values would be too verbose compared
      // to the actual error message which contains a combined view of these two
      // input values.
      return inspect(this, _objectSpread(_objectSpread({}, ctx), {}, {
        customInspect: false,
        depth: 0
      }));
    }
  }]);
  return AssertionError;
}( /*#__PURE__*/_wrapNativeSuper(Error), inspect.custom);
module.exports = AssertionError;

/***/ }),

/***/ "./node_modules/assert/build/internal/errors.js":
/*!******************************************************!*\
  !*** ./node_modules/assert/build/internal/errors.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// Currently in sync with Node.js lib/internal/errors.js
// https://github.com/nodejs/node/commit/3b044962c48fe313905877a96b5d0894a5404f6f

/* eslint node-core/documented-errors: "error" */
/* eslint node-core/alphabetize-errors: "error" */
/* eslint node-core/prefer-util-format-errors: "error" */



// The whole point behind this internal module is to allow Node.js to no
// longer be forced to treat every error message change as a semver-major
// change. The NodeError classes here all expose a `code` property whose
// value statically and permanently identifies the error. While the error
// message may change, the code should not.
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
var codes = {};

// Lazy loaded
var assert;
var util;
function createErrorType(code, message, Base) {
  if (!Base) {
    Base = Error;
  }
  function getMessage(arg1, arg2, arg3) {
    if (typeof message === 'string') {
      return message;
    } else {
      return message(arg1, arg2, arg3);
    }
  }
  var NodeError = /*#__PURE__*/function (_Base) {
    _inherits(NodeError, _Base);
    var _super = _createSuper(NodeError);
    function NodeError(arg1, arg2, arg3) {
      var _this;
      _classCallCheck(this, NodeError);
      _this = _super.call(this, getMessage(arg1, arg2, arg3));
      _this.code = code;
      return _this;
    }
    return _createClass(NodeError);
  }(Base);
  codes[code] = NodeError;
}

// https://github.com/nodejs/node/blob/v10.8.0/lib/internal/errors.js
function oneOf(expected, thing) {
  if (Array.isArray(expected)) {
    var len = expected.length;
    expected = expected.map(function (i) {
      return String(i);
    });
    if (len > 2) {
      return "one of ".concat(thing, " ").concat(expected.slice(0, len - 1).join(', '), ", or ") + expected[len - 1];
    } else if (len === 2) {
      return "one of ".concat(thing, " ").concat(expected[0], " or ").concat(expected[1]);
    } else {
      return "of ".concat(thing, " ").concat(expected[0]);
    }
  } else {
    return "of ".concat(thing, " ").concat(String(expected));
  }
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith
function startsWith(str, search, pos) {
  return str.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith
function endsWith(str, search, this_len) {
  if (this_len === undefined || this_len > str.length) {
    this_len = str.length;
  }
  return str.substring(this_len - search.length, this_len) === search;
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes
function includes(str, search, start) {
  if (typeof start !== 'number') {
    start = 0;
  }
  if (start + search.length > str.length) {
    return false;
  } else {
    return str.indexOf(search, start) !== -1;
  }
}
createErrorType('ERR_AMBIGUOUS_ARGUMENT', 'The "%s" argument is ambiguous. %s', TypeError);
createErrorType('ERR_INVALID_ARG_TYPE', function (name, expected, actual) {
  if (assert === undefined) assert = __webpack_require__(/*! ../assert */ "./node_modules/assert/build/assert.js");
  assert(typeof name === 'string', "'name' must be a string");

  // determiner: 'must be' or 'must not be'
  var determiner;
  if (typeof expected === 'string' && startsWith(expected, 'not ')) {
    determiner = 'must not be';
    expected = expected.replace(/^not /, '');
  } else {
    determiner = 'must be';
  }
  var msg;
  if (endsWith(name, ' argument')) {
    // For cases like 'first argument'
    msg = "The ".concat(name, " ").concat(determiner, " ").concat(oneOf(expected, 'type'));
  } else {
    var type = includes(name, '.') ? 'property' : 'argument';
    msg = "The \"".concat(name, "\" ").concat(type, " ").concat(determiner, " ").concat(oneOf(expected, 'type'));
  }

  // TODO(BridgeAR): Improve the output by showing `null` and similar.
  msg += ". Received type ".concat(_typeof(actual));
  return msg;
}, TypeError);
createErrorType('ERR_INVALID_ARG_VALUE', function (name, value) {
  var reason = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'is invalid';
  if (util === undefined) util = __webpack_require__(/*! util/ */ "./node_modules/util/util.js");
  var inspected = util.inspect(value);
  if (inspected.length > 128) {
    inspected = "".concat(inspected.slice(0, 128), "...");
  }
  return "The argument '".concat(name, "' ").concat(reason, ". Received ").concat(inspected);
}, TypeError, RangeError);
createErrorType('ERR_INVALID_RETURN_VALUE', function (input, name, value) {
  var type;
  if (value && value.constructor && value.constructor.name) {
    type = "instance of ".concat(value.constructor.name);
  } else {
    type = "type ".concat(_typeof(value));
  }
  return "Expected ".concat(input, " to be returned from the \"").concat(name, "\"") + " function but got ".concat(type, ".");
}, TypeError);
createErrorType('ERR_MISSING_ARGS', function () {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }
  if (assert === undefined) assert = __webpack_require__(/*! ../assert */ "./node_modules/assert/build/assert.js");
  assert(args.length > 0, 'At least one arg needs to be specified');
  var msg = 'The ';
  var len = args.length;
  args = args.map(function (a) {
    return "\"".concat(a, "\"");
  });
  switch (len) {
    case 1:
      msg += "".concat(args[0], " argument");
      break;
    case 2:
      msg += "".concat(args[0], " and ").concat(args[1], " arguments");
      break;
    default:
      msg += args.slice(0, len - 1).join(', ');
      msg += ", and ".concat(args[len - 1], " arguments");
      break;
  }
  return "".concat(msg, " must be specified");
}, TypeError);
module.exports.codes = codes;

/***/ }),

/***/ "./node_modules/assert/build/internal/util/comparisons.js":
/*!****************************************************************!*\
  !*** ./node_modules/assert/build/internal/util/comparisons.js ***!
  \****************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// Currently in sync with Node.js lib/internal/util/comparisons.js
// https://github.com/nodejs/node/commit/112cc7c27551254aa2b17098fb774867f05ed0d9



function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
var regexFlagsSupported = /a/g.flags !== undefined;
var arrayFromSet = function arrayFromSet(set) {
  var array = [];
  set.forEach(function (value) {
    return array.push(value);
  });
  return array;
};
var arrayFromMap = function arrayFromMap(map) {
  var array = [];
  map.forEach(function (value, key) {
    return array.push([key, value]);
  });
  return array;
};
var objectIs = Object.is ? Object.is : __webpack_require__(/*! object-is */ "./node_modules/object-is/index.js");
var objectGetOwnPropertySymbols = Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols : function () {
  return [];
};
var numberIsNaN = Number.isNaN ? Number.isNaN : __webpack_require__(/*! is-nan */ "./node_modules/is-nan/index.js");
function uncurryThis(f) {
  return f.call.bind(f);
}
var hasOwnProperty = uncurryThis(Object.prototype.hasOwnProperty);
var propertyIsEnumerable = uncurryThis(Object.prototype.propertyIsEnumerable);
var objectToString = uncurryThis(Object.prototype.toString);
var _require$types = (__webpack_require__(/*! util/ */ "./node_modules/util/util.js").types),
  isAnyArrayBuffer = _require$types.isAnyArrayBuffer,
  isArrayBufferView = _require$types.isArrayBufferView,
  isDate = _require$types.isDate,
  isMap = _require$types.isMap,
  isRegExp = _require$types.isRegExp,
  isSet = _require$types.isSet,
  isNativeError = _require$types.isNativeError,
  isBoxedPrimitive = _require$types.isBoxedPrimitive,
  isNumberObject = _require$types.isNumberObject,
  isStringObject = _require$types.isStringObject,
  isBooleanObject = _require$types.isBooleanObject,
  isBigIntObject = _require$types.isBigIntObject,
  isSymbolObject = _require$types.isSymbolObject,
  isFloat32Array = _require$types.isFloat32Array,
  isFloat64Array = _require$types.isFloat64Array;
function isNonIndex(key) {
  if (key.length === 0 || key.length > 10) return true;
  for (var i = 0; i < key.length; i++) {
    var code = key.charCodeAt(i);
    if (code < 48 || code > 57) return true;
  }
  // The maximum size for an array is 2 ** 32 -1.
  return key.length === 10 && key >= Math.pow(2, 32);
}
function getOwnNonIndexProperties(value) {
  return Object.keys(value).filter(isNonIndex).concat(objectGetOwnPropertySymbols(value).filter(Object.prototype.propertyIsEnumerable.bind(value)));
}

// Taken from https://github.com/feross/buffer/blob/680e9e5e488f22aac27599a57dc844a6315928dd/index.js
// original notice:
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
function compare(a, b) {
  if (a === b) {
    return 0;
  }
  var x = a.length;
  var y = b.length;
  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i];
      y = b[i];
      break;
    }
  }
  if (x < y) {
    return -1;
  }
  if (y < x) {
    return 1;
  }
  return 0;
}
var ONLY_ENUMERABLE = undefined;
var kStrict = true;
var kLoose = false;
var kNoIterator = 0;
var kIsArray = 1;
var kIsSet = 2;
var kIsMap = 3;

// Check if they have the same source and flags
function areSimilarRegExps(a, b) {
  return regexFlagsSupported ? a.source === b.source && a.flags === b.flags : RegExp.prototype.toString.call(a) === RegExp.prototype.toString.call(b);
}
function areSimilarFloatArrays(a, b) {
  if (a.byteLength !== b.byteLength) {
    return false;
  }
  for (var offset = 0; offset < a.byteLength; offset++) {
    if (a[offset] !== b[offset]) {
      return false;
    }
  }
  return true;
}
function areSimilarTypedArrays(a, b) {
  if (a.byteLength !== b.byteLength) {
    return false;
  }
  return compare(new Uint8Array(a.buffer, a.byteOffset, a.byteLength), new Uint8Array(b.buffer, b.byteOffset, b.byteLength)) === 0;
}
function areEqualArrayBuffers(buf1, buf2) {
  return buf1.byteLength === buf2.byteLength && compare(new Uint8Array(buf1), new Uint8Array(buf2)) === 0;
}
function isEqualBoxedPrimitive(val1, val2) {
  if (isNumberObject(val1)) {
    return isNumberObject(val2) && objectIs(Number.prototype.valueOf.call(val1), Number.prototype.valueOf.call(val2));
  }
  if (isStringObject(val1)) {
    return isStringObject(val2) && String.prototype.valueOf.call(val1) === String.prototype.valueOf.call(val2);
  }
  if (isBooleanObject(val1)) {
    return isBooleanObject(val2) && Boolean.prototype.valueOf.call(val1) === Boolean.prototype.valueOf.call(val2);
  }
  if (isBigIntObject(val1)) {
    return isBigIntObject(val2) && BigInt.prototype.valueOf.call(val1) === BigInt.prototype.valueOf.call(val2);
  }
  return isSymbolObject(val2) && Symbol.prototype.valueOf.call(val1) === Symbol.prototype.valueOf.call(val2);
}

// Notes: Type tags are historical [[Class]] properties that can be set by
// FunctionTemplate::SetClassName() in C++ or Symbol.toStringTag in JS
// and retrieved using Object.prototype.toString.call(obj) in JS
// See https://tc39.github.io/ecma262/#sec-object.prototype.tostring
// for a list of tags pre-defined in the spec.
// There are some unspecified tags in the wild too (e.g. typed array tags).
// Since tags can be altered, they only serve fast failures
//
// Typed arrays and buffers are checked by comparing the content in their
// underlying ArrayBuffer. This optimization requires that it's
// reasonable to interpret their underlying memory in the same way,
// which is checked by comparing their type tags.
// (e.g. a Uint8Array and a Uint16Array with the same memory content
// could still be different because they will be interpreted differently).
//
// For strict comparison, objects should have
// a) The same built-in type tags
// b) The same prototypes.

function innerDeepEqual(val1, val2, strict, memos) {
  // All identical values are equivalent, as determined by ===.
  if (val1 === val2) {
    if (val1 !== 0) return true;
    return strict ? objectIs(val1, val2) : true;
  }

  // Check more closely if val1 and val2 are equal.
  if (strict) {
    if (_typeof(val1) !== 'object') {
      return typeof val1 === 'number' && numberIsNaN(val1) && numberIsNaN(val2);
    }
    if (_typeof(val2) !== 'object' || val1 === null || val2 === null) {
      return false;
    }
    if (Object.getPrototypeOf(val1) !== Object.getPrototypeOf(val2)) {
      return false;
    }
  } else {
    if (val1 === null || _typeof(val1) !== 'object') {
      if (val2 === null || _typeof(val2) !== 'object') {
        // eslint-disable-next-line eqeqeq
        return val1 == val2;
      }
      return false;
    }
    if (val2 === null || _typeof(val2) !== 'object') {
      return false;
    }
  }
  var val1Tag = objectToString(val1);
  var val2Tag = objectToString(val2);
  if (val1Tag !== val2Tag) {
    return false;
  }
  if (Array.isArray(val1)) {
    // Check for sparse arrays and general fast path
    if (val1.length !== val2.length) {
      return false;
    }
    var keys1 = getOwnNonIndexProperties(val1, ONLY_ENUMERABLE);
    var keys2 = getOwnNonIndexProperties(val2, ONLY_ENUMERABLE);
    if (keys1.length !== keys2.length) {
      return false;
    }
    return keyCheck(val1, val2, strict, memos, kIsArray, keys1);
  }
  // [browserify] This triggers on certain types in IE (Map/Set) so we don't
  // wan't to early return out of the rest of the checks. However we can check
  // if the second value is one of these values and the first isn't.
  if (val1Tag === '[object Object]') {
    // return keyCheck(val1, val2, strict, memos, kNoIterator);
    if (!isMap(val1) && isMap(val2) || !isSet(val1) && isSet(val2)) {
      return false;
    }
  }
  if (isDate(val1)) {
    if (!isDate(val2) || Date.prototype.getTime.call(val1) !== Date.prototype.getTime.call(val2)) {
      return false;
    }
  } else if (isRegExp(val1)) {
    if (!isRegExp(val2) || !areSimilarRegExps(val1, val2)) {
      return false;
    }
  } else if (isNativeError(val1) || val1 instanceof Error) {
    // Do not compare the stack as it might differ even though the error itself
    // is otherwise identical.
    if (val1.message !== val2.message || val1.name !== val2.name) {
      return false;
    }
  } else if (isArrayBufferView(val1)) {
    if (!strict && (isFloat32Array(val1) || isFloat64Array(val1))) {
      if (!areSimilarFloatArrays(val1, val2)) {
        return false;
      }
    } else if (!areSimilarTypedArrays(val1, val2)) {
      return false;
    }
    // Buffer.compare returns true, so val1.length === val2.length. If they both
    // only contain numeric keys, we don't need to exam further than checking
    // the symbols.
    var _keys = getOwnNonIndexProperties(val1, ONLY_ENUMERABLE);
    var _keys2 = getOwnNonIndexProperties(val2, ONLY_ENUMERABLE);
    if (_keys.length !== _keys2.length) {
      return false;
    }
    return keyCheck(val1, val2, strict, memos, kNoIterator, _keys);
  } else if (isSet(val1)) {
    if (!isSet(val2) || val1.size !== val2.size) {
      return false;
    }
    return keyCheck(val1, val2, strict, memos, kIsSet);
  } else if (isMap(val1)) {
    if (!isMap(val2) || val1.size !== val2.size) {
      return false;
    }
    return keyCheck(val1, val2, strict, memos, kIsMap);
  } else if (isAnyArrayBuffer(val1)) {
    if (!areEqualArrayBuffers(val1, val2)) {
      return false;
    }
  } else if (isBoxedPrimitive(val1) && !isEqualBoxedPrimitive(val1, val2)) {
    return false;
  }
  return keyCheck(val1, val2, strict, memos, kNoIterator);
}
function getEnumerables(val, keys) {
  return keys.filter(function (k) {
    return propertyIsEnumerable(val, k);
  });
}
function keyCheck(val1, val2, strict, memos, iterationType, aKeys) {
  // For all remaining Object pairs, including Array, objects and Maps,
  // equivalence is determined by having:
  // a) The same number of owned enumerable properties
  // b) The same set of keys/indexes (although not necessarily the same order)
  // c) Equivalent values for every corresponding key/index
  // d) For Sets and Maps, equal contents
  // Note: this accounts for both named and indexed properties on Arrays.
  if (arguments.length === 5) {
    aKeys = Object.keys(val1);
    var bKeys = Object.keys(val2);

    // The pair must have the same number of owned properties.
    if (aKeys.length !== bKeys.length) {
      return false;
    }
  }

  // Cheap key test
  var i = 0;
  for (; i < aKeys.length; i++) {
    if (!hasOwnProperty(val2, aKeys[i])) {
      return false;
    }
  }
  if (strict && arguments.length === 5) {
    var symbolKeysA = objectGetOwnPropertySymbols(val1);
    if (symbolKeysA.length !== 0) {
      var count = 0;
      for (i = 0; i < symbolKeysA.length; i++) {
        var key = symbolKeysA[i];
        if (propertyIsEnumerable(val1, key)) {
          if (!propertyIsEnumerable(val2, key)) {
            return false;
          }
          aKeys.push(key);
          count++;
        } else if (propertyIsEnumerable(val2, key)) {
          return false;
        }
      }
      var symbolKeysB = objectGetOwnPropertySymbols(val2);
      if (symbolKeysA.length !== symbolKeysB.length && getEnumerables(val2, symbolKeysB).length !== count) {
        return false;
      }
    } else {
      var _symbolKeysB = objectGetOwnPropertySymbols(val2);
      if (_symbolKeysB.length !== 0 && getEnumerables(val2, _symbolKeysB).length !== 0) {
        return false;
      }
    }
  }
  if (aKeys.length === 0 && (iterationType === kNoIterator || iterationType === kIsArray && val1.length === 0 || val1.size === 0)) {
    return true;
  }

  // Use memos to handle cycles.
  if (memos === undefined) {
    memos = {
      val1: new Map(),
      val2: new Map(),
      position: 0
    };
  } else {
    // We prevent up to two map.has(x) calls by directly retrieving the value
    // and checking for undefined. The map can only contain numbers, so it is
    // safe to check for undefined only.
    var val2MemoA = memos.val1.get(val1);
    if (val2MemoA !== undefined) {
      var val2MemoB = memos.val2.get(val2);
      if (val2MemoB !== undefined) {
        return val2MemoA === val2MemoB;
      }
    }
    memos.position++;
  }
  memos.val1.set(val1, memos.position);
  memos.val2.set(val2, memos.position);
  var areEq = objEquiv(val1, val2, strict, aKeys, memos, iterationType);
  memos.val1.delete(val1);
  memos.val2.delete(val2);
  return areEq;
}
function setHasEqualElement(set, val1, strict, memo) {
  // Go looking.
  var setValues = arrayFromSet(set);
  for (var i = 0; i < setValues.length; i++) {
    var val2 = setValues[i];
    if (innerDeepEqual(val1, val2, strict, memo)) {
      // Remove the matching element to make sure we do not check that again.
      set.delete(val2);
      return true;
    }
  }
  return false;
}

// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness#Loose_equality_using
// Sadly it is not possible to detect corresponding values properly in case the
// type is a string, number, bigint or boolean. The reason is that those values
// can match lots of different string values (e.g., 1n == '+00001').
function findLooseMatchingPrimitives(prim) {
  switch (_typeof(prim)) {
    case 'undefined':
      return null;
    case 'object':
      // Only pass in null as object!
      return undefined;
    case 'symbol':
      return false;
    case 'string':
      prim = +prim;
    // Loose equal entries exist only if the string is possible to convert to
    // a regular number and not NaN.
    // Fall through
    case 'number':
      if (numberIsNaN(prim)) {
        return false;
      }
  }
  return true;
}
function setMightHaveLoosePrim(a, b, prim) {
  var altValue = findLooseMatchingPrimitives(prim);
  if (altValue != null) return altValue;
  return b.has(altValue) && !a.has(altValue);
}
function mapMightHaveLoosePrim(a, b, prim, item, memo) {
  var altValue = findLooseMatchingPrimitives(prim);
  if (altValue != null) {
    return altValue;
  }
  var curB = b.get(altValue);
  if (curB === undefined && !b.has(altValue) || !innerDeepEqual(item, curB, false, memo)) {
    return false;
  }
  return !a.has(altValue) && innerDeepEqual(item, curB, false, memo);
}
function setEquiv(a, b, strict, memo) {
  // This is a lazily initiated Set of entries which have to be compared
  // pairwise.
  var set = null;
  var aValues = arrayFromSet(a);
  for (var i = 0; i < aValues.length; i++) {
    var val = aValues[i];
    // Note: Checking for the objects first improves the performance for object
    // heavy sets but it is a minor slow down for primitives. As they are fast
    // to check this improves the worst case scenario instead.
    if (_typeof(val) === 'object' && val !== null) {
      if (set === null) {
        set = new Set();
      }
      // If the specified value doesn't exist in the second set its an not null
      // object (or non strict only: a not matching primitive) we'll need to go
      // hunting for something thats deep-(strict-)equal to it. To make this
      // O(n log n) complexity we have to copy these values in a new set first.
      set.add(val);
    } else if (!b.has(val)) {
      if (strict) return false;

      // Fast path to detect missing string, symbol, undefined and null values.
      if (!setMightHaveLoosePrim(a, b, val)) {
        return false;
      }
      if (set === null) {
        set = new Set();
      }
      set.add(val);
    }
  }
  if (set !== null) {
    var bValues = arrayFromSet(b);
    for (var _i = 0; _i < bValues.length; _i++) {
      var _val = bValues[_i];
      // We have to check if a primitive value is already
      // matching and only if it's not, go hunting for it.
      if (_typeof(_val) === 'object' && _val !== null) {
        if (!setHasEqualElement(set, _val, strict, memo)) return false;
      } else if (!strict && !a.has(_val) && !setHasEqualElement(set, _val, strict, memo)) {
        return false;
      }
    }
    return set.size === 0;
  }
  return true;
}
function mapHasEqualEntry(set, map, key1, item1, strict, memo) {
  // To be able to handle cases like:
  //   Map([[{}, 'a'], [{}, 'b']]) vs Map([[{}, 'b'], [{}, 'a']])
  // ... we need to consider *all* matching keys, not just the first we find.
  var setValues = arrayFromSet(set);
  for (var i = 0; i < setValues.length; i++) {
    var key2 = setValues[i];
    if (innerDeepEqual(key1, key2, strict, memo) && innerDeepEqual(item1, map.get(key2), strict, memo)) {
      set.delete(key2);
      return true;
    }
  }
  return false;
}
function mapEquiv(a, b, strict, memo) {
  var set = null;
  var aEntries = arrayFromMap(a);
  for (var i = 0; i < aEntries.length; i++) {
    var _aEntries$i = _slicedToArray(aEntries[i], 2),
      key = _aEntries$i[0],
      item1 = _aEntries$i[1];
    if (_typeof(key) === 'object' && key !== null) {
      if (set === null) {
        set = new Set();
      }
      set.add(key);
    } else {
      // By directly retrieving the value we prevent another b.has(key) check in
      // almost all possible cases.
      var item2 = b.get(key);
      if (item2 === undefined && !b.has(key) || !innerDeepEqual(item1, item2, strict, memo)) {
        if (strict) return false;
        // Fast path to detect missing string, symbol, undefined and null
        // keys.
        if (!mapMightHaveLoosePrim(a, b, key, item1, memo)) return false;
        if (set === null) {
          set = new Set();
        }
        set.add(key);
      }
    }
  }
  if (set !== null) {
    var bEntries = arrayFromMap(b);
    for (var _i2 = 0; _i2 < bEntries.length; _i2++) {
      var _bEntries$_i = _slicedToArray(bEntries[_i2], 2),
        _key = _bEntries$_i[0],
        item = _bEntries$_i[1];
      if (_typeof(_key) === 'object' && _key !== null) {
        if (!mapHasEqualEntry(set, a, _key, item, strict, memo)) return false;
      } else if (!strict && (!a.has(_key) || !innerDeepEqual(a.get(_key), item, false, memo)) && !mapHasEqualEntry(set, a, _key, item, false, memo)) {
        return false;
      }
    }
    return set.size === 0;
  }
  return true;
}
function objEquiv(a, b, strict, keys, memos, iterationType) {
  // Sets and maps don't have their entries accessible via normal object
  // properties.
  var i = 0;
  if (iterationType === kIsSet) {
    if (!setEquiv(a, b, strict, memos)) {
      return false;
    }
  } else if (iterationType === kIsMap) {
    if (!mapEquiv(a, b, strict, memos)) {
      return false;
    }
  } else if (iterationType === kIsArray) {
    for (; i < a.length; i++) {
      if (hasOwnProperty(a, i)) {
        if (!hasOwnProperty(b, i) || !innerDeepEqual(a[i], b[i], strict, memos)) {
          return false;
        }
      } else if (hasOwnProperty(b, i)) {
        return false;
      } else {
        // Array is sparse.
        var keysA = Object.keys(a);
        for (; i < keysA.length; i++) {
          var key = keysA[i];
          if (!hasOwnProperty(b, key) || !innerDeepEqual(a[key], b[key], strict, memos)) {
            return false;
          }
        }
        if (keysA.length !== Object.keys(b).length) {
          return false;
        }
        return true;
      }
    }
  }

  // The pair must have equivalent values for every corresponding key.
  // Possibly expensive deep test:
  for (i = 0; i < keys.length; i++) {
    var _key2 = keys[i];
    if (!innerDeepEqual(a[_key2], b[_key2], strict, memos)) {
      return false;
    }
  }
  return true;
}
function isDeepEqual(val1, val2) {
  return innerDeepEqual(val1, val2, kLoose);
}
function isDeepStrictEqual(val1, val2) {
  return innerDeepEqual(val1, val2, kStrict);
}
module.exports = {
  isDeepEqual: isDeepEqual,
  isDeepStrictEqual: isDeepStrictEqual
};

/***/ }),

/***/ "./node_modules/call-bind/callBound.js":
/*!*********************************************!*\
  !*** ./node_modules/call-bind/callBound.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var GetIntrinsic = __webpack_require__(/*! get-intrinsic */ "./node_modules/get-intrinsic/index.js");

var callBind = __webpack_require__(/*! ./ */ "./node_modules/call-bind/index.js");

var $indexOf = callBind(GetIntrinsic('String.prototype.indexOf'));

module.exports = function callBoundIntrinsic(name, allowMissing) {
	var intrinsic = GetIntrinsic(name, !!allowMissing);
	if (typeof intrinsic === 'function' && $indexOf(name, '.prototype.') > -1) {
		return callBind(intrinsic);
	}
	return intrinsic;
};


/***/ }),

/***/ "./node_modules/call-bind/index.js":
/*!*****************************************!*\
  !*** ./node_modules/call-bind/index.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var bind = __webpack_require__(/*! function-bind */ "./node_modules/function-bind/index.js");
var GetIntrinsic = __webpack_require__(/*! get-intrinsic */ "./node_modules/get-intrinsic/index.js");
var setFunctionLength = __webpack_require__(/*! set-function-length */ "./node_modules/set-function-length/index.js");

var $TypeError = __webpack_require__(/*! es-errors/type */ "./node_modules/es-errors/type.js");
var $apply = GetIntrinsic('%Function.prototype.apply%');
var $call = GetIntrinsic('%Function.prototype.call%');
var $reflectApply = GetIntrinsic('%Reflect.apply%', true) || bind.call($call, $apply);

var $defineProperty = __webpack_require__(/*! es-define-property */ "./node_modules/es-define-property/index.js");
var $max = GetIntrinsic('%Math.max%');

module.exports = function callBind(originalFunction) {
	if (typeof originalFunction !== 'function') {
		throw new $TypeError('a function is required');
	}
	var func = $reflectApply(bind, $call, arguments);
	return setFunctionLength(
		func,
		1 + $max(0, originalFunction.length - (arguments.length - 1)),
		true
	);
};

var applyBind = function applyBind() {
	return $reflectApply(bind, $apply, arguments);
};

if ($defineProperty) {
	$defineProperty(module.exports, 'apply', { value: applyBind });
} else {
	module.exports.apply = applyBind;
}


/***/ }),

/***/ "./node_modules/define-data-property/index.js":
/*!****************************************************!*\
  !*** ./node_modules/define-data-property/index.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var $defineProperty = __webpack_require__(/*! es-define-property */ "./node_modules/es-define-property/index.js");

var $SyntaxError = __webpack_require__(/*! es-errors/syntax */ "./node_modules/es-errors/syntax.js");
var $TypeError = __webpack_require__(/*! es-errors/type */ "./node_modules/es-errors/type.js");

var gopd = __webpack_require__(/*! gopd */ "./node_modules/gopd/index.js");

/** @type {import('.')} */
module.exports = function defineDataProperty(
	obj,
	property,
	value
) {
	if (!obj || (typeof obj !== 'object' && typeof obj !== 'function')) {
		throw new $TypeError('`obj` must be an object or a function`');
	}
	if (typeof property !== 'string' && typeof property !== 'symbol') {
		throw new $TypeError('`property` must be a string or a symbol`');
	}
	if (arguments.length > 3 && typeof arguments[3] !== 'boolean' && arguments[3] !== null) {
		throw new $TypeError('`nonEnumerable`, if provided, must be a boolean or null');
	}
	if (arguments.length > 4 && typeof arguments[4] !== 'boolean' && arguments[4] !== null) {
		throw new $TypeError('`nonWritable`, if provided, must be a boolean or null');
	}
	if (arguments.length > 5 && typeof arguments[5] !== 'boolean' && arguments[5] !== null) {
		throw new $TypeError('`nonConfigurable`, if provided, must be a boolean or null');
	}
	if (arguments.length > 6 && typeof arguments[6] !== 'boolean') {
		throw new $TypeError('`loose`, if provided, must be a boolean');
	}

	var nonEnumerable = arguments.length > 3 ? arguments[3] : null;
	var nonWritable = arguments.length > 4 ? arguments[4] : null;
	var nonConfigurable = arguments.length > 5 ? arguments[5] : null;
	var loose = arguments.length > 6 ? arguments[6] : false;

	/* @type {false | TypedPropertyDescriptor<unknown>} */
	var desc = !!gopd && gopd(obj, property);

	if ($defineProperty) {
		$defineProperty(obj, property, {
			configurable: nonConfigurable === null && desc ? desc.configurable : !nonConfigurable,
			enumerable: nonEnumerable === null && desc ? desc.enumerable : !nonEnumerable,
			value: value,
			writable: nonWritable === null && desc ? desc.writable : !nonWritable
		});
	} else if (loose || (!nonEnumerable && !nonWritable && !nonConfigurable)) {
		// must fall back to [[Set]], and was not explicitly asked to make non-enumerable, non-writable, or non-configurable
		obj[property] = value; // eslint-disable-line no-param-reassign
	} else {
		throw new $SyntaxError('This environment does not support defining a property as non-configurable, non-writable, or non-enumerable.');
	}
};


/***/ }),

/***/ "./node_modules/define-properties/index.js":
/*!*************************************************!*\
  !*** ./node_modules/define-properties/index.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var keys = __webpack_require__(/*! object-keys */ "./node_modules/object-keys/index.js");
var hasSymbols = typeof Symbol === 'function' && typeof Symbol('foo') === 'symbol';

var toStr = Object.prototype.toString;
var concat = Array.prototype.concat;
var defineDataProperty = __webpack_require__(/*! define-data-property */ "./node_modules/define-data-property/index.js");

var isFunction = function (fn) {
	return typeof fn === 'function' && toStr.call(fn) === '[object Function]';
};

var supportsDescriptors = __webpack_require__(/*! has-property-descriptors */ "./node_modules/has-property-descriptors/index.js")();

var defineProperty = function (object, name, value, predicate) {
	if (name in object) {
		if (predicate === true) {
			if (object[name] === value) {
				return;
			}
		} else if (!isFunction(predicate) || !predicate()) {
			return;
		}
	}

	if (supportsDescriptors) {
		defineDataProperty(object, name, value, true);
	} else {
		defineDataProperty(object, name, value);
	}
};

var defineProperties = function (object, map) {
	var predicates = arguments.length > 2 ? arguments[2] : {};
	var props = keys(map);
	if (hasSymbols) {
		props = concat.call(props, Object.getOwnPropertySymbols(map));
	}
	for (var i = 0; i < props.length; i += 1) {
		defineProperty(object, props[i], map[props[i]], predicates[props[i]]);
	}
};

defineProperties.supportsDescriptors = !!supportsDescriptors;

module.exports = defineProperties;


/***/ }),

/***/ "./node_modules/es-define-property/index.js":
/*!**************************************************!*\
  !*** ./node_modules/es-define-property/index.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var GetIntrinsic = __webpack_require__(/*! get-intrinsic */ "./node_modules/get-intrinsic/index.js");

/** @type {import('.')} */
var $defineProperty = GetIntrinsic('%Object.defineProperty%', true) || false;
if ($defineProperty) {
	try {
		$defineProperty({}, 'a', { value: 1 });
	} catch (e) {
		// IE 8 has a broken defineProperty
		$defineProperty = false;
	}
}

module.exports = $defineProperty;


/***/ }),

/***/ "./node_modules/es-errors/eval.js":
/*!****************************************!*\
  !*** ./node_modules/es-errors/eval.js ***!
  \****************************************/
/***/ ((module) => {

"use strict";


/** @type {import('./eval')} */
module.exports = EvalError;


/***/ }),

/***/ "./node_modules/es-errors/index.js":
/*!*****************************************!*\
  !*** ./node_modules/es-errors/index.js ***!
  \*****************************************/
/***/ ((module) => {

"use strict";


/** @type {import('.')} */
module.exports = Error;


/***/ }),

/***/ "./node_modules/es-errors/range.js":
/*!*****************************************!*\
  !*** ./node_modules/es-errors/range.js ***!
  \*****************************************/
/***/ ((module) => {

"use strict";


/** @type {import('./range')} */
module.exports = RangeError;


/***/ }),

/***/ "./node_modules/es-errors/ref.js":
/*!***************************************!*\
  !*** ./node_modules/es-errors/ref.js ***!
  \***************************************/
/***/ ((module) => {

"use strict";


/** @type {import('./ref')} */
module.exports = ReferenceError;


/***/ }),

/***/ "./node_modules/es-errors/syntax.js":
/*!******************************************!*\
  !*** ./node_modules/es-errors/syntax.js ***!
  \******************************************/
/***/ ((module) => {

"use strict";


/** @type {import('./syntax')} */
module.exports = SyntaxError;


/***/ }),

/***/ "./node_modules/es-errors/type.js":
/*!****************************************!*\
  !*** ./node_modules/es-errors/type.js ***!
  \****************************************/
/***/ ((module) => {

"use strict";


/** @type {import('./type')} */
module.exports = TypeError;


/***/ }),

/***/ "./node_modules/es-errors/uri.js":
/*!***************************************!*\
  !*** ./node_modules/es-errors/uri.js ***!
  \***************************************/
/***/ ((module) => {

"use strict";


/** @type {import('./uri')} */
module.exports = URIError;


/***/ }),

/***/ "./node_modules/for-each/index.js":
/*!****************************************!*\
  !*** ./node_modules/for-each/index.js ***!
  \****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var isCallable = __webpack_require__(/*! is-callable */ "./node_modules/is-callable/index.js");

var toStr = Object.prototype.toString;
var hasOwnProperty = Object.prototype.hasOwnProperty;

var forEachArray = function forEachArray(array, iterator, receiver) {
    for (var i = 0, len = array.length; i < len; i++) {
        if (hasOwnProperty.call(array, i)) {
            if (receiver == null) {
                iterator(array[i], i, array);
            } else {
                iterator.call(receiver, array[i], i, array);
            }
        }
    }
};

var forEachString = function forEachString(string, iterator, receiver) {
    for (var i = 0, len = string.length; i < len; i++) {
        // no such thing as a sparse string.
        if (receiver == null) {
            iterator(string.charAt(i), i, string);
        } else {
            iterator.call(receiver, string.charAt(i), i, string);
        }
    }
};

var forEachObject = function forEachObject(object, iterator, receiver) {
    for (var k in object) {
        if (hasOwnProperty.call(object, k)) {
            if (receiver == null) {
                iterator(object[k], k, object);
            } else {
                iterator.call(receiver, object[k], k, object);
            }
        }
    }
};

var forEach = function forEach(list, iterator, thisArg) {
    if (!isCallable(iterator)) {
        throw new TypeError('iterator must be a function');
    }

    var receiver;
    if (arguments.length >= 3) {
        receiver = thisArg;
    }

    if (toStr.call(list) === '[object Array]') {
        forEachArray(list, iterator, receiver);
    } else if (typeof list === 'string') {
        forEachString(list, iterator, receiver);
    } else {
        forEachObject(list, iterator, receiver);
    }
};

module.exports = forEach;


/***/ }),

/***/ "./node_modules/function-bind/implementation.js":
/*!******************************************************!*\
  !*** ./node_modules/function-bind/implementation.js ***!
  \******************************************************/
/***/ ((module) => {

"use strict";


/* eslint no-invalid-this: 1 */

var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible ';
var toStr = Object.prototype.toString;
var max = Math.max;
var funcType = '[object Function]';

var concatty = function concatty(a, b) {
    var arr = [];

    for (var i = 0; i < a.length; i += 1) {
        arr[i] = a[i];
    }
    for (var j = 0; j < b.length; j += 1) {
        arr[j + a.length] = b[j];
    }

    return arr;
};

var slicy = function slicy(arrLike, offset) {
    var arr = [];
    for (var i = offset || 0, j = 0; i < arrLike.length; i += 1, j += 1) {
        arr[j] = arrLike[i];
    }
    return arr;
};

var joiny = function (arr, joiner) {
    var str = '';
    for (var i = 0; i < arr.length; i += 1) {
        str += arr[i];
        if (i + 1 < arr.length) {
            str += joiner;
        }
    }
    return str;
};

module.exports = function bind(that) {
    var target = this;
    if (typeof target !== 'function' || toStr.apply(target) !== funcType) {
        throw new TypeError(ERROR_MESSAGE + target);
    }
    var args = slicy(arguments, 1);

    var bound;
    var binder = function () {
        if (this instanceof bound) {
            var result = target.apply(
                this,
                concatty(args, arguments)
            );
            if (Object(result) === result) {
                return result;
            }
            return this;
        }
        return target.apply(
            that,
            concatty(args, arguments)
        );

    };

    var boundLength = max(0, target.length - args.length);
    var boundArgs = [];
    for (var i = 0; i < boundLength; i++) {
        boundArgs[i] = '$' + i;
    }

    bound = Function('binder', 'return function (' + joiny(boundArgs, ',') + '){ return binder.apply(this,arguments); }')(binder);

    if (target.prototype) {
        var Empty = function Empty() {};
        Empty.prototype = target.prototype;
        bound.prototype = new Empty();
        Empty.prototype = null;
    }

    return bound;
};


/***/ }),

/***/ "./node_modules/function-bind/index.js":
/*!*********************************************!*\
  !*** ./node_modules/function-bind/index.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var implementation = __webpack_require__(/*! ./implementation */ "./node_modules/function-bind/implementation.js");

module.exports = Function.prototype.bind || implementation;


/***/ }),

/***/ "./node_modules/get-intrinsic/index.js":
/*!*********************************************!*\
  !*** ./node_modules/get-intrinsic/index.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var undefined;

var $Error = __webpack_require__(/*! es-errors */ "./node_modules/es-errors/index.js");
var $EvalError = __webpack_require__(/*! es-errors/eval */ "./node_modules/es-errors/eval.js");
var $RangeError = __webpack_require__(/*! es-errors/range */ "./node_modules/es-errors/range.js");
var $ReferenceError = __webpack_require__(/*! es-errors/ref */ "./node_modules/es-errors/ref.js");
var $SyntaxError = __webpack_require__(/*! es-errors/syntax */ "./node_modules/es-errors/syntax.js");
var $TypeError = __webpack_require__(/*! es-errors/type */ "./node_modules/es-errors/type.js");
var $URIError = __webpack_require__(/*! es-errors/uri */ "./node_modules/es-errors/uri.js");

var $Function = Function;

// eslint-disable-next-line consistent-return
var getEvalledConstructor = function (expressionSyntax) {
	try {
		return $Function('"use strict"; return (' + expressionSyntax + ').constructor;')();
	} catch (e) {}
};

var $gOPD = Object.getOwnPropertyDescriptor;
if ($gOPD) {
	try {
		$gOPD({}, '');
	} catch (e) {
		$gOPD = null; // this is IE 8, which has a broken gOPD
	}
}

var throwTypeError = function () {
	throw new $TypeError();
};
var ThrowTypeError = $gOPD
	? (function () {
		try {
			// eslint-disable-next-line no-unused-expressions, no-caller, no-restricted-properties
			arguments.callee; // IE 8 does not throw here
			return throwTypeError;
		} catch (calleeThrows) {
			try {
				// IE 8 throws on Object.getOwnPropertyDescriptor(arguments, '')
				return $gOPD(arguments, 'callee').get;
			} catch (gOPDthrows) {
				return throwTypeError;
			}
		}
	}())
	: throwTypeError;

var hasSymbols = __webpack_require__(/*! has-symbols */ "./node_modules/has-symbols/index.js")();
var hasProto = __webpack_require__(/*! has-proto */ "./node_modules/has-proto/index.js")();

var getProto = Object.getPrototypeOf || (
	hasProto
		? function (x) { return x.__proto__; } // eslint-disable-line no-proto
		: null
);

var needsEval = {};

var TypedArray = typeof Uint8Array === 'undefined' || !getProto ? undefined : getProto(Uint8Array);

var INTRINSICS = {
	__proto__: null,
	'%AggregateError%': typeof AggregateError === 'undefined' ? undefined : AggregateError,
	'%Array%': Array,
	'%ArrayBuffer%': typeof ArrayBuffer === 'undefined' ? undefined : ArrayBuffer,
	'%ArrayIteratorPrototype%': hasSymbols && getProto ? getProto([][Symbol.iterator]()) : undefined,
	'%AsyncFromSyncIteratorPrototype%': undefined,
	'%AsyncFunction%': needsEval,
	'%AsyncGenerator%': needsEval,
	'%AsyncGeneratorFunction%': needsEval,
	'%AsyncIteratorPrototype%': needsEval,
	'%Atomics%': typeof Atomics === 'undefined' ? undefined : Atomics,
	'%BigInt%': typeof BigInt === 'undefined' ? undefined : BigInt,
	'%BigInt64Array%': typeof BigInt64Array === 'undefined' ? undefined : BigInt64Array,
	'%BigUint64Array%': typeof BigUint64Array === 'undefined' ? undefined : BigUint64Array,
	'%Boolean%': Boolean,
	'%DataView%': typeof DataView === 'undefined' ? undefined : DataView,
	'%Date%': Date,
	'%decodeURI%': decodeURI,
	'%decodeURIComponent%': decodeURIComponent,
	'%encodeURI%': encodeURI,
	'%encodeURIComponent%': encodeURIComponent,
	'%Error%': $Error,
	'%eval%': eval, // eslint-disable-line no-eval
	'%EvalError%': $EvalError,
	'%Float32Array%': typeof Float32Array === 'undefined' ? undefined : Float32Array,
	'%Float64Array%': typeof Float64Array === 'undefined' ? undefined : Float64Array,
	'%FinalizationRegistry%': typeof FinalizationRegistry === 'undefined' ? undefined : FinalizationRegistry,
	'%Function%': $Function,
	'%GeneratorFunction%': needsEval,
	'%Int8Array%': typeof Int8Array === 'undefined' ? undefined : Int8Array,
	'%Int16Array%': typeof Int16Array === 'undefined' ? undefined : Int16Array,
	'%Int32Array%': typeof Int32Array === 'undefined' ? undefined : Int32Array,
	'%isFinite%': isFinite,
	'%isNaN%': isNaN,
	'%IteratorPrototype%': hasSymbols && getProto ? getProto(getProto([][Symbol.iterator]())) : undefined,
	'%JSON%': typeof JSON === 'object' ? JSON : undefined,
	'%Map%': typeof Map === 'undefined' ? undefined : Map,
	'%MapIteratorPrototype%': typeof Map === 'undefined' || !hasSymbols || !getProto ? undefined : getProto(new Map()[Symbol.iterator]()),
	'%Math%': Math,
	'%Number%': Number,
	'%Object%': Object,
	'%parseFloat%': parseFloat,
	'%parseInt%': parseInt,
	'%Promise%': typeof Promise === 'undefined' ? undefined : Promise,
	'%Proxy%': typeof Proxy === 'undefined' ? undefined : Proxy,
	'%RangeError%': $RangeError,
	'%ReferenceError%': $ReferenceError,
	'%Reflect%': typeof Reflect === 'undefined' ? undefined : Reflect,
	'%RegExp%': RegExp,
	'%Set%': typeof Set === 'undefined' ? undefined : Set,
	'%SetIteratorPrototype%': typeof Set === 'undefined' || !hasSymbols || !getProto ? undefined : getProto(new Set()[Symbol.iterator]()),
	'%SharedArrayBuffer%': typeof SharedArrayBuffer === 'undefined' ? undefined : SharedArrayBuffer,
	'%String%': String,
	'%StringIteratorPrototype%': hasSymbols && getProto ? getProto(''[Symbol.iterator]()) : undefined,
	'%Symbol%': hasSymbols ? Symbol : undefined,
	'%SyntaxError%': $SyntaxError,
	'%ThrowTypeError%': ThrowTypeError,
	'%TypedArray%': TypedArray,
	'%TypeError%': $TypeError,
	'%Uint8Array%': typeof Uint8Array === 'undefined' ? undefined : Uint8Array,
	'%Uint8ClampedArray%': typeof Uint8ClampedArray === 'undefined' ? undefined : Uint8ClampedArray,
	'%Uint16Array%': typeof Uint16Array === 'undefined' ? undefined : Uint16Array,
	'%Uint32Array%': typeof Uint32Array === 'undefined' ? undefined : Uint32Array,
	'%URIError%': $URIError,
	'%WeakMap%': typeof WeakMap === 'undefined' ? undefined : WeakMap,
	'%WeakRef%': typeof WeakRef === 'undefined' ? undefined : WeakRef,
	'%WeakSet%': typeof WeakSet === 'undefined' ? undefined : WeakSet
};

if (getProto) {
	try {
		null.error; // eslint-disable-line no-unused-expressions
	} catch (e) {
		// https://github.com/tc39/proposal-shadowrealm/pull/384#issuecomment-1364264229
		var errorProto = getProto(getProto(e));
		INTRINSICS['%Error.prototype%'] = errorProto;
	}
}

var doEval = function doEval(name) {
	var value;
	if (name === '%AsyncFunction%') {
		value = getEvalledConstructor('async function () {}');
	} else if (name === '%GeneratorFunction%') {
		value = getEvalledConstructor('function* () {}');
	} else if (name === '%AsyncGeneratorFunction%') {
		value = getEvalledConstructor('async function* () {}');
	} else if (name === '%AsyncGenerator%') {
		var fn = doEval('%AsyncGeneratorFunction%');
		if (fn) {
			value = fn.prototype;
		}
	} else if (name === '%AsyncIteratorPrototype%') {
		var gen = doEval('%AsyncGenerator%');
		if (gen && getProto) {
			value = getProto(gen.prototype);
		}
	}

	INTRINSICS[name] = value;

	return value;
};

var LEGACY_ALIASES = {
	__proto__: null,
	'%ArrayBufferPrototype%': ['ArrayBuffer', 'prototype'],
	'%ArrayPrototype%': ['Array', 'prototype'],
	'%ArrayProto_entries%': ['Array', 'prototype', 'entries'],
	'%ArrayProto_forEach%': ['Array', 'prototype', 'forEach'],
	'%ArrayProto_keys%': ['Array', 'prototype', 'keys'],
	'%ArrayProto_values%': ['Array', 'prototype', 'values'],
	'%AsyncFunctionPrototype%': ['AsyncFunction', 'prototype'],
	'%AsyncGenerator%': ['AsyncGeneratorFunction', 'prototype'],
	'%AsyncGeneratorPrototype%': ['AsyncGeneratorFunction', 'prototype', 'prototype'],
	'%BooleanPrototype%': ['Boolean', 'prototype'],
	'%DataViewPrototype%': ['DataView', 'prototype'],
	'%DatePrototype%': ['Date', 'prototype'],
	'%ErrorPrototype%': ['Error', 'prototype'],
	'%EvalErrorPrototype%': ['EvalError', 'prototype'],
	'%Float32ArrayPrototype%': ['Float32Array', 'prototype'],
	'%Float64ArrayPrototype%': ['Float64Array', 'prototype'],
	'%FunctionPrototype%': ['Function', 'prototype'],
	'%Generator%': ['GeneratorFunction', 'prototype'],
	'%GeneratorPrototype%': ['GeneratorFunction', 'prototype', 'prototype'],
	'%Int8ArrayPrototype%': ['Int8Array', 'prototype'],
	'%Int16ArrayPrototype%': ['Int16Array', 'prototype'],
	'%Int32ArrayPrototype%': ['Int32Array', 'prototype'],
	'%JSONParse%': ['JSON', 'parse'],
	'%JSONStringify%': ['JSON', 'stringify'],
	'%MapPrototype%': ['Map', 'prototype'],
	'%NumberPrototype%': ['Number', 'prototype'],
	'%ObjectPrototype%': ['Object', 'prototype'],
	'%ObjProto_toString%': ['Object', 'prototype', 'toString'],
	'%ObjProto_valueOf%': ['Object', 'prototype', 'valueOf'],
	'%PromisePrototype%': ['Promise', 'prototype'],
	'%PromiseProto_then%': ['Promise', 'prototype', 'then'],
	'%Promise_all%': ['Promise', 'all'],
	'%Promise_reject%': ['Promise', 'reject'],
	'%Promise_resolve%': ['Promise', 'resolve'],
	'%RangeErrorPrototype%': ['RangeError', 'prototype'],
	'%ReferenceErrorPrototype%': ['ReferenceError', 'prototype'],
	'%RegExpPrototype%': ['RegExp', 'prototype'],
	'%SetPrototype%': ['Set', 'prototype'],
	'%SharedArrayBufferPrototype%': ['SharedArrayBuffer', 'prototype'],
	'%StringPrototype%': ['String', 'prototype'],
	'%SymbolPrototype%': ['Symbol', 'prototype'],
	'%SyntaxErrorPrototype%': ['SyntaxError', 'prototype'],
	'%TypedArrayPrototype%': ['TypedArray', 'prototype'],
	'%TypeErrorPrototype%': ['TypeError', 'prototype'],
	'%Uint8ArrayPrototype%': ['Uint8Array', 'prototype'],
	'%Uint8ClampedArrayPrototype%': ['Uint8ClampedArray', 'prototype'],
	'%Uint16ArrayPrototype%': ['Uint16Array', 'prototype'],
	'%Uint32ArrayPrototype%': ['Uint32Array', 'prototype'],
	'%URIErrorPrototype%': ['URIError', 'prototype'],
	'%WeakMapPrototype%': ['WeakMap', 'prototype'],
	'%WeakSetPrototype%': ['WeakSet', 'prototype']
};

var bind = __webpack_require__(/*! function-bind */ "./node_modules/function-bind/index.js");
var hasOwn = __webpack_require__(/*! hasown */ "./node_modules/hasown/index.js");
var $concat = bind.call(Function.call, Array.prototype.concat);
var $spliceApply = bind.call(Function.apply, Array.prototype.splice);
var $replace = bind.call(Function.call, String.prototype.replace);
var $strSlice = bind.call(Function.call, String.prototype.slice);
var $exec = bind.call(Function.call, RegExp.prototype.exec);

/* adapted from https://github.com/lodash/lodash/blob/4.17.15/dist/lodash.js#L6735-L6744 */
var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
var reEscapeChar = /\\(\\)?/g; /** Used to match backslashes in property paths. */
var stringToPath = function stringToPath(string) {
	var first = $strSlice(string, 0, 1);
	var last = $strSlice(string, -1);
	if (first === '%' && last !== '%') {
		throw new $SyntaxError('invalid intrinsic syntax, expected closing `%`');
	} else if (last === '%' && first !== '%') {
		throw new $SyntaxError('invalid intrinsic syntax, expected opening `%`');
	}
	var result = [];
	$replace(string, rePropName, function (match, number, quote, subString) {
		result[result.length] = quote ? $replace(subString, reEscapeChar, '$1') : number || match;
	});
	return result;
};
/* end adaptation */

var getBaseIntrinsic = function getBaseIntrinsic(name, allowMissing) {
	var intrinsicName = name;
	var alias;
	if (hasOwn(LEGACY_ALIASES, intrinsicName)) {
		alias = LEGACY_ALIASES[intrinsicName];
		intrinsicName = '%' + alias[0] + '%';
	}

	if (hasOwn(INTRINSICS, intrinsicName)) {
		var value = INTRINSICS[intrinsicName];
		if (value === needsEval) {
			value = doEval(intrinsicName);
		}
		if (typeof value === 'undefined' && !allowMissing) {
			throw new $TypeError('intrinsic ' + name + ' exists, but is not available. Please file an issue!');
		}

		return {
			alias: alias,
			name: intrinsicName,
			value: value
		};
	}

	throw new $SyntaxError('intrinsic ' + name + ' does not exist!');
};

module.exports = function GetIntrinsic(name, allowMissing) {
	if (typeof name !== 'string' || name.length === 0) {
		throw new $TypeError('intrinsic name must be a non-empty string');
	}
	if (arguments.length > 1 && typeof allowMissing !== 'boolean') {
		throw new $TypeError('"allowMissing" argument must be a boolean');
	}

	if ($exec(/^%?[^%]*%?$/, name) === null) {
		throw new $SyntaxError('`%` may not be present anywhere but at the beginning and end of the intrinsic name');
	}
	var parts = stringToPath(name);
	var intrinsicBaseName = parts.length > 0 ? parts[0] : '';

	var intrinsic = getBaseIntrinsic('%' + intrinsicBaseName + '%', allowMissing);
	var intrinsicRealName = intrinsic.name;
	var value = intrinsic.value;
	var skipFurtherCaching = false;

	var alias = intrinsic.alias;
	if (alias) {
		intrinsicBaseName = alias[0];
		$spliceApply(parts, $concat([0, 1], alias));
	}

	for (var i = 1, isOwn = true; i < parts.length; i += 1) {
		var part = parts[i];
		var first = $strSlice(part, 0, 1);
		var last = $strSlice(part, -1);
		if (
			(
				(first === '"' || first === "'" || first === '`')
				|| (last === '"' || last === "'" || last === '`')
			)
			&& first !== last
		) {
			throw new $SyntaxError('property names with quotes must have matching quotes');
		}
		if (part === 'constructor' || !isOwn) {
			skipFurtherCaching = true;
		}

		intrinsicBaseName += '.' + part;
		intrinsicRealName = '%' + intrinsicBaseName + '%';

		if (hasOwn(INTRINSICS, intrinsicRealName)) {
			value = INTRINSICS[intrinsicRealName];
		} else if (value != null) {
			if (!(part in value)) {
				if (!allowMissing) {
					throw new $TypeError('base intrinsic for ' + name + ' exists, but the property is not available.');
				}
				return void undefined;
			}
			if ($gOPD && (i + 1) >= parts.length) {
				var desc = $gOPD(value, part);
				isOwn = !!desc;

				// By convention, when a data property is converted to an accessor
				// property to emulate a data property that does not suffer from
				// the override mistake, that accessor's getter is marked with
				// an `originalValue` property. Here, when we detect this, we
				// uphold the illusion by pretending to see that original data
				// property, i.e., returning the value rather than the getter
				// itself.
				if (isOwn && 'get' in desc && !('originalValue' in desc.get)) {
					value = desc.get;
				} else {
					value = value[part];
				}
			} else {
				isOwn = hasOwn(value, part);
				value = value[part];
			}

			if (isOwn && !skipFurtherCaching) {
				INTRINSICS[intrinsicRealName] = value;
			}
		}
	}
	return value;
};


/***/ }),

/***/ "./node_modules/gopd/index.js":
/*!************************************!*\
  !*** ./node_modules/gopd/index.js ***!
  \************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var GetIntrinsic = __webpack_require__(/*! get-intrinsic */ "./node_modules/get-intrinsic/index.js");

var $gOPD = GetIntrinsic('%Object.getOwnPropertyDescriptor%', true);

if ($gOPD) {
	try {
		$gOPD([], 'length');
	} catch (e) {
		// IE 8 has a broken gOPD
		$gOPD = null;
	}
}

module.exports = $gOPD;


/***/ }),

/***/ "./node_modules/has-property-descriptors/index.js":
/*!********************************************************!*\
  !*** ./node_modules/has-property-descriptors/index.js ***!
  \********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var $defineProperty = __webpack_require__(/*! es-define-property */ "./node_modules/es-define-property/index.js");

var hasPropertyDescriptors = function hasPropertyDescriptors() {
	return !!$defineProperty;
};

hasPropertyDescriptors.hasArrayLengthDefineBug = function hasArrayLengthDefineBug() {
	// node v0.6 has a bug where array lengths can be Set but not Defined
	if (!$defineProperty) {
		return null;
	}
	try {
		return $defineProperty([], 'length', { value: 1 }).length !== 1;
	} catch (e) {
		// In Firefox 4-22, defining length on an array throws an exception.
		return true;
	}
};

module.exports = hasPropertyDescriptors;


/***/ }),

/***/ "./node_modules/has-proto/index.js":
/*!*****************************************!*\
  !*** ./node_modules/has-proto/index.js ***!
  \*****************************************/
/***/ ((module) => {

"use strict";


var test = {
	__proto__: null,
	foo: {}
};

var $Object = Object;

/** @type {import('.')} */
module.exports = function hasProto() {
	// @ts-expect-error: TS errors on an inherited property for some reason
	return { __proto__: test }.foo === test.foo
		&& !(test instanceof $Object);
};


/***/ }),

/***/ "./node_modules/has-symbols/index.js":
/*!*******************************************!*\
  !*** ./node_modules/has-symbols/index.js ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var origSymbol = typeof Symbol !== 'undefined' && Symbol;
var hasSymbolSham = __webpack_require__(/*! ./shams */ "./node_modules/has-symbols/shams.js");

module.exports = function hasNativeSymbols() {
	if (typeof origSymbol !== 'function') { return false; }
	if (typeof Symbol !== 'function') { return false; }
	if (typeof origSymbol('foo') !== 'symbol') { return false; }
	if (typeof Symbol('bar') !== 'symbol') { return false; }

	return hasSymbolSham();
};


/***/ }),

/***/ "./node_modules/has-symbols/shams.js":
/*!*******************************************!*\
  !*** ./node_modules/has-symbols/shams.js ***!
  \*******************************************/
/***/ ((module) => {

"use strict";


/* eslint complexity: [2, 18], max-statements: [2, 33] */
module.exports = function hasSymbols() {
	if (typeof Symbol !== 'function' || typeof Object.getOwnPropertySymbols !== 'function') { return false; }
	if (typeof Symbol.iterator === 'symbol') { return true; }

	var obj = {};
	var sym = Symbol('test');
	var symObj = Object(sym);
	if (typeof sym === 'string') { return false; }

	if (Object.prototype.toString.call(sym) !== '[object Symbol]') { return false; }
	if (Object.prototype.toString.call(symObj) !== '[object Symbol]') { return false; }

	// temp disabled per https://github.com/ljharb/object.assign/issues/17
	// if (sym instanceof Symbol) { return false; }
	// temp disabled per https://github.com/WebReflection/get-own-property-symbols/issues/4
	// if (!(symObj instanceof Symbol)) { return false; }

	// if (typeof Symbol.prototype.toString !== 'function') { return false; }
	// if (String(sym) !== Symbol.prototype.toString.call(sym)) { return false; }

	var symVal = 42;
	obj[sym] = symVal;
	for (sym in obj) { return false; } // eslint-disable-line no-restricted-syntax, no-unreachable-loop
	if (typeof Object.keys === 'function' && Object.keys(obj).length !== 0) { return false; }

	if (typeof Object.getOwnPropertyNames === 'function' && Object.getOwnPropertyNames(obj).length !== 0) { return false; }

	var syms = Object.getOwnPropertySymbols(obj);
	if (syms.length !== 1 || syms[0] !== sym) { return false; }

	if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) { return false; }

	if (typeof Object.getOwnPropertyDescriptor === 'function') {
		var descriptor = Object.getOwnPropertyDescriptor(obj, sym);
		if (descriptor.value !== symVal || descriptor.enumerable !== true) { return false; }
	}

	return true;
};


/***/ }),

/***/ "./node_modules/has-tostringtag/shams.js":
/*!***********************************************!*\
  !*** ./node_modules/has-tostringtag/shams.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var hasSymbols = __webpack_require__(/*! has-symbols/shams */ "./node_modules/has-symbols/shams.js");

/** @type {import('.')} */
module.exports = function hasToStringTagShams() {
	return hasSymbols() && !!Symbol.toStringTag;
};


/***/ }),

/***/ "./node_modules/hasown/index.js":
/*!**************************************!*\
  !*** ./node_modules/hasown/index.js ***!
  \**************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var call = Function.prototype.call;
var $hasOwn = Object.prototype.hasOwnProperty;
var bind = __webpack_require__(/*! function-bind */ "./node_modules/function-bind/index.js");

/** @type {import('.')} */
module.exports = bind.call(call, $hasOwn);


/***/ }),

/***/ "./node_modules/inherits/inherits_browser.js":
/*!***************************************************!*\
  !*** ./node_modules/inherits/inherits_browser.js ***!
  \***************************************************/
/***/ ((module) => {

if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      })
    }
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor
      var TempCtor = function () {}
      TempCtor.prototype = superCtor.prototype
      ctor.prototype = new TempCtor()
      ctor.prototype.constructor = ctor
    }
  }
}


/***/ }),

/***/ "./node_modules/is-arguments/index.js":
/*!********************************************!*\
  !*** ./node_modules/is-arguments/index.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var hasToStringTag = __webpack_require__(/*! has-tostringtag/shams */ "./node_modules/has-tostringtag/shams.js")();
var callBound = __webpack_require__(/*! call-bind/callBound */ "./node_modules/call-bind/callBound.js");

var $toString = callBound('Object.prototype.toString');

var isStandardArguments = function isArguments(value) {
	if (hasToStringTag && value && typeof value === 'object' && Symbol.toStringTag in value) {
		return false;
	}
	return $toString(value) === '[object Arguments]';
};

var isLegacyArguments = function isArguments(value) {
	if (isStandardArguments(value)) {
		return true;
	}
	return value !== null &&
		typeof value === 'object' &&
		typeof value.length === 'number' &&
		value.length >= 0 &&
		$toString(value) !== '[object Array]' &&
		$toString(value.callee) === '[object Function]';
};

var supportsStandardArguments = (function () {
	return isStandardArguments(arguments);
}());

isStandardArguments.isLegacyArguments = isLegacyArguments; // for tests

module.exports = supportsStandardArguments ? isStandardArguments : isLegacyArguments;


/***/ }),

/***/ "./node_modules/is-callable/index.js":
/*!*******************************************!*\
  !*** ./node_modules/is-callable/index.js ***!
  \*******************************************/
/***/ ((module) => {

"use strict";


var fnToStr = Function.prototype.toString;
var reflectApply = typeof Reflect === 'object' && Reflect !== null && Reflect.apply;
var badArrayLike;
var isCallableMarker;
if (typeof reflectApply === 'function' && typeof Object.defineProperty === 'function') {
	try {
		badArrayLike = Object.defineProperty({}, 'length', {
			get: function () {
				throw isCallableMarker;
			}
		});
		isCallableMarker = {};
		// eslint-disable-next-line no-throw-literal
		reflectApply(function () { throw 42; }, null, badArrayLike);
	} catch (_) {
		if (_ !== isCallableMarker) {
			reflectApply = null;
		}
	}
} else {
	reflectApply = null;
}

var constructorRegex = /^\s*class\b/;
var isES6ClassFn = function isES6ClassFunction(value) {
	try {
		var fnStr = fnToStr.call(value);
		return constructorRegex.test(fnStr);
	} catch (e) {
		return false; // not a function
	}
};

var tryFunctionObject = function tryFunctionToStr(value) {
	try {
		if (isES6ClassFn(value)) { return false; }
		fnToStr.call(value);
		return true;
	} catch (e) {
		return false;
	}
};
var toStr = Object.prototype.toString;
var objectClass = '[object Object]';
var fnClass = '[object Function]';
var genClass = '[object GeneratorFunction]';
var ddaClass = '[object HTMLAllCollection]'; // IE 11
var ddaClass2 = '[object HTML document.all class]';
var ddaClass3 = '[object HTMLCollection]'; // IE 9-10
var hasToStringTag = typeof Symbol === 'function' && !!Symbol.toStringTag; // better: use `has-tostringtag`

var isIE68 = !(0 in [,]); // eslint-disable-line no-sparse-arrays, comma-spacing

var isDDA = function isDocumentDotAll() { return false; };
if (typeof document === 'object') {
	// Firefox 3 canonicalizes DDA to undefined when it's not accessed directly
	var all = document.all;
	if (toStr.call(all) === toStr.call(document.all)) {
		isDDA = function isDocumentDotAll(value) {
			/* globals document: false */
			// in IE 6-8, typeof document.all is "object" and it's truthy
			if ((isIE68 || !value) && (typeof value === 'undefined' || typeof value === 'object')) {
				try {
					var str = toStr.call(value);
					return (
						str === ddaClass
						|| str === ddaClass2
						|| str === ddaClass3 // opera 12.16
						|| str === objectClass // IE 6-8
					) && value('') == null; // eslint-disable-line eqeqeq
				} catch (e) { /**/ }
			}
			return false;
		};
	}
}

module.exports = reflectApply
	? function isCallable(value) {
		if (isDDA(value)) { return true; }
		if (!value) { return false; }
		if (typeof value !== 'function' && typeof value !== 'object') { return false; }
		try {
			reflectApply(value, null, badArrayLike);
		} catch (e) {
			if (e !== isCallableMarker) { return false; }
		}
		return !isES6ClassFn(value) && tryFunctionObject(value);
	}
	: function isCallable(value) {
		if (isDDA(value)) { return true; }
		if (!value) { return false; }
		if (typeof value !== 'function' && typeof value !== 'object') { return false; }
		if (hasToStringTag) { return tryFunctionObject(value); }
		if (isES6ClassFn(value)) { return false; }
		var strClass = toStr.call(value);
		if (strClass !== fnClass && strClass !== genClass && !(/^\[object HTML/).test(strClass)) { return false; }
		return tryFunctionObject(value);
	};


/***/ }),

/***/ "./node_modules/is-generator-function/index.js":
/*!*****************************************************!*\
  !*** ./node_modules/is-generator-function/index.js ***!
  \*****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var toStr = Object.prototype.toString;
var fnToStr = Function.prototype.toString;
var isFnRegex = /^\s*(?:function)?\*/;
var hasToStringTag = __webpack_require__(/*! has-tostringtag/shams */ "./node_modules/has-tostringtag/shams.js")();
var getProto = Object.getPrototypeOf;
var getGeneratorFunc = function () { // eslint-disable-line consistent-return
	if (!hasToStringTag) {
		return false;
	}
	try {
		return Function('return function*() {}')();
	} catch (e) {
	}
};
var GeneratorFunction;

module.exports = function isGeneratorFunction(fn) {
	if (typeof fn !== 'function') {
		return false;
	}
	if (isFnRegex.test(fnToStr.call(fn))) {
		return true;
	}
	if (!hasToStringTag) {
		var str = toStr.call(fn);
		return str === '[object GeneratorFunction]';
	}
	if (!getProto) {
		return false;
	}
	if (typeof GeneratorFunction === 'undefined') {
		var generatorFunc = getGeneratorFunc();
		GeneratorFunction = generatorFunc ? getProto(generatorFunc) : false;
	}
	return getProto(fn) === GeneratorFunction;
};


/***/ }),

/***/ "./node_modules/is-nan/implementation.js":
/*!***********************************************!*\
  !*** ./node_modules/is-nan/implementation.js ***!
  \***********************************************/
/***/ ((module) => {

"use strict";


/* http://www.ecma-international.org/ecma-262/6.0/#sec-number.isnan */

module.exports = function isNaN(value) {
	return value !== value;
};


/***/ }),

/***/ "./node_modules/is-nan/index.js":
/*!**************************************!*\
  !*** ./node_modules/is-nan/index.js ***!
  \**************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var callBind = __webpack_require__(/*! call-bind */ "./node_modules/call-bind/index.js");
var define = __webpack_require__(/*! define-properties */ "./node_modules/define-properties/index.js");

var implementation = __webpack_require__(/*! ./implementation */ "./node_modules/is-nan/implementation.js");
var getPolyfill = __webpack_require__(/*! ./polyfill */ "./node_modules/is-nan/polyfill.js");
var shim = __webpack_require__(/*! ./shim */ "./node_modules/is-nan/shim.js");

var polyfill = callBind(getPolyfill(), Number);

/* http://www.ecma-international.org/ecma-262/6.0/#sec-number.isnan */

define(polyfill, {
	getPolyfill: getPolyfill,
	implementation: implementation,
	shim: shim
});

module.exports = polyfill;


/***/ }),

/***/ "./node_modules/is-nan/polyfill.js":
/*!*****************************************!*\
  !*** ./node_modules/is-nan/polyfill.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var implementation = __webpack_require__(/*! ./implementation */ "./node_modules/is-nan/implementation.js");

module.exports = function getPolyfill() {
	if (Number.isNaN && Number.isNaN(NaN) && !Number.isNaN('a')) {
		return Number.isNaN;
	}
	return implementation;
};


/***/ }),

/***/ "./node_modules/is-nan/shim.js":
/*!*************************************!*\
  !*** ./node_modules/is-nan/shim.js ***!
  \*************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var define = __webpack_require__(/*! define-properties */ "./node_modules/define-properties/index.js");
var getPolyfill = __webpack_require__(/*! ./polyfill */ "./node_modules/is-nan/polyfill.js");

/* http://www.ecma-international.org/ecma-262/6.0/#sec-number.isnan */

module.exports = function shimNumberIsNaN() {
	var polyfill = getPolyfill();
	define(Number, { isNaN: polyfill }, {
		isNaN: function testIsNaN() {
			return Number.isNaN !== polyfill;
		}
	});
	return polyfill;
};


/***/ }),

/***/ "./node_modules/is-typed-array/index.js":
/*!**********************************************!*\
  !*** ./node_modules/is-typed-array/index.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var whichTypedArray = __webpack_require__(/*! which-typed-array */ "./node_modules/which-typed-array/index.js");

/** @type {import('.')} */
module.exports = function isTypedArray(value) {
	return !!whichTypedArray(value);
};


/***/ }),

/***/ "./node_modules/object-is/implementation.js":
/*!**************************************************!*\
  !*** ./node_modules/object-is/implementation.js ***!
  \**************************************************/
/***/ ((module) => {

"use strict";


var numberIsNaN = function (value) {
	return value !== value;
};

module.exports = function is(a, b) {
	if (a === 0 && b === 0) {
		return 1 / a === 1 / b;
	}
	if (a === b) {
		return true;
	}
	if (numberIsNaN(a) && numberIsNaN(b)) {
		return true;
	}
	return false;
};



/***/ }),

/***/ "./node_modules/object-is/index.js":
/*!*****************************************!*\
  !*** ./node_modules/object-is/index.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var define = __webpack_require__(/*! define-properties */ "./node_modules/define-properties/index.js");
var callBind = __webpack_require__(/*! call-bind */ "./node_modules/call-bind/index.js");

var implementation = __webpack_require__(/*! ./implementation */ "./node_modules/object-is/implementation.js");
var getPolyfill = __webpack_require__(/*! ./polyfill */ "./node_modules/object-is/polyfill.js");
var shim = __webpack_require__(/*! ./shim */ "./node_modules/object-is/shim.js");

var polyfill = callBind(getPolyfill(), Object);

define(polyfill, {
	getPolyfill: getPolyfill,
	implementation: implementation,
	shim: shim
});

module.exports = polyfill;


/***/ }),

/***/ "./node_modules/object-is/polyfill.js":
/*!********************************************!*\
  !*** ./node_modules/object-is/polyfill.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var implementation = __webpack_require__(/*! ./implementation */ "./node_modules/object-is/implementation.js");

module.exports = function getPolyfill() {
	return typeof Object.is === 'function' ? Object.is : implementation;
};


/***/ }),

/***/ "./node_modules/object-is/shim.js":
/*!****************************************!*\
  !*** ./node_modules/object-is/shim.js ***!
  \****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var getPolyfill = __webpack_require__(/*! ./polyfill */ "./node_modules/object-is/polyfill.js");
var define = __webpack_require__(/*! define-properties */ "./node_modules/define-properties/index.js");

module.exports = function shimObjectIs() {
	var polyfill = getPolyfill();
	define(Object, { is: polyfill }, {
		is: function testObjectIs() {
			return Object.is !== polyfill;
		}
	});
	return polyfill;
};


/***/ }),

/***/ "./node_modules/object-keys/implementation.js":
/*!****************************************************!*\
  !*** ./node_modules/object-keys/implementation.js ***!
  \****************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var keysShim;
if (!Object.keys) {
	// modified from https://github.com/es-shims/es5-shim
	var has = Object.prototype.hasOwnProperty;
	var toStr = Object.prototype.toString;
	var isArgs = __webpack_require__(/*! ./isArguments */ "./node_modules/object-keys/isArguments.js"); // eslint-disable-line global-require
	var isEnumerable = Object.prototype.propertyIsEnumerable;
	var hasDontEnumBug = !isEnumerable.call({ toString: null }, 'toString');
	var hasProtoEnumBug = isEnumerable.call(function () {}, 'prototype');
	var dontEnums = [
		'toString',
		'toLocaleString',
		'valueOf',
		'hasOwnProperty',
		'isPrototypeOf',
		'propertyIsEnumerable',
		'constructor'
	];
	var equalsConstructorPrototype = function (o) {
		var ctor = o.constructor;
		return ctor && ctor.prototype === o;
	};
	var excludedKeys = {
		$applicationCache: true,
		$console: true,
		$external: true,
		$frame: true,
		$frameElement: true,
		$frames: true,
		$innerHeight: true,
		$innerWidth: true,
		$onmozfullscreenchange: true,
		$onmozfullscreenerror: true,
		$outerHeight: true,
		$outerWidth: true,
		$pageXOffset: true,
		$pageYOffset: true,
		$parent: true,
		$scrollLeft: true,
		$scrollTop: true,
		$scrollX: true,
		$scrollY: true,
		$self: true,
		$webkitIndexedDB: true,
		$webkitStorageInfo: true,
		$window: true
	};
	var hasAutomationEqualityBug = (function () {
		/* global window */
		if (typeof window === 'undefined') { return false; }
		for (var k in window) {
			try {
				if (!excludedKeys['$' + k] && has.call(window, k) && window[k] !== null && typeof window[k] === 'object') {
					try {
						equalsConstructorPrototype(window[k]);
					} catch (e) {
						return true;
					}
				}
			} catch (e) {
				return true;
			}
		}
		return false;
	}());
	var equalsConstructorPrototypeIfNotBuggy = function (o) {
		/* global window */
		if (typeof window === 'undefined' || !hasAutomationEqualityBug) {
			return equalsConstructorPrototype(o);
		}
		try {
			return equalsConstructorPrototype(o);
		} catch (e) {
			return false;
		}
	};

	keysShim = function keys(object) {
		var isObject = object !== null && typeof object === 'object';
		var isFunction = toStr.call(object) === '[object Function]';
		var isArguments = isArgs(object);
		var isString = isObject && toStr.call(object) === '[object String]';
		var theKeys = [];

		if (!isObject && !isFunction && !isArguments) {
			throw new TypeError('Object.keys called on a non-object');
		}

		var skipProto = hasProtoEnumBug && isFunction;
		if (isString && object.length > 0 && !has.call(object, 0)) {
			for (var i = 0; i < object.length; ++i) {
				theKeys.push(String(i));
			}
		}

		if (isArguments && object.length > 0) {
			for (var j = 0; j < object.length; ++j) {
				theKeys.push(String(j));
			}
		} else {
			for (var name in object) {
				if (!(skipProto && name === 'prototype') && has.call(object, name)) {
					theKeys.push(String(name));
				}
			}
		}

		if (hasDontEnumBug) {
			var skipConstructor = equalsConstructorPrototypeIfNotBuggy(object);

			for (var k = 0; k < dontEnums.length; ++k) {
				if (!(skipConstructor && dontEnums[k] === 'constructor') && has.call(object, dontEnums[k])) {
					theKeys.push(dontEnums[k]);
				}
			}
		}
		return theKeys;
	};
}
module.exports = keysShim;


/***/ }),

/***/ "./node_modules/object-keys/index.js":
/*!*******************************************!*\
  !*** ./node_modules/object-keys/index.js ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var slice = Array.prototype.slice;
var isArgs = __webpack_require__(/*! ./isArguments */ "./node_modules/object-keys/isArguments.js");

var origKeys = Object.keys;
var keysShim = origKeys ? function keys(o) { return origKeys(o); } : __webpack_require__(/*! ./implementation */ "./node_modules/object-keys/implementation.js");

var originalKeys = Object.keys;

keysShim.shim = function shimObjectKeys() {
	if (Object.keys) {
		var keysWorksWithArguments = (function () {
			// Safari 5.0 bug
			var args = Object.keys(arguments);
			return args && args.length === arguments.length;
		}(1, 2));
		if (!keysWorksWithArguments) {
			Object.keys = function keys(object) { // eslint-disable-line func-name-matching
				if (isArgs(object)) {
					return originalKeys(slice.call(object));
				}
				return originalKeys(object);
			};
		}
	} else {
		Object.keys = keysShim;
	}
	return Object.keys || keysShim;
};

module.exports = keysShim;


/***/ }),

/***/ "./node_modules/object-keys/isArguments.js":
/*!*************************************************!*\
  !*** ./node_modules/object-keys/isArguments.js ***!
  \*************************************************/
/***/ ((module) => {

"use strict";


var toStr = Object.prototype.toString;

module.exports = function isArguments(value) {
	var str = toStr.call(value);
	var isArgs = str === '[object Arguments]';
	if (!isArgs) {
		isArgs = str !== '[object Array]' &&
			value !== null &&
			typeof value === 'object' &&
			typeof value.length === 'number' &&
			value.length >= 0 &&
			toStr.call(value.callee) === '[object Function]';
	}
	return isArgs;
};


/***/ }),

/***/ "./node_modules/object.assign/implementation.js":
/*!******************************************************!*\
  !*** ./node_modules/object.assign/implementation.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


// modified from https://github.com/es-shims/es6-shim
var objectKeys = __webpack_require__(/*! object-keys */ "./node_modules/object-keys/index.js");
var hasSymbols = __webpack_require__(/*! has-symbols/shams */ "./node_modules/has-symbols/shams.js")();
var callBound = __webpack_require__(/*! call-bind/callBound */ "./node_modules/call-bind/callBound.js");
var toObject = Object;
var $push = callBound('Array.prototype.push');
var $propIsEnumerable = callBound('Object.prototype.propertyIsEnumerable');
var originalGetSymbols = hasSymbols ? Object.getOwnPropertySymbols : null;

// eslint-disable-next-line no-unused-vars
module.exports = function assign(target, source1) {
	if (target == null) { throw new TypeError('target must be an object'); }
	var to = toObject(target); // step 1
	if (arguments.length === 1) {
		return to; // step 2
	}
	for (var s = 1; s < arguments.length; ++s) {
		var from = toObject(arguments[s]); // step 3.a.i

		// step 3.a.ii:
		var keys = objectKeys(from);
		var getSymbols = hasSymbols && (Object.getOwnPropertySymbols || originalGetSymbols);
		if (getSymbols) {
			var syms = getSymbols(from);
			for (var j = 0; j < syms.length; ++j) {
				var key = syms[j];
				if ($propIsEnumerable(from, key)) {
					$push(keys, key);
				}
			}
		}

		// step 3.a.iii:
		for (var i = 0; i < keys.length; ++i) {
			var nextKey = keys[i];
			if ($propIsEnumerable(from, nextKey)) { // step 3.a.iii.2
				var propValue = from[nextKey]; // step 3.a.iii.2.a
				to[nextKey] = propValue; // step 3.a.iii.2.b
			}
		}
	}

	return to; // step 4
};


/***/ }),

/***/ "./node_modules/object.assign/polyfill.js":
/*!************************************************!*\
  !*** ./node_modules/object.assign/polyfill.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var implementation = __webpack_require__(/*! ./implementation */ "./node_modules/object.assign/implementation.js");

var lacksProperEnumerationOrder = function () {
	if (!Object.assign) {
		return false;
	}
	/*
	 * v8, specifically in node 4.x, has a bug with incorrect property enumeration order
	 * note: this does not detect the bug unless there's 20 characters
	 */
	var str = 'abcdefghijklmnopqrst';
	var letters = str.split('');
	var map = {};
	for (var i = 0; i < letters.length; ++i) {
		map[letters[i]] = letters[i];
	}
	var obj = Object.assign({}, map);
	var actual = '';
	for (var k in obj) {
		actual += k;
	}
	return str !== actual;
};

var assignHasPendingExceptions = function () {
	if (!Object.assign || !Object.preventExtensions) {
		return false;
	}
	/*
	 * Firefox 37 still has "pending exception" logic in its Object.assign implementation,
	 * which is 72% slower than our shim, and Firefox 40's native implementation.
	 */
	var thrower = Object.preventExtensions({ 1: 2 });
	try {
		Object.assign(thrower, 'xy');
	} catch (e) {
		return thrower[1] === 'y';
	}
	return false;
};

module.exports = function getPolyfill() {
	if (!Object.assign) {
		return implementation;
	}
	if (lacksProperEnumerationOrder()) {
		return implementation;
	}
	if (assignHasPendingExceptions()) {
		return implementation;
	}
	return Object.assign;
};


/***/ }),

/***/ "./node_modules/possible-typed-array-names/index.js":
/*!**********************************************************!*\
  !*** ./node_modules/possible-typed-array-names/index.js ***!
  \**********************************************************/
/***/ ((module) => {

"use strict";


/** @type {import('.')} */
module.exports = [
	'Float32Array',
	'Float64Array',
	'Int8Array',
	'Int16Array',
	'Int32Array',
	'Uint8Array',
	'Uint8ClampedArray',
	'Uint16Array',
	'Uint32Array',
	'BigInt64Array',
	'BigUint64Array'
];


/***/ }),

/***/ "./node_modules/process/browser.js":
/*!*****************************************!*\
  !*** ./node_modules/process/browser.js ***!
  \*****************************************/
/***/ ((module) => {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),

/***/ "./node_modules/set-function-length/index.js":
/*!***************************************************!*\
  !*** ./node_modules/set-function-length/index.js ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var GetIntrinsic = __webpack_require__(/*! get-intrinsic */ "./node_modules/get-intrinsic/index.js");
var define = __webpack_require__(/*! define-data-property */ "./node_modules/define-data-property/index.js");
var hasDescriptors = __webpack_require__(/*! has-property-descriptors */ "./node_modules/has-property-descriptors/index.js")();
var gOPD = __webpack_require__(/*! gopd */ "./node_modules/gopd/index.js");

var $TypeError = __webpack_require__(/*! es-errors/type */ "./node_modules/es-errors/type.js");
var $floor = GetIntrinsic('%Math.floor%');

/** @typedef {(...args: unknown[]) => unknown} Func */

/** @type {<T extends Func = Func>(fn: T, length: number, loose?: boolean) => T} */
module.exports = function setFunctionLength(fn, length) {
	if (typeof fn !== 'function') {
		throw new $TypeError('`fn` is not a function');
	}
	if (typeof length !== 'number' || length < 0 || length > 0xFFFFFFFF || $floor(length) !== length) {
		throw new $TypeError('`length` must be a positive 32-bit integer');
	}

	var loose = arguments.length > 2 && !!arguments[2];

	var functionLengthIsConfigurable = true;
	var functionLengthIsWritable = true;
	if ('length' in fn && gOPD) {
		var desc = gOPD(fn, 'length');
		if (desc && !desc.configurable) {
			functionLengthIsConfigurable = false;
		}
		if (desc && !desc.writable) {
			functionLengthIsWritable = false;
		}
	}

	if (functionLengthIsConfigurable || functionLengthIsWritable || !loose) {
		if (hasDescriptors) {
			define(/** @type {Parameters<define>[0]} */ (fn), 'length', length, true, true);
		} else {
			define(/** @type {Parameters<define>[0]} */ (fn), 'length', length);
		}
	}
	return fn;
};


/***/ }),

/***/ "./node_modules/util/support/isBufferBrowser.js":
/*!******************************************************!*\
  !*** ./node_modules/util/support/isBufferBrowser.js ***!
  \******************************************************/
/***/ ((module) => {

module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}

/***/ }),

/***/ "./node_modules/util/support/types.js":
/*!********************************************!*\
  !*** ./node_modules/util/support/types.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
// Currently in sync with Node.js lib/internal/util/types.js
// https://github.com/nodejs/node/commit/112cc7c27551254aa2b17098fb774867f05ed0d9



var isArgumentsObject = __webpack_require__(/*! is-arguments */ "./node_modules/is-arguments/index.js");
var isGeneratorFunction = __webpack_require__(/*! is-generator-function */ "./node_modules/is-generator-function/index.js");
var whichTypedArray = __webpack_require__(/*! which-typed-array */ "./node_modules/which-typed-array/index.js");
var isTypedArray = __webpack_require__(/*! is-typed-array */ "./node_modules/is-typed-array/index.js");

function uncurryThis(f) {
  return f.call.bind(f);
}

var BigIntSupported = typeof BigInt !== 'undefined';
var SymbolSupported = typeof Symbol !== 'undefined';

var ObjectToString = uncurryThis(Object.prototype.toString);

var numberValue = uncurryThis(Number.prototype.valueOf);
var stringValue = uncurryThis(String.prototype.valueOf);
var booleanValue = uncurryThis(Boolean.prototype.valueOf);

if (BigIntSupported) {
  var bigIntValue = uncurryThis(BigInt.prototype.valueOf);
}

if (SymbolSupported) {
  var symbolValue = uncurryThis(Symbol.prototype.valueOf);
}

function checkBoxedPrimitive(value, prototypeValueOf) {
  if (typeof value !== 'object') {
    return false;
  }
  try {
    prototypeValueOf(value);
    return true;
  } catch(e) {
    return false;
  }
}

exports.isArgumentsObject = isArgumentsObject;
exports.isGeneratorFunction = isGeneratorFunction;
exports.isTypedArray = isTypedArray;

// Taken from here and modified for better browser support
// https://github.com/sindresorhus/p-is-promise/blob/cda35a513bda03f977ad5cde3a079d237e82d7ef/index.js
function isPromise(input) {
	return (
		(
			typeof Promise !== 'undefined' &&
			input instanceof Promise
		) ||
		(
			input !== null &&
			typeof input === 'object' &&
			typeof input.then === 'function' &&
			typeof input.catch === 'function'
		)
	);
}
exports.isPromise = isPromise;

function isArrayBufferView(value) {
  if (typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView) {
    return ArrayBuffer.isView(value);
  }

  return (
    isTypedArray(value) ||
    isDataView(value)
  );
}
exports.isArrayBufferView = isArrayBufferView;


function isUint8Array(value) {
  return whichTypedArray(value) === 'Uint8Array';
}
exports.isUint8Array = isUint8Array;

function isUint8ClampedArray(value) {
  return whichTypedArray(value) === 'Uint8ClampedArray';
}
exports.isUint8ClampedArray = isUint8ClampedArray;

function isUint16Array(value) {
  return whichTypedArray(value) === 'Uint16Array';
}
exports.isUint16Array = isUint16Array;

function isUint32Array(value) {
  return whichTypedArray(value) === 'Uint32Array';
}
exports.isUint32Array = isUint32Array;

function isInt8Array(value) {
  return whichTypedArray(value) === 'Int8Array';
}
exports.isInt8Array = isInt8Array;

function isInt16Array(value) {
  return whichTypedArray(value) === 'Int16Array';
}
exports.isInt16Array = isInt16Array;

function isInt32Array(value) {
  return whichTypedArray(value) === 'Int32Array';
}
exports.isInt32Array = isInt32Array;

function isFloat32Array(value) {
  return whichTypedArray(value) === 'Float32Array';
}
exports.isFloat32Array = isFloat32Array;

function isFloat64Array(value) {
  return whichTypedArray(value) === 'Float64Array';
}
exports.isFloat64Array = isFloat64Array;

function isBigInt64Array(value) {
  return whichTypedArray(value) === 'BigInt64Array';
}
exports.isBigInt64Array = isBigInt64Array;

function isBigUint64Array(value) {
  return whichTypedArray(value) === 'BigUint64Array';
}
exports.isBigUint64Array = isBigUint64Array;

function isMapToString(value) {
  return ObjectToString(value) === '[object Map]';
}
isMapToString.working = (
  typeof Map !== 'undefined' &&
  isMapToString(new Map())
);

function isMap(value) {
  if (typeof Map === 'undefined') {
    return false;
  }

  return isMapToString.working
    ? isMapToString(value)
    : value instanceof Map;
}
exports.isMap = isMap;

function isSetToString(value) {
  return ObjectToString(value) === '[object Set]';
}
isSetToString.working = (
  typeof Set !== 'undefined' &&
  isSetToString(new Set())
);
function isSet(value) {
  if (typeof Set === 'undefined') {
    return false;
  }

  return isSetToString.working
    ? isSetToString(value)
    : value instanceof Set;
}
exports.isSet = isSet;

function isWeakMapToString(value) {
  return ObjectToString(value) === '[object WeakMap]';
}
isWeakMapToString.working = (
  typeof WeakMap !== 'undefined' &&
  isWeakMapToString(new WeakMap())
);
function isWeakMap(value) {
  if (typeof WeakMap === 'undefined') {
    return false;
  }

  return isWeakMapToString.working
    ? isWeakMapToString(value)
    : value instanceof WeakMap;
}
exports.isWeakMap = isWeakMap;

function isWeakSetToString(value) {
  return ObjectToString(value) === '[object WeakSet]';
}
isWeakSetToString.working = (
  typeof WeakSet !== 'undefined' &&
  isWeakSetToString(new WeakSet())
);
function isWeakSet(value) {
  return isWeakSetToString(value);
}
exports.isWeakSet = isWeakSet;

function isArrayBufferToString(value) {
  return ObjectToString(value) === '[object ArrayBuffer]';
}
isArrayBufferToString.working = (
  typeof ArrayBuffer !== 'undefined' &&
  isArrayBufferToString(new ArrayBuffer())
);
function isArrayBuffer(value) {
  if (typeof ArrayBuffer === 'undefined') {
    return false;
  }

  return isArrayBufferToString.working
    ? isArrayBufferToString(value)
    : value instanceof ArrayBuffer;
}
exports.isArrayBuffer = isArrayBuffer;

function isDataViewToString(value) {
  return ObjectToString(value) === '[object DataView]';
}
isDataViewToString.working = (
  typeof ArrayBuffer !== 'undefined' &&
  typeof DataView !== 'undefined' &&
  isDataViewToString(new DataView(new ArrayBuffer(1), 0, 1))
);
function isDataView(value) {
  if (typeof DataView === 'undefined') {
    return false;
  }

  return isDataViewToString.working
    ? isDataViewToString(value)
    : value instanceof DataView;
}
exports.isDataView = isDataView;

// Store a copy of SharedArrayBuffer in case it's deleted elsewhere
var SharedArrayBufferCopy = typeof SharedArrayBuffer !== 'undefined' ? SharedArrayBuffer : undefined;
function isSharedArrayBufferToString(value) {
  return ObjectToString(value) === '[object SharedArrayBuffer]';
}
function isSharedArrayBuffer(value) {
  if (typeof SharedArrayBufferCopy === 'undefined') {
    return false;
  }

  if (typeof isSharedArrayBufferToString.working === 'undefined') {
    isSharedArrayBufferToString.working = isSharedArrayBufferToString(new SharedArrayBufferCopy());
  }

  return isSharedArrayBufferToString.working
    ? isSharedArrayBufferToString(value)
    : value instanceof SharedArrayBufferCopy;
}
exports.isSharedArrayBuffer = isSharedArrayBuffer;

function isAsyncFunction(value) {
  return ObjectToString(value) === '[object AsyncFunction]';
}
exports.isAsyncFunction = isAsyncFunction;

function isMapIterator(value) {
  return ObjectToString(value) === '[object Map Iterator]';
}
exports.isMapIterator = isMapIterator;

function isSetIterator(value) {
  return ObjectToString(value) === '[object Set Iterator]';
}
exports.isSetIterator = isSetIterator;

function isGeneratorObject(value) {
  return ObjectToString(value) === '[object Generator]';
}
exports.isGeneratorObject = isGeneratorObject;

function isWebAssemblyCompiledModule(value) {
  return ObjectToString(value) === '[object WebAssembly.Module]';
}
exports.isWebAssemblyCompiledModule = isWebAssemblyCompiledModule;

function isNumberObject(value) {
  return checkBoxedPrimitive(value, numberValue);
}
exports.isNumberObject = isNumberObject;

function isStringObject(value) {
  return checkBoxedPrimitive(value, stringValue);
}
exports.isStringObject = isStringObject;

function isBooleanObject(value) {
  return checkBoxedPrimitive(value, booleanValue);
}
exports.isBooleanObject = isBooleanObject;

function isBigIntObject(value) {
  return BigIntSupported && checkBoxedPrimitive(value, bigIntValue);
}
exports.isBigIntObject = isBigIntObject;

function isSymbolObject(value) {
  return SymbolSupported && checkBoxedPrimitive(value, symbolValue);
}
exports.isSymbolObject = isSymbolObject;

function isBoxedPrimitive(value) {
  return (
    isNumberObject(value) ||
    isStringObject(value) ||
    isBooleanObject(value) ||
    isBigIntObject(value) ||
    isSymbolObject(value)
  );
}
exports.isBoxedPrimitive = isBoxedPrimitive;

function isAnyArrayBuffer(value) {
  return typeof Uint8Array !== 'undefined' && (
    isArrayBuffer(value) ||
    isSharedArrayBuffer(value)
  );
}
exports.isAnyArrayBuffer = isAnyArrayBuffer;

['isProxy', 'isExternal', 'isModuleNamespaceObject'].forEach(function(method) {
  Object.defineProperty(exports, method, {
    enumerable: false,
    value: function() {
      throw new Error(method + ' is not supported in userland');
    }
  });
});


/***/ }),

/***/ "./node_modules/util/util.js":
/*!***********************************!*\
  !*** ./node_modules/util/util.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

/* provided dependency */ var process = __webpack_require__(/*! process/browser */ "./node_modules/process/browser.js");
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var getOwnPropertyDescriptors = Object.getOwnPropertyDescriptors ||
  function getOwnPropertyDescriptors(obj) {
    var keys = Object.keys(obj);
    var descriptors = {};
    for (var i = 0; i < keys.length; i++) {
      descriptors[keys[i]] = Object.getOwnPropertyDescriptor(obj, keys[i]);
    }
    return descriptors;
  };

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  if (typeof process !== 'undefined' && process.noDeprecation === true) {
    return fn;
  }

  // Allow for deprecating things in the process of starting up.
  if (typeof process === 'undefined') {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnvRegex = /^$/;

if (process.env.NODE_DEBUG) {
  var debugEnv = process.env.NODE_DEBUG;
  debugEnv = debugEnv.replace(/[|\\{}()[\]^$+?.]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/,/g, '$|^')
    .toUpperCase();
  debugEnvRegex = new RegExp('^' + debugEnv + '$', 'i');
}
exports.debuglog = function(set) {
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (debugEnvRegex.test(set)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').slice(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.slice(1, -1);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
exports.types = __webpack_require__(/*! ./support/types */ "./node_modules/util/support/types.js");

function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;
exports.types.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;
exports.types.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;
exports.types.isNativeError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = __webpack_require__(/*! ./support/isBuffer */ "./node_modules/util/support/isBufferBrowser.js");

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = __webpack_require__(/*! inherits */ "./node_modules/inherits/inherits_browser.js");

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

var kCustomPromisifiedSymbol = typeof Symbol !== 'undefined' ? Symbol('util.promisify.custom') : undefined;

exports.promisify = function promisify(original) {
  if (typeof original !== 'function')
    throw new TypeError('The "original" argument must be of type Function');

  if (kCustomPromisifiedSymbol && original[kCustomPromisifiedSymbol]) {
    var fn = original[kCustomPromisifiedSymbol];
    if (typeof fn !== 'function') {
      throw new TypeError('The "util.promisify.custom" argument must be of type Function');
    }
    Object.defineProperty(fn, kCustomPromisifiedSymbol, {
      value: fn, enumerable: false, writable: false, configurable: true
    });
    return fn;
  }

  function fn() {
    var promiseResolve, promiseReject;
    var promise = new Promise(function (resolve, reject) {
      promiseResolve = resolve;
      promiseReject = reject;
    });

    var args = [];
    for (var i = 0; i < arguments.length; i++) {
      args.push(arguments[i]);
    }
    args.push(function (err, value) {
      if (err) {
        promiseReject(err);
      } else {
        promiseResolve(value);
      }
    });

    try {
      original.apply(this, args);
    } catch (err) {
      promiseReject(err);
    }

    return promise;
  }

  Object.setPrototypeOf(fn, Object.getPrototypeOf(original));

  if (kCustomPromisifiedSymbol) Object.defineProperty(fn, kCustomPromisifiedSymbol, {
    value: fn, enumerable: false, writable: false, configurable: true
  });
  return Object.defineProperties(
    fn,
    getOwnPropertyDescriptors(original)
  );
}

exports.promisify.custom = kCustomPromisifiedSymbol

function callbackifyOnRejected(reason, cb) {
  // `!reason` guard inspired by bluebird (Ref: https://goo.gl/t5IS6M).
  // Because `null` is a special error value in callbacks which means "no error
  // occurred", we error-wrap so the callback consumer can distinguish between
  // "the promise rejected with null" or "the promise fulfilled with undefined".
  if (!reason) {
    var newReason = new Error('Promise was rejected with a falsy value');
    newReason.reason = reason;
    reason = newReason;
  }
  return cb(reason);
}

function callbackify(original) {
  if (typeof original !== 'function') {
    throw new TypeError('The "original" argument must be of type Function');
  }

  // We DO NOT return the promise as it gives the user a false sense that
  // the promise is actually somehow related to the callback's execution
  // and that the callback throwing will reject the promise.
  function callbackified() {
    var args = [];
    for (var i = 0; i < arguments.length; i++) {
      args.push(arguments[i]);
    }

    var maybeCb = args.pop();
    if (typeof maybeCb !== 'function') {
      throw new TypeError('The last argument must be of type Function');
    }
    var self = this;
    var cb = function() {
      return maybeCb.apply(self, arguments);
    };
    // In true node style we process the callback on `nextTick` with all the
    // implications (stack, `uncaughtException`, `async_hooks`)
    original.apply(this, args)
      .then(function(ret) { process.nextTick(cb.bind(null, null, ret)) },
            function(rej) { process.nextTick(callbackifyOnRejected.bind(null, rej, cb)) });
  }

  Object.setPrototypeOf(callbackified, Object.getPrototypeOf(original));
  Object.defineProperties(callbackified,
                          getOwnPropertyDescriptors(original));
  return callbackified;
}
exports.callbackify = callbackify;


/***/ }),

/***/ "./node_modules/webextension-polyfill/dist/browser-polyfill.js":
/*!*********************************************************************!*\
  !*** ./node_modules/webextension-polyfill/dist/browser-polyfill.js ***!
  \*********************************************************************/
/***/ (function(module, exports) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
  if (true) {
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else { var mod; }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (module) {
  /* webextension-polyfill - v0.10.0 - Fri Aug 12 2022 19:42:44 */

  /* -*- Mode: indent-tabs-mode: nil; js-indent-level: 2 -*- */

  /* vim: set sts=2 sw=2 et tw=80: */

  /* This Source Code Form is subject to the terms of the Mozilla Public
   * License, v. 2.0. If a copy of the MPL was not distributed with this
   * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
  "use strict";

  if (!globalThis.chrome?.runtime?.id) {
    throw new Error("This script should only be loaded in a browser extension.");
  }

  if (typeof globalThis.browser === "undefined" || Object.getPrototypeOf(globalThis.browser) !== Object.prototype) {
    const CHROME_SEND_MESSAGE_CALLBACK_NO_RESPONSE_MESSAGE = "The message port closed before a response was received."; // Wrapping the bulk of this polyfill in a one-time-use function is a minor
    // optimization for Firefox. Since Spidermonkey does not fully parse the
    // contents of a function until the first time it's called, and since it will
    // never actually need to be called, this allows the polyfill to be included
    // in Firefox nearly for free.

    const wrapAPIs = extensionAPIs => {
      // NOTE: apiMetadata is associated to the content of the api-metadata.json file
      // at build time by replacing the following "include" with the content of the
      // JSON file.
      const apiMetadata = {
        "alarms": {
          "clear": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "clearAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "get": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "bookmarks": {
          "create": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "get": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getChildren": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getRecent": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getSubTree": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getTree": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "move": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeTree": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "search": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "update": {
            "minArgs": 2,
            "maxArgs": 2
          }
        },
        "browserAction": {
          "disable": {
            "minArgs": 0,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "enable": {
            "minArgs": 0,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "getBadgeBackgroundColor": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getBadgeText": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getPopup": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getTitle": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "openPopup": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "setBadgeBackgroundColor": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "setBadgeText": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "setIcon": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "setPopup": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "setTitle": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          }
        },
        "browsingData": {
          "remove": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "removeCache": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeCookies": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeDownloads": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeFormData": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeHistory": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeLocalStorage": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removePasswords": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removePluginData": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "settings": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "commands": {
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "contextMenus": {
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "update": {
            "minArgs": 2,
            "maxArgs": 2
          }
        },
        "cookies": {
          "get": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAll": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAllCookieStores": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "set": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "devtools": {
          "inspectedWindow": {
            "eval": {
              "minArgs": 1,
              "maxArgs": 2,
              "singleCallbackArg": false
            }
          },
          "panels": {
            "create": {
              "minArgs": 3,
              "maxArgs": 3,
              "singleCallbackArg": true
            },
            "elements": {
              "createSidebarPane": {
                "minArgs": 1,
                "maxArgs": 1
              }
            }
          }
        },
        "downloads": {
          "cancel": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "download": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "erase": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getFileIcon": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "open": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "pause": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeFile": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "resume": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "search": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "show": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          }
        },
        "extension": {
          "isAllowedFileSchemeAccess": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "isAllowedIncognitoAccess": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "history": {
          "addUrl": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "deleteAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "deleteRange": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "deleteUrl": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getVisits": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "search": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "i18n": {
          "detectLanguage": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAcceptLanguages": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "identity": {
          "launchWebAuthFlow": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "idle": {
          "queryState": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "management": {
          "get": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "getSelf": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "setEnabled": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "uninstallSelf": {
            "minArgs": 0,
            "maxArgs": 1
          }
        },
        "notifications": {
          "clear": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "create": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "getPermissionLevel": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "update": {
            "minArgs": 2,
            "maxArgs": 2
          }
        },
        "pageAction": {
          "getPopup": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getTitle": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "hide": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "setIcon": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "setPopup": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "setTitle": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "show": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          }
        },
        "permissions": {
          "contains": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "request": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "runtime": {
          "getBackgroundPage": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "getPlatformInfo": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "openOptionsPage": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "requestUpdateCheck": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "sendMessage": {
            "minArgs": 1,
            "maxArgs": 3
          },
          "sendNativeMessage": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "setUninstallURL": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "sessions": {
          "getDevices": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getRecentlyClosed": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "restore": {
            "minArgs": 0,
            "maxArgs": 1
          }
        },
        "storage": {
          "local": {
            "clear": {
              "minArgs": 0,
              "maxArgs": 0
            },
            "get": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "getBytesInUse": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "remove": {
              "minArgs": 1,
              "maxArgs": 1
            },
            "set": {
              "minArgs": 1,
              "maxArgs": 1
            }
          },
          "managed": {
            "get": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "getBytesInUse": {
              "minArgs": 0,
              "maxArgs": 1
            }
          },
          "sync": {
            "clear": {
              "minArgs": 0,
              "maxArgs": 0
            },
            "get": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "getBytesInUse": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "remove": {
              "minArgs": 1,
              "maxArgs": 1
            },
            "set": {
              "minArgs": 1,
              "maxArgs": 1
            }
          }
        },
        "tabs": {
          "captureVisibleTab": {
            "minArgs": 0,
            "maxArgs": 2
          },
          "create": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "detectLanguage": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "discard": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "duplicate": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "executeScript": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "get": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getCurrent": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "getZoom": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getZoomSettings": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "goBack": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "goForward": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "highlight": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "insertCSS": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "move": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "query": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "reload": {
            "minArgs": 0,
            "maxArgs": 2
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeCSS": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "sendMessage": {
            "minArgs": 2,
            "maxArgs": 3
          },
          "setZoom": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "setZoomSettings": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "update": {
            "minArgs": 1,
            "maxArgs": 2
          }
        },
        "topSites": {
          "get": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "webNavigation": {
          "getAllFrames": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getFrame": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "webRequest": {
          "handlerBehaviorChanged": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "windows": {
          "create": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "get": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getCurrent": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getLastFocused": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "update": {
            "minArgs": 2,
            "maxArgs": 2
          }
        }
      };

      if (Object.keys(apiMetadata).length === 0) {
        throw new Error("api-metadata.json has not been included in browser-polyfill");
      }
      /**
       * A WeakMap subclass which creates and stores a value for any key which does
       * not exist when accessed, but behaves exactly as an ordinary WeakMap
       * otherwise.
       *
       * @param {function} createItem
       *        A function which will be called in order to create the value for any
       *        key which does not exist, the first time it is accessed. The
       *        function receives, as its only argument, the key being created.
       */


      class DefaultWeakMap extends WeakMap {
        constructor(createItem, items = undefined) {
          super(items);
          this.createItem = createItem;
        }

        get(key) {
          if (!this.has(key)) {
            this.set(key, this.createItem(key));
          }

          return super.get(key);
        }

      }
      /**
       * Returns true if the given object is an object with a `then` method, and can
       * therefore be assumed to behave as a Promise.
       *
       * @param {*} value The value to test.
       * @returns {boolean} True if the value is thenable.
       */


      const isThenable = value => {
        return value && typeof value === "object" && typeof value.then === "function";
      };
      /**
       * Creates and returns a function which, when called, will resolve or reject
       * the given promise based on how it is called:
       *
       * - If, when called, `chrome.runtime.lastError` contains a non-null object,
       *   the promise is rejected with that value.
       * - If the function is called with exactly one argument, the promise is
       *   resolved to that value.
       * - Otherwise, the promise is resolved to an array containing all of the
       *   function's arguments.
       *
       * @param {object} promise
       *        An object containing the resolution and rejection functions of a
       *        promise.
       * @param {function} promise.resolve
       *        The promise's resolution function.
       * @param {function} promise.reject
       *        The promise's rejection function.
       * @param {object} metadata
       *        Metadata about the wrapped method which has created the callback.
       * @param {boolean} metadata.singleCallbackArg
       *        Whether or not the promise is resolved with only the first
       *        argument of the callback, alternatively an array of all the
       *        callback arguments is resolved. By default, if the callback
       *        function is invoked with only a single argument, that will be
       *        resolved to the promise, while all arguments will be resolved as
       *        an array if multiple are given.
       *
       * @returns {function}
       *        The generated callback function.
       */


      const makeCallback = (promise, metadata) => {
        return (...callbackArgs) => {
          if (extensionAPIs.runtime.lastError) {
            promise.reject(new Error(extensionAPIs.runtime.lastError.message));
          } else if (metadata.singleCallbackArg || callbackArgs.length <= 1 && metadata.singleCallbackArg !== false) {
            promise.resolve(callbackArgs[0]);
          } else {
            promise.resolve(callbackArgs);
          }
        };
      };

      const pluralizeArguments = numArgs => numArgs == 1 ? "argument" : "arguments";
      /**
       * Creates a wrapper function for a method with the given name and metadata.
       *
       * @param {string} name
       *        The name of the method which is being wrapped.
       * @param {object} metadata
       *        Metadata about the method being wrapped.
       * @param {integer} metadata.minArgs
       *        The minimum number of arguments which must be passed to the
       *        function. If called with fewer than this number of arguments, the
       *        wrapper will raise an exception.
       * @param {integer} metadata.maxArgs
       *        The maximum number of arguments which may be passed to the
       *        function. If called with more than this number of arguments, the
       *        wrapper will raise an exception.
       * @param {boolean} metadata.singleCallbackArg
       *        Whether or not the promise is resolved with only the first
       *        argument of the callback, alternatively an array of all the
       *        callback arguments is resolved. By default, if the callback
       *        function is invoked with only a single argument, that will be
       *        resolved to the promise, while all arguments will be resolved as
       *        an array if multiple are given.
       *
       * @returns {function(object, ...*)}
       *       The generated wrapper function.
       */


      const wrapAsyncFunction = (name, metadata) => {
        return function asyncFunctionWrapper(target, ...args) {
          if (args.length < metadata.minArgs) {
            throw new Error(`Expected at least ${metadata.minArgs} ${pluralizeArguments(metadata.minArgs)} for ${name}(), got ${args.length}`);
          }

          if (args.length > metadata.maxArgs) {
            throw new Error(`Expected at most ${metadata.maxArgs} ${pluralizeArguments(metadata.maxArgs)} for ${name}(), got ${args.length}`);
          }

          return new Promise((resolve, reject) => {
            if (metadata.fallbackToNoCallback) {
              // This API method has currently no callback on Chrome, but it return a promise on Firefox,
              // and so the polyfill will try to call it with a callback first, and it will fallback
              // to not passing the callback if the first call fails.
              try {
                target[name](...args, makeCallback({
                  resolve,
                  reject
                }, metadata));
              } catch (cbError) {
                console.warn(`${name} API method doesn't seem to support the callback parameter, ` + "falling back to call it without a callback: ", cbError);
                target[name](...args); // Update the API method metadata, so that the next API calls will not try to
                // use the unsupported callback anymore.

                metadata.fallbackToNoCallback = false;
                metadata.noCallback = true;
                resolve();
              }
            } else if (metadata.noCallback) {
              target[name](...args);
              resolve();
            } else {
              target[name](...args, makeCallback({
                resolve,
                reject
              }, metadata));
            }
          });
        };
      };
      /**
       * Wraps an existing method of the target object, so that calls to it are
       * intercepted by the given wrapper function. The wrapper function receives,
       * as its first argument, the original `target` object, followed by each of
       * the arguments passed to the original method.
       *
       * @param {object} target
       *        The original target object that the wrapped method belongs to.
       * @param {function} method
       *        The method being wrapped. This is used as the target of the Proxy
       *        object which is created to wrap the method.
       * @param {function} wrapper
       *        The wrapper function which is called in place of a direct invocation
       *        of the wrapped method.
       *
       * @returns {Proxy<function>}
       *        A Proxy object for the given method, which invokes the given wrapper
       *        method in its place.
       */


      const wrapMethod = (target, method, wrapper) => {
        return new Proxy(method, {
          apply(targetMethod, thisObj, args) {
            return wrapper.call(thisObj, target, ...args);
          }

        });
      };

      let hasOwnProperty = Function.call.bind(Object.prototype.hasOwnProperty);
      /**
       * Wraps an object in a Proxy which intercepts and wraps certain methods
       * based on the given `wrappers` and `metadata` objects.
       *
       * @param {object} target
       *        The target object to wrap.
       *
       * @param {object} [wrappers = {}]
       *        An object tree containing wrapper functions for special cases. Any
       *        function present in this object tree is called in place of the
       *        method in the same location in the `target` object tree. These
       *        wrapper methods are invoked as described in {@see wrapMethod}.
       *
       * @param {object} [metadata = {}]
       *        An object tree containing metadata used to automatically generate
       *        Promise-based wrapper functions for asynchronous. Any function in
       *        the `target` object tree which has a corresponding metadata object
       *        in the same location in the `metadata` tree is replaced with an
       *        automatically-generated wrapper function, as described in
       *        {@see wrapAsyncFunction}
       *
       * @returns {Proxy<object>}
       */

      const wrapObject = (target, wrappers = {}, metadata = {}) => {
        let cache = Object.create(null);
        let handlers = {
          has(proxyTarget, prop) {
            return prop in target || prop in cache;
          },

          get(proxyTarget, prop, receiver) {
            if (prop in cache) {
              return cache[prop];
            }

            if (!(prop in target)) {
              return undefined;
            }

            let value = target[prop];

            if (typeof value === "function") {
              // This is a method on the underlying object. Check if we need to do
              // any wrapping.
              if (typeof wrappers[prop] === "function") {
                // We have a special-case wrapper for this method.
                value = wrapMethod(target, target[prop], wrappers[prop]);
              } else if (hasOwnProperty(metadata, prop)) {
                // This is an async method that we have metadata for. Create a
                // Promise wrapper for it.
                let wrapper = wrapAsyncFunction(prop, metadata[prop]);
                value = wrapMethod(target, target[prop], wrapper);
              } else {
                // This is a method that we don't know or care about. Return the
                // original method, bound to the underlying object.
                value = value.bind(target);
              }
            } else if (typeof value === "object" && value !== null && (hasOwnProperty(wrappers, prop) || hasOwnProperty(metadata, prop))) {
              // This is an object that we need to do some wrapping for the children
              // of. Create a sub-object wrapper for it with the appropriate child
              // metadata.
              value = wrapObject(value, wrappers[prop], metadata[prop]);
            } else if (hasOwnProperty(metadata, "*")) {
              // Wrap all properties in * namespace.
              value = wrapObject(value, wrappers[prop], metadata["*"]);
            } else {
              // We don't need to do any wrapping for this property,
              // so just forward all access to the underlying object.
              Object.defineProperty(cache, prop, {
                configurable: true,
                enumerable: true,

                get() {
                  return target[prop];
                },

                set(value) {
                  target[prop] = value;
                }

              });
              return value;
            }

            cache[prop] = value;
            return value;
          },

          set(proxyTarget, prop, value, receiver) {
            if (prop in cache) {
              cache[prop] = value;
            } else {
              target[prop] = value;
            }

            return true;
          },

          defineProperty(proxyTarget, prop, desc) {
            return Reflect.defineProperty(cache, prop, desc);
          },

          deleteProperty(proxyTarget, prop) {
            return Reflect.deleteProperty(cache, prop);
          }

        }; // Per contract of the Proxy API, the "get" proxy handler must return the
        // original value of the target if that value is declared read-only and
        // non-configurable. For this reason, we create an object with the
        // prototype set to `target` instead of using `target` directly.
        // Otherwise we cannot return a custom object for APIs that
        // are declared read-only and non-configurable, such as `chrome.devtools`.
        //
        // The proxy handlers themselves will still use the original `target`
        // instead of the `proxyTarget`, so that the methods and properties are
        // dereferenced via the original targets.

        let proxyTarget = Object.create(target);
        return new Proxy(proxyTarget, handlers);
      };
      /**
       * Creates a set of wrapper functions for an event object, which handles
       * wrapping of listener functions that those messages are passed.
       *
       * A single wrapper is created for each listener function, and stored in a
       * map. Subsequent calls to `addListener`, `hasListener`, or `removeListener`
       * retrieve the original wrapper, so that  attempts to remove a
       * previously-added listener work as expected.
       *
       * @param {DefaultWeakMap<function, function>} wrapperMap
       *        A DefaultWeakMap object which will create the appropriate wrapper
       *        for a given listener function when one does not exist, and retrieve
       *        an existing one when it does.
       *
       * @returns {object}
       */


      const wrapEvent = wrapperMap => ({
        addListener(target, listener, ...args) {
          target.addListener(wrapperMap.get(listener), ...args);
        },

        hasListener(target, listener) {
          return target.hasListener(wrapperMap.get(listener));
        },

        removeListener(target, listener) {
          target.removeListener(wrapperMap.get(listener));
        }

      });

      const onRequestFinishedWrappers = new DefaultWeakMap(listener => {
        if (typeof listener !== "function") {
          return listener;
        }
        /**
         * Wraps an onRequestFinished listener function so that it will return a
         * `getContent()` property which returns a `Promise` rather than using a
         * callback API.
         *
         * @param {object} req
         *        The HAR entry object representing the network request.
         */


        return function onRequestFinished(req) {
          const wrappedReq = wrapObject(req, {}
          /* wrappers */
          , {
            getContent: {
              minArgs: 0,
              maxArgs: 0
            }
          });
          listener(wrappedReq);
        };
      });
      const onMessageWrappers = new DefaultWeakMap(listener => {
        if (typeof listener !== "function") {
          return listener;
        }
        /**
         * Wraps a message listener function so that it may send responses based on
         * its return value, rather than by returning a sentinel value and calling a
         * callback. If the listener function returns a Promise, the response is
         * sent when the promise either resolves or rejects.
         *
         * @param {*} message
         *        The message sent by the other end of the channel.
         * @param {object} sender
         *        Details about the sender of the message.
         * @param {function(*)} sendResponse
         *        A callback which, when called with an arbitrary argument, sends
         *        that value as a response.
         * @returns {boolean}
         *        True if the wrapped listener returned a Promise, which will later
         *        yield a response. False otherwise.
         */


        return function onMessage(message, sender, sendResponse) {
          let didCallSendResponse = false;
          let wrappedSendResponse;
          let sendResponsePromise = new Promise(resolve => {
            wrappedSendResponse = function (response) {
              didCallSendResponse = true;
              resolve(response);
            };
          });
          let result;

          try {
            result = listener(message, sender, wrappedSendResponse);
          } catch (err) {
            result = Promise.reject(err);
          }

          const isResultThenable = result !== true && isThenable(result); // If the listener didn't returned true or a Promise, or called
          // wrappedSendResponse synchronously, we can exit earlier
          // because there will be no response sent from this listener.

          if (result !== true && !isResultThenable && !didCallSendResponse) {
            return false;
          } // A small helper to send the message if the promise resolves
          // and an error if the promise rejects (a wrapped sendMessage has
          // to translate the message into a resolved promise or a rejected
          // promise).


          const sendPromisedResult = promise => {
            promise.then(msg => {
              // send the message value.
              sendResponse(msg);
            }, error => {
              // Send a JSON representation of the error if the rejected value
              // is an instance of error, or the object itself otherwise.
              let message;

              if (error && (error instanceof Error || typeof error.message === "string")) {
                message = error.message;
              } else {
                message = "An unexpected error occurred";
              }

              sendResponse({
                __mozWebExtensionPolyfillReject__: true,
                message
              });
            }).catch(err => {
              // Print an error on the console if unable to send the response.
              console.error("Failed to send onMessage rejected reply", err);
            });
          }; // If the listener returned a Promise, send the resolved value as a
          // result, otherwise wait the promise related to the wrappedSendResponse
          // callback to resolve and send it as a response.


          if (isResultThenable) {
            sendPromisedResult(result);
          } else {
            sendPromisedResult(sendResponsePromise);
          } // Let Chrome know that the listener is replying.


          return true;
        };
      });

      const wrappedSendMessageCallback = ({
        reject,
        resolve
      }, reply) => {
        if (extensionAPIs.runtime.lastError) {
          // Detect when none of the listeners replied to the sendMessage call and resolve
          // the promise to undefined as in Firefox.
          // See https://github.com/mozilla/webextension-polyfill/issues/130
          if (extensionAPIs.runtime.lastError.message === CHROME_SEND_MESSAGE_CALLBACK_NO_RESPONSE_MESSAGE) {
            resolve();
          } else {
            reject(new Error(extensionAPIs.runtime.lastError.message));
          }
        } else if (reply && reply.__mozWebExtensionPolyfillReject__) {
          // Convert back the JSON representation of the error into
          // an Error instance.
          reject(new Error(reply.message));
        } else {
          resolve(reply);
        }
      };

      const wrappedSendMessage = (name, metadata, apiNamespaceObj, ...args) => {
        if (args.length < metadata.minArgs) {
          throw new Error(`Expected at least ${metadata.minArgs} ${pluralizeArguments(metadata.minArgs)} for ${name}(), got ${args.length}`);
        }

        if (args.length > metadata.maxArgs) {
          throw new Error(`Expected at most ${metadata.maxArgs} ${pluralizeArguments(metadata.maxArgs)} for ${name}(), got ${args.length}`);
        }

        return new Promise((resolve, reject) => {
          const wrappedCb = wrappedSendMessageCallback.bind(null, {
            resolve,
            reject
          });
          args.push(wrappedCb);
          apiNamespaceObj.sendMessage(...args);
        });
      };

      const staticWrappers = {
        devtools: {
          network: {
            onRequestFinished: wrapEvent(onRequestFinishedWrappers)
          }
        },
        runtime: {
          onMessage: wrapEvent(onMessageWrappers),
          onMessageExternal: wrapEvent(onMessageWrappers),
          sendMessage: wrappedSendMessage.bind(null, "sendMessage", {
            minArgs: 1,
            maxArgs: 3
          })
        },
        tabs: {
          sendMessage: wrappedSendMessage.bind(null, "sendMessage", {
            minArgs: 2,
            maxArgs: 3
          })
        }
      };
      const settingMetadata = {
        clear: {
          minArgs: 1,
          maxArgs: 1
        },
        get: {
          minArgs: 1,
          maxArgs: 1
        },
        set: {
          minArgs: 1,
          maxArgs: 1
        }
      };
      apiMetadata.privacy = {
        network: {
          "*": settingMetadata
        },
        services: {
          "*": settingMetadata
        },
        websites: {
          "*": settingMetadata
        }
      };
      return wrapObject(extensionAPIs, staticWrappers, apiMetadata);
    }; // The build process adds a UMD wrapper around this file, which makes the
    // `module` variable available.


    module.exports = wrapAPIs(chrome);
  } else {
    module.exports = globalThis.browser;
  }
});
//# sourceMappingURL=browser-polyfill.js.map


/***/ }),

/***/ "./node_modules/which-typed-array/index.js":
/*!*************************************************!*\
  !*** ./node_modules/which-typed-array/index.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var forEach = __webpack_require__(/*! for-each */ "./node_modules/for-each/index.js");
var availableTypedArrays = __webpack_require__(/*! available-typed-arrays */ "./node_modules/available-typed-arrays/index.js");
var callBind = __webpack_require__(/*! call-bind */ "./node_modules/call-bind/index.js");
var callBound = __webpack_require__(/*! call-bind/callBound */ "./node_modules/call-bind/callBound.js");
var gOPD = __webpack_require__(/*! gopd */ "./node_modules/gopd/index.js");

var $toString = callBound('Object.prototype.toString');
var hasToStringTag = __webpack_require__(/*! has-tostringtag/shams */ "./node_modules/has-tostringtag/shams.js")();

var g = typeof globalThis === 'undefined' ? __webpack_require__.g : globalThis;
var typedArrays = availableTypedArrays();

var $slice = callBound('String.prototype.slice');
var getPrototypeOf = Object.getPrototypeOf; // require('getprototypeof');

var $indexOf = callBound('Array.prototype.indexOf', true) || /** @type {(array: readonly unknown[], value: unknown) => keyof array} */ function indexOf(array, value) {
	for (var i = 0; i < array.length; i += 1) {
		if (array[i] === value) {
			return i;
		}
	}
	return -1;
};

/** @typedef {Int8Array | Uint8Array | Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array | BigInt64Array | BigUint64Array} TypedArray */
/** @typedef {'Int8Array' | 'Uint8Array' | 'Uint8ClampedArray' | 'Int16Array' | 'Uint16Array' | 'Int32Array' | 'Uint32Array' | 'Float32Array' | 'Float64Array' | 'BigInt64Array' | 'BigUint64Array'} TypedArrayName */
/** @type {{ [k in `\$${TypedArrayName}`]?: (receiver: TypedArray) => string | typeof Uint8Array.prototype.slice.call | typeof Uint8Array.prototype.set.call } & { __proto__: null }} */
var cache = { __proto__: null };
if (hasToStringTag && gOPD && getPrototypeOf) {
	forEach(typedArrays, function (typedArray) {
		var arr = new g[typedArray]();
		if (Symbol.toStringTag in arr) {
			var proto = getPrototypeOf(arr);
			// @ts-expect-error TS won't narrow inside a closure
			var descriptor = gOPD(proto, Symbol.toStringTag);
			if (!descriptor) {
				var superProto = getPrototypeOf(proto);
				// @ts-expect-error TS won't narrow inside a closure
				descriptor = gOPD(superProto, Symbol.toStringTag);
			}
			// @ts-expect-error TODO: fix
			cache['$' + typedArray] = callBind(descriptor.get);
		}
	});
} else {
	forEach(typedArrays, function (typedArray) {
		var arr = new g[typedArray]();
		var fn = arr.slice || arr.set;
		if (fn) {
			// @ts-expect-error TODO: fix
			cache['$' + typedArray] = callBind(fn);
		}
	});
}

/** @type {import('.')} */
var tryTypedArrays = function tryAllTypedArrays(value) {
	/** @type {ReturnType<tryAllTypedArrays>} */ var found = false;
	forEach(
		// eslint-disable-next-line no-extra-parens
		/** @type {Record<`\$${TypedArrayName}`, typeof cache>} */ /** @type {any} */ (cache),
		/** @type {(getter: typeof cache, name: `\$${TypedArrayName}`) => void} */ function (getter, typedArray) {
			if (!found) {
				try {
				// @ts-expect-error TODO: fix
					if ('$' + getter(value) === typedArray) {
						found = $slice(typedArray, 1);
					}
				} catch (e) { /**/ }
			}
		}
	);
	return found;
};

/** @type {import('.')} */
var trySlices = function tryAllSlices(value) {
	/** @type {ReturnType<tryAllSlices>} */ var found = false;
	forEach(
		// eslint-disable-next-line no-extra-parens
		/** @type {any} */ (cache),
		/** @type {(getter: typeof cache, name: `\$${TypedArrayName}`) => void} */ function (getter, name) {
			if (!found) {
				try {
				// @ts-expect-error TODO: fix
					getter(value);
					found = $slice(name, 1);
				} catch (e) { /**/ }
			}
		}
	);
	return found;
};

/** @type {import('.')} */
module.exports = function whichTypedArray(value) {
	if (!value || typeof value !== 'object') { return false; }
	if (!hasToStringTag) {
		var tag = $slice($toString(value), 8, -1);
		if ($indexOf(typedArrays, tag) > -1) {
			return tag;
		}
		if (tag !== 'Object') {
			return false;
		}
		// node < 0.6 hits here on real Typed Arrays
		return trySlices(value);
	}
	if (!gOPD) { return null; } // unknown engine
	return tryTypedArrays(value);
};


/***/ }),

/***/ "./node_modules/available-typed-arrays/index.js":
/*!******************************************************!*\
  !*** ./node_modules/available-typed-arrays/index.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var possibleNames = __webpack_require__(/*! possible-typed-array-names */ "./node_modules/possible-typed-array-names/index.js");

var g = typeof globalThis === 'undefined' ? __webpack_require__.g : globalThis;

/** @type {import('.')} */
module.exports = function availableTypedArrays() {
	var /** @type {ReturnType<typeof availableTypedArrays>} */ out = [];
	for (var i = 0; i < possibleNames.length; i++) {
		if (typeof g[possibleNames[i]] === 'function') {
			// @ts-expect-error
			out[out.length] = possibleNames[i];
		}
	}
	return out;
};


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!*****************************!*\
  !*** ./src/canvas/index.ts ***!
  \*****************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Account: () => (/* binding */ Account),
/* harmony export */   Assignment: () => (/* binding */ Assignment),
/* harmony export */   BaseCanvasObject: () => (/* binding */ BaseCanvasObject),
/* harmony export */   BaseContentItem: () => (/* binding */ BaseContentItem),
/* harmony export */   Course: () => (/* binding */ Course),
/* harmony export */   CourseNotFoundException: () => (/* binding */ CourseNotFoundException),
/* harmony export */   Discussion: () => (/* binding */ Discussion),
/* harmony export */   NotImplementedException: () => (/* binding */ NotImplementedException),
/* harmony export */   Page: () => (/* binding */ Page),
/* harmony export */   Quiz: () => (/* binding */ Quiz),
/* harmony export */   Rubric: () => (/* binding */ Rubric),
/* harmony export */   RubricAssociation: () => (/* binding */ RubricAssociation),
/* harmony export */   Term: () => (/* binding */ Term),
/* harmony export */   formDataify: () => (/* binding */ formDataify),
/* harmony export */   getItemTypeAndId: () => (/* binding */ getItemTypeAndId),
/* harmony export */   getModuleWeekNumber: () => (/* binding */ getModuleWeekNumber),
/* harmony export */   resizedImage: () => (/* binding */ resizedImage)
/* harmony export */ });
/* harmony import */ var assert__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! assert */ "./node_modules/assert/build/assert.js");
/* harmony import */ var assert__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(assert__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var webextension_polyfill__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! webextension-polyfill */ "./node_modules/webextension-polyfill/dist/browser-polyfill.js");
/* harmony import */ var webextension_polyfill__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(webextension_polyfill__WEBPACK_IMPORTED_MODULE_1__);
/**
 * noinspection FunctionNamingConventionJS,JSUnusedGlobalSymbols
 */
var __esDecorate = (undefined && undefined.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (undefined && undefined.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __setFunctionName = (undefined && undefined.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
/* Very Initial refactor to JS using ChatGPT4
NOTE: Almost all of this code has had to be rewritten since then.
And starting to convert to ts
 */


const HOMETILE_WIDTH = 500;
const type_lut = {
    'Assignment': 'assignment',
    'Discussion': 'discussion_topic',
    'Quiz': 'quiz',
    'Attachment': 'attachment',
    'External Tool': 'external_tool',
    'File': 'file',
    'Page': 'wiki_page'
};
function downloadFile(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield webextension_polyfill__WEBPACK_IMPORTED_MODULE_1__.runtime.sendMessage('downloadFile', options);
    });
}
function resizedImage(imgSrc, targetWidth, targetHeight = null) {
    assert__WEBPACK_IMPORTED_MODULE_0___default()(document);
    const image = new Image();
    image.loading = 'eager';
    return new Promise((resolve, reject) => {
        let callback = () => {
            console.log("Loaded");
            console.log(image.src, image.height, image.width);
            const targetCanvas = document.createElement('canvas');
            const tCtx = targetCanvas.getContext('2d');
            if (!tCtx) {
                reject();
                return;
            }
            tCtx.imageSmoothingEnabled = true;
            tCtx.imageSmoothingQuality = "high";
            const aspectRatio = image.width / image.height;
            targetHeight = targetHeight ? targetHeight : targetWidth / aspectRatio;
            targetCanvas.width = targetWidth;
            targetCanvas.height = targetHeight;
            tCtx.drawImage(image, 0, 0, targetWidth, targetHeight);
            resolve(tCtx.getImageData(0, 0, targetWidth, targetHeight));
        };
        console.log("loading", imgSrc);
        image.src = imgSrc;
        if (image.complete) {
            callback();
        }
        else {
            image.addEventListener('load', callback);
            image.addEventListener('error', (e) => {
                console.log(e);
                console.log(image);
            });
        }
    });
}
function formDataify(data) {
    console.log('form', data);
    let formData = new FormData();
    for (let key in data) {
        addToFormData(formData, key, data[key]);
    }
    if (document) {
        const el = document.querySelector("input[name='authenticity_token']");
        const authenticityToken = el ? el.value : null;
        if (authenticityToken)
            formData.append('authenticity_token', authenticityToken);
    }
    for (let entry of formData.entries()) {
        console.log(entry[0], entry[1]);
    }
    return formData;
}
function legacyAddToFormData(formData, key, value) {
    formData.append(key, value);
}
function addToFormData(formData, key, value) {
    if (Array.isArray(value)) {
        for (let item of value) {
            addToFormData(formData, `${key}[]`, item);
        }
    }
    else if (typeof value === 'object') {
        for (let itemKey in value) {
            const itemValue = value[itemKey];
            addToFormData(formData, key.length > 0 ? `${key}[${itemKey}]` : itemKey, itemValue);
        }
    }
    else {
        formData.append(key, value.toString());
    }
}
function getModuleWeekNumber(module) {
    const regex = /(week|module) (\d+)/i;
    let match = module.name.match(regex);
    let weekNumber = !match ? null : Number(match[1]);
    if (!weekNumber) {
        for (let moduleItem of module.items) {
            if (!moduleItem.hasOwnProperty('title')) {
                continue;
            }
            let match = moduleItem.title.match(regex);
            if (match) {
                weekNumber = match[2];
            }
        }
    }
    return weekNumber;
}
/**
 * Takes in a module item and returns an object specifying its type and content id
 * @param item
 */
function getItemTypeAndId(item) {
    return __awaiter(this, void 0, void 0, function* () {
        let id;
        let type;
        assert__WEBPACK_IMPORTED_MODULE_0___default()(type_lut.hasOwnProperty(item.type), "Unexpected type " + item.type);
        type = type_lut[item.type];
        if (type === "wiki_page") {
            assert__WEBPACK_IMPORTED_MODULE_0___default()(item.url); //wiki_page items always have a url param
            const pageData = yield fetchJson(item.url);
            id = pageData.page_id;
        }
        else {
            id = item.content_id;
        }
        return { type, id };
    });
}
/**
 * @param queryParams
 * @returns {URLSearchParams} The correctly formatted parameters
 */
function searchParamsFromObject(queryParams) {
    return new URLSearchParams(queryParams);
}
function getApiPagedData(url, config = null) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield getPagedData(`/api/v1/${url}`, config);
    });
}
/**
 * @param url The entire path of the url
 * @param config a configuration object of type ICanvasCallConfig
 * @returns {Promise<Dict[]>}
 */
function getPagedData(url, config = null) {
    return __awaiter(this, void 0, void 0, function* () {
        if (config === null || config === void 0 ? void 0 : config.queryParams) {
            url += '?' + searchParamsFromObject(config.queryParams);
        }
        /* Returns a list of data from a GET request, going through multiple pages of data requests as necessary */
        let response = yield fetch(url, config === null || config === void 0 ? void 0 : config.fetchInit);
        let data = yield response.json();
        if (typeof data === 'object' && !Array.isArray(data)) {
            let values = Array.from(Object.values(data));
            if (values) {
                data = values.find((a) => Array.isArray(a));
            }
        }
        assert__WEBPACK_IMPORTED_MODULE_0___default()(Array.isArray(data));
        let next_page_link = "!";
        while (next_page_link.length !== 0 &&
            response &&
            response.headers.has("Link") && response.ok) {
            const link = response.headers.get("Link");
            assert__WEBPACK_IMPORTED_MODULE_0___default()(link);
            const paginationLinks = link.split(",");
            const nextLink = paginationLinks.find((link) => link.includes('next'));
            if (nextLink) {
                next_page_link = nextLink.split(";")[0].split("<")[1].split(">")[0];
                response = yield fetch(next_page_link, config === null || config === void 0 ? void 0 : config.fetchInit);
                let responseData = yield response.json();
                if (typeof responseData === 'object' && !Array.isArray(data)) {
                    let values = Array.from(Object.values(data));
                    if (values) {
                        responseData = values === null || values === void 0 ? void 0 : values.find((a) => Array.isArray(a));
                    }
                }
                data = data.concat(responseData);
            }
            else {
                next_page_link = "";
            }
        }
        return data;
    });
}
function fetchJson(url, config = null) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if (config === null || config === void 0 ? void 0 : config.queryParams) {
            url += '?' + new URLSearchParams(config.queryParams);
        }
        config !== null && config !== void 0 ? config : (config = {});
        if (!document) {
            (_a = config.fetchInit) !== null && _a !== void 0 ? _a : (config.fetchInit = {});
            config.fetchInit.headers = [];
        }
        const response = yield fetch(url, config.fetchInit);
        return yield response.json();
    });
}
/**
 * Fetches a json object from /api/v1/${url}
 * @param url
 * @param config query and fetch params
 */
function fetchApiJson(url, config = null) {
    return __awaiter(this, void 0, void 0, function* () {
        url = `/api/v1/${url}`;
        return yield fetchJson(url, config);
    });
}
function fetchOneApiJson(url, config = null) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield fetchApiJson(url, config);
        if (Array.isArray(result))
            return result[0];
        return result;
    });
}
/**
 *  A base class for objects that interact with the Canvas API
 */
class BaseCanvasObject {
    constructor(data) {
        this.accountId = null;
        this.canvasData = data || {}; // A dict holding the decoded json representation of the object in Canvas
    }
    getClass() {
        return this.constructor;
    }
    toString() {
        return JSON.stringify(this.canvasData);
    }
    getItem(item) {
        return this.canvasData[item] || null;
    }
    get myClass() { return this.constructor; }
    get nameKey() {
        assert__WEBPACK_IMPORTED_MODULE_0___default()(this.myClass.nameProperty);
        return this.myClass.nameProperty;
    }
    get contentUrlPath() {
        const constructor = this.constructor;
        assert__WEBPACK_IMPORTED_MODULE_0___default()(typeof this.accountId === 'number');
        assert__WEBPACK_IMPORTED_MODULE_0___default()(typeof constructor.contentUrlTemplate === 'string');
        return constructor.contentUrlTemplate
            .replace('{content_id}', this.id.toString())
            .replace('{account_id}', this.accountId.toString());
    }
    get htmlContentUrl() {
        return `/${this.contentUrlPath}`;
    }
    get rawData() {
        const out = {
            id: NaN,
        };
        for (let key in this.canvasData) {
            out[key] = this.canvasData[key];
        }
        return out;
    }
    static getDataById(contentId, course = null, config = null) {
        return __awaiter(this, void 0, void 0, function* () {
            let url = this.getUrlPathFromIds(contentId, course ? course.id : null);
            const response = yield fetchApiJson(url, config);
            assert__WEBPACK_IMPORTED_MODULE_0___default()(!Array.isArray(response));
            return response;
        });
    }
    static getById(contentId, course) {
        return __awaiter(this, void 0, void 0, function* () {
            return new this(yield this.getDataById(contentId, course));
        });
    }
    static getUrlPathFromIds(contentId, courseId) {
        assert__WEBPACK_IMPORTED_MODULE_0___default()(typeof this.contentUrlTemplate === 'string');
        let url = this.contentUrlTemplate
            .replace('{content_id}', contentId.toString());
        if (courseId)
            url = url.replace('{course_id}', courseId.toString());
        return url;
    }
    /**
     *
     * @param courseId - The course ID to get elements within, if applicable
     * @param accountId - The account ID to get elements within, if applicable
     */
    static getAllUrl(courseId = null, accountId = null) {
        assert__WEBPACK_IMPORTED_MODULE_0___default()(typeof this.allContentUrlTemplate === 'string');
        let replaced = this.allContentUrlTemplate;
        if (courseId)
            replaced = replaced.replace('{course_id}', courseId.toString());
        if (accountId)
            replaced = replaced.replace('{account_id}', accountId.toString());
        return replaced;
    }
    static getAll(config = null) {
        return __awaiter(this, void 0, void 0, function* () {
            let url = this.getAllUrl();
            let data = yield getApiPagedData(url, config);
            return data.map(item => new this(item));
        });
    }
    get id() {
        const id = this.canvasData[this.constructor.idProperty];
        return parseInt(id);
    }
    get name() {
        let nameProperty = this.getClass().nameProperty;
        assert__WEBPACK_IMPORTED_MODULE_0___default()(nameProperty);
        return this.getItem(nameProperty);
    }
    saveData(data) {
        return __awaiter(this, void 0, void 0, function* () {
            assert__WEBPACK_IMPORTED_MODULE_0___default()(this.contentUrlPath);
            return yield fetchApiJson(this.contentUrlPath, { fetchInit: {
                    method: 'PUT',
                    body: formDataify(data)
                } });
        });
    }
    delete() {
        return __awaiter(this, void 0, void 0, function* () {
            assert__WEBPACK_IMPORTED_MODULE_0___default()(this.contentUrlPath);
            return yield fetchApiJson(this.contentUrlPath, { fetchInit: { method: 'DELETE' } });
        });
    }
}
BaseCanvasObject.idProperty = 'id'; // The field name of the id of the canvas object type
BaseCanvasObject.nameProperty = null; // The field name of the primary name of the canvas object type
BaseCanvasObject.contentUrlTemplate = null; // A templated url to get a single item
BaseCanvasObject.allContentUrlTemplate = null; // A templated url to get all items
class Account extends BaseCanvasObject {
    static getFromUrl(url = null) {
        return __awaiter(this, void 0, void 0, function* () {
            if (url === null) {
                url = document.documentURI;
            }
            let match = /accounts\/(\d+)/.exec(url);
            if (match) {
                console.log(match);
                return yield this.getById(parseInt(match[1]));
            }
            return null;
        });
    }
    static getById(accountId, config = undefined) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.getDataById(accountId, null, config);
            console.assert();
            return new Account(data);
        });
    }
    static getRootAccount(resetCache = false) {
        return __awaiter(this, void 0, void 0, function* () {
            let accounts = yield this.getAll();
            if (!resetCache && this.hasOwnProperty('account') && this.account) {
                return this.account;
            }
            let root = accounts.find((a) => a.rootAccountId === null);
            assert__WEBPACK_IMPORTED_MODULE_0___default()(root);
            this.account = root;
            return root;
        });
    }
    get rootAccountId() {
        return this.canvasData['root_account_id'];
    }
}
Account.nameProperty = 'name'; // The field name of the primary name of the canvas object type
Account.contentUrlTemplate = 'accounts/{content_id}'; // A templated url to get a single item
Account.allContentUrlTemplate = 'accounts'; // A templated url to get all items
class Course extends BaseCanvasObject {
    constructor() {
        super(...arguments);
        this._modules = undefined;
        this.modulesByWeekNumber = undefined;
    }
    static getFromUrl(url = null) {
        return __awaiter(this, void 0, void 0, function* () {
            if (url === null) {
                url = document.documentURI;
            }
            let match = /courses\/(\d+)/.exec(url);
            if (match) {
                console.log(match);
                const id = this.getIdFromUrl(url);
                if (!id)
                    return null;
                return yield this.getById(id);
            }
            return null;
        });
    }
    static getIdFromUrl(url) {
        let match = /courses\/(\d+)/.exec(url);
        if (match) {
            return parseInt(match[1]);
        }
        return null;
    }
    /**
     * Returns this library's class corresponding to the current url, drawing from Course.contentClasses.
     * Classes can be included in Course.contentClasses using the decorator @contentClass
     *
     * @param url
     */
    static getContentClassFromUrl(url = null) {
        if (!url)
            url = document.documentURI;
        for (let class_ of this.contentClasses) {
            console.log(class_, class_.contentUrlPart);
            if (class_.contentUrlPart && url.includes(class_.contentUrlPart))
                return class_;
        }
        return null;
    }
    static getById(courseId, config = undefined) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield fetchOneApiJson(`courses/${courseId}`, config);
            return new Course(data);
        });
    }
    static getCoursesByString(code, term = null, config = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            let courseDataList = null;
            const accountIdsByName = yield Course.getAccountIdsByName();
            for (let accountKey in accountIdsByName) {
                let accountId = accountIdsByName[accountKey];
                let url = `accounts/${accountId}/courses`;
                config.queryParams = config.queryParams || {};
                config.queryParams['search_term'] = code;
                if (term !== null) {
                    config.queryParams['enrollment_term_id'] = term.id;
                }
                courseDataList = yield getApiPagedData(url, config);
                if (courseDataList && courseDataList.length > 0) {
                    break;
                }
            }
            if (!courseDataList || courseDataList.length === 0) {
                return null;
            }
            if (courseDataList.length > 1) {
                courseDataList.sort((a, b) => b.id - a.id); // Sort courses by ID in descending order
            }
            return courseDataList.map(courseData => new Course(courseData));
        });
    }
    static getAllByCode(code, term = null, config = undefined) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.getCoursesByString(code, term, config);
        });
    }
    static getByCode(code, term = null, config = undefined) {
        return __awaiter(this, void 0, void 0, function* () {
            const courses = yield this.getCoursesByString(code, term, config);
            if (Array.isArray(courses))
                return courses[0];
            return null;
        });
    }
    static getAccountIdsByName() {
        return __awaiter(this, void 0, void 0, function* () {
            let course = yield Course.getFromUrl();
            if (!course) {
                console.warn("You must be on a canvas page to get accounts");
                return {};
            }
            return {
                'root': course.canvasData['root_account_id'],
                'current': course.canvasData['accountId']
            };
        });
    }
    // static async courseEvent(courses: Course[], event: string, accountId: number) {
    //     const url = `accounts/${accountId}/courses`; // Assuming API_URL and ACCOUNT_ID are defined elsewhere
    //     const data = {
    //         'event': event,
    //         'course_ids[]': courses.map(course => course.id)
    //     };
    //     const response = await fetch(url, {
    //         method: 'PUT',
    //         body: JSON.stringify(data)
    //     });
    //     if (!response.ok) {
    //         console.error(await response.text());
    //     }
    // }
    get contentUrlPath() {
        return `courses/${this.id}`;
    }
    get courseUrl() {
        return this.htmlContentUrl;
    }
    get courseCode() {
        let match = this.codeMatch;
        if (!match)
            return null;
        let prefix = match[1] || "";
        let courseCode = match[2] || "";
        return `${prefix}_${courseCode}`;
    }
    get codeMatch() {
        return Course.CODE_REGEX.exec(this.canvasData.course_code);
    }
    get baseCode() {
        let match = this.codeMatch;
        return match ? match[2] : '';
    }
    get codePrefix() {
        let match = this.codeMatch;
        return match ? match[1] : '';
    }
    get isBlueprint() {
        return 'blueprint' in this.canvasData && this.canvasData['blueprint'];
    }
    get isPublished() {
        return this.canvasData['workflow_state'] === 'available';
    }
    getModules() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._modules) {
                return this._modules;
            }
            let modules = yield getApiPagedData(`${this.contentUrlPath}/modules?include[]=items&include[]=content_details`);
            this._modules = modules;
            return modules;
        });
    }
    getContentItemFromUrl(url = null) {
        return __awaiter(this, void 0, void 0, function* () {
            let ContentClass = Course.getContentClassFromUrl(url);
            if (!ContentClass)
                return null;
            return ContentClass.getFromUrl(url);
        });
    }
    getModulesByWeekNumber() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.modulesByWeekNumber)
                return this.modulesByWeekNumber;
            let modules = yield this.getModules();
            let modulesByWeekNumber = {};
            for (let module of modules) {
                let weekNumber = getModuleWeekNumber(module);
                if (weekNumber) {
                    modulesByWeekNumber[weekNumber] = module;
                }
            }
            this.modulesByWeekNumber = modulesByWeekNumber;
            return modulesByWeekNumber;
        });
    }
    getModuleItemLink(moduleOrWeekNumber, target) {
        return __awaiter(this, void 0, void 0, function* () {
            assert__WEBPACK_IMPORTED_MODULE_0___default()(target.hasOwnProperty('type'));
            let targetType = target.type;
            let url = null;
            let contentSearchString = target.hasOwnProperty('search') ? target.search : null;
            let targetIndex = target.hasOwnProperty('index') ? target.index : null;
            let targetModuleWeekNumber;
            let targetModule;
            if (typeof moduleOrWeekNumber === 'number') {
                let modules = yield this.getModulesByWeekNumber();
                assert__WEBPACK_IMPORTED_MODULE_0___default()(modules.hasOwnProperty(moduleOrWeekNumber));
                targetModuleWeekNumber = moduleOrWeekNumber;
                targetModule = modules[targetModuleWeekNumber];
            }
            else {
                targetModule = moduleOrWeekNumber;
                targetModuleWeekNumber = getModuleWeekNumber(targetModule);
            }
            if (targetModule && typeof targetType !== 'undefined') {
                //If it's a page, just search for the parameter string
                if (targetType === 'Page' && contentSearchString) {
                    url = `/courses/${this.id}/pages?${new URLSearchParams([['search_term', contentSearchString]])}`;
                    //If it's anything else, get only those items in the module and set url to the targetIndexth one.
                }
                else if (targetType && targetIndex) {
                    //bump index for week 1 to account for intro discussion / checking for rubric would require pulling too much data
                    //and too much performance overhead
                    if (targetType === 'Discussion' && targetModuleWeekNumber === 1)
                        targetIndex++;
                    const matchingTypeItems = targetModule.items.filter((a) => a.type === targetType);
                    if (matchingTypeItems.length >= targetIndex) {
                        //We discuss and number the assignments indexed at 1, but the array is indexed at 0
                        const targetItem = matchingTypeItems[targetIndex - 1];
                        url = targetItem['html_url'];
                    }
                }
            }
            return url;
        });
    }
    getSyllabus() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!('syllabus_body' in this.canvasData)) {
                const data = yield Course.getById(this.id, { 'include[]': 'syllabus_body' });
                this.canvasData['syllabus_body'] = data.canvasData['syllabus_body'];
            }
            return this.canvasData['syllabus_body'];
        });
    }
    /**
     * gets all assignments in a course
     * @returns {Promise<Assignment[]>}
     * @param config
     */
    getAssignments(config = {
        queryParams: { 'include': ['due_at'] }
    }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Assignment.getAllInCourse(this, config);
        });
    }
    /**
     *Gets all quizzes in a course
     * @param queryParams a json object representing the query param string. Defaults to including due dates     *
     * @returns {Promise<Quiz[]>}
     */
    getQuizzes(queryParams = { 'include': ['due_at'] }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Quiz.getAllInCourse(this, { queryParams });
        });
    }
    getAssociatedCourses() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isBlueprint)
                return null;
            const url = `courses/${this.id}/blueprint_templates/default/associated_courses`;
            const courses = yield getApiPagedData(url, { queryParams: { per_page: 50 } });
            return courses.map(courseData => new Course(courseData));
        });
    }
    getSubsections() {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `/api/v1/courses/${this.id}/sections`;
            return yield fetchApiJson(url);
        });
    }
    getTabs() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield fetchApiJson(`courses/${this.id}/tabs`);
        });
    }
    getFrontPage() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield fetchOneApiJson(`${this.contentUrlPath}/front_page`);
                return new Page(data, this);
            }
            catch (error) {
                return null;
            }
        });
    }
    getTab(label) {
        return this.canvasData.tabs.find((tab) => tab.label === label) || null;
    }
    setNavigationTabHidden(label, value) {
        return __awaiter(this, void 0, void 0, function* () {
            const tab = this.getTab(label);
            if (!tab)
                return null;
            return yield fetchApiJson(`courses/${this.id}/tabs/${tab.id}`, {
                queryParams: { 'hidden': value }
            });
        });
    }
    changeSyllabus(newHtml) {
        return __awaiter(this, void 0, void 0, function* () {
            this.canvasData['syllabus_body'] = newHtml;
            return yield fetchApiJson(`courses/${this.id}`, {
                fetchInit: {
                    method: 'PUT',
                    body: JSON.stringify({ 'course[syllabus_body]': newHtml })
                }
            });
        });
    }
    getPotentialSections(term) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield Course.getAllByCode(this.baseCode, term);
        });
    }
    lockBlueprint() {
        return __awaiter(this, void 0, void 0, function* () {
            const modules = yield this.getModules();
            let items = [];
            items = items.concat(...modules.map((a) => [].concat(...a.items)));
            const promises = items.map((item) => __awaiter(this, void 0, void 0, function* () {
                const url = `${this.contentUrlPath}/blueprint_templates/default/restrict_item`;
                let { type, id } = yield getItemTypeAndId(item);
                let body = {
                    "content_type": type,
                    "content_id": id,
                    "restricted": true,
                    "_method": 'PUT'
                };
                console.log(body);
                yield fetchApiJson(url, { fetchInit: {
                        method: 'PUT',
                        body: formDataify(body)
                    } });
            }));
            yield Promise.all(promises);
        });
    }
    setAsBlueprint() {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `courses/${this.id}`;
            const payload = {
                'course[blueprint]': true,
                'course[use_blueprint_restrictions_by_object_type]': 0,
                'course[blueprint_restrictions][content]': 1,
                'course[blueprint_restrictions][points]': 1,
                'course[blueprint_restrictions][due_dates]': 1,
                'course[blueprint_restrictions][availability_dates]': 1,
            };
            this.canvasData = yield fetchOneApiJson(url, { fetchInit: {
                    method: 'PUT',
                    body: JSON.stringify(payload)
                } });
            this.resetCache();
        });
    }
    unsetAsBlueprint() {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `courses/${this.id}`;
            const payload = {
                'course[blueprint]': false,
            };
            this.canvasData = yield fetchOneApiJson(url, { fetchInit: {
                    method: 'PUT',
                    body: JSON.stringify(payload)
                } });
            this.resetCache();
        });
    }
    resetCache() {
        //delete this.subsections;
        //delete this.associatedCourses;
    }
    publish() {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `courses/${this.id}`;
            const courseData = yield fetchOneApiJson(url, { fetchInit: {
                    method: 'PUT',
                    body: JSON.stringify({ 'offer': true })
                } });
            console.log(courseData);
            this.canvasData = courseData;
            this.resetCache();
        });
    }
    unpublish() {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `courses/${this.id}`;
            yield fetchApiJson(url, { fetchInit: {
                    method: 'PUT',
                    body: JSON.stringify({ 'course[event]': 'claim' })
                } });
            this.canvasData = (yield Course.getById(this.id)).rawData;
        });
    }
    contentUpdatesAndFixes(_fixesToRun = null) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new NotImplementedException();
            // await this.setNavigationTabHidden('Dropout Detective', false);
            // await this.setNavigationTabHidden('BigBlueButton', false);
            //
            // const appliedTo = [];
            // if (fixesToRun === null) {
            //     fixesToRun = this.fixesToRun;
            // }
            //
            // for (const page of EvalFix.findContent(this)) {
            //     page.delete();
            //     appliedTo.push(page);
            // }
            //
            // for (const fixSet of fixesToRun) {
            //     const pages = fixSet.findContent(this);
            //     for (const page of pages) {
            //         const text = fixSet.fix(page.body);
            //         page.updateContent(text);
            //         appliedTo.push(page);
            //     }
            // }
            //
            // const syllabus = SyllabusFix.fix(this.syllabus);
            // await fetchApiJson(`courses/${this.id}`, {}, {
            //     method: 'PUT',
            //     body: JSON.stringify({'course[syllabus_body]': syllabus})
            // });
            // this.canvasData['syllabus_body'] = syllabus;
            // return appliedTo;
        });
    }
    reset(prompt = true) {
        return __awaiter(this, void 0, void 0, function* () {
            if (prompt && !confirm(`Are you sure you want to reset ${this.courseCode}?`)) {
                return false;
            }
            const url = `/courses/${this.id}/reset_content`;
            const data = yield fetchOneApiJson(url, { fetchInit: { method: 'POST' } });
            this.canvasData['id'] = data.id;
            return false;
        });
    }
    /**
     * NOT IMPLEMENTED
     * @param prompt Either a boolean or an async function that takes in a source and destination course and returns a boolean
     * @param updateCallback
     */
    importDevCourse(prompt = false, updateCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            const devCourse = yield this.getParentCourse();
            if (!devCourse) {
                throw new CourseNotFoundException(`DEV not found for ${this.name}.`);
            }
            if (prompt) {
                const canContinue = yield prompt(devCourse, this);
                if (!canContinue)
                    return;
            }
            yield this.importCourse(devCourse, updateCallback);
        });
    }
    importCourse(course, updateCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new NotImplementedException();
        });
    }
    getParentCourse(return_dev_search = false) {
        return __awaiter(this, void 0, void 0, function* () {
            let migrations = yield getApiPagedData(`courses/${this.id}/content_migrations`);
            if (migrations.length < 1) {
                console.log('no migrations found');
                if (return_dev_search) {
                    return Course.getByCode('DEV_' + this.baseCode);
                }
                else
                    return null;
            }
            migrations.sort((a, b) => b.id - a.id);
            try {
                for (let migration of migrations) {
                    let course = yield Course.getById(migration['settings']['source_course_id']);
                    if (course.codePrefix === "DEV")
                        return course;
                }
            }
            catch (e) {
                return yield Course.getByCode('DEV_' + this.baseCode);
            }
        });
    }
    generateHomeTiles() {
        return __awaiter(this, void 0, void 0, function* () {
            const modules = yield this.getModules();
            const promises = [];
            for (let module of modules) {
                promises.push(this.generateHomeTile(module));
            }
            yield Promise.all(promises);
        });
    }
    generateHomeTile(module) {
        return __awaiter(this, void 0, void 0, function* () {
            let overview = module.items.find(item => item.type === "Page" &&
                item.title.toLowerCase().includes('overview'));
            if (!(overview === null || overview === void 0 ? void 0 : overview.url))
                return;
            assert__WEBPACK_IMPORTED_MODULE_0___default()(overview.url);
            const url = overview.url.replace(/https:\/\/.*api\/v1/, '/api/v1');
            const pageData = yield fetchJson(url);
            const overviewPage = new Page(pageData, this);
            const pageBody = document.createElement('html');
            pageBody.innerHTML = overviewPage.body;
            let bannerImg = pageBody.querySelector('.cbt-banner-image img');
            assert__WEBPACK_IMPORTED_MODULE_0___default()(bannerImg, "Page has no banner");
            let download = yield downloadFile({
                method: 'GET',
                url: bannerImg.src,
            });
            // const img = await resizedImage(bannerImg.src, 500);
            // const canvas = document.createElement('canvas');
            // const ctx = canvas.getContext('2d');
            // const blob: Blob = await new Promise((resolve, reject) => canvas.toBlob(resolve as BlobCallback));
            // const homeTileName = `hometile${module.position}.png`
            // await this.uploadFile(
            //     new File([blob], homeTileName),
            //     '/Images/hometile');
        });
    }
    uploadFile(file, path) {
        return __awaiter(this, void 0, void 0, function* () {
            let url = `/api/v1/courses/${this.id}/files`;
            file.name;
            const initialParams = {
                name: file.name,
                no_redirect: true,
                parent_folder: path,
                on_duplicate: 'overwrite'
            };
            let response = yield fetch(url, {
                body: formDataify(initialParams),
                method: 'POST'
            });
            assert__WEBPACK_IMPORTED_MODULE_0___default()(response.ok, yield response.json());
            const data = yield response.json();
            const uploadParams = data.upload_params;
            const uploadFormData = formDataify(uploadParams);
            uploadFormData.append('file', file);
            response = yield fetch(uploadParams.url, {
                body: uploadFormData,
            });
            assert__WEBPACK_IMPORTED_MODULE_0___default()(response.ok, yield response.text());
        });
    }
    static registerContentClass(contentClass) {
        this.contentClasses.push(contentClass);
    }
}
Course.CODE_REGEX = /^(.+[^_])?_?(\w{4}\d{3})/i; // Adapted to JavaScript's regex syntax.
Course.contentClasses = [];
class BaseContentItem extends BaseCanvasObject {
    constructor(canvasData, course) {
        super(canvasData);
        this._course = course;
    }
    static get contentUrlPart() {
        assert__WEBPACK_IMPORTED_MODULE_0___default()(this.allContentUrlTemplate, "Not a content url template");
        const urlTermMatch = /\/([\w_]+)$/.exec(this.allContentUrlTemplate);
        console.log(this.allContentUrlTemplate, urlTermMatch);
        if (!urlTermMatch)
            return null;
        const urlTerm = urlTermMatch[1];
        return urlTerm;
    }
    static getIdFromUrl(url) {
        var _a;
        //let _contentUrlTemplate = "courses/{course_id}/discussion_topics/{content_id}";
        assert__WEBPACK_IMPORTED_MODULE_0___default()(this.contentUrlTemplate);
        // use the content url template as a basis to generate
        let regex = new RegExp((_a = this.contentUrlTemplate) === null || _a === void 0 ? void 0 : _a.replace(/\{.*\}/, '(d+)'));
        let match = /courses\/(\d+)/.exec(url);
        if (match) {
            return parseInt(match[1]);
        }
        return null;
    }
    static getAllInCourse(course, config) {
        return __awaiter(this, void 0, void 0, function* () {
            let url = this.getAllUrl(course.id);
            let data = yield getApiPagedData(url, config);
            return data.map(item => new this(item, course));
        });
    }
    static clearAddedContentTags(text) {
        let out = text.replace(/<\/?link[^>]*>/g, '');
        out = out.replace(/<\/?script[^>]*>/g, '');
        return out;
    }
    static getFromUrl(url = null, course = null) {
        return __awaiter(this, void 0, void 0, function* () {
            if (url === null) {
                url = document.documentURI;
            }
            url = url.replace(/\.com/, '.com/api/v1');
            let data = yield fetchJson(url);
            if (!course) {
                course = yield Course.getFromUrl();
                if (!course)
                    return null;
            }
            //If this is a collection of data, we can't process it as a Canvas Object
            if (Array.isArray(data))
                return null;
            assert__WEBPACK_IMPORTED_MODULE_0___default()(!Array.isArray(data));
            if (data) {
                return new this(data, course);
            }
            return null;
        });
    }
    get bodyKey() { return this.myClass.bodyProperty; }
    get body() {
        if (!this.bodyKey)
            return null;
        return this.myClass.clearAddedContentTags(this.canvasData[this.bodyKey]);
    }
    get dueAt() {
        if (!this.canvasData.hasOwnProperty('due_at')) {
            return null;
        }
        return new Date(this.canvasData.due_at);
    }
    setDueAt(date) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new NotImplementedException();
        });
    }
    dueAtTimeDelta(timeDelta) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.dueAt)
                return null;
            let result = new Date(this.dueAt);
            result.setDate(result.getDate() + timeDelta);
            return yield this.setDueAt(result);
        });
    }
    get contentUrlPath() {
        let url = this.constructor.contentUrlTemplate;
        assert__WEBPACK_IMPORTED_MODULE_0___default()(url);
        url = url.replace('{course_id}', this.course.id.toString());
        url = url.replace('{content_id}', this.id.toString());
        return url;
    }
    get course() {
        return this._course;
    }
    updateContent(text = null, name = null) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = {};
            const constructor = this.constructor;
            assert__WEBPACK_IMPORTED_MODULE_0___default()(constructor.bodyProperty);
            assert__WEBPACK_IMPORTED_MODULE_0___default()(constructor.nameProperty);
            const nameProp = constructor.nameProperty;
            const bodyProp = constructor.bodyProperty;
            if (text && bodyProp) {
                this.canvasData[bodyProp] = text;
                data[bodyProp] = text;
            }
            if (name && nameProp) {
                this.canvasData[nameProp] = name;
                data[nameProp] = name;
            }
            return this.saveData(data);
        });
    }
    getMeInAnotherCourse(targetCourse) {
        return __awaiter(this, void 0, void 0, function* () {
            let ContentClass = this.constructor;
            let targets = yield ContentClass.getAllInCourse(targetCourse, { queryParams: { search_term: this.name } });
            return targets.find((target) => target.name == this.name);
        });
    }
}
let Discussion = (() => {
    let _classDecorators = [contentClass];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseContentItem;
    var Discussion = _classThis = class extends _classSuper {
    };
    __setFunctionName(_classThis, "Discussion");
    (() => {
        var _a;
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Discussion = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
    })();
    _classThis.nameProperty = 'title';
    _classThis.bodyProperty = 'message';
    _classThis.contentUrlTemplate = "courses/{course_id}/discussion_topics/{content_id}";
    _classThis.allContentUrlTemplate = "courses/{course_id}/discussion_topics";
    (() => {
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Discussion = _classThis;
})();

let Assignment = (() => {
    let _classDecorators = [contentClass];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseContentItem;
    var Assignment = _classThis = class extends _classSuper {
        setDueAt(dueAt) {
            return __awaiter(this, void 0, void 0, function* () {
                let data = yield this.saveData({ 'assignment[due_at]': dueAt.toISOString() });
                this.canvasData['due_at'] = dueAt.toISOString();
                return data;
            });
        }
    };
    __setFunctionName(_classThis, "Assignment");
    (() => {
        var _a;
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Assignment = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
    })();
    _classThis.nameProperty = 'name';
    _classThis.bodyProperty = 'description';
    _classThis.contentUrlTemplate = "courses/{course_id}/assignments/{content_id}";
    _classThis.allContentUrlTemplate = "courses/{course_id}/assignments";
    (() => {
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Assignment = _classThis;
})();

let Quiz = (() => {
    let _classDecorators = [contentClass];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseContentItem;
    var Quiz = _classThis = class extends _classSuper {
        setDueAt(dueAt) {
            return __awaiter(this, void 0, void 0, function* () {
                let result = yield this.saveData({ 'quiz[due_at]': dueAt.toISOString() });
                this.canvasData['due_at'] = dueAt.toISOString();
                return result;
            });
        }
    };
    __setFunctionName(_classThis, "Quiz");
    (() => {
        var _a;
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Quiz = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
    })();
    _classThis.nameProperty = 'title';
    _classThis.bodyProperty = 'description';
    _classThis.contentUrlTemplate = "courses/{course_id}/quizzes/{content_id}";
    _classThis.allContentUrlTemplate = "courses/{course_id}/quizzes";
    (() => {
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Quiz = _classThis;
})();

let Page = (() => {
    let _classDecorators = [contentClass];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BaseContentItem;
    var Page = _classThis = class extends _classSuper {
        getRevisions() {
            return __awaiter(this, void 0, void 0, function* () {
                return getPagedData(`${this.contentUrlPath}/revisions`);
            });
        }
        revertLastChangeSet(stepsBack = 1) {
            return __awaiter(this, void 0, void 0, function* () {
                let revisions = yield this.getRevisions();
                revisions.sort((a, b) => b['revision_id'] - a['revision_id']);
                if (revisions.length <= stepsBack) {
                    console.warn(`Tried to revert ${this.name} but there isn't a previous revision`);
                    return null;
                }
                let revision = revisions[stepsBack];
                yield this.applyRevision(revision);
            });
        }
        resetContent(revisionId = 1) {
            return __awaiter(this, void 0, void 0, function* () {
                let revisions = yield this.getRevisions();
                let revision = revisions.find(r => r['revision_id'] === revisionId);
                if (!revision)
                    throw new Error(`No revision found for ${revisionId}`);
                yield this.applyRevision(revision);
            });
        }
        applyRevision(revision) {
            return __awaiter(this, void 0, void 0, function* () {
                const revisionId = revision['revision_id'];
                let result = yield fetchOneApiJson(`${this.contentUrlPath}/revisions/${revisionId}?revision_id=${revisionId}`);
                this.canvasData[this.bodyKey] = result['body'];
                this.canvasData[this.nameKey] = result['title'];
            });
        }
        get body() {
            return this.canvasData[this.bodyKey];
        }
        updateContent(text = null, name = null) {
            return __awaiter(this, void 0, void 0, function* () {
                let data = {};
                if (text) {
                    this.canvasData[this.bodyKey] = text;
                    data['wiki_page[body]'] = text;
                }
                if (name) {
                    this.canvasData[this.nameKey] = name;
                    data[this.nameKey] = name;
                }
                return this.saveData(data);
            });
        }
    };
    __setFunctionName(_classThis, "Page");
    (() => {
        var _a;
        const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create((_a = _classSuper[Symbol.metadata]) !== null && _a !== void 0 ? _a : null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Page = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
    })();
    _classThis.idProperty = 'page_id';
    _classThis.nameProperty = 'title';
    _classThis.bodyProperty = 'body';
    _classThis.contentUrlTemplate = "courses/{course_id}/pages/{content_id}";
    _classThis.allContentUrlTemplate = "courses/{course_id}/pages/";
    (() => {
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Page = _classThis;
})();

class Rubric extends BaseContentItem {
    associations(reload = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if ('associations' in this.canvasData && !reload) {
                return this.canvasData['associations'];
            }
            let data = yield this.myClass.getDataById(this.id, this.course, { params: { 'include': ['associations'] } });
            let associations = data['associations'].map((data) => new RubricAssociation(data, this.course));
            this.canvasData['associations'] = associations;
            return associations;
        });
    }
}
Rubric.nameProperty = 'title';
Rubric.contentUrlTemplate = "courses/{course_id}/rubrics/{content_id}";
Rubric.allContentUrlTemplate = "courses/{course_id}/rubrics";
class RubricAssociation extends BaseContentItem {
    get useForGrading() {
        return this.canvasData['use_for_grading'];
    }
    setUseForGrading(value) {
        return __awaiter(this, void 0, void 0, function* () {
            this.canvasData['use_for_grading'] = value;
            return yield this.saveData({ 'rubric_association[use_for_grading]': value });
        });
    }
}
RubricAssociation.contentUrlTemplate = "courses/{course_id}/rubric_associations/{content_id}";
RubricAssociation.allContentUrlTemplate = "courses/{course_id}/rubric_associations";
class Term extends BaseCanvasObject {
    get code() {
        return this.canvasData['name'];
    }
    static getTerm(code, workflowState = 'any', config = undefined) {
        return __awaiter(this, void 0, void 0, function* () {
            const terms = yield this.searchTerms(code, workflowState, config);
            if (!Array.isArray(terms) || terms.length <= 0) {
                return null;
            }
            return terms[0];
        });
    }
    static getAllActiveTerms(config = null) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.searchTerms(null, 'active', config);
        });
    }
    static searchTerms(code = null, workflowState = 'all', config = null) {
        return __awaiter(this, void 0, void 0, function* () {
            config = config || {};
            config.queryParams = config.queryParams || {};
            let queryParams = config.queryParams;
            if (workflowState)
                queryParams['workflow_state'] = workflowState;
            if (code)
                queryParams['term_name'] = code;
            let rootAccount = yield Account.getRootAccount();
            let url = `accounts/${rootAccount === null || rootAccount === void 0 ? void 0 : rootAccount.id}/terms`;
            const data = yield getApiPagedData(url, config);
            let terms = [];
            terms.concat(...data.map((datum) => [...datum['enrollment_terms']]));
            if (!data || !data.hasOwnProperty('enrollment_terms')) {
                console.warn(`No enrollment terms found for ${code}`);
                return null;
            }
            if (!terms || terms.length === 0) {
                return null;
            }
            return terms.map(term => new Term(term));
        });
    }
}
class NotImplementedException extends Error {
}
class CourseNotFoundException extends Error {
}
function contentClass(originalClass, _context) {
    Course.registerContentClass(originalClass);
    //originalClass.contentUrlPart =
}

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FudmFzLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFYTs7QUFFYixzQkFBc0IsMkJBQTJCLG9HQUFvRyxtQkFBbUIsaUJBQWlCLHNIQUFzSDtBQUMvUyw0Q0FBNEMsZ0JBQWdCLGtCQUFrQixPQUFPLDJCQUEyQix3REFBd0QsZ0NBQWdDLHVEQUF1RDtBQUMvUCw4REFBOEQsc0VBQXNFLDhEQUE4RCxrREFBa0QsaUJBQWlCLEdBQUc7QUFDeFEsK0JBQStCLHVDQUF1QztBQUN0RSxxQ0FBcUMsaUVBQWlFLHNDQUFzQywwQkFBMEIsK0NBQStDLDJDQUEyQyx1RUFBdUU7QUFDdlUsa0RBQWtELDBDQUEwQztBQUM1RixlQUFlLG1CQUFPLENBQUMseUVBQW1CO0FBQzFDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQixtQkFBTyxDQUFDLHlHQUFtQztBQUNoRSxnQkFBZ0IsbUJBQU8sQ0FBQywwQ0FBTztBQUMvQjtBQUNBLHFCQUFxQix1RUFBc0I7QUFDM0M7QUFDQTtBQUNBLG1CQUFtQixtQkFBTyxDQUFDLHdFQUF3QjtBQUNuRCxlQUFlLG1CQUFPLENBQUMsZ0VBQW9CO0FBQzNDLDBCQUEwQixtQkFBTyxDQUFDLGtFQUFxQjtBQUN2RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixtQkFBTyxDQUFDLDZGQUE2QjtBQUN4RDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBLGlCQUFpQixPQUFPLGVBQWUsT0FBTztBQUM5QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esc0VBQXNFLGFBQWE7QUFDbkY7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSCxDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5QkFBeUI7QUFDekI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsS0FBSztBQUNMO0FBQ0EsS0FBSztBQUNMLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1B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QTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0NBQW9DLGFBQWEsSUFBSSxhQUFhO0FBQ2xFO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjLGNBQWM7QUFDNUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFD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QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUIsdUVBQXNCO0FBQzNDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0IsZ0JBQWdCO0FBQ2xDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0NBQXdDLFNBQVM7QUFDakQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUIsdUJBQXVCO0FBQzlDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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QUFDSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQ3REYTs7QUFFYixXQUFXLGFBQWE7QUFDeEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7O0FDZkE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixzQkFBc0I7QUFDOUM7QUFD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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsNENBQTRDLEtBQUs7O0FBRWpEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBLEtBQUs7QUFDTDs7QUFFQTs7QUFFQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQSxvQ0FBb0MsT0FBTztBQUMzQztBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBOzs7QUFHQTtBQUNBO0FBQ0EsMERBQTBEO0FBQzFEO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYLFVBQVU7QUFDVjtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQSxrR0FBMEM7O0FBRTFDO0FBQ0E7QUFDQTtBQUNBLGVBQWU7O0FBRWY7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCOztBQUVqQjtBQUNBO0FBQ0E7QUFDQSxjQUFjOztBQUVkO0FBQ0E7QUFDQTtBQUNBLHlCQUF5Qjs7QUFFekI7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCOztBQUVoQjtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0I7O0FBRWhCO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQjs7QUFFaEI7QUFDQTtBQUNBO0FBQ0EsbUJBQW1COztBQUVuQjtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0I7QUFDaEIsc0JBQXNCOztBQUV0QjtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0I7O0FBRWhCO0FBQ0E7QUFDQTtBQUNBLGNBQWM7QUFDZCxvQkFBb0I7O0FBRXBCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZTtBQUNmLDJCQUEyQjs7QUFFM0I7QUFDQTtBQUNBO0FBQ0Esa0JBQWtCOztBQUVsQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1COztBQUVuQixrSEFBZ0Q7O0FBRWhEO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsVUFBVTtBQUNyQjtBQUNBLFdBQVcsVUFBVTtBQUNyQjtBQUNBLHFHQUFzQzs7QUFFdEMsZUFBZTtBQUNmO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBLGlCQUFpQjtBQUNqQjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQSxvQkFBb0Isc0JBQXNCO0FBQzFDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLHdCQUF3Qjs7QUFFeEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0Isc0JBQXNCO0FBQzFDO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRCQUE0QixPQUFPLHFDQUFxQztBQUN4RSw0QkFBNEIsT0FBTyxzREFBc0Q7QUFDekY7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQjs7Ozs7Ozs7Ozs7QUMxc0JuQjtBQUNBLE1BQU0sSUFBMEM7QUFDaEQsSUFBSSxpQ0FBZ0MsQ0FBQyxNQUFRLENBQUMsb0NBQUUsT0FBTztBQUFBO0FBQUE7QUFBQSxrR0FBQztBQUN4RCxJQUFJLEtBQUssWUFRTjtBQUNILENBQUM7QUFDRDs7QUFFQSxzQ0FBc0M7O0FBRXRDOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHdIQUF3SDtBQUN4SDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCLFVBQVU7QUFDM0I7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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LENBQUMsQ0FBQztnQkFDdEQsT0FBTyxJQUFJLENBQUM7WUFDaEIsQ0FBQztZQUVELElBQUksQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDL0IsT0FBTyxJQUFJLENBQUM7WUFDaEIsQ0FBQztZQUNELE9BQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDN0MsQ0FBQztLQUFBO0NBQ0o7QUFHTSxNQUFNLHVCQUF3QixTQUFRLEtBQUs7Q0FBRztBQUM5QyxNQUFNLHVCQUF3QixTQUFRLEtBQUs7Q0FBRztBQUlyRCxTQUFTLFlBQVksQ0FBQyxhQUFxQyxFQUFFLFFBQStCO0lBQ3hGLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUMzQyxnQ0FBZ0M7QUFDcEMsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9hc3NlcnQvYnVpbGQvYXNzZXJ0LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9hc3NlcnQvYnVpbGQvaW50ZXJuYWwvYXNzZXJ0L2Fzc2VydGlvbl9lcnJvci5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvYXNzZXJ0L2J1aWxkL2ludGVybmFsL2Vycm9ycy5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvYXNzZXJ0L2J1aWxkL2ludGVybmFsL3V0aWwvY29tcGFyaXNvbnMuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2NhbGwtYmluZC9jYWxsQm91bmQuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2NhbGwtYmluZC9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvZGVmaW5lLWRhdGEtcHJvcGVydHkvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2RlZmluZS1wcm9wZXJ0aWVzL2luZGV4LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9lcy1kZWZpbmUtcHJvcGVydHkvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2VzLWVycm9ycy9ldmFsLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9lcy1lcnJvcnMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2VzLWVycm9ycy9yYW5nZS5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvZXMtZXJyb3JzL3JlZi5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvZXMtZXJyb3JzL3N5bnRheC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvZXMtZXJyb3JzL3R5cGUuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2VzLWVycm9ycy91cmkuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2Zvci1lYWNoL2luZGV4LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9mdW5jdGlvbi1iaW5kL2ltcGxlbWVudGF0aW9uLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9mdW5jdGlvbi1iaW5kL2luZGV4LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9nZXQtaW50cmluc2ljL2luZGV4LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9nb3BkL2luZGV4LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9oYXMtcHJvcGVydHktZGVzY3JpcHRvcnMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2hhcy1wcm90by9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvaGFzLXN5bWJvbHMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2hhcy1zeW1ib2xzL3NoYW1zLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9oYXMtdG9zdHJpbmd0YWcvc2hhbXMuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2hhc293bi9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvaW5oZXJpdHMvaW5oZXJpdHNfYnJvd3Nlci5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvaXMtYXJndW1lbnRzL2luZGV4LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9pcy1jYWxsYWJsZS9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvaXMtZ2VuZXJhdG9yLWZ1bmN0aW9uL2luZGV4LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9pcy1uYW4vaW1wbGVtZW50YXRpb24uanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2lzLW5hbi9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvaXMtbmFuL3BvbHlmaWxsLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9pcy1uYW4vc2hpbS5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvaXMtdHlwZWQtYXJyYXkvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL29iamVjdC1pcy9pbXBsZW1lbnRhdGlvbi5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvb2JqZWN0LWlzL2luZGV4LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9vYmplY3QtaXMvcG9seWZpbGwuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL29iamVjdC1pcy9zaGltLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9vYmplY3Qta2V5cy9pbXBsZW1lbnRhdGlvbi5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvb2JqZWN0LWtleXMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL29iamVjdC1rZXlzL2lzQXJndW1lbnRzLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9vYmplY3QuYXNzaWduL2ltcGxlbWVudGF0aW9uLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9vYmplY3QuYXNzaWduL3BvbHlmaWxsLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9wb3NzaWJsZS10eXBlZC1hcnJheS1uYW1lcy9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9zZXQtZnVuY3Rpb24tbGVuZ3RoL2luZGV4LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy91dGlsL3N1cHBvcnQvaXNCdWZmZXJCcm93c2VyLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy91dGlsL3N1cHBvcnQvdHlwZXMuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3V0aWwvdXRpbC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvd2ViZXh0ZW5zaW9uLXBvbHlmaWxsL2Rpc3QvYnJvd3Nlci1wb2x5ZmlsbC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvd2hpY2gtdHlwZWQtYXJyYXkvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2F2YWlsYWJsZS10eXBlZC1hcnJheXMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvY29tcGF0IGdldCBkZWZhdWx0IGV4cG9ydCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvZ2xvYmFsIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovLy8uL3NyYy9jYW52YXMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ3VycmVudGx5IGluIHN5bmMgd2l0aCBOb2RlLmpzIGxpYi9hc3NlcnQuanNcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9ub2RlanMvbm9kZS9jb21taXQvMmE1MWFlNDI0YTUxM2VjOWE2YWEzNDY2YmFhMGNjMWQ1NWRkNGYzYlxuXG4vLyBPcmlnaW5hbGx5IGZyb20gbmFyd2hhbC5qcyAoaHR0cDovL25hcndoYWxqcy5vcmcpXG4vLyBDb3B5cmlnaHQgKGMpIDIwMDkgVGhvbWFzIFJvYmluc29uIDwyODBub3J0aC5jb20+XG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgJ1NvZnR3YXJlJyksIHRvXG4vLyBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZVxuLy8gcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yXG4vLyBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEICdBUyBJUycsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTlxuLy8gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTlxuLy8gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gX3R5cGVvZihvKSB7IFwiQGJhYmVsL2hlbHBlcnMgLSB0eXBlb2ZcIjsgcmV0dXJuIF90eXBlb2YgPSBcImZ1bmN0aW9uXCIgPT0gdHlwZW9mIFN5bWJvbCAmJiBcInN5bWJvbFwiID09IHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPyBmdW5jdGlvbiAobykgeyByZXR1cm4gdHlwZW9mIG87IH0gOiBmdW5jdGlvbiAobykgeyByZXR1cm4gbyAmJiBcImZ1bmN0aW9uXCIgPT0gdHlwZW9mIFN5bWJvbCAmJiBvLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgJiYgbyAhPT0gU3ltYm9sLnByb3RvdHlwZSA/IFwic3ltYm9sXCIgOiB0eXBlb2YgbzsgfSwgX3R5cGVvZihvKTsgfVxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBfdG9Qcm9wZXJ0eUtleShkZXNjcmlwdG9yLmtleSksIGRlc2NyaXB0b3IpOyB9IH1cbmZ1bmN0aW9uIF9jcmVhdGVDbGFzcyhDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIF9kZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgX2RlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KENvbnN0cnVjdG9yLCBcInByb3RvdHlwZVwiLCB7IHdyaXRhYmxlOiBmYWxzZSB9KTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9XG5mdW5jdGlvbiBfdG9Qcm9wZXJ0eUtleShhcmcpIHsgdmFyIGtleSA9IF90b1ByaW1pdGl2ZShhcmcsIFwic3RyaW5nXCIpOyByZXR1cm4gX3R5cGVvZihrZXkpID09PSBcInN5bWJvbFwiID8ga2V5IDogU3RyaW5nKGtleSk7IH1cbmZ1bmN0aW9uIF90b1ByaW1pdGl2ZShpbnB1dCwgaGludCkgeyBpZiAoX3R5cGVvZihpbnB1dCkgIT09IFwib2JqZWN0XCIgfHwgaW5wdXQgPT09IG51bGwpIHJldHVybiBpbnB1dDsgdmFyIHByaW0gPSBpbnB1dFtTeW1ib2wudG9QcmltaXRpdmVdOyBpZiAocHJpbSAhPT0gdW5kZWZpbmVkKSB7IHZhciByZXMgPSBwcmltLmNhbGwoaW5wdXQsIGhpbnQgfHwgXCJkZWZhdWx0XCIpOyBpZiAoX3R5cGVvZihyZXMpICE9PSBcIm9iamVjdFwiKSByZXR1cm4gcmVzOyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQEB0b1ByaW1pdGl2ZSBtdXN0IHJldHVybiBhIHByaW1pdGl2ZSB2YWx1ZS5cIik7IH0gcmV0dXJuIChoaW50ID09PSBcInN0cmluZ1wiID8gU3RyaW5nIDogTnVtYmVyKShpbnB1dCk7IH1cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG52YXIgX3JlcXVpcmUgPSByZXF1aXJlKCcuL2ludGVybmFsL2Vycm9ycycpLFxuICBfcmVxdWlyZSRjb2RlcyA9IF9yZXF1aXJlLmNvZGVzLFxuICBFUlJfQU1CSUdVT1VTX0FSR1VNRU5UID0gX3JlcXVpcmUkY29kZXMuRVJSX0FNQklHVU9VU19BUkdVTUVOVCxcbiAgRVJSX0lOVkFMSURfQVJHX1RZUEUgPSBfcmVxdWlyZSRjb2Rlcy5FUlJfSU5WQUxJRF9BUkdfVFlQRSxcbiAgRVJSX0lOVkFMSURfQVJHX1ZBTFVFID0gX3JlcXVpcmUkY29kZXMuRVJSX0lOVkFMSURfQVJHX1ZBTFVFLFxuICBFUlJfSU5WQUxJRF9SRVRVUk5fVkFMVUUgPSBfcmVxdWlyZSRjb2Rlcy5FUlJfSU5WQUxJRF9SRVRVUk5fVkFMVUUsXG4gIEVSUl9NSVNTSU5HX0FSR1MgPSBfcmVxdWlyZSRjb2Rlcy5FUlJfTUlTU0lOR19BUkdTO1xudmFyIEFzc2VydGlvbkVycm9yID0gcmVxdWlyZSgnLi9pbnRlcm5hbC9hc3NlcnQvYXNzZXJ0aW9uX2Vycm9yJyk7XG52YXIgX3JlcXVpcmUyID0gcmVxdWlyZSgndXRpbC8nKSxcbiAgaW5zcGVjdCA9IF9yZXF1aXJlMi5pbnNwZWN0O1xudmFyIF9yZXF1aXJlJHR5cGVzID0gcmVxdWlyZSgndXRpbC8nKS50eXBlcyxcbiAgaXNQcm9taXNlID0gX3JlcXVpcmUkdHlwZXMuaXNQcm9taXNlLFxuICBpc1JlZ0V4cCA9IF9yZXF1aXJlJHR5cGVzLmlzUmVnRXhwO1xudmFyIG9iamVjdEFzc2lnbiA9IHJlcXVpcmUoJ29iamVjdC5hc3NpZ24vcG9seWZpbGwnKSgpO1xudmFyIG9iamVjdElzID0gcmVxdWlyZSgnb2JqZWN0LWlzL3BvbHlmaWxsJykoKTtcbnZhciBSZWdFeHBQcm90b3R5cGVUZXN0ID0gcmVxdWlyZSgnY2FsbC1iaW5kL2NhbGxCb3VuZCcpKCdSZWdFeHAucHJvdG90eXBlLnRlc3QnKTtcbnZhciBlcnJvckNhY2hlID0gbmV3IE1hcCgpO1xudmFyIGlzRGVlcEVxdWFsO1xudmFyIGlzRGVlcFN0cmljdEVxdWFsO1xudmFyIHBhcnNlRXhwcmVzc2lvbkF0O1xudmFyIGZpbmROb2RlQXJvdW5kO1xudmFyIGRlY29kZXI7XG5mdW5jdGlvbiBsYXp5TG9hZENvbXBhcmlzb24oKSB7XG4gIHZhciBjb21wYXJpc29uID0gcmVxdWlyZSgnLi9pbnRlcm5hbC91dGlsL2NvbXBhcmlzb25zJyk7XG4gIGlzRGVlcEVxdWFsID0gY29tcGFyaXNvbi5pc0RlZXBFcXVhbDtcbiAgaXNEZWVwU3RyaWN0RXF1YWwgPSBjb21wYXJpc29uLmlzRGVlcFN0cmljdEVxdWFsO1xufVxuXG4vLyBFc2NhcGUgY29udHJvbCBjaGFyYWN0ZXJzIGJ1dCBub3QgXFxuIGFuZCBcXHQgdG8ga2VlcCB0aGUgbGluZSBicmVha3MgYW5kXG4vLyBpbmRlbnRhdGlvbiBpbnRhY3QuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29udHJvbC1yZWdleFxudmFyIGVzY2FwZVNlcXVlbmNlc1JlZ0V4cCA9IC9bXFx4MDAtXFx4MDhcXHgwYlxceDBjXFx4MGUtXFx4MWZdL2c7XG52YXIgbWV0YSA9IFtcIlxcXFx1MDAwMFwiLCBcIlxcXFx1MDAwMVwiLCBcIlxcXFx1MDAwMlwiLCBcIlxcXFx1MDAwM1wiLCBcIlxcXFx1MDAwNFwiLCBcIlxcXFx1MDAwNVwiLCBcIlxcXFx1MDAwNlwiLCBcIlxcXFx1MDAwN1wiLCAnXFxcXGInLCAnJywgJycsIFwiXFxcXHUwMDBiXCIsICdcXFxcZicsICcnLCBcIlxcXFx1MDAwZVwiLCBcIlxcXFx1MDAwZlwiLCBcIlxcXFx1MDAxMFwiLCBcIlxcXFx1MDAxMVwiLCBcIlxcXFx1MDAxMlwiLCBcIlxcXFx1MDAxM1wiLCBcIlxcXFx1MDAxNFwiLCBcIlxcXFx1MDAxNVwiLCBcIlxcXFx1MDAxNlwiLCBcIlxcXFx1MDAxN1wiLCBcIlxcXFx1MDAxOFwiLCBcIlxcXFx1MDAxOVwiLCBcIlxcXFx1MDAxYVwiLCBcIlxcXFx1MDAxYlwiLCBcIlxcXFx1MDAxY1wiLCBcIlxcXFx1MDAxZFwiLCBcIlxcXFx1MDAxZVwiLCBcIlxcXFx1MDAxZlwiXTtcbnZhciBlc2NhcGVGbiA9IGZ1bmN0aW9uIGVzY2FwZUZuKHN0cikge1xuICByZXR1cm4gbWV0YVtzdHIuY2hhckNvZGVBdCgwKV07XG59O1xudmFyIHdhcm5lZCA9IGZhbHNlO1xuXG4vLyBUaGUgYXNzZXJ0IG1vZHVsZSBwcm92aWRlcyBmdW5jdGlvbnMgdGhhdCB0aHJvd1xuLy8gQXNzZXJ0aW9uRXJyb3IncyB3aGVuIHBhcnRpY3VsYXIgY29uZGl0aW9ucyBhcmUgbm90IG1ldC4gVGhlXG4vLyBhc3NlcnQgbW9kdWxlIG11c3QgY29uZm9ybSB0byB0aGUgZm9sbG93aW5nIGludGVyZmFjZS5cblxudmFyIGFzc2VydCA9IG1vZHVsZS5leHBvcnRzID0gb2s7XG52YXIgTk9fRVhDRVBUSU9OX1NFTlRJTkVMID0ge307XG5cbi8vIEFsbCBvZiB0aGUgZm9sbG93aW5nIGZ1bmN0aW9ucyBtdXN0IHRocm93IGFuIEFzc2VydGlvbkVycm9yXG4vLyB3aGVuIGEgY29ycmVzcG9uZGluZyBjb25kaXRpb24gaXMgbm90IG1ldCwgd2l0aCBhIG1lc3NhZ2UgdGhhdFxuLy8gbWF5IGJlIHVuZGVmaW5lZCBpZiBub3QgcHJvdmlkZWQuIEFsbCBhc3NlcnRpb24gbWV0aG9kcyBwcm92aWRlXG4vLyBib3RoIHRoZSBhY3R1YWwgYW5kIGV4cGVjdGVkIHZhbHVlcyB0byB0aGUgYXNzZXJ0aW9uIGVycm9yIGZvclxuLy8gZGlzcGxheSBwdXJwb3Nlcy5cblxuZnVuY3Rpb24gaW5uZXJGYWlsKG9iaikge1xuICBpZiAob2JqLm1lc3NhZ2UgaW5zdGFuY2VvZiBFcnJvcikgdGhyb3cgb2JqLm1lc3NhZ2U7XG4gIHRocm93IG5ldyBBc3NlcnRpb25FcnJvcihvYmopO1xufVxuZnVuY3Rpb24gZmFpbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlLCBvcGVyYXRvciwgc3RhY2tTdGFydEZuKSB7XG4gIHZhciBhcmdzTGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgdmFyIGludGVybmFsTWVzc2FnZTtcbiAgaWYgKGFyZ3NMZW4gPT09IDApIHtcbiAgICBpbnRlcm5hbE1lc3NhZ2UgPSAnRmFpbGVkJztcbiAgfSBlbHNlIGlmIChhcmdzTGVuID09PSAxKSB7XG4gICAgbWVzc2FnZSA9IGFjdHVhbDtcbiAgICBhY3R1YWwgPSB1bmRlZmluZWQ7XG4gIH0gZWxzZSB7XG4gICAgaWYgKHdhcm5lZCA9PT0gZmFsc2UpIHtcbiAgICAgIHdhcm5lZCA9IHRydWU7XG4gICAgICB2YXIgd2FybiA9IHByb2Nlc3MuZW1pdFdhcm5pbmcgPyBwcm9jZXNzLmVtaXRXYXJuaW5nIDogY29uc29sZS53YXJuLmJpbmQoY29uc29sZSk7XG4gICAgICB3YXJuKCdhc3NlcnQuZmFpbCgpIHdpdGggbW9yZSB0aGFuIG9uZSBhcmd1bWVudCBpcyBkZXByZWNhdGVkLiAnICsgJ1BsZWFzZSB1c2UgYXNzZXJ0LnN0cmljdEVxdWFsKCkgaW5zdGVhZCBvciBvbmx5IHBhc3MgYSBtZXNzYWdlLicsICdEZXByZWNhdGlvbldhcm5pbmcnLCAnREVQMDA5NCcpO1xuICAgIH1cbiAgICBpZiAoYXJnc0xlbiA9PT0gMikgb3BlcmF0b3IgPSAnIT0nO1xuICB9XG4gIGlmIChtZXNzYWdlIGluc3RhbmNlb2YgRXJyb3IpIHRocm93IG1lc3NhZ2U7XG4gIHZhciBlcnJBcmdzID0ge1xuICAgIGFjdHVhbDogYWN0dWFsLFxuICAgIGV4cGVjdGVkOiBleHBlY3RlZCxcbiAgICBvcGVyYXRvcjogb3BlcmF0b3IgPT09IHVuZGVmaW5lZCA/ICdmYWlsJyA6IG9wZXJhdG9yLFxuICAgIHN0YWNrU3RhcnRGbjogc3RhY2tTdGFydEZuIHx8IGZhaWxcbiAgfTtcbiAgaWYgKG1lc3NhZ2UgIT09IHVuZGVmaW5lZCkge1xuICAgIGVyckFyZ3MubWVzc2FnZSA9IG1lc3NhZ2U7XG4gIH1cbiAgdmFyIGVyciA9IG5ldyBBc3NlcnRpb25FcnJvcihlcnJBcmdzKTtcbiAgaWYgKGludGVybmFsTWVzc2FnZSkge1xuICAgIGVyci5tZXNzYWdlID0gaW50ZXJuYWxNZXNzYWdlO1xuICAgIGVyci5nZW5lcmF0ZWRNZXNzYWdlID0gdHJ1ZTtcbiAgfVxuICB0aHJvdyBlcnI7XG59XG5hc3NlcnQuZmFpbCA9IGZhaWw7XG5cbi8vIFRoZSBBc3NlcnRpb25FcnJvciBpcyBkZWZpbmVkIGluIGludGVybmFsL2Vycm9yLlxuYXNzZXJ0LkFzc2VydGlvbkVycm9yID0gQXNzZXJ0aW9uRXJyb3I7XG5mdW5jdGlvbiBpbm5lck9rKGZuLCBhcmdMZW4sIHZhbHVlLCBtZXNzYWdlKSB7XG4gIGlmICghdmFsdWUpIHtcbiAgICB2YXIgZ2VuZXJhdGVkTWVzc2FnZSA9IGZhbHNlO1xuICAgIGlmIChhcmdMZW4gPT09IDApIHtcbiAgICAgIGdlbmVyYXRlZE1lc3NhZ2UgPSB0cnVlO1xuICAgICAgbWVzc2FnZSA9ICdObyB2YWx1ZSBhcmd1bWVudCBwYXNzZWQgdG8gYGFzc2VydC5vaygpYCc7XG4gICAgfSBlbHNlIGlmIChtZXNzYWdlIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgIHRocm93IG1lc3NhZ2U7XG4gICAgfVxuICAgIHZhciBlcnIgPSBuZXcgQXNzZXJ0aW9uRXJyb3Ioe1xuICAgICAgYWN0dWFsOiB2YWx1ZSxcbiAgICAgIGV4cGVjdGVkOiB0cnVlLFxuICAgICAgbWVzc2FnZTogbWVzc2FnZSxcbiAgICAgIG9wZXJhdG9yOiAnPT0nLFxuICAgICAgc3RhY2tTdGFydEZuOiBmblxuICAgIH0pO1xuICAgIGVyci5nZW5lcmF0ZWRNZXNzYWdlID0gZ2VuZXJhdGVkTWVzc2FnZTtcbiAgICB0aHJvdyBlcnI7XG4gIH1cbn1cblxuLy8gUHVyZSBhc3NlcnRpb24gdGVzdHMgd2hldGhlciBhIHZhbHVlIGlzIHRydXRoeSwgYXMgZGV0ZXJtaW5lZFxuLy8gYnkgISF2YWx1ZS5cbmZ1bmN0aW9uIG9rKCkge1xuICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IG5ldyBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICBhcmdzW19rZXldID0gYXJndW1lbnRzW19rZXldO1xuICB9XG4gIGlubmVyT2suYXBwbHkodm9pZCAwLCBbb2ssIGFyZ3MubGVuZ3RoXS5jb25jYXQoYXJncykpO1xufVxuYXNzZXJ0Lm9rID0gb2s7XG5cbi8vIFRoZSBlcXVhbGl0eSBhc3NlcnRpb24gdGVzdHMgc2hhbGxvdywgY29lcmNpdmUgZXF1YWxpdHkgd2l0aCA9PS5cbi8qIGVzbGludC1kaXNhYmxlIG5vLXJlc3RyaWN0ZWQtcHJvcGVydGllcyAqL1xuYXNzZXJ0LmVxdWFsID0gZnVuY3Rpb24gZXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHtcbiAgICB0aHJvdyBuZXcgRVJSX01JU1NJTkdfQVJHUygnYWN0dWFsJywgJ2V4cGVjdGVkJyk7XG4gIH1cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGVxZXFlcVxuICBpZiAoYWN0dWFsICE9IGV4cGVjdGVkKSB7XG4gICAgaW5uZXJGYWlsKHtcbiAgICAgIGFjdHVhbDogYWN0dWFsLFxuICAgICAgZXhwZWN0ZWQ6IGV4cGVjdGVkLFxuICAgICAgbWVzc2FnZTogbWVzc2FnZSxcbiAgICAgIG9wZXJhdG9yOiAnPT0nLFxuICAgICAgc3RhY2tTdGFydEZuOiBlcXVhbFxuICAgIH0pO1xuICB9XG59O1xuXG4vLyBUaGUgbm9uLWVxdWFsaXR5IGFzc2VydGlvbiB0ZXN0cyBmb3Igd2hldGhlciB0d28gb2JqZWN0cyBhcmUgbm90XG4vLyBlcXVhbCB3aXRoICE9LlxuYXNzZXJ0Lm5vdEVxdWFsID0gZnVuY3Rpb24gbm90RXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHtcbiAgICB0aHJvdyBuZXcgRVJSX01JU1NJTkdfQVJHUygnYWN0dWFsJywgJ2V4cGVjdGVkJyk7XG4gIH1cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGVxZXFlcVxuICBpZiAoYWN0dWFsID09IGV4cGVjdGVkKSB7XG4gICAgaW5uZXJGYWlsKHtcbiAgICAgIGFjdHVhbDogYWN0dWFsLFxuICAgICAgZXhwZWN0ZWQ6IGV4cGVjdGVkLFxuICAgICAgbWVzc2FnZTogbWVzc2FnZSxcbiAgICAgIG9wZXJhdG9yOiAnIT0nLFxuICAgICAgc3RhY2tTdGFydEZuOiBub3RFcXVhbFxuICAgIH0pO1xuICB9XG59O1xuXG4vLyBUaGUgZXF1aXZhbGVuY2UgYXNzZXJ0aW9uIHRlc3RzIGEgZGVlcCBlcXVhbGl0eSByZWxhdGlvbi5cbmFzc2VydC5kZWVwRXF1YWwgPSBmdW5jdGlvbiBkZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHtcbiAgICB0aHJvdyBuZXcgRVJSX01JU1NJTkdfQVJHUygnYWN0dWFsJywgJ2V4cGVjdGVkJyk7XG4gIH1cbiAgaWYgKGlzRGVlcEVxdWFsID09PSB1bmRlZmluZWQpIGxhenlMb2FkQ29tcGFyaXNvbigpO1xuICBpZiAoIWlzRGVlcEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQpKSB7XG4gICAgaW5uZXJGYWlsKHtcbiAgICAgIGFjdHVhbDogYWN0dWFsLFxuICAgICAgZXhwZWN0ZWQ6IGV4cGVjdGVkLFxuICAgICAgbWVzc2FnZTogbWVzc2FnZSxcbiAgICAgIG9wZXJhdG9yOiAnZGVlcEVxdWFsJyxcbiAgICAgIHN0YWNrU3RhcnRGbjogZGVlcEVxdWFsXG4gICAgfSk7XG4gIH1cbn07XG5cbi8vIFRoZSBub24tZXF1aXZhbGVuY2UgYXNzZXJ0aW9uIHRlc3RzIGZvciBhbnkgZGVlcCBpbmVxdWFsaXR5LlxuYXNzZXJ0Lm5vdERlZXBFcXVhbCA9IGZ1bmN0aW9uIG5vdERlZXBFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikge1xuICAgIHRocm93IG5ldyBFUlJfTUlTU0lOR19BUkdTKCdhY3R1YWwnLCAnZXhwZWN0ZWQnKTtcbiAgfVxuICBpZiAoaXNEZWVwRXF1YWwgPT09IHVuZGVmaW5lZCkgbGF6eUxvYWRDb21wYXJpc29uKCk7XG4gIGlmIChpc0RlZXBFcXVhbChhY3R1YWwsIGV4cGVjdGVkKSkge1xuICAgIGlubmVyRmFpbCh7XG4gICAgICBhY3R1YWw6IGFjdHVhbCxcbiAgICAgIGV4cGVjdGVkOiBleHBlY3RlZCxcbiAgICAgIG1lc3NhZ2U6IG1lc3NhZ2UsXG4gICAgICBvcGVyYXRvcjogJ25vdERlZXBFcXVhbCcsXG4gICAgICBzdGFja1N0YXJ0Rm46IG5vdERlZXBFcXVhbFxuICAgIH0pO1xuICB9XG59O1xuLyogZXNsaW50LWVuYWJsZSAqL1xuXG5hc3NlcnQuZGVlcFN0cmljdEVxdWFsID0gZnVuY3Rpb24gZGVlcFN0cmljdEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UpIHtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSB7XG4gICAgdGhyb3cgbmV3IEVSUl9NSVNTSU5HX0FSR1MoJ2FjdHVhbCcsICdleHBlY3RlZCcpO1xuICB9XG4gIGlmIChpc0RlZXBFcXVhbCA9PT0gdW5kZWZpbmVkKSBsYXp5TG9hZENvbXBhcmlzb24oKTtcbiAgaWYgKCFpc0RlZXBTdHJpY3RFcXVhbChhY3R1YWwsIGV4cGVjdGVkKSkge1xuICAgIGlubmVyRmFpbCh7XG4gICAgICBhY3R1YWw6IGFjdHVhbCxcbiAgICAgIGV4cGVjdGVkOiBleHBlY3RlZCxcbiAgICAgIG1lc3NhZ2U6IG1lc3NhZ2UsXG4gICAgICBvcGVyYXRvcjogJ2RlZXBTdHJpY3RFcXVhbCcsXG4gICAgICBzdGFja1N0YXJ0Rm46IGRlZXBTdHJpY3RFcXVhbFxuICAgIH0pO1xuICB9XG59O1xuYXNzZXJ0Lm5vdERlZXBTdHJpY3RFcXVhbCA9IG5vdERlZXBTdHJpY3RFcXVhbDtcbmZ1bmN0aW9uIG5vdERlZXBTdHJpY3RFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikge1xuICAgIHRocm93IG5ldyBFUlJfTUlTU0lOR19BUkdTKCdhY3R1YWwnLCAnZXhwZWN0ZWQnKTtcbiAgfVxuICBpZiAoaXNEZWVwRXF1YWwgPT09IHVuZGVmaW5lZCkgbGF6eUxvYWRDb21wYXJpc29uKCk7XG4gIGlmIChpc0RlZXBTdHJpY3RFcXVhbChhY3R1YWwsIGV4cGVjdGVkKSkge1xuICAgIGlubmVyRmFpbCh7XG4gICAgICBhY3R1YWw6IGFjdHVhbCxcbiAgICAgIGV4cGVjdGVkOiBleHBlY3RlZCxcbiAgICAgIG1lc3NhZ2U6IG1lc3NhZ2UsXG4gICAgICBvcGVyYXRvcjogJ25vdERlZXBTdHJpY3RFcXVhbCcsXG4gICAgICBzdGFja1N0YXJ0Rm46IG5vdERlZXBTdHJpY3RFcXVhbFxuICAgIH0pO1xuICB9XG59XG5hc3NlcnQuc3RyaWN0RXF1YWwgPSBmdW5jdGlvbiBzdHJpY3RFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikge1xuICAgIHRocm93IG5ldyBFUlJfTUlTU0lOR19BUkdTKCdhY3R1YWwnLCAnZXhwZWN0ZWQnKTtcbiAgfVxuICBpZiAoIW9iamVjdElzKGFjdHVhbCwgZXhwZWN0ZWQpKSB7XG4gICAgaW5uZXJGYWlsKHtcbiAgICAgIGFjdHVhbDogYWN0dWFsLFxuICAgICAgZXhwZWN0ZWQ6IGV4cGVjdGVkLFxuICAgICAgbWVzc2FnZTogbWVzc2FnZSxcbiAgICAgIG9wZXJhdG9yOiAnc3RyaWN0RXF1YWwnLFxuICAgICAgc3RhY2tTdGFydEZuOiBzdHJpY3RFcXVhbFxuICAgIH0pO1xuICB9XG59O1xuYXNzZXJ0Lm5vdFN0cmljdEVxdWFsID0gZnVuY3Rpb24gbm90U3RyaWN0RXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHtcbiAgICB0aHJvdyBuZXcgRVJSX01JU1NJTkdfQVJHUygnYWN0dWFsJywgJ2V4cGVjdGVkJyk7XG4gIH1cbiAgaWYgKG9iamVjdElzKGFjdHVhbCwgZXhwZWN0ZWQpKSB7XG4gICAgaW5uZXJGYWlsKHtcbiAgICAgIGFjdHVhbDogYWN0dWFsLFxuICAgICAgZXhwZWN0ZWQ6IGV4cGVjdGVkLFxuICAgICAgbWVzc2FnZTogbWVzc2FnZSxcbiAgICAgIG9wZXJhdG9yOiAnbm90U3RyaWN0RXF1YWwnLFxuICAgICAgc3RhY2tTdGFydEZuOiBub3RTdHJpY3RFcXVhbFxuICAgIH0pO1xuICB9XG59O1xudmFyIENvbXBhcmlzb24gPSAvKiNfX1BVUkVfXyovX2NyZWF0ZUNsYXNzKGZ1bmN0aW9uIENvbXBhcmlzb24ob2JqLCBrZXlzLCBhY3R1YWwpIHtcbiAgdmFyIF90aGlzID0gdGhpcztcbiAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIENvbXBhcmlzb24pO1xuICBrZXlzLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgIGlmIChrZXkgaW4gb2JqKSB7XG4gICAgICBpZiAoYWN0dWFsICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIGFjdHVhbFtrZXldID09PSAnc3RyaW5nJyAmJiBpc1JlZ0V4cChvYmpba2V5XSkgJiYgUmVnRXhwUHJvdG90eXBlVGVzdChvYmpba2V5XSwgYWN0dWFsW2tleV0pKSB7XG4gICAgICAgIF90aGlzW2tleV0gPSBhY3R1YWxba2V5XTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIF90aGlzW2tleV0gPSBvYmpba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufSk7XG5mdW5jdGlvbiBjb21wYXJlRXhjZXB0aW9uS2V5KGFjdHVhbCwgZXhwZWN0ZWQsIGtleSwgbWVzc2FnZSwga2V5cywgZm4pIHtcbiAgaWYgKCEoa2V5IGluIGFjdHVhbCkgfHwgIWlzRGVlcFN0cmljdEVxdWFsKGFjdHVhbFtrZXldLCBleHBlY3RlZFtrZXldKSkge1xuICAgIGlmICghbWVzc2FnZSkge1xuICAgICAgLy8gQ3JlYXRlIHBsYWNlaG9sZGVyIG9iamVjdHMgdG8gY3JlYXRlIGEgbmljZSBvdXRwdXQuXG4gICAgICB2YXIgYSA9IG5ldyBDb21wYXJpc29uKGFjdHVhbCwga2V5cyk7XG4gICAgICB2YXIgYiA9IG5ldyBDb21wYXJpc29uKGV4cGVjdGVkLCBrZXlzLCBhY3R1YWwpO1xuICAgICAgdmFyIGVyciA9IG5ldyBBc3NlcnRpb25FcnJvcih7XG4gICAgICAgIGFjdHVhbDogYSxcbiAgICAgICAgZXhwZWN0ZWQ6IGIsXG4gICAgICAgIG9wZXJhdG9yOiAnZGVlcFN0cmljdEVxdWFsJyxcbiAgICAgICAgc3RhY2tTdGFydEZuOiBmblxuICAgICAgfSk7XG4gICAgICBlcnIuYWN0dWFsID0gYWN0dWFsO1xuICAgICAgZXJyLmV4cGVjdGVkID0gZXhwZWN0ZWQ7XG4gICAgICBlcnIub3BlcmF0b3IgPSBmbi5uYW1lO1xuICAgICAgdGhyb3cgZXJyO1xuICAgIH1cbiAgICBpbm5lckZhaWwoe1xuICAgICAgYWN0dWFsOiBhY3R1YWwsXG4gICAgICBleHBlY3RlZDogZXhwZWN0ZWQsXG4gICAgICBtZXNzYWdlOiBtZXNzYWdlLFxuICAgICAgb3BlcmF0b3I6IGZuLm5hbWUsXG4gICAgICBzdGFja1N0YXJ0Rm46IGZuXG4gICAgfSk7XG4gIH1cbn1cbmZ1bmN0aW9uIGV4cGVjdGVkRXhjZXB0aW9uKGFjdHVhbCwgZXhwZWN0ZWQsIG1zZywgZm4pIHtcbiAgaWYgKHR5cGVvZiBleHBlY3RlZCAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIGlmIChpc1JlZ0V4cChleHBlY3RlZCkpIHJldHVybiBSZWdFeHBQcm90b3R5cGVUZXN0KGV4cGVjdGVkLCBhY3R1YWwpO1xuICAgIC8vIGFzc2VydC5kb2VzTm90VGhyb3cgZG9lcyBub3QgYWNjZXB0IG9iamVjdHMuXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIHtcbiAgICAgIHRocm93IG5ldyBFUlJfSU5WQUxJRF9BUkdfVFlQRSgnZXhwZWN0ZWQnLCBbJ0Z1bmN0aW9uJywgJ1JlZ0V4cCddLCBleHBlY3RlZCk7XG4gICAgfVxuXG4gICAgLy8gSGFuZGxlIHByaW1pdGl2ZXMgcHJvcGVybHkuXG4gICAgaWYgKF90eXBlb2YoYWN0dWFsKSAhPT0gJ29iamVjdCcgfHwgYWN0dWFsID09PSBudWxsKSB7XG4gICAgICB2YXIgZXJyID0gbmV3IEFzc2VydGlvbkVycm9yKHtcbiAgICAgICAgYWN0dWFsOiBhY3R1YWwsXG4gICAgICAgIGV4cGVjdGVkOiBleHBlY3RlZCxcbiAgICAgICAgbWVzc2FnZTogbXNnLFxuICAgICAgICBvcGVyYXRvcjogJ2RlZXBTdHJpY3RFcXVhbCcsXG4gICAgICAgIHN0YWNrU3RhcnRGbjogZm5cbiAgICAgIH0pO1xuICAgICAgZXJyLm9wZXJhdG9yID0gZm4ubmFtZTtcbiAgICAgIHRocm93IGVycjtcbiAgICB9XG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhleHBlY3RlZCk7XG4gICAgLy8gU3BlY2lhbCBoYW5kbGUgZXJyb3JzIHRvIG1ha2Ugc3VyZSB0aGUgbmFtZSBhbmQgdGhlIG1lc3NhZ2UgYXJlIGNvbXBhcmVkXG4gICAgLy8gYXMgd2VsbC5cbiAgICBpZiAoZXhwZWN0ZWQgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAga2V5cy5wdXNoKCduYW1lJywgJ21lc3NhZ2UnKTtcbiAgICB9IGVsc2UgaWYgKGtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgRVJSX0lOVkFMSURfQVJHX1ZBTFVFKCdlcnJvcicsIGV4cGVjdGVkLCAnbWF5IG5vdCBiZSBhbiBlbXB0eSBvYmplY3QnKTtcbiAgICB9XG4gICAgaWYgKGlzRGVlcEVxdWFsID09PSB1bmRlZmluZWQpIGxhenlMb2FkQ29tcGFyaXNvbigpO1xuICAgIGtleXMuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICBpZiAodHlwZW9mIGFjdHVhbFtrZXldID09PSAnc3RyaW5nJyAmJiBpc1JlZ0V4cChleHBlY3RlZFtrZXldKSAmJiBSZWdFeHBQcm90b3R5cGVUZXN0KGV4cGVjdGVkW2tleV0sIGFjdHVhbFtrZXldKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb21wYXJlRXhjZXB0aW9uS2V5KGFjdHVhbCwgZXhwZWN0ZWQsIGtleSwgbXNnLCBrZXlzLCBmbik7XG4gICAgfSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgLy8gR3VhcmQgaW5zdGFuY2VvZiBhZ2FpbnN0IGFycm93IGZ1bmN0aW9ucyBhcyB0aGV5IGRvbid0IGhhdmUgYSBwcm90b3R5cGUuXG4gIGlmIChleHBlY3RlZC5wcm90b3R5cGUgIT09IHVuZGVmaW5lZCAmJiBhY3R1YWwgaW5zdGFuY2VvZiBleHBlY3RlZCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGlmIChFcnJvci5pc1Byb3RvdHlwZU9mKGV4cGVjdGVkKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gZXhwZWN0ZWQuY2FsbCh7fSwgYWN0dWFsKSA9PT0gdHJ1ZTtcbn1cbmZ1bmN0aW9uIGdldEFjdHVhbChmbikge1xuICBpZiAodHlwZW9mIGZuICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IEVSUl9JTlZBTElEX0FSR19UWVBFKCdmbicsICdGdW5jdGlvbicsIGZuKTtcbiAgfVxuICB0cnkge1xuICAgIGZuKCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZTtcbiAgfVxuICByZXR1cm4gTk9fRVhDRVBUSU9OX1NFTlRJTkVMO1xufVxuZnVuY3Rpb24gY2hlY2tJc1Byb21pc2Uob2JqKSB7XG4gIC8vIEFjY2VwdCBuYXRpdmUgRVM2IHByb21pc2VzIGFuZCBwcm9taXNlcyB0aGF0IGFyZSBpbXBsZW1lbnRlZCBpbiBhIHNpbWlsYXJcbiAgLy8gd2F5LiBEbyBub3QgYWNjZXB0IHRoZW5hYmxlcyB0aGF0IHVzZSBhIGZ1bmN0aW9uIGFzIGBvYmpgIGFuZCB0aGF0IGhhdmUgbm9cbiAgLy8gYGNhdGNoYCBoYW5kbGVyLlxuXG4gIC8vIFRPRE86IHRoZW5hYmxlcyBhcmUgY2hlY2tlZCB1cCB1bnRpbCB0aGV5IGhhdmUgdGhlIGNvcnJlY3QgbWV0aG9kcyxcbiAgLy8gYnV0IGFjY29yZGluZyB0byBkb2N1bWVudGF0aW9uLCB0aGUgYHRoZW5gIG1ldGhvZCBzaG91bGQgcmVjZWl2ZVxuICAvLyB0aGUgYGZ1bGZpbGxgIGFuZCBgcmVqZWN0YCBhcmd1bWVudHMgYXMgd2VsbCBvciBpdCBtYXkgYmUgbmV2ZXIgcmVzb2x2ZWQuXG5cbiAgcmV0dXJuIGlzUHJvbWlzZShvYmopIHx8IG9iaiAhPT0gbnVsbCAmJiBfdHlwZW9mKG9iaikgPT09ICdvYmplY3QnICYmIHR5cGVvZiBvYmoudGhlbiA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2Ygb2JqLmNhdGNoID09PSAnZnVuY3Rpb24nO1xufVxuZnVuY3Rpb24gd2FpdEZvckFjdHVhbChwcm9taXNlRm4pIHtcbiAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgIHZhciByZXN1bHRQcm9taXNlO1xuICAgIGlmICh0eXBlb2YgcHJvbWlzZUZuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAvLyBSZXR1cm4gYSByZWplY3RlZCBwcm9taXNlIGlmIGBwcm9taXNlRm5gIHRocm93cyBzeW5jaHJvbm91c2x5LlxuICAgICAgcmVzdWx0UHJvbWlzZSA9IHByb21pc2VGbigpO1xuICAgICAgLy8gRmFpbCBpbiBjYXNlIG5vIHByb21pc2UgaXMgcmV0dXJuZWQuXG4gICAgICBpZiAoIWNoZWNrSXNQcm9taXNlKHJlc3VsdFByb21pc2UpKSB7XG4gICAgICAgIHRocm93IG5ldyBFUlJfSU5WQUxJRF9SRVRVUk5fVkFMVUUoJ2luc3RhbmNlIG9mIFByb21pc2UnLCAncHJvbWlzZUZuJywgcmVzdWx0UHJvbWlzZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChjaGVja0lzUHJvbWlzZShwcm9taXNlRm4pKSB7XG4gICAgICByZXN1bHRQcm9taXNlID0gcHJvbWlzZUZuO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRVJSX0lOVkFMSURfQVJHX1RZUEUoJ3Byb21pc2VGbicsIFsnRnVuY3Rpb24nLCAnUHJvbWlzZSddLCBwcm9taXNlRm4pO1xuICAgIH1cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gcmVzdWx0UHJvbWlzZTtcbiAgICB9KS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBOT19FWENFUFRJT05fU0VOVElORUw7XG4gICAgfSkuY2F0Y2goZnVuY3Rpb24gKGUpIHtcbiAgICAgIHJldHVybiBlO1xuICAgIH0pO1xuICB9KTtcbn1cbmZ1bmN0aW9uIGV4cGVjdHNFcnJvcihzdGFja1N0YXJ0Rm4sIGFjdHVhbCwgZXJyb3IsIG1lc3NhZ2UpIHtcbiAgaWYgKHR5cGVvZiBlcnJvciA9PT0gJ3N0cmluZycpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gNCkge1xuICAgICAgdGhyb3cgbmV3IEVSUl9JTlZBTElEX0FSR19UWVBFKCdlcnJvcicsIFsnT2JqZWN0JywgJ0Vycm9yJywgJ0Z1bmN0aW9uJywgJ1JlZ0V4cCddLCBlcnJvcik7XG4gICAgfVxuICAgIGlmIChfdHlwZW9mKGFjdHVhbCkgPT09ICdvYmplY3QnICYmIGFjdHVhbCAhPT0gbnVsbCkge1xuICAgICAgaWYgKGFjdHVhbC5tZXNzYWdlID09PSBlcnJvcikge1xuICAgICAgICB0aHJvdyBuZXcgRVJSX0FNQklHVU9VU19BUkdVTUVOVCgnZXJyb3IvbWVzc2FnZScsIFwiVGhlIGVycm9yIG1lc3NhZ2UgXFxcIlwiLmNvbmNhdChhY3R1YWwubWVzc2FnZSwgXCJcXFwiIGlzIGlkZW50aWNhbCB0byB0aGUgbWVzc2FnZS5cIikpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoYWN0dWFsID09PSBlcnJvcikge1xuICAgICAgdGhyb3cgbmV3IEVSUl9BTUJJR1VPVVNfQVJHVU1FTlQoJ2Vycm9yL21lc3NhZ2UnLCBcIlRoZSBlcnJvciBcXFwiXCIuY29uY2F0KGFjdHVhbCwgXCJcXFwiIGlzIGlkZW50aWNhbCB0byB0aGUgbWVzc2FnZS5cIikpO1xuICAgIH1cbiAgICBtZXNzYWdlID0gZXJyb3I7XG4gICAgZXJyb3IgPSB1bmRlZmluZWQ7XG4gIH0gZWxzZSBpZiAoZXJyb3IgIT0gbnVsbCAmJiBfdHlwZW9mKGVycm9yKSAhPT0gJ29iamVjdCcgJiYgdHlwZW9mIGVycm9yICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IEVSUl9JTlZBTElEX0FSR19UWVBFKCdlcnJvcicsIFsnT2JqZWN0JywgJ0Vycm9yJywgJ0Z1bmN0aW9uJywgJ1JlZ0V4cCddLCBlcnJvcik7XG4gIH1cbiAgaWYgKGFjdHVhbCA9PT0gTk9fRVhDRVBUSU9OX1NFTlRJTkVMKSB7XG4gICAgdmFyIGRldGFpbHMgPSAnJztcbiAgICBpZiAoZXJyb3IgJiYgZXJyb3IubmFtZSkge1xuICAgICAgZGV0YWlscyArPSBcIiAoXCIuY29uY2F0KGVycm9yLm5hbWUsIFwiKVwiKTtcbiAgICB9XG4gICAgZGV0YWlscyArPSBtZXNzYWdlID8gXCI6IFwiLmNvbmNhdChtZXNzYWdlKSA6ICcuJztcbiAgICB2YXIgZm5UeXBlID0gc3RhY2tTdGFydEZuLm5hbWUgPT09ICdyZWplY3RzJyA/ICdyZWplY3Rpb24nIDogJ2V4Y2VwdGlvbic7XG4gICAgaW5uZXJGYWlsKHtcbiAgICAgIGFjdHVhbDogdW5kZWZpbmVkLFxuICAgICAgZXhwZWN0ZWQ6IGVycm9yLFxuICAgICAgb3BlcmF0b3I6IHN0YWNrU3RhcnRGbi5uYW1lLFxuICAgICAgbWVzc2FnZTogXCJNaXNzaW5nIGV4cGVjdGVkIFwiLmNvbmNhdChmblR5cGUpLmNvbmNhdChkZXRhaWxzKSxcbiAgICAgIHN0YWNrU3RhcnRGbjogc3RhY2tTdGFydEZuXG4gICAgfSk7XG4gIH1cbiAgaWYgKGVycm9yICYmICFleHBlY3RlZEV4Y2VwdGlvbihhY3R1YWwsIGVycm9yLCBtZXNzYWdlLCBzdGFja1N0YXJ0Rm4pKSB7XG4gICAgdGhyb3cgYWN0dWFsO1xuICB9XG59XG5mdW5jdGlvbiBleHBlY3RzTm9FcnJvcihzdGFja1N0YXJ0Rm4sIGFjdHVhbCwgZXJyb3IsIG1lc3NhZ2UpIHtcbiAgaWYgKGFjdHVhbCA9PT0gTk9fRVhDRVBUSU9OX1NFTlRJTkVMKSByZXR1cm47XG4gIGlmICh0eXBlb2YgZXJyb3IgPT09ICdzdHJpbmcnKSB7XG4gICAgbWVzc2FnZSA9IGVycm9yO1xuICAgIGVycm9yID0gdW5kZWZpbmVkO1xuICB9XG4gIGlmICghZXJyb3IgfHwgZXhwZWN0ZWRFeGNlcHRpb24oYWN0dWFsLCBlcnJvcikpIHtcbiAgICB2YXIgZGV0YWlscyA9IG1lc3NhZ2UgPyBcIjogXCIuY29uY2F0KG1lc3NhZ2UpIDogJy4nO1xuICAgIHZhciBmblR5cGUgPSBzdGFja1N0YXJ0Rm4ubmFtZSA9PT0gJ2RvZXNOb3RSZWplY3QnID8gJ3JlamVjdGlvbicgOiAnZXhjZXB0aW9uJztcbiAgICBpbm5lckZhaWwoe1xuICAgICAgYWN0dWFsOiBhY3R1YWwsXG4gICAgICBleHBlY3RlZDogZXJyb3IsXG4gICAgICBvcGVyYXRvcjogc3RhY2tTdGFydEZuLm5hbWUsXG4gICAgICBtZXNzYWdlOiBcIkdvdCB1bndhbnRlZCBcIi5jb25jYXQoZm5UeXBlKS5jb25jYXQoZGV0YWlscywgXCJcXG5cIikgKyBcIkFjdHVhbCBtZXNzYWdlOiBcXFwiXCIuY29uY2F0KGFjdHVhbCAmJiBhY3R1YWwubWVzc2FnZSwgXCJcXFwiXCIpLFxuICAgICAgc3RhY2tTdGFydEZuOiBzdGFja1N0YXJ0Rm5cbiAgICB9KTtcbiAgfVxuICB0aHJvdyBhY3R1YWw7XG59XG5hc3NlcnQudGhyb3dzID0gZnVuY3Rpb24gdGhyb3dzKHByb21pc2VGbikge1xuICBmb3IgKHZhciBfbGVuMiA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBuZXcgQXJyYXkoX2xlbjIgPiAxID8gX2xlbjIgLSAxIDogMCksIF9rZXkyID0gMTsgX2tleTIgPCBfbGVuMjsgX2tleTIrKykge1xuICAgIGFyZ3NbX2tleTIgLSAxXSA9IGFyZ3VtZW50c1tfa2V5Ml07XG4gIH1cbiAgZXhwZWN0c0Vycm9yLmFwcGx5KHZvaWQgMCwgW3Rocm93cywgZ2V0QWN0dWFsKHByb21pc2VGbildLmNvbmNhdChhcmdzKSk7XG59O1xuYXNzZXJ0LnJlamVjdHMgPSBmdW5jdGlvbiByZWplY3RzKHByb21pc2VGbikge1xuICBmb3IgKHZhciBfbGVuMyA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBuZXcgQXJyYXkoX2xlbjMgPiAxID8gX2xlbjMgLSAxIDogMCksIF9rZXkzID0gMTsgX2tleTMgPCBfbGVuMzsgX2tleTMrKykge1xuICAgIGFyZ3NbX2tleTMgLSAxXSA9IGFyZ3VtZW50c1tfa2V5M107XG4gIH1cbiAgcmV0dXJuIHdhaXRGb3JBY3R1YWwocHJvbWlzZUZuKS50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICByZXR1cm4gZXhwZWN0c0Vycm9yLmFwcGx5KHZvaWQgMCwgW3JlamVjdHMsIHJlc3VsdF0uY29uY2F0KGFyZ3MpKTtcbiAgfSk7XG59O1xuYXNzZXJ0LmRvZXNOb3RUaHJvdyA9IGZ1bmN0aW9uIGRvZXNOb3RUaHJvdyhmbikge1xuICBmb3IgKHZhciBfbGVuNCA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBuZXcgQXJyYXkoX2xlbjQgPiAxID8gX2xlbjQgLSAxIDogMCksIF9rZXk0ID0gMTsgX2tleTQgPCBfbGVuNDsgX2tleTQrKykge1xuICAgIGFyZ3NbX2tleTQgLSAxXSA9IGFyZ3VtZW50c1tfa2V5NF07XG4gIH1cbiAgZXhwZWN0c05vRXJyb3IuYXBwbHkodm9pZCAwLCBbZG9lc05vdFRocm93LCBnZXRBY3R1YWwoZm4pXS5jb25jYXQoYXJncykpO1xufTtcbmFzc2VydC5kb2VzTm90UmVqZWN0ID0gZnVuY3Rpb24gZG9lc05vdFJlamVjdChmbikge1xuICBmb3IgKHZhciBfbGVuNSA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBuZXcgQXJyYXkoX2xlbjUgPiAxID8gX2xlbjUgLSAxIDogMCksIF9rZXk1ID0gMTsgX2tleTUgPCBfbGVuNTsgX2tleTUrKykge1xuICAgIGFyZ3NbX2tleTUgLSAxXSA9IGFyZ3VtZW50c1tfa2V5NV07XG4gIH1cbiAgcmV0dXJuIHdhaXRGb3JBY3R1YWwoZm4pLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgIHJldHVybiBleHBlY3RzTm9FcnJvci5hcHBseSh2b2lkIDAsIFtkb2VzTm90UmVqZWN0LCByZXN1bHRdLmNvbmNhdChhcmdzKSk7XG4gIH0pO1xufTtcbmFzc2VydC5pZkVycm9yID0gZnVuY3Rpb24gaWZFcnJvcihlcnIpIHtcbiAgaWYgKGVyciAhPT0gbnVsbCAmJiBlcnIgIT09IHVuZGVmaW5lZCkge1xuICAgIHZhciBtZXNzYWdlID0gJ2lmRXJyb3IgZ290IHVud2FudGVkIGV4Y2VwdGlvbjogJztcbiAgICBpZiAoX3R5cGVvZihlcnIpID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgZXJyLm1lc3NhZ2UgPT09ICdzdHJpbmcnKSB7XG4gICAgICBpZiAoZXJyLm1lc3NhZ2UubGVuZ3RoID09PSAwICYmIGVyci5jb25zdHJ1Y3Rvcikge1xuICAgICAgICBtZXNzYWdlICs9IGVyci5jb25zdHJ1Y3Rvci5uYW1lO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbWVzc2FnZSArPSBlcnIubWVzc2FnZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgbWVzc2FnZSArPSBpbnNwZWN0KGVycik7XG4gICAgfVxuICAgIHZhciBuZXdFcnIgPSBuZXcgQXNzZXJ0aW9uRXJyb3Ioe1xuICAgICAgYWN0dWFsOiBlcnIsXG4gICAgICBleHBlY3RlZDogbnVsbCxcbiAgICAgIG9wZXJhdG9yOiAnaWZFcnJvcicsXG4gICAgICBtZXNzYWdlOiBtZXNzYWdlLFxuICAgICAgc3RhY2tTdGFydEZuOiBpZkVycm9yXG4gICAgfSk7XG5cbiAgICAvLyBNYWtlIHN1cmUgd2UgYWN0dWFsbHkgaGF2ZSBhIHN0YWNrIHRyYWNlIVxuICAgIHZhciBvcmlnU3RhY2sgPSBlcnIuc3RhY2s7XG4gICAgaWYgKHR5cGVvZiBvcmlnU3RhY2sgPT09ICdzdHJpbmcnKSB7XG4gICAgICAvLyBUaGlzIHdpbGwgcmVtb3ZlIGFueSBkdXBsaWNhdGVkIGZyYW1lcyBmcm9tIHRoZSBlcnJvciBmcmFtZXMgdGFrZW5cbiAgICAgIC8vIGZyb20gd2l0aGluIGBpZkVycm9yYCBhbmQgYWRkIHRoZSBvcmlnaW5hbCBlcnJvciBmcmFtZXMgdG8gdGhlIG5ld2x5XG4gICAgICAvLyBjcmVhdGVkIG9uZXMuXG4gICAgICB2YXIgdG1wMiA9IG9yaWdTdGFjay5zcGxpdCgnXFxuJyk7XG4gICAgICB0bXAyLnNoaWZ0KCk7XG4gICAgICAvLyBGaWx0ZXIgYWxsIGZyYW1lcyBleGlzdGluZyBpbiBlcnIuc3RhY2suXG4gICAgICB2YXIgdG1wMSA9IG5ld0Vyci5zdGFjay5zcGxpdCgnXFxuJyk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRtcDIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgLy8gRmluZCB0aGUgZmlyc3Qgb2NjdXJyZW5jZSBvZiB0aGUgZnJhbWUuXG4gICAgICAgIHZhciBwb3MgPSB0bXAxLmluZGV4T2YodG1wMltpXSk7XG4gICAgICAgIGlmIChwb3MgIT09IC0xKSB7XG4gICAgICAgICAgLy8gT25seSBrZWVwIG5ldyBmcmFtZXMuXG4gICAgICAgICAgdG1wMSA9IHRtcDEuc2xpY2UoMCwgcG9zKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbmV3RXJyLnN0YWNrID0gXCJcIi5jb25jYXQodG1wMS5qb2luKCdcXG4nKSwgXCJcXG5cIikuY29uY2F0KHRtcDIuam9pbignXFxuJykpO1xuICAgIH1cbiAgICB0aHJvdyBuZXdFcnI7XG4gIH1cbn07XG5cbi8vIEN1cnJlbnRseSBpbiBzeW5jIHdpdGggTm9kZS5qcyBsaWIvYXNzZXJ0LmpzXG4vLyBodHRwczovL2dpdGh1Yi5jb20vbm9kZWpzL25vZGUvY29tbWl0LzJhODcxZGYzZGZiOGVhNjYzZWY1ZTFmOGY2MjcwMWVjNTEzODRlY2JcbmZ1bmN0aW9uIGludGVybmFsTWF0Y2goc3RyaW5nLCByZWdleHAsIG1lc3NhZ2UsIGZuLCBmbk5hbWUpIHtcbiAgaWYgKCFpc1JlZ0V4cChyZWdleHApKSB7XG4gICAgdGhyb3cgbmV3IEVSUl9JTlZBTElEX0FSR19UWVBFKCdyZWdleHAnLCAnUmVnRXhwJywgcmVnZXhwKTtcbiAgfVxuICB2YXIgbWF0Y2ggPSBmbk5hbWUgPT09ICdtYXRjaCc7XG4gIGlmICh0eXBlb2Ygc3RyaW5nICE9PSAnc3RyaW5nJyB8fCBSZWdFeHBQcm90b3R5cGVUZXN0KHJlZ2V4cCwgc3RyaW5nKSAhPT0gbWF0Y2gpIHtcbiAgICBpZiAobWVzc2FnZSBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICB0aHJvdyBtZXNzYWdlO1xuICAgIH1cbiAgICB2YXIgZ2VuZXJhdGVkTWVzc2FnZSA9ICFtZXNzYWdlO1xuXG4gICAgLy8gJ1RoZSBpbnB1dCB3YXMgZXhwZWN0ZWQgdG8gbm90IG1hdGNoIHRoZSByZWd1bGFyIGV4cHJlc3Npb24gJyArXG4gICAgbWVzc2FnZSA9IG1lc3NhZ2UgfHwgKHR5cGVvZiBzdHJpbmcgIT09ICdzdHJpbmcnID8gJ1RoZSBcInN0cmluZ1wiIGFyZ3VtZW50IG11c3QgYmUgb2YgdHlwZSBzdHJpbmcuIFJlY2VpdmVkIHR5cGUgJyArIFwiXCIuY29uY2F0KF90eXBlb2Yoc3RyaW5nKSwgXCIgKFwiKS5jb25jYXQoaW5zcGVjdChzdHJpbmcpLCBcIilcIikgOiAobWF0Y2ggPyAnVGhlIGlucHV0IGRpZCBub3QgbWF0Y2ggdGhlIHJlZ3VsYXIgZXhwcmVzc2lvbiAnIDogJ1RoZSBpbnB1dCB3YXMgZXhwZWN0ZWQgdG8gbm90IG1hdGNoIHRoZSByZWd1bGFyIGV4cHJlc3Npb24gJykgKyBcIlwiLmNvbmNhdChpbnNwZWN0KHJlZ2V4cCksIFwiLiBJbnB1dDpcXG5cXG5cIikuY29uY2F0KGluc3BlY3Qoc3RyaW5nKSwgXCJcXG5cIikpO1xuICAgIHZhciBlcnIgPSBuZXcgQXNzZXJ0aW9uRXJyb3Ioe1xuICAgICAgYWN0dWFsOiBzdHJpbmcsXG4gICAgICBleHBlY3RlZDogcmVnZXhwLFxuICAgICAgbWVzc2FnZTogbWVzc2FnZSxcbiAgICAgIG9wZXJhdG9yOiBmbk5hbWUsXG4gICAgICBzdGFja1N0YXJ0Rm46IGZuXG4gICAgfSk7XG4gICAgZXJyLmdlbmVyYXRlZE1lc3NhZ2UgPSBnZW5lcmF0ZWRNZXNzYWdlO1xuICAgIHRocm93IGVycjtcbiAgfVxufVxuYXNzZXJ0Lm1hdGNoID0gZnVuY3Rpb24gbWF0Y2goc3RyaW5nLCByZWdleHAsIG1lc3NhZ2UpIHtcbiAgaW50ZXJuYWxNYXRjaChzdHJpbmcsIHJlZ2V4cCwgbWVzc2FnZSwgbWF0Y2gsICdtYXRjaCcpO1xufTtcbmFzc2VydC5kb2VzTm90TWF0Y2ggPSBmdW5jdGlvbiBkb2VzTm90TWF0Y2goc3RyaW5nLCByZWdleHAsIG1lc3NhZ2UpIHtcbiAgaW50ZXJuYWxNYXRjaChzdHJpbmcsIHJlZ2V4cCwgbWVzc2FnZSwgZG9lc05vdE1hdGNoLCAnZG9lc05vdE1hdGNoJyk7XG59O1xuXG4vLyBFeHBvc2UgYSBzdHJpY3Qgb25seSB2YXJpYW50IG9mIGFzc2VydFxuZnVuY3Rpb24gc3RyaWN0KCkge1xuICBmb3IgKHZhciBfbGVuNiA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBuZXcgQXJyYXkoX2xlbjYpLCBfa2V5NiA9IDA7IF9rZXk2IDwgX2xlbjY7IF9rZXk2KyspIHtcbiAgICBhcmdzW19rZXk2XSA9IGFyZ3VtZW50c1tfa2V5Nl07XG4gIH1cbiAgaW5uZXJPay5hcHBseSh2b2lkIDAsIFtzdHJpY3QsIGFyZ3MubGVuZ3RoXS5jb25jYXQoYXJncykpO1xufVxuYXNzZXJ0LnN0cmljdCA9IG9iamVjdEFzc2lnbihzdHJpY3QsIGFzc2VydCwge1xuICBlcXVhbDogYXNzZXJ0LnN0cmljdEVxdWFsLFxuICBkZWVwRXF1YWw6IGFzc2VydC5kZWVwU3RyaWN0RXF1YWwsXG4gIG5vdEVxdWFsOiBhc3NlcnQubm90U3RyaWN0RXF1YWwsXG4gIG5vdERlZXBFcXVhbDogYXNzZXJ0Lm5vdERlZXBTdHJpY3RFcXVhbFxufSk7XG5hc3NlcnQuc3RyaWN0LnN0cmljdCA9IGFzc2VydC5zdHJpY3Q7IiwiLy8gQ3VycmVudGx5IGluIHN5bmMgd2l0aCBOb2RlLmpzIGxpYi9pbnRlcm5hbC9hc3NlcnQvYXNzZXJ0aW9uX2Vycm9yLmpzXG4vLyBodHRwczovL2dpdGh1Yi5jb20vbm9kZWpzL25vZGUvY29tbWl0LzA4MTc4NDBmNzc1MDMyMTY5ZGRkNzBjODVhYzA1OWYxOGZmY2M4MWNcblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBvd25LZXlzKGUsIHIpIHsgdmFyIHQgPSBPYmplY3Qua2V5cyhlKTsgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHsgdmFyIG8gPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKGUpOyByICYmIChvID0gby5maWx0ZXIoZnVuY3Rpb24gKHIpIHsgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZSwgcikuZW51bWVyYWJsZTsgfSkpLCB0LnB1c2guYXBwbHkodCwgbyk7IH0gcmV0dXJuIHQ7IH1cbmZ1bmN0aW9uIF9vYmplY3RTcHJlYWQoZSkgeyBmb3IgKHZhciByID0gMTsgciA8IGFyZ3VtZW50cy5sZW5ndGg7IHIrKykgeyB2YXIgdCA9IG51bGwgIT0gYXJndW1lbnRzW3JdID8gYXJndW1lbnRzW3JdIDoge307IHIgJSAyID8gb3duS2V5cyhPYmplY3QodCksICEwKS5mb3JFYWNoKGZ1bmN0aW9uIChyKSB7IF9kZWZpbmVQcm9wZXJ0eShlLCByLCB0W3JdKTsgfSkgOiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyA/IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKGUsIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKHQpKSA6IG93bktleXMoT2JqZWN0KHQpKS5mb3JFYWNoKGZ1bmN0aW9uIChyKSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLCByLCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHQsIHIpKTsgfSk7IH0gcmV0dXJuIGU7IH1cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgdmFsdWUpIHsga2V5ID0gX3RvUHJvcGVydHlLZXkoa2V5KTsgaWYgKGtleSBpbiBvYmopIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCB7IHZhbHVlOiB2YWx1ZSwgZW51bWVyYWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlLCB3cml0YWJsZTogdHJ1ZSB9KTsgfSBlbHNlIHsgb2JqW2tleV0gPSB2YWx1ZTsgfSByZXR1cm4gb2JqOyB9XG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBfdG9Qcm9wZXJ0eUtleShkZXNjcmlwdG9yLmtleSksIGRlc2NyaXB0b3IpOyB9IH1cbmZ1bmN0aW9uIF9jcmVhdGVDbGFzcyhDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIF9kZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgX2RlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KENvbnN0cnVjdG9yLCBcInByb3RvdHlwZVwiLCB7IHdyaXRhYmxlOiBmYWxzZSB9KTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9XG5mdW5jdGlvbiBfdG9Qcm9wZXJ0eUtleShhcmcpIHsgdmFyIGtleSA9IF90b1ByaW1pdGl2ZShhcmcsIFwic3RyaW5nXCIpOyByZXR1cm4gX3R5cGVvZihrZXkpID09PSBcInN5bWJvbFwiID8ga2V5IDogU3RyaW5nKGtleSk7IH1cbmZ1bmN0aW9uIF90b1ByaW1pdGl2ZShpbnB1dCwgaGludCkgeyBpZiAoX3R5cGVvZihpbnB1dCkgIT09IFwib2JqZWN0XCIgfHwgaW5wdXQgPT09IG51bGwpIHJldHVybiBpbnB1dDsgdmFyIHByaW0gPSBpbnB1dFtTeW1ib2wudG9QcmltaXRpdmVdOyBpZiAocHJpbSAhPT0gdW5kZWZpbmVkKSB7IHZhciByZXMgPSBwcmltLmNhbGwoaW5wdXQsIGhpbnQgfHwgXCJkZWZhdWx0XCIpOyBpZiAoX3R5cGVvZihyZXMpICE9PSBcIm9iamVjdFwiKSByZXR1cm4gcmVzOyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQEB0b1ByaW1pdGl2ZSBtdXN0IHJldHVybiBhIHByaW1pdGl2ZSB2YWx1ZS5cIik7IH0gcmV0dXJuIChoaW50ID09PSBcInN0cmluZ1wiID8gU3RyaW5nIDogTnVtYmVyKShpbnB1dCk7IH1cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvblwiKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShzdWJDbGFzcywgXCJwcm90b3R5cGVcIiwgeyB3cml0YWJsZTogZmFsc2UgfSk7IGlmIChzdXBlckNsYXNzKSBfc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpOyB9XG5mdW5jdGlvbiBfY3JlYXRlU3VwZXIoRGVyaXZlZCkgeyB2YXIgaGFzTmF0aXZlUmVmbGVjdENvbnN0cnVjdCA9IF9pc05hdGl2ZVJlZmxlY3RDb25zdHJ1Y3QoKTsgcmV0dXJuIGZ1bmN0aW9uIF9jcmVhdGVTdXBlckludGVybmFsKCkgeyB2YXIgU3VwZXIgPSBfZ2V0UHJvdG90eXBlT2YoRGVyaXZlZCksIHJlc3VsdDsgaWYgKGhhc05hdGl2ZVJlZmxlY3RDb25zdHJ1Y3QpIHsgdmFyIE5ld1RhcmdldCA9IF9nZXRQcm90b3R5cGVPZih0aGlzKS5jb25zdHJ1Y3RvcjsgcmVzdWx0ID0gUmVmbGVjdC5jb25zdHJ1Y3QoU3VwZXIsIGFyZ3VtZW50cywgTmV3VGFyZ2V0KTsgfSBlbHNlIHsgcmVzdWx0ID0gU3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTsgfSByZXR1cm4gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgcmVzdWx0KTsgfTsgfVxuZnVuY3Rpb24gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oc2VsZiwgY2FsbCkgeyBpZiAoY2FsbCAmJiAoX3R5cGVvZihjYWxsKSA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSkgeyByZXR1cm4gY2FsbDsgfSBlbHNlIGlmIChjYWxsICE9PSB2b2lkIDApIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkRlcml2ZWQgY29uc3RydWN0b3JzIG1heSBvbmx5IHJldHVybiBvYmplY3Qgb3IgdW5kZWZpbmVkXCIpOyB9IHJldHVybiBfYXNzZXJ0VGhpc0luaXRpYWxpemVkKHNlbGYpOyB9XG5mdW5jdGlvbiBfYXNzZXJ0VGhpc0luaXRpYWxpemVkKHNlbGYpIHsgaWYgKHNlbGYgPT09IHZvaWQgMCkgeyB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7IH0gcmV0dXJuIHNlbGY7IH1cbmZ1bmN0aW9uIF93cmFwTmF0aXZlU3VwZXIoQ2xhc3MpIHsgdmFyIF9jYWNoZSA9IHR5cGVvZiBNYXAgPT09IFwiZnVuY3Rpb25cIiA/IG5ldyBNYXAoKSA6IHVuZGVmaW5lZDsgX3dyYXBOYXRpdmVTdXBlciA9IGZ1bmN0aW9uIF93cmFwTmF0aXZlU3VwZXIoQ2xhc3MpIHsgaWYgKENsYXNzID09PSBudWxsIHx8ICFfaXNOYXRpdmVGdW5jdGlvbihDbGFzcykpIHJldHVybiBDbGFzczsgaWYgKHR5cGVvZiBDbGFzcyAhPT0gXCJmdW5jdGlvblwiKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvblwiKTsgfSBpZiAodHlwZW9mIF9jYWNoZSAhPT0gXCJ1bmRlZmluZWRcIikgeyBpZiAoX2NhY2hlLmhhcyhDbGFzcykpIHJldHVybiBfY2FjaGUuZ2V0KENsYXNzKTsgX2NhY2hlLnNldChDbGFzcywgV3JhcHBlcik7IH0gZnVuY3Rpb24gV3JhcHBlcigpIHsgcmV0dXJuIF9jb25zdHJ1Y3QoQ2xhc3MsIGFyZ3VtZW50cywgX2dldFByb3RvdHlwZU9mKHRoaXMpLmNvbnN0cnVjdG9yKTsgfSBXcmFwcGVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBXcmFwcGVyLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyByZXR1cm4gX3NldFByb3RvdHlwZU9mKFdyYXBwZXIsIENsYXNzKTsgfTsgcmV0dXJuIF93cmFwTmF0aXZlU3VwZXIoQ2xhc3MpOyB9XG5mdW5jdGlvbiBfY29uc3RydWN0KFBhcmVudCwgYXJncywgQ2xhc3MpIHsgaWYgKF9pc05hdGl2ZVJlZmxlY3RDb25zdHJ1Y3QoKSkgeyBfY29uc3RydWN0ID0gUmVmbGVjdC5jb25zdHJ1Y3QuYmluZCgpOyB9IGVsc2UgeyBfY29uc3RydWN0ID0gZnVuY3Rpb24gX2NvbnN0cnVjdChQYXJlbnQsIGFyZ3MsIENsYXNzKSB7IHZhciBhID0gW251bGxdOyBhLnB1c2guYXBwbHkoYSwgYXJncyk7IHZhciBDb25zdHJ1Y3RvciA9IEZ1bmN0aW9uLmJpbmQuYXBwbHkoUGFyZW50LCBhKTsgdmFyIGluc3RhbmNlID0gbmV3IENvbnN0cnVjdG9yKCk7IGlmIChDbGFzcykgX3NldFByb3RvdHlwZU9mKGluc3RhbmNlLCBDbGFzcy5wcm90b3R5cGUpOyByZXR1cm4gaW5zdGFuY2U7IH07IH0gcmV0dXJuIF9jb25zdHJ1Y3QuYXBwbHkobnVsbCwgYXJndW1lbnRzKTsgfVxuZnVuY3Rpb24gX2lzTmF0aXZlUmVmbGVjdENvbnN0cnVjdCgpIHsgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcInVuZGVmaW5lZFwiIHx8ICFSZWZsZWN0LmNvbnN0cnVjdCkgcmV0dXJuIGZhbHNlOyBpZiAoUmVmbGVjdC5jb25zdHJ1Y3Quc2hhbSkgcmV0dXJuIGZhbHNlOyBpZiAodHlwZW9mIFByb3h5ID09PSBcImZ1bmN0aW9uXCIpIHJldHVybiB0cnVlOyB0cnkgeyBCb29sZWFuLnByb3RvdHlwZS52YWx1ZU9mLmNhbGwoUmVmbGVjdC5jb25zdHJ1Y3QoQm9vbGVhbiwgW10sIGZ1bmN0aW9uICgpIHt9KSk7IHJldHVybiB0cnVlOyB9IGNhdGNoIChlKSB7IHJldHVybiBmYWxzZTsgfSB9XG5mdW5jdGlvbiBfaXNOYXRpdmVGdW5jdGlvbihmbikgeyByZXR1cm4gRnVuY3Rpb24udG9TdHJpbmcuY2FsbChmbikuaW5kZXhPZihcIltuYXRpdmUgY29kZV1cIikgIT09IC0xOyB9XG5mdW5jdGlvbiBfc2V0UHJvdG90eXBlT2YobywgcCkgeyBfc2V0UHJvdG90eXBlT2YgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2YuYmluZCgpIDogZnVuY3Rpb24gX3NldFByb3RvdHlwZU9mKG8sIHApIHsgby5fX3Byb3RvX18gPSBwOyByZXR1cm4gbzsgfTsgcmV0dXJuIF9zZXRQcm90b3R5cGVPZihvLCBwKTsgfVxuZnVuY3Rpb24gX2dldFByb3RvdHlwZU9mKG8pIHsgX2dldFByb3RvdHlwZU9mID0gT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LmdldFByb3RvdHlwZU9mLmJpbmQoKSA6IGZ1bmN0aW9uIF9nZXRQcm90b3R5cGVPZihvKSB7IHJldHVybiBvLl9fcHJvdG9fXyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2Yobyk7IH07IHJldHVybiBfZ2V0UHJvdG90eXBlT2Yobyk7IH1cbmZ1bmN0aW9uIF90eXBlb2YobykgeyBcIkBiYWJlbC9oZWxwZXJzIC0gdHlwZW9mXCI7IHJldHVybiBfdHlwZW9mID0gXCJmdW5jdGlvblwiID09IHR5cGVvZiBTeW1ib2wgJiYgXCJzeW1ib2xcIiA9PSB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID8gZnVuY3Rpb24gKG8pIHsgcmV0dXJuIHR5cGVvZiBvOyB9IDogZnVuY3Rpb24gKG8pIHsgcmV0dXJuIG8gJiYgXCJmdW5jdGlvblwiID09IHR5cGVvZiBTeW1ib2wgJiYgby5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sICYmIG8gIT09IFN5bWJvbC5wcm90b3R5cGUgPyBcInN5bWJvbFwiIDogdHlwZW9mIG87IH0sIF90eXBlb2Yobyk7IH1cbnZhciBfcmVxdWlyZSA9IHJlcXVpcmUoJ3V0aWwvJyksXG4gIGluc3BlY3QgPSBfcmVxdWlyZS5pbnNwZWN0O1xudmFyIF9yZXF1aXJlMiA9IHJlcXVpcmUoJy4uL2Vycm9ycycpLFxuICBFUlJfSU5WQUxJRF9BUkdfVFlQRSA9IF9yZXF1aXJlMi5jb2Rlcy5FUlJfSU5WQUxJRF9BUkdfVFlQRTtcblxuLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvU3RyaW5nL2VuZHNXaXRoXG5mdW5jdGlvbiBlbmRzV2l0aChzdHIsIHNlYXJjaCwgdGhpc19sZW4pIHtcbiAgaWYgKHRoaXNfbGVuID09PSB1bmRlZmluZWQgfHwgdGhpc19sZW4gPiBzdHIubGVuZ3RoKSB7XG4gICAgdGhpc19sZW4gPSBzdHIubGVuZ3RoO1xuICB9XG4gIHJldHVybiBzdHIuc3Vic3RyaW5nKHRoaXNfbGVuIC0gc2VhcmNoLmxlbmd0aCwgdGhpc19sZW4pID09PSBzZWFyY2g7XG59XG5cbi8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL1N0cmluZy9yZXBlYXRcbmZ1bmN0aW9uIHJlcGVhdChzdHIsIGNvdW50KSB7XG4gIGNvdW50ID0gTWF0aC5mbG9vcihjb3VudCk7XG4gIGlmIChzdHIubGVuZ3RoID09IDAgfHwgY291bnQgPT0gMCkgcmV0dXJuICcnO1xuICB2YXIgbWF4Q291bnQgPSBzdHIubGVuZ3RoICogY291bnQ7XG4gIGNvdW50ID0gTWF0aC5mbG9vcihNYXRoLmxvZyhjb3VudCkgLyBNYXRoLmxvZygyKSk7XG4gIHdoaWxlIChjb3VudCkge1xuICAgIHN0ciArPSBzdHI7XG4gICAgY291bnQtLTtcbiAgfVxuICBzdHIgKz0gc3RyLnN1YnN0cmluZygwLCBtYXhDb3VudCAtIHN0ci5sZW5ndGgpO1xuICByZXR1cm4gc3RyO1xufVxudmFyIGJsdWUgPSAnJztcbnZhciBncmVlbiA9ICcnO1xudmFyIHJlZCA9ICcnO1xudmFyIHdoaXRlID0gJyc7XG52YXIga1JlYWRhYmxlT3BlcmF0b3IgPSB7XG4gIGRlZXBTdHJpY3RFcXVhbDogJ0V4cGVjdGVkIHZhbHVlcyB0byBiZSBzdHJpY3RseSBkZWVwLWVxdWFsOicsXG4gIHN0cmljdEVxdWFsOiAnRXhwZWN0ZWQgdmFsdWVzIHRvIGJlIHN0cmljdGx5IGVxdWFsOicsXG4gIHN0cmljdEVxdWFsT2JqZWN0OiAnRXhwZWN0ZWQgXCJhY3R1YWxcIiB0byBiZSByZWZlcmVuY2UtZXF1YWwgdG8gXCJleHBlY3RlZFwiOicsXG4gIGRlZXBFcXVhbDogJ0V4cGVjdGVkIHZhbHVlcyB0byBiZSBsb29zZWx5IGRlZXAtZXF1YWw6JyxcbiAgZXF1YWw6ICdFeHBlY3RlZCB2YWx1ZXMgdG8gYmUgbG9vc2VseSBlcXVhbDonLFxuICBub3REZWVwU3RyaWN0RXF1YWw6ICdFeHBlY3RlZCBcImFjdHVhbFwiIG5vdCB0byBiZSBzdHJpY3RseSBkZWVwLWVxdWFsIHRvOicsXG4gIG5vdFN0cmljdEVxdWFsOiAnRXhwZWN0ZWQgXCJhY3R1YWxcIiB0byBiZSBzdHJpY3RseSB1bmVxdWFsIHRvOicsXG4gIG5vdFN0cmljdEVxdWFsT2JqZWN0OiAnRXhwZWN0ZWQgXCJhY3R1YWxcIiBub3QgdG8gYmUgcmVmZXJlbmNlLWVxdWFsIHRvIFwiZXhwZWN0ZWRcIjonLFxuICBub3REZWVwRXF1YWw6ICdFeHBlY3RlZCBcImFjdHVhbFwiIG5vdCB0byBiZSBsb29zZWx5IGRlZXAtZXF1YWwgdG86JyxcbiAgbm90RXF1YWw6ICdFeHBlY3RlZCBcImFjdHVhbFwiIHRvIGJlIGxvb3NlbHkgdW5lcXVhbCB0bzonLFxuICBub3RJZGVudGljYWw6ICdWYWx1ZXMgaWRlbnRpY2FsIGJ1dCBub3QgcmVmZXJlbmNlLWVxdWFsOidcbn07XG5cbi8vIENvbXBhcmluZyBzaG9ydCBwcmltaXRpdmVzIHNob3VsZCBqdXN0IHNob3cgPT09IC8gIT09IGluc3RlYWQgb2YgdXNpbmcgdGhlXG4vLyBkaWZmLlxudmFyIGtNYXhTaG9ydExlbmd0aCA9IDEwO1xuZnVuY3Rpb24gY29weUVycm9yKHNvdXJjZSkge1xuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHNvdXJjZSk7XG4gIHZhciB0YXJnZXQgPSBPYmplY3QuY3JlYXRlKE9iamVjdC5nZXRQcm90b3R5cGVPZihzb3VyY2UpKTtcbiAga2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldO1xuICB9KTtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgJ21lc3NhZ2UnLCB7XG4gICAgdmFsdWU6IHNvdXJjZS5tZXNzYWdlXG4gIH0pO1xuICByZXR1cm4gdGFyZ2V0O1xufVxuZnVuY3Rpb24gaW5zcGVjdFZhbHVlKHZhbCkge1xuICAvLyBUaGUgdXRpbC5pbnNwZWN0IGRlZmF1bHQgdmFsdWVzIGNvdWxkIGJlIGNoYW5nZWQuIFRoaXMgbWFrZXMgc3VyZSB0aGVcbiAgLy8gZXJyb3IgbWVzc2FnZXMgY29udGFpbiB0aGUgbmVjZXNzYXJ5IGluZm9ybWF0aW9uIG5ldmVydGhlbGVzcy5cbiAgcmV0dXJuIGluc3BlY3QodmFsLCB7XG4gICAgY29tcGFjdDogZmFsc2UsXG4gICAgY3VzdG9tSW5zcGVjdDogZmFsc2UsXG4gICAgZGVwdGg6IDEwMDAsXG4gICAgbWF4QXJyYXlMZW5ndGg6IEluZmluaXR5LFxuICAgIC8vIEFzc2VydCBjb21wYXJlcyBvbmx5IGVudW1lcmFibGUgcHJvcGVydGllcyAod2l0aCBhIGZldyBleGNlcHRpb25zKS5cbiAgICBzaG93SGlkZGVuOiBmYWxzZSxcbiAgICAvLyBIYXZpbmcgYSBsb25nIGxpbmUgYXMgZXJyb3IgaXMgYmV0dGVyIHRoYW4gd3JhcHBpbmcgdGhlIGxpbmUgZm9yXG4gICAgLy8gY29tcGFyaXNvbiBmb3Igbm93LlxuICAgIC8vIFRPRE8oQnJpZGdlQVIpOiBgYnJlYWtMZW5ndGhgIHNob3VsZCBiZSBsaW1pdGVkIGFzIHNvb24gYXMgc29vbiBhcyB3ZVxuICAgIC8vIGhhdmUgbWV0YSBpbmZvcm1hdGlvbiBhYm91dCB0aGUgaW5zcGVjdGVkIHByb3BlcnRpZXMgKGkuZS4sIGtub3cgd2hlcmVcbiAgICAvLyBpbiB3aGF0IGxpbmUgdGhlIHByb3BlcnR5IHN0YXJ0cyBhbmQgZW5kcykuXG4gICAgYnJlYWtMZW5ndGg6IEluZmluaXR5LFxuICAgIC8vIEFzc2VydCBkb2VzIG5vdCBkZXRlY3QgcHJveGllcyBjdXJyZW50bHkuXG4gICAgc2hvd1Byb3h5OiBmYWxzZSxcbiAgICBzb3J0ZWQ6IHRydWUsXG4gICAgLy8gSW5zcGVjdCBnZXR0ZXJzIGFzIHdlIGFsc28gY2hlY2sgdGhlbSB3aGVuIGNvbXBhcmluZyBlbnRyaWVzLlxuICAgIGdldHRlcnM6IHRydWVcbiAgfSk7XG59XG5mdW5jdGlvbiBjcmVhdGVFcnJEaWZmKGFjdHVhbCwgZXhwZWN0ZWQsIG9wZXJhdG9yKSB7XG4gIHZhciBvdGhlciA9ICcnO1xuICB2YXIgcmVzID0gJyc7XG4gIHZhciBsYXN0UG9zID0gMDtcbiAgdmFyIGVuZCA9ICcnO1xuICB2YXIgc2tpcHBlZCA9IGZhbHNlO1xuICB2YXIgYWN0dWFsSW5zcGVjdGVkID0gaW5zcGVjdFZhbHVlKGFjdHVhbCk7XG4gIHZhciBhY3R1YWxMaW5lcyA9IGFjdHVhbEluc3BlY3RlZC5zcGxpdCgnXFxuJyk7XG4gIHZhciBleHBlY3RlZExpbmVzID0gaW5zcGVjdFZhbHVlKGV4cGVjdGVkKS5zcGxpdCgnXFxuJyk7XG4gIHZhciBpID0gMDtcbiAgdmFyIGluZGljYXRvciA9ICcnO1xuXG4gIC8vIEluIGNhc2UgYm90aCB2YWx1ZXMgYXJlIG9iamVjdHMgZXhwbGljaXRseSBtYXJrIHRoZW0gYXMgbm90IHJlZmVyZW5jZSBlcXVhbFxuICAvLyBmb3IgdGhlIGBzdHJpY3RFcXVhbGAgb3BlcmF0b3IuXG4gIGlmIChvcGVyYXRvciA9PT0gJ3N0cmljdEVxdWFsJyAmJiBfdHlwZW9mKGFjdHVhbCkgPT09ICdvYmplY3QnICYmIF90eXBlb2YoZXhwZWN0ZWQpID09PSAnb2JqZWN0JyAmJiBhY3R1YWwgIT09IG51bGwgJiYgZXhwZWN0ZWQgIT09IG51bGwpIHtcbiAgICBvcGVyYXRvciA9ICdzdHJpY3RFcXVhbE9iamVjdCc7XG4gIH1cblxuICAvLyBJZiBcImFjdHVhbFwiIGFuZCBcImV4cGVjdGVkXCIgZml0IG9uIGEgc2luZ2xlIGxpbmUgYW5kIHRoZXkgYXJlIG5vdCBzdHJpY3RseVxuICAvLyBlcXVhbCwgY2hlY2sgZnVydGhlciBzcGVjaWFsIGhhbmRsaW5nLlxuICBpZiAoYWN0dWFsTGluZXMubGVuZ3RoID09PSAxICYmIGV4cGVjdGVkTGluZXMubGVuZ3RoID09PSAxICYmIGFjdHVhbExpbmVzWzBdICE9PSBleHBlY3RlZExpbmVzWzBdKSB7XG4gICAgdmFyIGlucHV0TGVuZ3RoID0gYWN0dWFsTGluZXNbMF0ubGVuZ3RoICsgZXhwZWN0ZWRMaW5lc1swXS5sZW5ndGg7XG4gICAgLy8gSWYgdGhlIGNoYXJhY3RlciBsZW5ndGggb2YgXCJhY3R1YWxcIiBhbmQgXCJleHBlY3RlZFwiIHRvZ2V0aGVyIGlzIGxlc3MgdGhhblxuICAgIC8vIGtNYXhTaG9ydExlbmd0aCBhbmQgaWYgbmVpdGhlciBpcyBhbiBvYmplY3QgYW5kIGF0IGxlYXN0IG9uZSBvZiB0aGVtIGlzXG4gICAgLy8gbm90IGB6ZXJvYCwgdXNlIHRoZSBzdHJpY3QgZXF1YWwgY29tcGFyaXNvbiB0byB2aXN1YWxpemUgdGhlIG91dHB1dC5cbiAgICBpZiAoaW5wdXRMZW5ndGggPD0ga01heFNob3J0TGVuZ3RoKSB7XG4gICAgICBpZiAoKF90eXBlb2YoYWN0dWFsKSAhPT0gJ29iamVjdCcgfHwgYWN0dWFsID09PSBudWxsKSAmJiAoX3R5cGVvZihleHBlY3RlZCkgIT09ICdvYmplY3QnIHx8IGV4cGVjdGVkID09PSBudWxsKSAmJiAoYWN0dWFsICE9PSAwIHx8IGV4cGVjdGVkICE9PSAwKSkge1xuICAgICAgICAvLyAtMCA9PT0gKzBcbiAgICAgICAgcmV0dXJuIFwiXCIuY29uY2F0KGtSZWFkYWJsZU9wZXJhdG9yW29wZXJhdG9yXSwgXCJcXG5cXG5cIikgKyBcIlwiLmNvbmNhdChhY3R1YWxMaW5lc1swXSwgXCIgIT09IFwiKS5jb25jYXQoZXhwZWN0ZWRMaW5lc1swXSwgXCJcXG5cIik7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChvcGVyYXRvciAhPT0gJ3N0cmljdEVxdWFsT2JqZWN0Jykge1xuICAgICAgLy8gSWYgdGhlIHN0ZGVyciBpcyBhIHR0eSBhbmQgdGhlIGlucHV0IGxlbmd0aCBpcyBsb3dlciB0aGFuIHRoZSBjdXJyZW50XG4gICAgICAvLyBjb2x1bW5zIHBlciBsaW5lLCBhZGQgYSBtaXNtYXRjaCBpbmRpY2F0b3IgYmVsb3cgdGhlIG91dHB1dC4gSWYgaXQgaXNcbiAgICAgIC8vIG5vdCBhIHR0eSwgdXNlIGEgZGVmYXVsdCB2YWx1ZSBvZiA4MCBjaGFyYWN0ZXJzLlxuICAgICAgdmFyIG1heExlbmd0aCA9IHByb2Nlc3Muc3RkZXJyICYmIHByb2Nlc3Muc3RkZXJyLmlzVFRZID8gcHJvY2Vzcy5zdGRlcnIuY29sdW1ucyA6IDgwO1xuICAgICAgaWYgKGlucHV0TGVuZ3RoIDwgbWF4TGVuZ3RoKSB7XG4gICAgICAgIHdoaWxlIChhY3R1YWxMaW5lc1swXVtpXSA9PT0gZXhwZWN0ZWRMaW5lc1swXVtpXSkge1xuICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgICAgICAvLyBJZ25vcmUgdGhlIGZpcnN0IGNoYXJhY3RlcnMuXG4gICAgICAgIGlmIChpID4gMikge1xuICAgICAgICAgIC8vIEFkZCBwb3NpdGlvbiBpbmRpY2F0b3IgZm9yIHRoZSBmaXJzdCBtaXNtYXRjaCBpbiBjYXNlIGl0IGlzIGFcbiAgICAgICAgICAvLyBzaW5nbGUgbGluZSBhbmQgdGhlIGlucHV0IGxlbmd0aCBpcyBsZXNzIHRoYW4gdGhlIGNvbHVtbiBsZW5ndGguXG4gICAgICAgICAgaW5kaWNhdG9yID0gXCJcXG4gIFwiLmNvbmNhdChyZXBlYXQoJyAnLCBpKSwgXCJeXCIpO1xuICAgICAgICAgIGkgPSAwO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gUmVtb3ZlIGFsbCBlbmRpbmcgbGluZXMgdGhhdCBtYXRjaCAodGhpcyBvcHRpbWl6ZXMgdGhlIG91dHB1dCBmb3JcbiAgLy8gcmVhZGFiaWxpdHkgYnkgcmVkdWNpbmcgdGhlIG51bWJlciBvZiB0b3RhbCBjaGFuZ2VkIGxpbmVzKS5cbiAgdmFyIGEgPSBhY3R1YWxMaW5lc1thY3R1YWxMaW5lcy5sZW5ndGggLSAxXTtcbiAgdmFyIGIgPSBleHBlY3RlZExpbmVzW2V4cGVjdGVkTGluZXMubGVuZ3RoIC0gMV07XG4gIHdoaWxlIChhID09PSBiKSB7XG4gICAgaWYgKGkrKyA8IDIpIHtcbiAgICAgIGVuZCA9IFwiXFxuICBcIi5jb25jYXQoYSkuY29uY2F0KGVuZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG90aGVyID0gYTtcbiAgICB9XG4gICAgYWN0dWFsTGluZXMucG9wKCk7XG4gICAgZXhwZWN0ZWRMaW5lcy5wb3AoKTtcbiAgICBpZiAoYWN0dWFsTGluZXMubGVuZ3RoID09PSAwIHx8IGV4cGVjdGVkTGluZXMubGVuZ3RoID09PSAwKSBicmVhaztcbiAgICBhID0gYWN0dWFsTGluZXNbYWN0dWFsTGluZXMubGVuZ3RoIC0gMV07XG4gICAgYiA9IGV4cGVjdGVkTGluZXNbZXhwZWN0ZWRMaW5lcy5sZW5ndGggLSAxXTtcbiAgfVxuICB2YXIgbWF4TGluZXMgPSBNYXRoLm1heChhY3R1YWxMaW5lcy5sZW5ndGgsIGV4cGVjdGVkTGluZXMubGVuZ3RoKTtcbiAgLy8gU3RyaWN0IGVxdWFsIHdpdGggaWRlbnRpY2FsIG9iamVjdHMgdGhhdCBhcmUgbm90IGlkZW50aWNhbCBieSByZWZlcmVuY2UuXG4gIC8vIEUuZy4sIGFzc2VydC5kZWVwU3RyaWN0RXF1YWwoeyBhOiBTeW1ib2woKSB9LCB7IGE6IFN5bWJvbCgpIH0pXG4gIGlmIChtYXhMaW5lcyA9PT0gMCkge1xuICAgIC8vIFdlIGhhdmUgdG8gZ2V0IHRoZSByZXN1bHQgYWdhaW4uIFRoZSBsaW5lcyB3ZXJlIGFsbCByZW1vdmVkIGJlZm9yZS5cbiAgICB2YXIgX2FjdHVhbExpbmVzID0gYWN0dWFsSW5zcGVjdGVkLnNwbGl0KCdcXG4nKTtcblxuICAgIC8vIE9ubHkgcmVtb3ZlIGxpbmVzIGluIGNhc2UgaXQgbWFrZXMgc2Vuc2UgdG8gY29sbGFwc2UgdGhvc2UuXG4gICAgLy8gVE9ETzogQWNjZXB0IGVudiB0byBhbHdheXMgc2hvdyB0aGUgZnVsbCBlcnJvci5cbiAgICBpZiAoX2FjdHVhbExpbmVzLmxlbmd0aCA+IDMwKSB7XG4gICAgICBfYWN0dWFsTGluZXNbMjZdID0gXCJcIi5jb25jYXQoYmx1ZSwgXCIuLi5cIikuY29uY2F0KHdoaXRlKTtcbiAgICAgIHdoaWxlIChfYWN0dWFsTGluZXMubGVuZ3RoID4gMjcpIHtcbiAgICAgICAgX2FjdHVhbExpbmVzLnBvcCgpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gXCJcIi5jb25jYXQoa1JlYWRhYmxlT3BlcmF0b3Iubm90SWRlbnRpY2FsLCBcIlxcblxcblwiKS5jb25jYXQoX2FjdHVhbExpbmVzLmpvaW4oJ1xcbicpLCBcIlxcblwiKTtcbiAgfVxuICBpZiAoaSA+IDMpIHtcbiAgICBlbmQgPSBcIlxcblwiLmNvbmNhdChibHVlLCBcIi4uLlwiKS5jb25jYXQod2hpdGUpLmNvbmNhdChlbmQpO1xuICAgIHNraXBwZWQgPSB0cnVlO1xuICB9XG4gIGlmIChvdGhlciAhPT0gJycpIHtcbiAgICBlbmQgPSBcIlxcbiAgXCIuY29uY2F0KG90aGVyKS5jb25jYXQoZW5kKTtcbiAgICBvdGhlciA9ICcnO1xuICB9XG4gIHZhciBwcmludGVkTGluZXMgPSAwO1xuICB2YXIgbXNnID0ga1JlYWRhYmxlT3BlcmF0b3Jbb3BlcmF0b3JdICsgXCJcXG5cIi5jb25jYXQoZ3JlZW4sIFwiKyBhY3R1YWxcIikuY29uY2F0KHdoaXRlLCBcIiBcIikuY29uY2F0KHJlZCwgXCItIGV4cGVjdGVkXCIpLmNvbmNhdCh3aGl0ZSk7XG4gIHZhciBza2lwcGVkTXNnID0gXCIgXCIuY29uY2F0KGJsdWUsIFwiLi4uXCIpLmNvbmNhdCh3aGl0ZSwgXCIgTGluZXMgc2tpcHBlZFwiKTtcbiAgZm9yIChpID0gMDsgaSA8IG1heExpbmVzOyBpKyspIHtcbiAgICAvLyBPbmx5IGV4dHJhIGV4cGVjdGVkIGxpbmVzIGV4aXN0XG4gICAgdmFyIGN1ciA9IGkgLSBsYXN0UG9zO1xuICAgIGlmIChhY3R1YWxMaW5lcy5sZW5ndGggPCBpICsgMSkge1xuICAgICAgLy8gSWYgdGhlIGxhc3QgZGl2ZXJnaW5nIGxpbmUgaXMgbW9yZSB0aGFuIG9uZSBsaW5lIGFib3ZlIGFuZCB0aGVcbiAgICAgIC8vIGN1cnJlbnQgbGluZSBpcyBhdCBsZWFzdCBsaW5lIHRocmVlLCBhZGQgc29tZSBvZiB0aGUgZm9ybWVyIGxpbmVzIGFuZFxuICAgICAgLy8gYWxzbyBhZGQgZG90cyB0byBpbmRpY2F0ZSBza2lwcGVkIGVudHJpZXMuXG4gICAgICBpZiAoY3VyID4gMSAmJiBpID4gMikge1xuICAgICAgICBpZiAoY3VyID4gNCkge1xuICAgICAgICAgIHJlcyArPSBcIlxcblwiLmNvbmNhdChibHVlLCBcIi4uLlwiKS5jb25jYXQod2hpdGUpO1xuICAgICAgICAgIHNraXBwZWQgPSB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKGN1ciA+IDMpIHtcbiAgICAgICAgICByZXMgKz0gXCJcXG4gIFwiLmNvbmNhdChleHBlY3RlZExpbmVzW2kgLSAyXSk7XG4gICAgICAgICAgcHJpbnRlZExpbmVzKys7XG4gICAgICAgIH1cbiAgICAgICAgcmVzICs9IFwiXFxuICBcIi5jb25jYXQoZXhwZWN0ZWRMaW5lc1tpIC0gMV0pO1xuICAgICAgICBwcmludGVkTGluZXMrKztcbiAgICAgIH1cbiAgICAgIC8vIE1hcmsgdGhlIGN1cnJlbnQgbGluZSBhcyB0aGUgbGFzdCBkaXZlcmdpbmcgb25lLlxuICAgICAgbGFzdFBvcyA9IGk7XG4gICAgICAvLyBBZGQgdGhlIGV4cGVjdGVkIGxpbmUgdG8gdGhlIGNhY2hlLlxuICAgICAgb3RoZXIgKz0gXCJcXG5cIi5jb25jYXQocmVkLCBcIi1cIikuY29uY2F0KHdoaXRlLCBcIiBcIikuY29uY2F0KGV4cGVjdGVkTGluZXNbaV0pO1xuICAgICAgcHJpbnRlZExpbmVzKys7XG4gICAgICAvLyBPbmx5IGV4dHJhIGFjdHVhbCBsaW5lcyBleGlzdFxuICAgIH0gZWxzZSBpZiAoZXhwZWN0ZWRMaW5lcy5sZW5ndGggPCBpICsgMSkge1xuICAgICAgLy8gSWYgdGhlIGxhc3QgZGl2ZXJnaW5nIGxpbmUgaXMgbW9yZSB0aGFuIG9uZSBsaW5lIGFib3ZlIGFuZCB0aGVcbiAgICAgIC8vIGN1cnJlbnQgbGluZSBpcyBhdCBsZWFzdCBsaW5lIHRocmVlLCBhZGQgc29tZSBvZiB0aGUgZm9ybWVyIGxpbmVzIGFuZFxuICAgICAgLy8gYWxzbyBhZGQgZG90cyB0byBpbmRpY2F0ZSBza2lwcGVkIGVudHJpZXMuXG4gICAgICBpZiAoY3VyID4gMSAmJiBpID4gMikge1xuICAgICAgICBpZiAoY3VyID4gNCkge1xuICAgICAgICAgIHJlcyArPSBcIlxcblwiLmNvbmNhdChibHVlLCBcIi4uLlwiKS5jb25jYXQod2hpdGUpO1xuICAgICAgICAgIHNraXBwZWQgPSB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKGN1ciA+IDMpIHtcbiAgICAgICAgICByZXMgKz0gXCJcXG4gIFwiLmNvbmNhdChhY3R1YWxMaW5lc1tpIC0gMl0pO1xuICAgICAgICAgIHByaW50ZWRMaW5lcysrO1xuICAgICAgICB9XG4gICAgICAgIHJlcyArPSBcIlxcbiAgXCIuY29uY2F0KGFjdHVhbExpbmVzW2kgLSAxXSk7XG4gICAgICAgIHByaW50ZWRMaW5lcysrO1xuICAgICAgfVxuICAgICAgLy8gTWFyayB0aGUgY3VycmVudCBsaW5lIGFzIHRoZSBsYXN0IGRpdmVyZ2luZyBvbmUuXG4gICAgICBsYXN0UG9zID0gaTtcbiAgICAgIC8vIEFkZCB0aGUgYWN0dWFsIGxpbmUgdG8gdGhlIHJlc3VsdC5cbiAgICAgIHJlcyArPSBcIlxcblwiLmNvbmNhdChncmVlbiwgXCIrXCIpLmNvbmNhdCh3aGl0ZSwgXCIgXCIpLmNvbmNhdChhY3R1YWxMaW5lc1tpXSk7XG4gICAgICBwcmludGVkTGluZXMrKztcbiAgICAgIC8vIExpbmVzIGRpdmVyZ2VcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGV4cGVjdGVkTGluZSA9IGV4cGVjdGVkTGluZXNbaV07XG4gICAgICB2YXIgYWN0dWFsTGluZSA9IGFjdHVhbExpbmVzW2ldO1xuICAgICAgLy8gSWYgdGhlIGxpbmVzIGRpdmVyZ2UsIHNwZWNpZmljYWxseSBjaGVjayBmb3IgbGluZXMgdGhhdCBvbmx5IGRpdmVyZ2UgYnlcbiAgICAgIC8vIGEgdHJhaWxpbmcgY29tbWEuIEluIHRoYXQgY2FzZSBpdCBpcyBhY3R1YWxseSBpZGVudGljYWwgYW5kIHdlIHNob3VsZFxuICAgICAgLy8gbWFyayBpdCBhcyBzdWNoLlxuICAgICAgdmFyIGRpdmVyZ2luZ0xpbmVzID0gYWN0dWFsTGluZSAhPT0gZXhwZWN0ZWRMaW5lICYmICghZW5kc1dpdGgoYWN0dWFsTGluZSwgJywnKSB8fCBhY3R1YWxMaW5lLnNsaWNlKDAsIC0xKSAhPT0gZXhwZWN0ZWRMaW5lKTtcbiAgICAgIC8vIElmIHRoZSBleHBlY3RlZCBsaW5lIGhhcyBhIHRyYWlsaW5nIGNvbW1hIGJ1dCBpcyBvdGhlcndpc2UgaWRlbnRpY2FsLFxuICAgICAgLy8gYWRkIGEgY29tbWEgYXQgdGhlIGVuZCBvZiB0aGUgYWN0dWFsIGxpbmUuIE90aGVyd2lzZSB0aGUgb3V0cHV0IGNvdWxkXG4gICAgICAvLyBsb29rIHdlaXJkIGFzIGluOlxuICAgICAgLy9cbiAgICAgIC8vICAgW1xuICAgICAgLy8gICAgIDEgICAgICAgICAvLyBObyBjb21tYSBhdCB0aGUgZW5kIVxuICAgICAgLy8gKyAgIDJcbiAgICAgIC8vICAgXVxuICAgICAgLy9cbiAgICAgIGlmIChkaXZlcmdpbmdMaW5lcyAmJiBlbmRzV2l0aChleHBlY3RlZExpbmUsICcsJykgJiYgZXhwZWN0ZWRMaW5lLnNsaWNlKDAsIC0xKSA9PT0gYWN0dWFsTGluZSkge1xuICAgICAgICBkaXZlcmdpbmdMaW5lcyA9IGZhbHNlO1xuICAgICAgICBhY3R1YWxMaW5lICs9ICcsJztcbiAgICAgIH1cbiAgICAgIGlmIChkaXZlcmdpbmdMaW5lcykge1xuICAgICAgICAvLyBJZiB0aGUgbGFzdCBkaXZlcmdpbmcgbGluZSBpcyBtb3JlIHRoYW4gb25lIGxpbmUgYWJvdmUgYW5kIHRoZVxuICAgICAgICAvLyBjdXJyZW50IGxpbmUgaXMgYXQgbGVhc3QgbGluZSB0aHJlZSwgYWRkIHNvbWUgb2YgdGhlIGZvcm1lciBsaW5lcyBhbmRcbiAgICAgICAgLy8gYWxzbyBhZGQgZG90cyB0byBpbmRpY2F0ZSBza2lwcGVkIGVudHJpZXMuXG4gICAgICAgIGlmIChjdXIgPiAxICYmIGkgPiAyKSB7XG4gICAgICAgICAgaWYgKGN1ciA+IDQpIHtcbiAgICAgICAgICAgIHJlcyArPSBcIlxcblwiLmNvbmNhdChibHVlLCBcIi4uLlwiKS5jb25jYXQod2hpdGUpO1xuICAgICAgICAgICAgc2tpcHBlZCA9IHRydWU7XG4gICAgICAgICAgfSBlbHNlIGlmIChjdXIgPiAzKSB7XG4gICAgICAgICAgICByZXMgKz0gXCJcXG4gIFwiLmNvbmNhdChhY3R1YWxMaW5lc1tpIC0gMl0pO1xuICAgICAgICAgICAgcHJpbnRlZExpbmVzKys7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJlcyArPSBcIlxcbiAgXCIuY29uY2F0KGFjdHVhbExpbmVzW2kgLSAxXSk7XG4gICAgICAgICAgcHJpbnRlZExpbmVzKys7XG4gICAgICAgIH1cbiAgICAgICAgLy8gTWFyayB0aGUgY3VycmVudCBsaW5lIGFzIHRoZSBsYXN0IGRpdmVyZ2luZyBvbmUuXG4gICAgICAgIGxhc3RQb3MgPSBpO1xuICAgICAgICAvLyBBZGQgdGhlIGFjdHVhbCBsaW5lIHRvIHRoZSByZXN1bHQgYW5kIGNhY2hlIHRoZSBleHBlY3RlZCBkaXZlcmdpbmdcbiAgICAgICAgLy8gbGluZSBzbyBjb25zZWN1dGl2ZSBkaXZlcmdpbmcgbGluZXMgc2hvdyB1cCBhcyArKystLS0gYW5kIG5vdCArLSstKy0uXG4gICAgICAgIHJlcyArPSBcIlxcblwiLmNvbmNhdChncmVlbiwgXCIrXCIpLmNvbmNhdCh3aGl0ZSwgXCIgXCIpLmNvbmNhdChhY3R1YWxMaW5lKTtcbiAgICAgICAgb3RoZXIgKz0gXCJcXG5cIi5jb25jYXQocmVkLCBcIi1cIikuY29uY2F0KHdoaXRlLCBcIiBcIikuY29uY2F0KGV4cGVjdGVkTGluZSk7XG4gICAgICAgIHByaW50ZWRMaW5lcyArPSAyO1xuICAgICAgICAvLyBMaW5lcyBhcmUgaWRlbnRpY2FsXG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBBZGQgYWxsIGNhY2hlZCBpbmZvcm1hdGlvbiB0byB0aGUgcmVzdWx0IGJlZm9yZSBhZGRpbmcgb3RoZXIgdGhpbmdzXG4gICAgICAgIC8vIGFuZCByZXNldCB0aGUgY2FjaGUuXG4gICAgICAgIHJlcyArPSBvdGhlcjtcbiAgICAgICAgb3RoZXIgPSAnJztcbiAgICAgICAgLy8gSWYgdGhlIGxhc3QgZGl2ZXJnaW5nIGxpbmUgaXMgZXhhY3RseSBvbmUgbGluZSBhYm92ZSBvciBpZiBpdCBpcyB0aGVcbiAgICAgICAgLy8gdmVyeSBmaXJzdCBsaW5lLCBhZGQgdGhlIGxpbmUgdG8gdGhlIHJlc3VsdC5cbiAgICAgICAgaWYgKGN1ciA9PT0gMSB8fCBpID09PSAwKSB7XG4gICAgICAgICAgcmVzICs9IFwiXFxuICBcIi5jb25jYXQoYWN0dWFsTGluZSk7XG4gICAgICAgICAgcHJpbnRlZExpbmVzKys7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgLy8gSW5zcGVjdGVkIG9iamVjdCB0byBiaWcgKFNob3cgfjIwIHJvd3MgbWF4KVxuICAgIGlmIChwcmludGVkTGluZXMgPiAyMCAmJiBpIDwgbWF4TGluZXMgLSAyKSB7XG4gICAgICByZXR1cm4gXCJcIi5jb25jYXQobXNnKS5jb25jYXQoc2tpcHBlZE1zZywgXCJcXG5cIikuY29uY2F0KHJlcywgXCJcXG5cIikuY29uY2F0KGJsdWUsIFwiLi4uXCIpLmNvbmNhdCh3aGl0ZSkuY29uY2F0KG90aGVyLCBcIlxcblwiKSArIFwiXCIuY29uY2F0KGJsdWUsIFwiLi4uXCIpLmNvbmNhdCh3aGl0ZSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBcIlwiLmNvbmNhdChtc2cpLmNvbmNhdChza2lwcGVkID8gc2tpcHBlZE1zZyA6ICcnLCBcIlxcblwiKS5jb25jYXQocmVzKS5jb25jYXQob3RoZXIpLmNvbmNhdChlbmQpLmNvbmNhdChpbmRpY2F0b3IpO1xufVxudmFyIEFzc2VydGlvbkVycm9yID0gLyojX19QVVJFX18qL2Z1bmN0aW9uIChfRXJyb3IsIF9pbnNwZWN0JGN1c3RvbSkge1xuICBfaW5oZXJpdHMoQXNzZXJ0aW9uRXJyb3IsIF9FcnJvcik7XG4gIHZhciBfc3VwZXIgPSBfY3JlYXRlU3VwZXIoQXNzZXJ0aW9uRXJyb3IpO1xuICBmdW5jdGlvbiBBc3NlcnRpb25FcnJvcihvcHRpb25zKSB7XG4gICAgdmFyIF90aGlzO1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBBc3NlcnRpb25FcnJvcik7XG4gICAgaWYgKF90eXBlb2Yob3B0aW9ucykgIT09ICdvYmplY3QnIHx8IG9wdGlvbnMgPT09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFUlJfSU5WQUxJRF9BUkdfVFlQRSgnb3B0aW9ucycsICdPYmplY3QnLCBvcHRpb25zKTtcbiAgICB9XG4gICAgdmFyIG1lc3NhZ2UgPSBvcHRpb25zLm1lc3NhZ2UsXG4gICAgICBvcGVyYXRvciA9IG9wdGlvbnMub3BlcmF0b3IsXG4gICAgICBzdGFja1N0YXJ0Rm4gPSBvcHRpb25zLnN0YWNrU3RhcnRGbjtcbiAgICB2YXIgYWN0dWFsID0gb3B0aW9ucy5hY3R1YWwsXG4gICAgICBleHBlY3RlZCA9IG9wdGlvbnMuZXhwZWN0ZWQ7XG4gICAgdmFyIGxpbWl0ID0gRXJyb3Iuc3RhY2tUcmFjZUxpbWl0O1xuICAgIEVycm9yLnN0YWNrVHJhY2VMaW1pdCA9IDA7XG4gICAgaWYgKG1lc3NhZ2UgIT0gbnVsbCkge1xuICAgICAgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzLCBTdHJpbmcobWVzc2FnZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAocHJvY2Vzcy5zdGRlcnIgJiYgcHJvY2Vzcy5zdGRlcnIuaXNUVFkpIHtcbiAgICAgICAgLy8gUmVzZXQgb24gZWFjaCBjYWxsIHRvIG1ha2Ugc3VyZSB3ZSBoYW5kbGUgZHluYW1pY2FsbHkgc2V0IGVudmlyb25tZW50XG4gICAgICAgIC8vIHZhcmlhYmxlcyBjb3JyZWN0LlxuICAgICAgICBpZiAocHJvY2Vzcy5zdGRlcnIgJiYgcHJvY2Vzcy5zdGRlcnIuZ2V0Q29sb3JEZXB0aCAmJiBwcm9jZXNzLnN0ZGVyci5nZXRDb2xvckRlcHRoKCkgIT09IDEpIHtcbiAgICAgICAgICBibHVlID0gXCJcXHgxQlszNG1cIjtcbiAgICAgICAgICBncmVlbiA9IFwiXFx4MUJbMzJtXCI7XG4gICAgICAgICAgd2hpdGUgPSBcIlxceDFCWzM5bVwiO1xuICAgICAgICAgIHJlZCA9IFwiXFx4MUJbMzFtXCI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYmx1ZSA9ICcnO1xuICAgICAgICAgIGdyZWVuID0gJyc7XG4gICAgICAgICAgd2hpdGUgPSAnJztcbiAgICAgICAgICByZWQgPSAnJztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gUHJldmVudCB0aGUgZXJyb3Igc3RhY2sgZnJvbSBiZWluZyB2aXNpYmxlIGJ5IGR1cGxpY2F0aW5nIHRoZSBlcnJvclxuICAgICAgLy8gaW4gYSB2ZXJ5IGNsb3NlIHdheSB0byB0aGUgb3JpZ2luYWwgaW4gY2FzZSBib3RoIHNpZGVzIGFyZSBhY3R1YWxseVxuICAgICAgLy8gaW5zdGFuY2VzIG9mIEVycm9yLlxuICAgICAgaWYgKF90eXBlb2YoYWN0dWFsKSA9PT0gJ29iamVjdCcgJiYgYWN0dWFsICE9PSBudWxsICYmIF90eXBlb2YoZXhwZWN0ZWQpID09PSAnb2JqZWN0JyAmJiBleHBlY3RlZCAhPT0gbnVsbCAmJiAnc3RhY2snIGluIGFjdHVhbCAmJiBhY3R1YWwgaW5zdGFuY2VvZiBFcnJvciAmJiAnc3RhY2snIGluIGV4cGVjdGVkICYmIGV4cGVjdGVkIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgYWN0dWFsID0gY29weUVycm9yKGFjdHVhbCk7XG4gICAgICAgIGV4cGVjdGVkID0gY29weUVycm9yKGV4cGVjdGVkKTtcbiAgICAgIH1cbiAgICAgIGlmIChvcGVyYXRvciA9PT0gJ2RlZXBTdHJpY3RFcXVhbCcgfHwgb3BlcmF0b3IgPT09ICdzdHJpY3RFcXVhbCcpIHtcbiAgICAgICAgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzLCBjcmVhdGVFcnJEaWZmKGFjdHVhbCwgZXhwZWN0ZWQsIG9wZXJhdG9yKSk7XG4gICAgICB9IGVsc2UgaWYgKG9wZXJhdG9yID09PSAnbm90RGVlcFN0cmljdEVxdWFsJyB8fCBvcGVyYXRvciA9PT0gJ25vdFN0cmljdEVxdWFsJykge1xuICAgICAgICAvLyBJbiBjYXNlIHRoZSBvYmplY3RzIGFyZSBlcXVhbCBidXQgdGhlIG9wZXJhdG9yIHJlcXVpcmVzIHVuZXF1YWwsIHNob3dcbiAgICAgICAgLy8gdGhlIGZpcnN0IG9iamVjdCBhbmQgc2F5IEEgZXF1YWxzIEJcbiAgICAgICAgdmFyIGJhc2UgPSBrUmVhZGFibGVPcGVyYXRvcltvcGVyYXRvcl07XG4gICAgICAgIHZhciByZXMgPSBpbnNwZWN0VmFsdWUoYWN0dWFsKS5zcGxpdCgnXFxuJyk7XG5cbiAgICAgICAgLy8gSW4gY2FzZSBcImFjdHVhbFwiIGlzIGFuIG9iamVjdCwgaXQgc2hvdWxkIG5vdCBiZSByZWZlcmVuY2UgZXF1YWwuXG4gICAgICAgIGlmIChvcGVyYXRvciA9PT0gJ25vdFN0cmljdEVxdWFsJyAmJiBfdHlwZW9mKGFjdHVhbCkgPT09ICdvYmplY3QnICYmIGFjdHVhbCAhPT0gbnVsbCkge1xuICAgICAgICAgIGJhc2UgPSBrUmVhZGFibGVPcGVyYXRvci5ub3RTdHJpY3RFcXVhbE9iamVjdDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE9ubHkgcmVtb3ZlIGxpbmVzIGluIGNhc2UgaXQgbWFrZXMgc2Vuc2UgdG8gY29sbGFwc2UgdGhvc2UuXG4gICAgICAgIC8vIFRPRE86IEFjY2VwdCBlbnYgdG8gYWx3YXlzIHNob3cgdGhlIGZ1bGwgZXJyb3IuXG4gICAgICAgIGlmIChyZXMubGVuZ3RoID4gMzApIHtcbiAgICAgICAgICByZXNbMjZdID0gXCJcIi5jb25jYXQoYmx1ZSwgXCIuLi5cIikuY29uY2F0KHdoaXRlKTtcbiAgICAgICAgICB3aGlsZSAocmVzLmxlbmd0aCA+IDI3KSB7XG4gICAgICAgICAgICByZXMucG9wKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gT25seSBwcmludCBhIHNpbmdsZSBpbnB1dC5cbiAgICAgICAgaWYgKHJlcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMsIFwiXCIuY29uY2F0KGJhc2UsIFwiIFwiKS5jb25jYXQocmVzWzBdKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzLCBcIlwiLmNvbmNhdChiYXNlLCBcIlxcblxcblwiKS5jb25jYXQocmVzLmpvaW4oJ1xcbicpLCBcIlxcblwiKSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBfcmVzID0gaW5zcGVjdFZhbHVlKGFjdHVhbCk7XG4gICAgICAgIHZhciBvdGhlciA9ICcnO1xuICAgICAgICB2YXIga25vd25PcGVyYXRvcnMgPSBrUmVhZGFibGVPcGVyYXRvcltvcGVyYXRvcl07XG4gICAgICAgIGlmIChvcGVyYXRvciA9PT0gJ25vdERlZXBFcXVhbCcgfHwgb3BlcmF0b3IgPT09ICdub3RFcXVhbCcpIHtcbiAgICAgICAgICBfcmVzID0gXCJcIi5jb25jYXQoa1JlYWRhYmxlT3BlcmF0b3Jbb3BlcmF0b3JdLCBcIlxcblxcblwiKS5jb25jYXQoX3Jlcyk7XG4gICAgICAgICAgaWYgKF9yZXMubGVuZ3RoID4gMTAyNCkge1xuICAgICAgICAgICAgX3JlcyA9IFwiXCIuY29uY2F0KF9yZXMuc2xpY2UoMCwgMTAyMSksIFwiLi4uXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvdGhlciA9IFwiXCIuY29uY2F0KGluc3BlY3RWYWx1ZShleHBlY3RlZCkpO1xuICAgICAgICAgIGlmIChfcmVzLmxlbmd0aCA+IDUxMikge1xuICAgICAgICAgICAgX3JlcyA9IFwiXCIuY29uY2F0KF9yZXMuc2xpY2UoMCwgNTA5KSwgXCIuLi5cIik7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChvdGhlci5sZW5ndGggPiA1MTIpIHtcbiAgICAgICAgICAgIG90aGVyID0gXCJcIi5jb25jYXQob3RoZXIuc2xpY2UoMCwgNTA5KSwgXCIuLi5cIik7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChvcGVyYXRvciA9PT0gJ2RlZXBFcXVhbCcgfHwgb3BlcmF0b3IgPT09ICdlcXVhbCcpIHtcbiAgICAgICAgICAgIF9yZXMgPSBcIlwiLmNvbmNhdChrbm93bk9wZXJhdG9ycywgXCJcXG5cXG5cIikuY29uY2F0KF9yZXMsIFwiXFxuXFxuc2hvdWxkIGVxdWFsXFxuXFxuXCIpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvdGhlciA9IFwiIFwiLmNvbmNhdChvcGVyYXRvciwgXCIgXCIpLmNvbmNhdChvdGhlcik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIF90aGlzID0gX3N1cGVyLmNhbGwodGhpcywgXCJcIi5jb25jYXQoX3JlcykuY29uY2F0KG90aGVyKSk7XG4gICAgICB9XG4gICAgfVxuICAgIEVycm9yLnN0YWNrVHJhY2VMaW1pdCA9IGxpbWl0O1xuICAgIF90aGlzLmdlbmVyYXRlZE1lc3NhZ2UgPSAhbWVzc2FnZTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoX2Fzc2VydFRoaXNJbml0aWFsaXplZChfdGhpcyksICduYW1lJywge1xuICAgICAgdmFsdWU6ICdBc3NlcnRpb25FcnJvciBbRVJSX0FTU0VSVElPTl0nLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIF90aGlzLmNvZGUgPSAnRVJSX0FTU0VSVElPTic7XG4gICAgX3RoaXMuYWN0dWFsID0gYWN0dWFsO1xuICAgIF90aGlzLmV4cGVjdGVkID0gZXhwZWN0ZWQ7XG4gICAgX3RoaXMub3BlcmF0b3IgPSBvcGVyYXRvcjtcbiAgICBpZiAoRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UpIHtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1yZXN0cmljdGVkLXN5bnRheFxuICAgICAgRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UoX2Fzc2VydFRoaXNJbml0aWFsaXplZChfdGhpcyksIHN0YWNrU3RhcnRGbik7XG4gICAgfVxuICAgIC8vIENyZWF0ZSBlcnJvciBtZXNzYWdlIGluY2x1ZGluZyB0aGUgZXJyb3IgY29kZSBpbiB0aGUgbmFtZS5cbiAgICBfdGhpcy5zdGFjaztcbiAgICAvLyBSZXNldCB0aGUgbmFtZS5cbiAgICBfdGhpcy5uYW1lID0gJ0Fzc2VydGlvbkVycm9yJztcbiAgICByZXR1cm4gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oX3RoaXMpO1xuICB9XG4gIF9jcmVhdGVDbGFzcyhBc3NlcnRpb25FcnJvciwgW3tcbiAgICBrZXk6IFwidG9TdHJpbmdcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gICAgICByZXR1cm4gXCJcIi5jb25jYXQodGhpcy5uYW1lLCBcIiBbXCIpLmNvbmNhdCh0aGlzLmNvZGUsIFwiXTogXCIpLmNvbmNhdCh0aGlzLm1lc3NhZ2UpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogX2luc3BlY3QkY3VzdG9tLFxuICAgIHZhbHVlOiBmdW5jdGlvbiB2YWx1ZShyZWN1cnNlVGltZXMsIGN0eCkge1xuICAgICAgLy8gVGhpcyBsaW1pdHMgdGhlIGBhY3R1YWxgIGFuZCBgZXhwZWN0ZWRgIHByb3BlcnR5IGRlZmF1bHQgaW5zcGVjdGlvbiB0b1xuICAgICAgLy8gdGhlIG1pbmltdW0gZGVwdGguIE90aGVyd2lzZSB0aG9zZSB2YWx1ZXMgd291bGQgYmUgdG9vIHZlcmJvc2UgY29tcGFyZWRcbiAgICAgIC8vIHRvIHRoZSBhY3R1YWwgZXJyb3IgbWVzc2FnZSB3aGljaCBjb250YWlucyBhIGNvbWJpbmVkIHZpZXcgb2YgdGhlc2UgdHdvXG4gICAgICAvLyBpbnB1dCB2YWx1ZXMuXG4gICAgICByZXR1cm4gaW5zcGVjdCh0aGlzLCBfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoe30sIGN0eCksIHt9LCB7XG4gICAgICAgIGN1c3RvbUluc3BlY3Q6IGZhbHNlLFxuICAgICAgICBkZXB0aDogMFxuICAgICAgfSkpO1xuICAgIH1cbiAgfV0pO1xuICByZXR1cm4gQXNzZXJ0aW9uRXJyb3I7XG59KCAvKiNfX1BVUkVfXyovX3dyYXBOYXRpdmVTdXBlcihFcnJvciksIGluc3BlY3QuY3VzdG9tKTtcbm1vZHVsZS5leHBvcnRzID0gQXNzZXJ0aW9uRXJyb3I7IiwiLy8gQ3VycmVudGx5IGluIHN5bmMgd2l0aCBOb2RlLmpzIGxpYi9pbnRlcm5hbC9lcnJvcnMuanNcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9ub2RlanMvbm9kZS9jb21taXQvM2IwNDQ5NjJjNDhmZTMxMzkwNTg3N2E5NmI1ZDA4OTRhNTQwNGY2ZlxuXG4vKiBlc2xpbnQgbm9kZS1jb3JlL2RvY3VtZW50ZWQtZXJyb3JzOiBcImVycm9yXCIgKi9cbi8qIGVzbGludCBub2RlLWNvcmUvYWxwaGFiZXRpemUtZXJyb3JzOiBcImVycm9yXCIgKi9cbi8qIGVzbGludCBub2RlLWNvcmUvcHJlZmVyLXV0aWwtZm9ybWF0LWVycm9yczogXCJlcnJvclwiICovXG5cbid1c2Ugc3RyaWN0JztcblxuLy8gVGhlIHdob2xlIHBvaW50IGJlaGluZCB0aGlzIGludGVybmFsIG1vZHVsZSBpcyB0byBhbGxvdyBOb2RlLmpzIHRvIG5vXG4vLyBsb25nZXIgYmUgZm9yY2VkIHRvIHRyZWF0IGV2ZXJ5IGVycm9yIG1lc3NhZ2UgY2hhbmdlIGFzIGEgc2VtdmVyLW1ham9yXG4vLyBjaGFuZ2UuIFRoZSBOb2RlRXJyb3IgY2xhc3NlcyBoZXJlIGFsbCBleHBvc2UgYSBgY29kZWAgcHJvcGVydHkgd2hvc2Vcbi8vIHZhbHVlIHN0YXRpY2FsbHkgYW5kIHBlcm1hbmVudGx5IGlkZW50aWZpZXMgdGhlIGVycm9yLiBXaGlsZSB0aGUgZXJyb3Jcbi8vIG1lc3NhZ2UgbWF5IGNoYW5nZSwgdGhlIGNvZGUgc2hvdWxkIG5vdC5cbmZ1bmN0aW9uIF90eXBlb2YobykgeyBcIkBiYWJlbC9oZWxwZXJzIC0gdHlwZW9mXCI7IHJldHVybiBfdHlwZW9mID0gXCJmdW5jdGlvblwiID09IHR5cGVvZiBTeW1ib2wgJiYgXCJzeW1ib2xcIiA9PSB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID8gZnVuY3Rpb24gKG8pIHsgcmV0dXJuIHR5cGVvZiBvOyB9IDogZnVuY3Rpb24gKG8pIHsgcmV0dXJuIG8gJiYgXCJmdW5jdGlvblwiID09IHR5cGVvZiBTeW1ib2wgJiYgby5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sICYmIG8gIT09IFN5bWJvbC5wcm90b3R5cGUgPyBcInN5bWJvbFwiIDogdHlwZW9mIG87IH0sIF90eXBlb2Yobyk7IH1cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgX3RvUHJvcGVydHlLZXkoZGVzY3JpcHRvci5rZXkpLCBkZXNjcmlwdG9yKTsgfSB9XG5mdW5jdGlvbiBfY3JlYXRlQ2xhc3MoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBfZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIF9kZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShDb25zdHJ1Y3RvciwgXCJwcm90b3R5cGVcIiwgeyB3cml0YWJsZTogZmFsc2UgfSk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfVxuZnVuY3Rpb24gX3RvUHJvcGVydHlLZXkoYXJnKSB7IHZhciBrZXkgPSBfdG9QcmltaXRpdmUoYXJnLCBcInN0cmluZ1wiKTsgcmV0dXJuIF90eXBlb2Yoa2V5KSA9PT0gXCJzeW1ib2xcIiA/IGtleSA6IFN0cmluZyhrZXkpOyB9XG5mdW5jdGlvbiBfdG9QcmltaXRpdmUoaW5wdXQsIGhpbnQpIHsgaWYgKF90eXBlb2YoaW5wdXQpICE9PSBcIm9iamVjdFwiIHx8IGlucHV0ID09PSBudWxsKSByZXR1cm4gaW5wdXQ7IHZhciBwcmltID0gaW5wdXRbU3ltYm9sLnRvUHJpbWl0aXZlXTsgaWYgKHByaW0gIT09IHVuZGVmaW5lZCkgeyB2YXIgcmVzID0gcHJpbS5jYWxsKGlucHV0LCBoaW50IHx8IFwiZGVmYXVsdFwiKTsgaWYgKF90eXBlb2YocmVzKSAhPT0gXCJvYmplY3RcIikgcmV0dXJuIHJlczsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkBAdG9QcmltaXRpdmUgbXVzdCByZXR1cm4gYSBwcmltaXRpdmUgdmFsdWUuXCIpOyB9IHJldHVybiAoaGludCA9PT0gXCJzdHJpbmdcIiA/IFN0cmluZyA6IE51bWJlcikoaW5wdXQpOyB9XG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uXCIpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHN1YkNsYXNzLCBcInByb3RvdHlwZVwiLCB7IHdyaXRhYmxlOiBmYWxzZSB9KTsgaWYgKHN1cGVyQ2xhc3MpIF9zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcyk7IH1cbmZ1bmN0aW9uIF9zZXRQcm90b3R5cGVPZihvLCBwKSB7IF9zZXRQcm90b3R5cGVPZiA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZi5iaW5kKCkgOiBmdW5jdGlvbiBfc2V0UHJvdG90eXBlT2YobywgcCkgeyBvLl9fcHJvdG9fXyA9IHA7IHJldHVybiBvOyB9OyByZXR1cm4gX3NldFByb3RvdHlwZU9mKG8sIHApOyB9XG5mdW5jdGlvbiBfY3JlYXRlU3VwZXIoRGVyaXZlZCkgeyB2YXIgaGFzTmF0aXZlUmVmbGVjdENvbnN0cnVjdCA9IF9pc05hdGl2ZVJlZmxlY3RDb25zdHJ1Y3QoKTsgcmV0dXJuIGZ1bmN0aW9uIF9jcmVhdGVTdXBlckludGVybmFsKCkgeyB2YXIgU3VwZXIgPSBfZ2V0UHJvdG90eXBlT2YoRGVyaXZlZCksIHJlc3VsdDsgaWYgKGhhc05hdGl2ZVJlZmxlY3RDb25zdHJ1Y3QpIHsgdmFyIE5ld1RhcmdldCA9IF9nZXRQcm90b3R5cGVPZih0aGlzKS5jb25zdHJ1Y3RvcjsgcmVzdWx0ID0gUmVmbGVjdC5jb25zdHJ1Y3QoU3VwZXIsIGFyZ3VtZW50cywgTmV3VGFyZ2V0KTsgfSBlbHNlIHsgcmVzdWx0ID0gU3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTsgfSByZXR1cm4gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgcmVzdWx0KTsgfTsgfVxuZnVuY3Rpb24gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oc2VsZiwgY2FsbCkgeyBpZiAoY2FsbCAmJiAoX3R5cGVvZihjYWxsKSA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSkgeyByZXR1cm4gY2FsbDsgfSBlbHNlIGlmIChjYWxsICE9PSB2b2lkIDApIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkRlcml2ZWQgY29uc3RydWN0b3JzIG1heSBvbmx5IHJldHVybiBvYmplY3Qgb3IgdW5kZWZpbmVkXCIpOyB9IHJldHVybiBfYXNzZXJ0VGhpc0luaXRpYWxpemVkKHNlbGYpOyB9XG5mdW5jdGlvbiBfYXNzZXJ0VGhpc0luaXRpYWxpemVkKHNlbGYpIHsgaWYgKHNlbGYgPT09IHZvaWQgMCkgeyB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7IH0gcmV0dXJuIHNlbGY7IH1cbmZ1bmN0aW9uIF9pc05hdGl2ZVJlZmxlY3RDb25zdHJ1Y3QoKSB7IGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJ1bmRlZmluZWRcIiB8fCAhUmVmbGVjdC5jb25zdHJ1Y3QpIHJldHVybiBmYWxzZTsgaWYgKFJlZmxlY3QuY29uc3RydWN0LnNoYW0pIHJldHVybiBmYWxzZTsgaWYgKHR5cGVvZiBQcm94eSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gdHJ1ZTsgdHJ5IHsgQm9vbGVhbi5wcm90b3R5cGUudmFsdWVPZi5jYWxsKFJlZmxlY3QuY29uc3RydWN0KEJvb2xlYW4sIFtdLCBmdW5jdGlvbiAoKSB7fSkpOyByZXR1cm4gdHJ1ZTsgfSBjYXRjaCAoZSkgeyByZXR1cm4gZmFsc2U7IH0gfVxuZnVuY3Rpb24gX2dldFByb3RvdHlwZU9mKG8pIHsgX2dldFByb3RvdHlwZU9mID0gT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LmdldFByb3RvdHlwZU9mLmJpbmQoKSA6IGZ1bmN0aW9uIF9nZXRQcm90b3R5cGVPZihvKSB7IHJldHVybiBvLl9fcHJvdG9fXyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2Yobyk7IH07IHJldHVybiBfZ2V0UHJvdG90eXBlT2Yobyk7IH1cbnZhciBjb2RlcyA9IHt9O1xuXG4vLyBMYXp5IGxvYWRlZFxudmFyIGFzc2VydDtcbnZhciB1dGlsO1xuZnVuY3Rpb24gY3JlYXRlRXJyb3JUeXBlKGNvZGUsIG1lc3NhZ2UsIEJhc2UpIHtcbiAgaWYgKCFCYXNlKSB7XG4gICAgQmFzZSA9IEVycm9yO1xuICB9XG4gIGZ1bmN0aW9uIGdldE1lc3NhZ2UoYXJnMSwgYXJnMiwgYXJnMykge1xuICAgIGlmICh0eXBlb2YgbWVzc2FnZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiBtZXNzYWdlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbWVzc2FnZShhcmcxLCBhcmcyLCBhcmczKTtcbiAgICB9XG4gIH1cbiAgdmFyIE5vZGVFcnJvciA9IC8qI19fUFVSRV9fKi9mdW5jdGlvbiAoX0Jhc2UpIHtcbiAgICBfaW5oZXJpdHMoTm9kZUVycm9yLCBfQmFzZSk7XG4gICAgdmFyIF9zdXBlciA9IF9jcmVhdGVTdXBlcihOb2RlRXJyb3IpO1xuICAgIGZ1bmN0aW9uIE5vZGVFcnJvcihhcmcxLCBhcmcyLCBhcmczKSB7XG4gICAgICB2YXIgX3RoaXM7XG4gICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgTm9kZUVycm9yKTtcbiAgICAgIF90aGlzID0gX3N1cGVyLmNhbGwodGhpcywgZ2V0TWVzc2FnZShhcmcxLCBhcmcyLCBhcmczKSk7XG4gICAgICBfdGhpcy5jb2RlID0gY29kZTtcbiAgICAgIHJldHVybiBfdGhpcztcbiAgICB9XG4gICAgcmV0dXJuIF9jcmVhdGVDbGFzcyhOb2RlRXJyb3IpO1xuICB9KEJhc2UpO1xuICBjb2Rlc1tjb2RlXSA9IE5vZGVFcnJvcjtcbn1cblxuLy8gaHR0cHM6Ly9naXRodWIuY29tL25vZGVqcy9ub2RlL2Jsb2IvdjEwLjguMC9saWIvaW50ZXJuYWwvZXJyb3JzLmpzXG5mdW5jdGlvbiBvbmVPZihleHBlY3RlZCwgdGhpbmcpIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkoZXhwZWN0ZWQpKSB7XG4gICAgdmFyIGxlbiA9IGV4cGVjdGVkLmxlbmd0aDtcbiAgICBleHBlY3RlZCA9IGV4cGVjdGVkLm1hcChmdW5jdGlvbiAoaSkge1xuICAgICAgcmV0dXJuIFN0cmluZyhpKTtcbiAgICB9KTtcbiAgICBpZiAobGVuID4gMikge1xuICAgICAgcmV0dXJuIFwib25lIG9mIFwiLmNvbmNhdCh0aGluZywgXCIgXCIpLmNvbmNhdChleHBlY3RlZC5zbGljZSgwLCBsZW4gLSAxKS5qb2luKCcsICcpLCBcIiwgb3IgXCIpICsgZXhwZWN0ZWRbbGVuIC0gMV07XG4gICAgfSBlbHNlIGlmIChsZW4gPT09IDIpIHtcbiAgICAgIHJldHVybiBcIm9uZSBvZiBcIi5jb25jYXQodGhpbmcsIFwiIFwiKS5jb25jYXQoZXhwZWN0ZWRbMF0sIFwiIG9yIFwiKS5jb25jYXQoZXhwZWN0ZWRbMV0pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gXCJvZiBcIi5jb25jYXQodGhpbmcsIFwiIFwiKS5jb25jYXQoZXhwZWN0ZWRbMF0pO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gXCJvZiBcIi5jb25jYXQodGhpbmcsIFwiIFwiKS5jb25jYXQoU3RyaW5nKGV4cGVjdGVkKSk7XG4gIH1cbn1cblxuLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvU3RyaW5nL3N0YXJ0c1dpdGhcbmZ1bmN0aW9uIHN0YXJ0c1dpdGgoc3RyLCBzZWFyY2gsIHBvcykge1xuICByZXR1cm4gc3RyLnN1YnN0cighcG9zIHx8IHBvcyA8IDAgPyAwIDogK3Bvcywgc2VhcmNoLmxlbmd0aCkgPT09IHNlYXJjaDtcbn1cblxuLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvU3RyaW5nL2VuZHNXaXRoXG5mdW5jdGlvbiBlbmRzV2l0aChzdHIsIHNlYXJjaCwgdGhpc19sZW4pIHtcbiAgaWYgKHRoaXNfbGVuID09PSB1bmRlZmluZWQgfHwgdGhpc19sZW4gPiBzdHIubGVuZ3RoKSB7XG4gICAgdGhpc19sZW4gPSBzdHIubGVuZ3RoO1xuICB9XG4gIHJldHVybiBzdHIuc3Vic3RyaW5nKHRoaXNfbGVuIC0gc2VhcmNoLmxlbmd0aCwgdGhpc19sZW4pID09PSBzZWFyY2g7XG59XG5cbi8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL1N0cmluZy9pbmNsdWRlc1xuZnVuY3Rpb24gaW5jbHVkZXMoc3RyLCBzZWFyY2gsIHN0YXJ0KSB7XG4gIGlmICh0eXBlb2Ygc3RhcnQgIT09ICdudW1iZXInKSB7XG4gICAgc3RhcnQgPSAwO1xuICB9XG4gIGlmIChzdGFydCArIHNlYXJjaC5sZW5ndGggPiBzdHIubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBzdHIuaW5kZXhPZihzZWFyY2gsIHN0YXJ0KSAhPT0gLTE7XG4gIH1cbn1cbmNyZWF0ZUVycm9yVHlwZSgnRVJSX0FNQklHVU9VU19BUkdVTUVOVCcsICdUaGUgXCIlc1wiIGFyZ3VtZW50IGlzIGFtYmlndW91cy4gJXMnLCBUeXBlRXJyb3IpO1xuY3JlYXRlRXJyb3JUeXBlKCdFUlJfSU5WQUxJRF9BUkdfVFlQRScsIGZ1bmN0aW9uIChuYW1lLCBleHBlY3RlZCwgYWN0dWFsKSB7XG4gIGlmIChhc3NlcnQgPT09IHVuZGVmaW5lZCkgYXNzZXJ0ID0gcmVxdWlyZSgnLi4vYXNzZXJ0Jyk7XG4gIGFzc2VydCh0eXBlb2YgbmFtZSA9PT0gJ3N0cmluZycsIFwiJ25hbWUnIG11c3QgYmUgYSBzdHJpbmdcIik7XG5cbiAgLy8gZGV0ZXJtaW5lcjogJ211c3QgYmUnIG9yICdtdXN0IG5vdCBiZSdcbiAgdmFyIGRldGVybWluZXI7XG4gIGlmICh0eXBlb2YgZXhwZWN0ZWQgPT09ICdzdHJpbmcnICYmIHN0YXJ0c1dpdGgoZXhwZWN0ZWQsICdub3QgJykpIHtcbiAgICBkZXRlcm1pbmVyID0gJ211c3Qgbm90IGJlJztcbiAgICBleHBlY3RlZCA9IGV4cGVjdGVkLnJlcGxhY2UoL15ub3QgLywgJycpO1xuICB9IGVsc2Uge1xuICAgIGRldGVybWluZXIgPSAnbXVzdCBiZSc7XG4gIH1cbiAgdmFyIG1zZztcbiAgaWYgKGVuZHNXaXRoKG5hbWUsICcgYXJndW1lbnQnKSkge1xuICAgIC8vIEZvciBjYXNlcyBsaWtlICdmaXJzdCBhcmd1bWVudCdcbiAgICBtc2cgPSBcIlRoZSBcIi5jb25jYXQobmFtZSwgXCIgXCIpLmNvbmNhdChkZXRlcm1pbmVyLCBcIiBcIikuY29uY2F0KG9uZU9mKGV4cGVjdGVkLCAndHlwZScpKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgdHlwZSA9IGluY2x1ZGVzKG5hbWUsICcuJykgPyAncHJvcGVydHknIDogJ2FyZ3VtZW50JztcbiAgICBtc2cgPSBcIlRoZSBcXFwiXCIuY29uY2F0KG5hbWUsIFwiXFxcIiBcIikuY29uY2F0KHR5cGUsIFwiIFwiKS5jb25jYXQoZGV0ZXJtaW5lciwgXCIgXCIpLmNvbmNhdChvbmVPZihleHBlY3RlZCwgJ3R5cGUnKSk7XG4gIH1cblxuICAvLyBUT0RPKEJyaWRnZUFSKTogSW1wcm92ZSB0aGUgb3V0cHV0IGJ5IHNob3dpbmcgYG51bGxgIGFuZCBzaW1pbGFyLlxuICBtc2cgKz0gXCIuIFJlY2VpdmVkIHR5cGUgXCIuY29uY2F0KF90eXBlb2YoYWN0dWFsKSk7XG4gIHJldHVybiBtc2c7XG59LCBUeXBlRXJyb3IpO1xuY3JlYXRlRXJyb3JUeXBlKCdFUlJfSU5WQUxJRF9BUkdfVkFMVUUnLCBmdW5jdGlvbiAobmFtZSwgdmFsdWUpIHtcbiAgdmFyIHJlYXNvbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogJ2lzIGludmFsaWQnO1xuICBpZiAodXRpbCA9PT0gdW5kZWZpbmVkKSB1dGlsID0gcmVxdWlyZSgndXRpbC8nKTtcbiAgdmFyIGluc3BlY3RlZCA9IHV0aWwuaW5zcGVjdCh2YWx1ZSk7XG4gIGlmIChpbnNwZWN0ZWQubGVuZ3RoID4gMTI4KSB7XG4gICAgaW5zcGVjdGVkID0gXCJcIi5jb25jYXQoaW5zcGVjdGVkLnNsaWNlKDAsIDEyOCksIFwiLi4uXCIpO1xuICB9XG4gIHJldHVybiBcIlRoZSBhcmd1bWVudCAnXCIuY29uY2F0KG5hbWUsIFwiJyBcIikuY29uY2F0KHJlYXNvbiwgXCIuIFJlY2VpdmVkIFwiKS5jb25jYXQoaW5zcGVjdGVkKTtcbn0sIFR5cGVFcnJvciwgUmFuZ2VFcnJvcik7XG5jcmVhdGVFcnJvclR5cGUoJ0VSUl9JTlZBTElEX1JFVFVSTl9WQUxVRScsIGZ1bmN0aW9uIChpbnB1dCwgbmFtZSwgdmFsdWUpIHtcbiAgdmFyIHR5cGU7XG4gIGlmICh2YWx1ZSAmJiB2YWx1ZS5jb25zdHJ1Y3RvciAmJiB2YWx1ZS5jb25zdHJ1Y3Rvci5uYW1lKSB7XG4gICAgdHlwZSA9IFwiaW5zdGFuY2Ugb2YgXCIuY29uY2F0KHZhbHVlLmNvbnN0cnVjdG9yLm5hbWUpO1xuICB9IGVsc2Uge1xuICAgIHR5cGUgPSBcInR5cGUgXCIuY29uY2F0KF90eXBlb2YodmFsdWUpKTtcbiAgfVxuICByZXR1cm4gXCJFeHBlY3RlZCBcIi5jb25jYXQoaW5wdXQsIFwiIHRvIGJlIHJldHVybmVkIGZyb20gdGhlIFxcXCJcIikuY29uY2F0KG5hbWUsIFwiXFxcIlwiKSArIFwiIGZ1bmN0aW9uIGJ1dCBnb3QgXCIuY29uY2F0KHR5cGUsIFwiLlwiKTtcbn0sIFR5cGVFcnJvcik7XG5jcmVhdGVFcnJvclR5cGUoJ0VSUl9NSVNTSU5HX0FSR1MnLCBmdW5jdGlvbiAoKSB7XG4gIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gbmV3IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgIGFyZ3NbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XG4gIH1cbiAgaWYgKGFzc2VydCA9PT0gdW5kZWZpbmVkKSBhc3NlcnQgPSByZXF1aXJlKCcuLi9hc3NlcnQnKTtcbiAgYXNzZXJ0KGFyZ3MubGVuZ3RoID4gMCwgJ0F0IGxlYXN0IG9uZSBhcmcgbmVlZHMgdG8gYmUgc3BlY2lmaWVkJyk7XG4gIHZhciBtc2cgPSAnVGhlICc7XG4gIHZhciBsZW4gPSBhcmdzLmxlbmd0aDtcbiAgYXJncyA9IGFyZ3MubWFwKGZ1bmN0aW9uIChhKSB7XG4gICAgcmV0dXJuIFwiXFxcIlwiLmNvbmNhdChhLCBcIlxcXCJcIik7XG4gIH0pO1xuICBzd2l0Y2ggKGxlbikge1xuICAgIGNhc2UgMTpcbiAgICAgIG1zZyArPSBcIlwiLmNvbmNhdChhcmdzWzBdLCBcIiBhcmd1bWVudFwiKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgMjpcbiAgICAgIG1zZyArPSBcIlwiLmNvbmNhdChhcmdzWzBdLCBcIiBhbmQgXCIpLmNvbmNhdChhcmdzWzFdLCBcIiBhcmd1bWVudHNcIik7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgbXNnICs9IGFyZ3Muc2xpY2UoMCwgbGVuIC0gMSkuam9pbignLCAnKTtcbiAgICAgIG1zZyArPSBcIiwgYW5kIFwiLmNvbmNhdChhcmdzW2xlbiAtIDFdLCBcIiBhcmd1bWVudHNcIik7XG4gICAgICBicmVhaztcbiAgfVxuICByZXR1cm4gXCJcIi5jb25jYXQobXNnLCBcIiBtdXN0IGJlIHNwZWNpZmllZFwiKTtcbn0sIFR5cGVFcnJvcik7XG5tb2R1bGUuZXhwb3J0cy5jb2RlcyA9IGNvZGVzOyIsIi8vIEN1cnJlbnRseSBpbiBzeW5jIHdpdGggTm9kZS5qcyBsaWIvaW50ZXJuYWwvdXRpbC9jb21wYXJpc29ucy5qc1xuLy8gaHR0cHM6Ly9naXRodWIuY29tL25vZGVqcy9ub2RlL2NvbW1pdC8xMTJjYzdjMjc1NTEyNTRhYTJiMTcwOThmYjc3NDg2N2YwNWVkMGQ5XG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gX3NsaWNlZFRvQXJyYXkoYXJyLCBpKSB7IHJldHVybiBfYXJyYXlXaXRoSG9sZXMoYXJyKSB8fCBfaXRlcmFibGVUb0FycmF5TGltaXQoYXJyLCBpKSB8fCBfdW5zdXBwb3J0ZWRJdGVyYWJsZVRvQXJyYXkoYXJyLCBpKSB8fCBfbm9uSXRlcmFibGVSZXN0KCk7IH1cbmZ1bmN0aW9uIF9ub25JdGVyYWJsZVJlc3QoKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIGF0dGVtcHQgdG8gZGVzdHJ1Y3R1cmUgbm9uLWl0ZXJhYmxlIGluc3RhbmNlLlxcbkluIG9yZGVyIHRvIGJlIGl0ZXJhYmxlLCBub24tYXJyYXkgb2JqZWN0cyBtdXN0IGhhdmUgYSBbU3ltYm9sLml0ZXJhdG9yXSgpIG1ldGhvZC5cIik7IH1cbmZ1bmN0aW9uIF91bnN1cHBvcnRlZEl0ZXJhYmxlVG9BcnJheShvLCBtaW5MZW4pIHsgaWYgKCFvKSByZXR1cm47IGlmICh0eXBlb2YgbyA9PT0gXCJzdHJpbmdcIikgcmV0dXJuIF9hcnJheUxpa2VUb0FycmF5KG8sIG1pbkxlbik7IHZhciBuID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG8pLnNsaWNlKDgsIC0xKTsgaWYgKG4gPT09IFwiT2JqZWN0XCIgJiYgby5jb25zdHJ1Y3RvcikgbiA9IG8uY29uc3RydWN0b3IubmFtZTsgaWYgKG4gPT09IFwiTWFwXCIgfHwgbiA9PT0gXCJTZXRcIikgcmV0dXJuIEFycmF5LmZyb20obyk7IGlmIChuID09PSBcIkFyZ3VtZW50c1wiIHx8IC9eKD86VWl8SSludCg/Ojh8MTZ8MzIpKD86Q2xhbXBlZCk/QXJyYXkkLy50ZXN0KG4pKSByZXR1cm4gX2FycmF5TGlrZVRvQXJyYXkobywgbWluTGVuKTsgfVxuZnVuY3Rpb24gX2FycmF5TGlrZVRvQXJyYXkoYXJyLCBsZW4pIHsgaWYgKGxlbiA9PSBudWxsIHx8IGxlbiA+IGFyci5sZW5ndGgpIGxlbiA9IGFyci5sZW5ndGg7IGZvciAodmFyIGkgPSAwLCBhcnIyID0gbmV3IEFycmF5KGxlbik7IGkgPCBsZW47IGkrKykgYXJyMltpXSA9IGFycltpXTsgcmV0dXJuIGFycjI7IH1cbmZ1bmN0aW9uIF9pdGVyYWJsZVRvQXJyYXlMaW1pdChyLCBsKSB7IHZhciB0ID0gbnVsbCA9PSByID8gbnVsbCA6IFwidW5kZWZpbmVkXCIgIT0gdHlwZW9mIFN5bWJvbCAmJiByW1N5bWJvbC5pdGVyYXRvcl0gfHwgcltcIkBAaXRlcmF0b3JcIl07IGlmIChudWxsICE9IHQpIHsgdmFyIGUsIG4sIGksIHUsIGEgPSBbXSwgZiA9ICEwLCBvID0gITE7IHRyeSB7IGlmIChpID0gKHQgPSB0LmNhbGwocikpLm5leHQsIDAgPT09IGwpIHsgaWYgKE9iamVjdCh0KSAhPT0gdCkgcmV0dXJuOyBmID0gITE7IH0gZWxzZSBmb3IgKDsgIShmID0gKGUgPSBpLmNhbGwodCkpLmRvbmUpICYmIChhLnB1c2goZS52YWx1ZSksIGEubGVuZ3RoICE9PSBsKTsgZiA9ICEwKTsgfSBjYXRjaCAocikgeyBvID0gITAsIG4gPSByOyB9IGZpbmFsbHkgeyB0cnkgeyBpZiAoIWYgJiYgbnVsbCAhPSB0LnJldHVybiAmJiAodSA9IHQucmV0dXJuKCksIE9iamVjdCh1KSAhPT0gdSkpIHJldHVybjsgfSBmaW5hbGx5IHsgaWYgKG8pIHRocm93IG47IH0gfSByZXR1cm4gYTsgfSB9XG5mdW5jdGlvbiBfYXJyYXlXaXRoSG9sZXMoYXJyKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHJldHVybiBhcnI7IH1cbmZ1bmN0aW9uIF90eXBlb2YobykgeyBcIkBiYWJlbC9oZWxwZXJzIC0gdHlwZW9mXCI7IHJldHVybiBfdHlwZW9mID0gXCJmdW5jdGlvblwiID09IHR5cGVvZiBTeW1ib2wgJiYgXCJzeW1ib2xcIiA9PSB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID8gZnVuY3Rpb24gKG8pIHsgcmV0dXJuIHR5cGVvZiBvOyB9IDogZnVuY3Rpb24gKG8pIHsgcmV0dXJuIG8gJiYgXCJmdW5jdGlvblwiID09IHR5cGVvZiBTeW1ib2wgJiYgby5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sICYmIG8gIT09IFN5bWJvbC5wcm90b3R5cGUgPyBcInN5bWJvbFwiIDogdHlwZW9mIG87IH0sIF90eXBlb2Yobyk7IH1cbnZhciByZWdleEZsYWdzU3VwcG9ydGVkID0gL2EvZy5mbGFncyAhPT0gdW5kZWZpbmVkO1xudmFyIGFycmF5RnJvbVNldCA9IGZ1bmN0aW9uIGFycmF5RnJvbVNldChzZXQpIHtcbiAgdmFyIGFycmF5ID0gW107XG4gIHNldC5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHJldHVybiBhcnJheS5wdXNoKHZhbHVlKTtcbiAgfSk7XG4gIHJldHVybiBhcnJheTtcbn07XG52YXIgYXJyYXlGcm9tTWFwID0gZnVuY3Rpb24gYXJyYXlGcm9tTWFwKG1hcCkge1xuICB2YXIgYXJyYXkgPSBbXTtcbiAgbWFwLmZvckVhY2goZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcbiAgICByZXR1cm4gYXJyYXkucHVzaChba2V5LCB2YWx1ZV0pO1xuICB9KTtcbiAgcmV0dXJuIGFycmF5O1xufTtcbnZhciBvYmplY3RJcyA9IE9iamVjdC5pcyA/IE9iamVjdC5pcyA6IHJlcXVpcmUoJ29iamVjdC1pcycpO1xudmFyIG9iamVjdEdldE93blByb3BlcnR5U3ltYm9scyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPyBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzIDogZnVuY3Rpb24gKCkge1xuICByZXR1cm4gW107XG59O1xudmFyIG51bWJlcklzTmFOID0gTnVtYmVyLmlzTmFOID8gTnVtYmVyLmlzTmFOIDogcmVxdWlyZSgnaXMtbmFuJyk7XG5mdW5jdGlvbiB1bmN1cnJ5VGhpcyhmKSB7XG4gIHJldHVybiBmLmNhbGwuYmluZChmKTtcbn1cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IHVuY3VycnlUaGlzKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkpO1xudmFyIHByb3BlcnR5SXNFbnVtZXJhYmxlID0gdW5jdXJyeVRoaXMoT2JqZWN0LnByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZSk7XG52YXIgb2JqZWN0VG9TdHJpbmcgPSB1bmN1cnJ5VGhpcyhPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nKTtcbnZhciBfcmVxdWlyZSR0eXBlcyA9IHJlcXVpcmUoJ3V0aWwvJykudHlwZXMsXG4gIGlzQW55QXJyYXlCdWZmZXIgPSBfcmVxdWlyZSR0eXBlcy5pc0FueUFycmF5QnVmZmVyLFxuICBpc0FycmF5QnVmZmVyVmlldyA9IF9yZXF1aXJlJHR5cGVzLmlzQXJyYXlCdWZmZXJWaWV3LFxuICBpc0RhdGUgPSBfcmVxdWlyZSR0eXBlcy5pc0RhdGUsXG4gIGlzTWFwID0gX3JlcXVpcmUkdHlwZXMuaXNNYXAsXG4gIGlzUmVnRXhwID0gX3JlcXVpcmUkdHlwZXMuaXNSZWdFeHAsXG4gIGlzU2V0ID0gX3JlcXVpcmUkdHlwZXMuaXNTZXQsXG4gIGlzTmF0aXZlRXJyb3IgPSBfcmVxdWlyZSR0eXBlcy5pc05hdGl2ZUVycm9yLFxuICBpc0JveGVkUHJpbWl0aXZlID0gX3JlcXVpcmUkdHlwZXMuaXNCb3hlZFByaW1pdGl2ZSxcbiAgaXNOdW1iZXJPYmplY3QgPSBfcmVxdWlyZSR0eXBlcy5pc051bWJlck9iamVjdCxcbiAgaXNTdHJpbmdPYmplY3QgPSBfcmVxdWlyZSR0eXBlcy5pc1N0cmluZ09iamVjdCxcbiAgaXNCb29sZWFuT2JqZWN0ID0gX3JlcXVpcmUkdHlwZXMuaXNCb29sZWFuT2JqZWN0LFxuICBpc0JpZ0ludE9iamVjdCA9IF9yZXF1aXJlJHR5cGVzLmlzQmlnSW50T2JqZWN0LFxuICBpc1N5bWJvbE9iamVjdCA9IF9yZXF1aXJlJHR5cGVzLmlzU3ltYm9sT2JqZWN0LFxuICBpc0Zsb2F0MzJBcnJheSA9IF9yZXF1aXJlJHR5cGVzLmlzRmxvYXQzMkFycmF5LFxuICBpc0Zsb2F0NjRBcnJheSA9IF9yZXF1aXJlJHR5cGVzLmlzRmxvYXQ2NEFycmF5O1xuZnVuY3Rpb24gaXNOb25JbmRleChrZXkpIHtcbiAgaWYgKGtleS5sZW5ndGggPT09IDAgfHwga2V5Lmxlbmd0aCA+IDEwKSByZXR1cm4gdHJ1ZTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXkubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgY29kZSA9IGtleS5jaGFyQ29kZUF0KGkpO1xuICAgIGlmIChjb2RlIDwgNDggfHwgY29kZSA+IDU3KSByZXR1cm4gdHJ1ZTtcbiAgfVxuICAvLyBUaGUgbWF4aW11bSBzaXplIGZvciBhbiBhcnJheSBpcyAyICoqIDMyIC0xLlxuICByZXR1cm4ga2V5Lmxlbmd0aCA9PT0gMTAgJiYga2V5ID49IE1hdGgucG93KDIsIDMyKTtcbn1cbmZ1bmN0aW9uIGdldE93bk5vbkluZGV4UHJvcGVydGllcyh2YWx1ZSkge1xuICByZXR1cm4gT2JqZWN0LmtleXModmFsdWUpLmZpbHRlcihpc05vbkluZGV4KS5jb25jYXQob2JqZWN0R2V0T3duUHJvcGVydHlTeW1ib2xzKHZhbHVlKS5maWx0ZXIoT2JqZWN0LnByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZS5iaW5kKHZhbHVlKSkpO1xufVxuXG4vLyBUYWtlbiBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyL2Jsb2IvNjgwZTllNWU0ODhmMjJhYWMyNzU5OWE1N2RjODQ0YTYzMTU5MjhkZC9pbmRleC5qc1xuLy8gb3JpZ2luYWwgbm90aWNlOlxuLyohXG4gKiBUaGUgYnVmZmVyIG1vZHVsZSBmcm9tIG5vZGUuanMsIGZvciB0aGUgYnJvd3Nlci5cbiAqXG4gKiBAYXV0aG9yICAgRmVyb3NzIEFib3VraGFkaWplaCA8ZmVyb3NzQGZlcm9zcy5vcmc+IDxodHRwOi8vZmVyb3NzLm9yZz5cbiAqIEBsaWNlbnNlICBNSVRcbiAqL1xuZnVuY3Rpb24gY29tcGFyZShhLCBiKSB7XG4gIGlmIChhID09PSBiKSB7XG4gICAgcmV0dXJuIDA7XG4gIH1cbiAgdmFyIHggPSBhLmxlbmd0aDtcbiAgdmFyIHkgPSBiLmxlbmd0aDtcbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IE1hdGgubWluKHgsIHkpOyBpIDwgbGVuOyArK2kpIHtcbiAgICBpZiAoYVtpXSAhPT0gYltpXSkge1xuICAgICAgeCA9IGFbaV07XG4gICAgICB5ID0gYltpXTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICBpZiAoeCA8IHkpIHtcbiAgICByZXR1cm4gLTE7XG4gIH1cbiAgaWYgKHkgPCB4KSB7XG4gICAgcmV0dXJuIDE7XG4gIH1cbiAgcmV0dXJuIDA7XG59XG52YXIgT05MWV9FTlVNRVJBQkxFID0gdW5kZWZpbmVkO1xudmFyIGtTdHJpY3QgPSB0cnVlO1xudmFyIGtMb29zZSA9IGZhbHNlO1xudmFyIGtOb0l0ZXJhdG9yID0gMDtcbnZhciBrSXNBcnJheSA9IDE7XG52YXIga0lzU2V0ID0gMjtcbnZhciBrSXNNYXAgPSAzO1xuXG4vLyBDaGVjayBpZiB0aGV5IGhhdmUgdGhlIHNhbWUgc291cmNlIGFuZCBmbGFnc1xuZnVuY3Rpb24gYXJlU2ltaWxhclJlZ0V4cHMoYSwgYikge1xuICByZXR1cm4gcmVnZXhGbGFnc1N1cHBvcnRlZCA/IGEuc291cmNlID09PSBiLnNvdXJjZSAmJiBhLmZsYWdzID09PSBiLmZsYWdzIDogUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGEpID09PSBSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYik7XG59XG5mdW5jdGlvbiBhcmVTaW1pbGFyRmxvYXRBcnJheXMoYSwgYikge1xuICBpZiAoYS5ieXRlTGVuZ3RoICE9PSBiLmJ5dGVMZW5ndGgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgZm9yICh2YXIgb2Zmc2V0ID0gMDsgb2Zmc2V0IDwgYS5ieXRlTGVuZ3RoOyBvZmZzZXQrKykge1xuICAgIGlmIChhW29mZnNldF0gIT09IGJbb2Zmc2V0XSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cbmZ1bmN0aW9uIGFyZVNpbWlsYXJUeXBlZEFycmF5cyhhLCBiKSB7XG4gIGlmIChhLmJ5dGVMZW5ndGggIT09IGIuYnl0ZUxlbmd0aCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gY29tcGFyZShuZXcgVWludDhBcnJheShhLmJ1ZmZlciwgYS5ieXRlT2Zmc2V0LCBhLmJ5dGVMZW5ndGgpLCBuZXcgVWludDhBcnJheShiLmJ1ZmZlciwgYi5ieXRlT2Zmc2V0LCBiLmJ5dGVMZW5ndGgpKSA9PT0gMDtcbn1cbmZ1bmN0aW9uIGFyZUVxdWFsQXJyYXlCdWZmZXJzKGJ1ZjEsIGJ1ZjIpIHtcbiAgcmV0dXJuIGJ1ZjEuYnl0ZUxlbmd0aCA9PT0gYnVmMi5ieXRlTGVuZ3RoICYmIGNvbXBhcmUobmV3IFVpbnQ4QXJyYXkoYnVmMSksIG5ldyBVaW50OEFycmF5KGJ1ZjIpKSA9PT0gMDtcbn1cbmZ1bmN0aW9uIGlzRXF1YWxCb3hlZFByaW1pdGl2ZSh2YWwxLCB2YWwyKSB7XG4gIGlmIChpc051bWJlck9iamVjdCh2YWwxKSkge1xuICAgIHJldHVybiBpc051bWJlck9iamVjdCh2YWwyKSAmJiBvYmplY3RJcyhOdW1iZXIucHJvdG90eXBlLnZhbHVlT2YuY2FsbCh2YWwxKSwgTnVtYmVyLnByb3RvdHlwZS52YWx1ZU9mLmNhbGwodmFsMikpO1xuICB9XG4gIGlmIChpc1N0cmluZ09iamVjdCh2YWwxKSkge1xuICAgIHJldHVybiBpc1N0cmluZ09iamVjdCh2YWwyKSAmJiBTdHJpbmcucHJvdG90eXBlLnZhbHVlT2YuY2FsbCh2YWwxKSA9PT0gU3RyaW5nLnByb3RvdHlwZS52YWx1ZU9mLmNhbGwodmFsMik7XG4gIH1cbiAgaWYgKGlzQm9vbGVhbk9iamVjdCh2YWwxKSkge1xuICAgIHJldHVybiBpc0Jvb2xlYW5PYmplY3QodmFsMikgJiYgQm9vbGVhbi5wcm90b3R5cGUudmFsdWVPZi5jYWxsKHZhbDEpID09PSBCb29sZWFuLnByb3RvdHlwZS52YWx1ZU9mLmNhbGwodmFsMik7XG4gIH1cbiAgaWYgKGlzQmlnSW50T2JqZWN0KHZhbDEpKSB7XG4gICAgcmV0dXJuIGlzQmlnSW50T2JqZWN0KHZhbDIpICYmIEJpZ0ludC5wcm90b3R5cGUudmFsdWVPZi5jYWxsKHZhbDEpID09PSBCaWdJbnQucHJvdG90eXBlLnZhbHVlT2YuY2FsbCh2YWwyKTtcbiAgfVxuICByZXR1cm4gaXNTeW1ib2xPYmplY3QodmFsMikgJiYgU3ltYm9sLnByb3RvdHlwZS52YWx1ZU9mLmNhbGwodmFsMSkgPT09IFN5bWJvbC5wcm90b3R5cGUudmFsdWVPZi5jYWxsKHZhbDIpO1xufVxuXG4vLyBOb3RlczogVHlwZSB0YWdzIGFyZSBoaXN0b3JpY2FsIFtbQ2xhc3NdXSBwcm9wZXJ0aWVzIHRoYXQgY2FuIGJlIHNldCBieVxuLy8gRnVuY3Rpb25UZW1wbGF0ZTo6U2V0Q2xhc3NOYW1lKCkgaW4gQysrIG9yIFN5bWJvbC50b1N0cmluZ1RhZyBpbiBKU1xuLy8gYW5kIHJldHJpZXZlZCB1c2luZyBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSBpbiBKU1xuLy8gU2VlIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmdcbi8vIGZvciBhIGxpc3Qgb2YgdGFncyBwcmUtZGVmaW5lZCBpbiB0aGUgc3BlYy5cbi8vIFRoZXJlIGFyZSBzb21lIHVuc3BlY2lmaWVkIHRhZ3MgaW4gdGhlIHdpbGQgdG9vIChlLmcuIHR5cGVkIGFycmF5IHRhZ3MpLlxuLy8gU2luY2UgdGFncyBjYW4gYmUgYWx0ZXJlZCwgdGhleSBvbmx5IHNlcnZlIGZhc3QgZmFpbHVyZXNcbi8vXG4vLyBUeXBlZCBhcnJheXMgYW5kIGJ1ZmZlcnMgYXJlIGNoZWNrZWQgYnkgY29tcGFyaW5nIHRoZSBjb250ZW50IGluIHRoZWlyXG4vLyB1bmRlcmx5aW5nIEFycmF5QnVmZmVyLiBUaGlzIG9wdGltaXphdGlvbiByZXF1aXJlcyB0aGF0IGl0J3Ncbi8vIHJlYXNvbmFibGUgdG8gaW50ZXJwcmV0IHRoZWlyIHVuZGVybHlpbmcgbWVtb3J5IGluIHRoZSBzYW1lIHdheSxcbi8vIHdoaWNoIGlzIGNoZWNrZWQgYnkgY29tcGFyaW5nIHRoZWlyIHR5cGUgdGFncy5cbi8vIChlLmcuIGEgVWludDhBcnJheSBhbmQgYSBVaW50MTZBcnJheSB3aXRoIHRoZSBzYW1lIG1lbW9yeSBjb250ZW50XG4vLyBjb3VsZCBzdGlsbCBiZSBkaWZmZXJlbnQgYmVjYXVzZSB0aGV5IHdpbGwgYmUgaW50ZXJwcmV0ZWQgZGlmZmVyZW50bHkpLlxuLy9cbi8vIEZvciBzdHJpY3QgY29tcGFyaXNvbiwgb2JqZWN0cyBzaG91bGQgaGF2ZVxuLy8gYSkgVGhlIHNhbWUgYnVpbHQtaW4gdHlwZSB0YWdzXG4vLyBiKSBUaGUgc2FtZSBwcm90b3R5cGVzLlxuXG5mdW5jdGlvbiBpbm5lckRlZXBFcXVhbCh2YWwxLCB2YWwyLCBzdHJpY3QsIG1lbW9zKSB7XG4gIC8vIEFsbCBpZGVudGljYWwgdmFsdWVzIGFyZSBlcXVpdmFsZW50LCBhcyBkZXRlcm1pbmVkIGJ5ID09PS5cbiAgaWYgKHZhbDEgPT09IHZhbDIpIHtcbiAgICBpZiAodmFsMSAhPT0gMCkgcmV0dXJuIHRydWU7XG4gICAgcmV0dXJuIHN0cmljdCA/IG9iamVjdElzKHZhbDEsIHZhbDIpIDogdHJ1ZTtcbiAgfVxuXG4gIC8vIENoZWNrIG1vcmUgY2xvc2VseSBpZiB2YWwxIGFuZCB2YWwyIGFyZSBlcXVhbC5cbiAgaWYgKHN0cmljdCkge1xuICAgIGlmIChfdHlwZW9mKHZhbDEpICE9PSAnb2JqZWN0Jykge1xuICAgICAgcmV0dXJuIHR5cGVvZiB2YWwxID09PSAnbnVtYmVyJyAmJiBudW1iZXJJc05hTih2YWwxKSAmJiBudW1iZXJJc05hTih2YWwyKTtcbiAgICB9XG4gICAgaWYgKF90eXBlb2YodmFsMikgIT09ICdvYmplY3QnIHx8IHZhbDEgPT09IG51bGwgfHwgdmFsMiA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAoT2JqZWN0LmdldFByb3RvdHlwZU9mKHZhbDEpICE9PSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodmFsMikpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKHZhbDEgPT09IG51bGwgfHwgX3R5cGVvZih2YWwxKSAhPT0gJ29iamVjdCcpIHtcbiAgICAgIGlmICh2YWwyID09PSBudWxsIHx8IF90eXBlb2YodmFsMikgIT09ICdvYmplY3QnKSB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBlcWVxZXFcbiAgICAgICAgcmV0dXJuIHZhbDEgPT0gdmFsMjtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKHZhbDIgPT09IG51bGwgfHwgX3R5cGVvZih2YWwyKSAhPT0gJ29iamVjdCcpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgdmFyIHZhbDFUYWcgPSBvYmplY3RUb1N0cmluZyh2YWwxKTtcbiAgdmFyIHZhbDJUYWcgPSBvYmplY3RUb1N0cmluZyh2YWwyKTtcbiAgaWYgKHZhbDFUYWcgIT09IHZhbDJUYWcpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKEFycmF5LmlzQXJyYXkodmFsMSkpIHtcbiAgICAvLyBDaGVjayBmb3Igc3BhcnNlIGFycmF5cyBhbmQgZ2VuZXJhbCBmYXN0IHBhdGhcbiAgICBpZiAodmFsMS5sZW5ndGggIT09IHZhbDIubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHZhciBrZXlzMSA9IGdldE93bk5vbkluZGV4UHJvcGVydGllcyh2YWwxLCBPTkxZX0VOVU1FUkFCTEUpO1xuICAgIHZhciBrZXlzMiA9IGdldE93bk5vbkluZGV4UHJvcGVydGllcyh2YWwyLCBPTkxZX0VOVU1FUkFCTEUpO1xuICAgIGlmIChrZXlzMS5sZW5ndGggIT09IGtleXMyLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4ga2V5Q2hlY2sodmFsMSwgdmFsMiwgc3RyaWN0LCBtZW1vcywga0lzQXJyYXksIGtleXMxKTtcbiAgfVxuICAvLyBbYnJvd3NlcmlmeV0gVGhpcyB0cmlnZ2VycyBvbiBjZXJ0YWluIHR5cGVzIGluIElFIChNYXAvU2V0KSBzbyB3ZSBkb24ndFxuICAvLyB3YW4ndCB0byBlYXJseSByZXR1cm4gb3V0IG9mIHRoZSByZXN0IG9mIHRoZSBjaGVja3MuIEhvd2V2ZXIgd2UgY2FuIGNoZWNrXG4gIC8vIGlmIHRoZSBzZWNvbmQgdmFsdWUgaXMgb25lIG9mIHRoZXNlIHZhbHVlcyBhbmQgdGhlIGZpcnN0IGlzbid0LlxuICBpZiAodmFsMVRhZyA9PT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcbiAgICAvLyByZXR1cm4ga2V5Q2hlY2sodmFsMSwgdmFsMiwgc3RyaWN0LCBtZW1vcywga05vSXRlcmF0b3IpO1xuICAgIGlmICghaXNNYXAodmFsMSkgJiYgaXNNYXAodmFsMikgfHwgIWlzU2V0KHZhbDEpICYmIGlzU2V0KHZhbDIpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIGlmIChpc0RhdGUodmFsMSkpIHtcbiAgICBpZiAoIWlzRGF0ZSh2YWwyKSB8fCBEYXRlLnByb3RvdHlwZS5nZXRUaW1lLmNhbGwodmFsMSkgIT09IERhdGUucHJvdG90eXBlLmdldFRpbWUuY2FsbCh2YWwyKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfSBlbHNlIGlmIChpc1JlZ0V4cCh2YWwxKSkge1xuICAgIGlmICghaXNSZWdFeHAodmFsMikgfHwgIWFyZVNpbWlsYXJSZWdFeHBzKHZhbDEsIHZhbDIpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9IGVsc2UgaWYgKGlzTmF0aXZlRXJyb3IodmFsMSkgfHwgdmFsMSBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgLy8gRG8gbm90IGNvbXBhcmUgdGhlIHN0YWNrIGFzIGl0IG1pZ2h0IGRpZmZlciBldmVuIHRob3VnaCB0aGUgZXJyb3IgaXRzZWxmXG4gICAgLy8gaXMgb3RoZXJ3aXNlIGlkZW50aWNhbC5cbiAgICBpZiAodmFsMS5tZXNzYWdlICE9PSB2YWwyLm1lc3NhZ2UgfHwgdmFsMS5uYW1lICE9PSB2YWwyLm5hbWUpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNBcnJheUJ1ZmZlclZpZXcodmFsMSkpIHtcbiAgICBpZiAoIXN0cmljdCAmJiAoaXNGbG9hdDMyQXJyYXkodmFsMSkgfHwgaXNGbG9hdDY0QXJyYXkodmFsMSkpKSB7XG4gICAgICBpZiAoIWFyZVNpbWlsYXJGbG9hdEFycmF5cyh2YWwxLCB2YWwyKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICghYXJlU2ltaWxhclR5cGVkQXJyYXlzKHZhbDEsIHZhbDIpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIC8vIEJ1ZmZlci5jb21wYXJlIHJldHVybnMgdHJ1ZSwgc28gdmFsMS5sZW5ndGggPT09IHZhbDIubGVuZ3RoLiBJZiB0aGV5IGJvdGhcbiAgICAvLyBvbmx5IGNvbnRhaW4gbnVtZXJpYyBrZXlzLCB3ZSBkb24ndCBuZWVkIHRvIGV4YW0gZnVydGhlciB0aGFuIGNoZWNraW5nXG4gICAgLy8gdGhlIHN5bWJvbHMuXG4gICAgdmFyIF9rZXlzID0gZ2V0T3duTm9uSW5kZXhQcm9wZXJ0aWVzKHZhbDEsIE9OTFlfRU5VTUVSQUJMRSk7XG4gICAgdmFyIF9rZXlzMiA9IGdldE93bk5vbkluZGV4UHJvcGVydGllcyh2YWwyLCBPTkxZX0VOVU1FUkFCTEUpO1xuICAgIGlmIChfa2V5cy5sZW5ndGggIT09IF9rZXlzMi5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIGtleUNoZWNrKHZhbDEsIHZhbDIsIHN0cmljdCwgbWVtb3MsIGtOb0l0ZXJhdG9yLCBfa2V5cyk7XG4gIH0gZWxzZSBpZiAoaXNTZXQodmFsMSkpIHtcbiAgICBpZiAoIWlzU2V0KHZhbDIpIHx8IHZhbDEuc2l6ZSAhPT0gdmFsMi5zaXplKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBrZXlDaGVjayh2YWwxLCB2YWwyLCBzdHJpY3QsIG1lbW9zLCBrSXNTZXQpO1xuICB9IGVsc2UgaWYgKGlzTWFwKHZhbDEpKSB7XG4gICAgaWYgKCFpc01hcCh2YWwyKSB8fCB2YWwxLnNpemUgIT09IHZhbDIuc2l6ZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4ga2V5Q2hlY2sodmFsMSwgdmFsMiwgc3RyaWN0LCBtZW1vcywga0lzTWFwKTtcbiAgfSBlbHNlIGlmIChpc0FueUFycmF5QnVmZmVyKHZhbDEpKSB7XG4gICAgaWYgKCFhcmVFcXVhbEFycmF5QnVmZmVycyh2YWwxLCB2YWwyKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfSBlbHNlIGlmIChpc0JveGVkUHJpbWl0aXZlKHZhbDEpICYmICFpc0VxdWFsQm94ZWRQcmltaXRpdmUodmFsMSwgdmFsMikpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIGtleUNoZWNrKHZhbDEsIHZhbDIsIHN0cmljdCwgbWVtb3MsIGtOb0l0ZXJhdG9yKTtcbn1cbmZ1bmN0aW9uIGdldEVudW1lcmFibGVzKHZhbCwga2V5cykge1xuICByZXR1cm4ga2V5cy5maWx0ZXIoZnVuY3Rpb24gKGspIHtcbiAgICByZXR1cm4gcHJvcGVydHlJc0VudW1lcmFibGUodmFsLCBrKTtcbiAgfSk7XG59XG5mdW5jdGlvbiBrZXlDaGVjayh2YWwxLCB2YWwyLCBzdHJpY3QsIG1lbW9zLCBpdGVyYXRpb25UeXBlLCBhS2V5cykge1xuICAvLyBGb3IgYWxsIHJlbWFpbmluZyBPYmplY3QgcGFpcnMsIGluY2x1ZGluZyBBcnJheSwgb2JqZWN0cyBhbmQgTWFwcyxcbiAgLy8gZXF1aXZhbGVuY2UgaXMgZGV0ZXJtaW5lZCBieSBoYXZpbmc6XG4gIC8vIGEpIFRoZSBzYW1lIG51bWJlciBvZiBvd25lZCBlbnVtZXJhYmxlIHByb3BlcnRpZXNcbiAgLy8gYikgVGhlIHNhbWUgc2V0IG9mIGtleXMvaW5kZXhlcyAoYWx0aG91Z2ggbm90IG5lY2Vzc2FyaWx5IHRoZSBzYW1lIG9yZGVyKVxuICAvLyBjKSBFcXVpdmFsZW50IHZhbHVlcyBmb3IgZXZlcnkgY29ycmVzcG9uZGluZyBrZXkvaW5kZXhcbiAgLy8gZCkgRm9yIFNldHMgYW5kIE1hcHMsIGVxdWFsIGNvbnRlbnRzXG4gIC8vIE5vdGU6IHRoaXMgYWNjb3VudHMgZm9yIGJvdGggbmFtZWQgYW5kIGluZGV4ZWQgcHJvcGVydGllcyBvbiBBcnJheXMuXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSA1KSB7XG4gICAgYUtleXMgPSBPYmplY3Qua2V5cyh2YWwxKTtcbiAgICB2YXIgYktleXMgPSBPYmplY3Qua2V5cyh2YWwyKTtcblxuICAgIC8vIFRoZSBwYWlyIG11c3QgaGF2ZSB0aGUgc2FtZSBudW1iZXIgb2Ygb3duZWQgcHJvcGVydGllcy5cbiAgICBpZiAoYUtleXMubGVuZ3RoICE9PSBiS2V5cy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvLyBDaGVhcCBrZXkgdGVzdFxuICB2YXIgaSA9IDA7XG4gIGZvciAoOyBpIDwgYUtleXMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoIWhhc093blByb3BlcnR5KHZhbDIsIGFLZXlzW2ldKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICBpZiAoc3RyaWN0ICYmIGFyZ3VtZW50cy5sZW5ndGggPT09IDUpIHtcbiAgICB2YXIgc3ltYm9sS2V5c0EgPSBvYmplY3RHZXRPd25Qcm9wZXJ0eVN5bWJvbHModmFsMSk7XG4gICAgaWYgKHN5bWJvbEtleXNBLmxlbmd0aCAhPT0gMCkge1xuICAgICAgdmFyIGNvdW50ID0gMDtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBzeW1ib2xLZXlzQS5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIga2V5ID0gc3ltYm9sS2V5c0FbaV07XG4gICAgICAgIGlmIChwcm9wZXJ0eUlzRW51bWVyYWJsZSh2YWwxLCBrZXkpKSB7XG4gICAgICAgICAgaWYgKCFwcm9wZXJ0eUlzRW51bWVyYWJsZSh2YWwyLCBrZXkpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICAgIGFLZXlzLnB1c2goa2V5KTtcbiAgICAgICAgICBjb3VudCsrO1xuICAgICAgICB9IGVsc2UgaWYgKHByb3BlcnR5SXNFbnVtZXJhYmxlKHZhbDIsIGtleSkpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHZhciBzeW1ib2xLZXlzQiA9IG9iamVjdEdldE93blByb3BlcnR5U3ltYm9scyh2YWwyKTtcbiAgICAgIGlmIChzeW1ib2xLZXlzQS5sZW5ndGggIT09IHN5bWJvbEtleXNCLmxlbmd0aCAmJiBnZXRFbnVtZXJhYmxlcyh2YWwyLCBzeW1ib2xLZXlzQikubGVuZ3RoICE9PSBjb3VudCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBfc3ltYm9sS2V5c0IgPSBvYmplY3RHZXRPd25Qcm9wZXJ0eVN5bWJvbHModmFsMik7XG4gICAgICBpZiAoX3N5bWJvbEtleXNCLmxlbmd0aCAhPT0gMCAmJiBnZXRFbnVtZXJhYmxlcyh2YWwyLCBfc3ltYm9sS2V5c0IpLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGlmIChhS2V5cy5sZW5ndGggPT09IDAgJiYgKGl0ZXJhdGlvblR5cGUgPT09IGtOb0l0ZXJhdG9yIHx8IGl0ZXJhdGlvblR5cGUgPT09IGtJc0FycmF5ICYmIHZhbDEubGVuZ3RoID09PSAwIHx8IHZhbDEuc2l6ZSA9PT0gMCkpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8vIFVzZSBtZW1vcyB0byBoYW5kbGUgY3ljbGVzLlxuICBpZiAobWVtb3MgPT09IHVuZGVmaW5lZCkge1xuICAgIG1lbW9zID0ge1xuICAgICAgdmFsMTogbmV3IE1hcCgpLFxuICAgICAgdmFsMjogbmV3IE1hcCgpLFxuICAgICAgcG9zaXRpb246IDBcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIC8vIFdlIHByZXZlbnQgdXAgdG8gdHdvIG1hcC5oYXMoeCkgY2FsbHMgYnkgZGlyZWN0bHkgcmV0cmlldmluZyB0aGUgdmFsdWVcbiAgICAvLyBhbmQgY2hlY2tpbmcgZm9yIHVuZGVmaW5lZC4gVGhlIG1hcCBjYW4gb25seSBjb250YWluIG51bWJlcnMsIHNvIGl0IGlzXG4gICAgLy8gc2FmZSB0byBjaGVjayBmb3IgdW5kZWZpbmVkIG9ubHkuXG4gICAgdmFyIHZhbDJNZW1vQSA9IG1lbW9zLnZhbDEuZ2V0KHZhbDEpO1xuICAgIGlmICh2YWwyTWVtb0EgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdmFyIHZhbDJNZW1vQiA9IG1lbW9zLnZhbDIuZ2V0KHZhbDIpO1xuICAgICAgaWYgKHZhbDJNZW1vQiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiB2YWwyTWVtb0EgPT09IHZhbDJNZW1vQjtcbiAgICAgIH1cbiAgICB9XG4gICAgbWVtb3MucG9zaXRpb24rKztcbiAgfVxuICBtZW1vcy52YWwxLnNldCh2YWwxLCBtZW1vcy5wb3NpdGlvbik7XG4gIG1lbW9zLnZhbDIuc2V0KHZhbDIsIG1lbW9zLnBvc2l0aW9uKTtcbiAgdmFyIGFyZUVxID0gb2JqRXF1aXYodmFsMSwgdmFsMiwgc3RyaWN0LCBhS2V5cywgbWVtb3MsIGl0ZXJhdGlvblR5cGUpO1xuICBtZW1vcy52YWwxLmRlbGV0ZSh2YWwxKTtcbiAgbWVtb3MudmFsMi5kZWxldGUodmFsMik7XG4gIHJldHVybiBhcmVFcTtcbn1cbmZ1bmN0aW9uIHNldEhhc0VxdWFsRWxlbWVudChzZXQsIHZhbDEsIHN0cmljdCwgbWVtbykge1xuICAvLyBHbyBsb29raW5nLlxuICB2YXIgc2V0VmFsdWVzID0gYXJyYXlGcm9tU2V0KHNldCk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc2V0VmFsdWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHZhbDIgPSBzZXRWYWx1ZXNbaV07XG4gICAgaWYgKGlubmVyRGVlcEVxdWFsKHZhbDEsIHZhbDIsIHN0cmljdCwgbWVtbykpIHtcbiAgICAgIC8vIFJlbW92ZSB0aGUgbWF0Y2hpbmcgZWxlbWVudCB0byBtYWtlIHN1cmUgd2UgZG8gbm90IGNoZWNrIHRoYXQgYWdhaW4uXG4gICAgICBzZXQuZGVsZXRlKHZhbDIpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLy8gU2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvRXF1YWxpdHlfY29tcGFyaXNvbnNfYW5kX3NhbWVuZXNzI0xvb3NlX2VxdWFsaXR5X3VzaW5nXG4vLyBTYWRseSBpdCBpcyBub3QgcG9zc2libGUgdG8gZGV0ZWN0IGNvcnJlc3BvbmRpbmcgdmFsdWVzIHByb3Blcmx5IGluIGNhc2UgdGhlXG4vLyB0eXBlIGlzIGEgc3RyaW5nLCBudW1iZXIsIGJpZ2ludCBvciBib29sZWFuLiBUaGUgcmVhc29uIGlzIHRoYXQgdGhvc2UgdmFsdWVzXG4vLyBjYW4gbWF0Y2ggbG90cyBvZiBkaWZmZXJlbnQgc3RyaW5nIHZhbHVlcyAoZS5nLiwgMW4gPT0gJyswMDAwMScpLlxuZnVuY3Rpb24gZmluZExvb3NlTWF0Y2hpbmdQcmltaXRpdmVzKHByaW0pIHtcbiAgc3dpdGNoIChfdHlwZW9mKHByaW0pKSB7XG4gICAgY2FzZSAndW5kZWZpbmVkJzpcbiAgICAgIHJldHVybiBudWxsO1xuICAgIGNhc2UgJ29iamVjdCc6XG4gICAgICAvLyBPbmx5IHBhc3MgaW4gbnVsbCBhcyBvYmplY3QhXG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIGNhc2UgJ3N5bWJvbCc6XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgIHByaW0gPSArcHJpbTtcbiAgICAvLyBMb29zZSBlcXVhbCBlbnRyaWVzIGV4aXN0IG9ubHkgaWYgdGhlIHN0cmluZyBpcyBwb3NzaWJsZSB0byBjb252ZXJ0IHRvXG4gICAgLy8gYSByZWd1bGFyIG51bWJlciBhbmQgbm90IE5hTi5cbiAgICAvLyBGYWxsIHRocm91Z2hcbiAgICBjYXNlICdudW1iZXInOlxuICAgICAgaWYgKG51bWJlcklzTmFOKHByaW0pKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cbmZ1bmN0aW9uIHNldE1pZ2h0SGF2ZUxvb3NlUHJpbShhLCBiLCBwcmltKSB7XG4gIHZhciBhbHRWYWx1ZSA9IGZpbmRMb29zZU1hdGNoaW5nUHJpbWl0aXZlcyhwcmltKTtcbiAgaWYgKGFsdFZhbHVlICE9IG51bGwpIHJldHVybiBhbHRWYWx1ZTtcbiAgcmV0dXJuIGIuaGFzKGFsdFZhbHVlKSAmJiAhYS5oYXMoYWx0VmFsdWUpO1xufVxuZnVuY3Rpb24gbWFwTWlnaHRIYXZlTG9vc2VQcmltKGEsIGIsIHByaW0sIGl0ZW0sIG1lbW8pIHtcbiAgdmFyIGFsdFZhbHVlID0gZmluZExvb3NlTWF0Y2hpbmdQcmltaXRpdmVzKHByaW0pO1xuICBpZiAoYWx0VmFsdWUgIT0gbnVsbCkge1xuICAgIHJldHVybiBhbHRWYWx1ZTtcbiAgfVxuICB2YXIgY3VyQiA9IGIuZ2V0KGFsdFZhbHVlKTtcbiAgaWYgKGN1ckIgPT09IHVuZGVmaW5lZCAmJiAhYi5oYXMoYWx0VmFsdWUpIHx8ICFpbm5lckRlZXBFcXVhbChpdGVtLCBjdXJCLCBmYWxzZSwgbWVtbykpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuICFhLmhhcyhhbHRWYWx1ZSkgJiYgaW5uZXJEZWVwRXF1YWwoaXRlbSwgY3VyQiwgZmFsc2UsIG1lbW8pO1xufVxuZnVuY3Rpb24gc2V0RXF1aXYoYSwgYiwgc3RyaWN0LCBtZW1vKSB7XG4gIC8vIFRoaXMgaXMgYSBsYXppbHkgaW5pdGlhdGVkIFNldCBvZiBlbnRyaWVzIHdoaWNoIGhhdmUgdG8gYmUgY29tcGFyZWRcbiAgLy8gcGFpcndpc2UuXG4gIHZhciBzZXQgPSBudWxsO1xuICB2YXIgYVZhbHVlcyA9IGFycmF5RnJvbVNldChhKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhVmFsdWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHZhbCA9IGFWYWx1ZXNbaV07XG4gICAgLy8gTm90ZTogQ2hlY2tpbmcgZm9yIHRoZSBvYmplY3RzIGZpcnN0IGltcHJvdmVzIHRoZSBwZXJmb3JtYW5jZSBmb3Igb2JqZWN0XG4gICAgLy8gaGVhdnkgc2V0cyBidXQgaXQgaXMgYSBtaW5vciBzbG93IGRvd24gZm9yIHByaW1pdGl2ZXMuIEFzIHRoZXkgYXJlIGZhc3RcbiAgICAvLyB0byBjaGVjayB0aGlzIGltcHJvdmVzIHRoZSB3b3JzdCBjYXNlIHNjZW5hcmlvIGluc3RlYWQuXG4gICAgaWYgKF90eXBlb2YodmFsKSA9PT0gJ29iamVjdCcgJiYgdmFsICE9PSBudWxsKSB7XG4gICAgICBpZiAoc2V0ID09PSBudWxsKSB7XG4gICAgICAgIHNldCA9IG5ldyBTZXQoKTtcbiAgICAgIH1cbiAgICAgIC8vIElmIHRoZSBzcGVjaWZpZWQgdmFsdWUgZG9lc24ndCBleGlzdCBpbiB0aGUgc2Vjb25kIHNldCBpdHMgYW4gbm90IG51bGxcbiAgICAgIC8vIG9iamVjdCAob3Igbm9uIHN0cmljdCBvbmx5OiBhIG5vdCBtYXRjaGluZyBwcmltaXRpdmUpIHdlJ2xsIG5lZWQgdG8gZ29cbiAgICAgIC8vIGh1bnRpbmcgZm9yIHNvbWV0aGluZyB0aGF0cyBkZWVwLShzdHJpY3QtKWVxdWFsIHRvIGl0LiBUbyBtYWtlIHRoaXNcbiAgICAgIC8vIE8obiBsb2cgbikgY29tcGxleGl0eSB3ZSBoYXZlIHRvIGNvcHkgdGhlc2UgdmFsdWVzIGluIGEgbmV3IHNldCBmaXJzdC5cbiAgICAgIHNldC5hZGQodmFsKTtcbiAgICB9IGVsc2UgaWYgKCFiLmhhcyh2YWwpKSB7XG4gICAgICBpZiAoc3RyaWN0KSByZXR1cm4gZmFsc2U7XG5cbiAgICAgIC8vIEZhc3QgcGF0aCB0byBkZXRlY3QgbWlzc2luZyBzdHJpbmcsIHN5bWJvbCwgdW5kZWZpbmVkIGFuZCBudWxsIHZhbHVlcy5cbiAgICAgIGlmICghc2V0TWlnaHRIYXZlTG9vc2VQcmltKGEsIGIsIHZhbCkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYgKHNldCA9PT0gbnVsbCkge1xuICAgICAgICBzZXQgPSBuZXcgU2V0KCk7XG4gICAgICB9XG4gICAgICBzZXQuYWRkKHZhbCk7XG4gICAgfVxuICB9XG4gIGlmIChzZXQgIT09IG51bGwpIHtcbiAgICB2YXIgYlZhbHVlcyA9IGFycmF5RnJvbVNldChiKTtcbiAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYlZhbHVlcy5sZW5ndGg7IF9pKyspIHtcbiAgICAgIHZhciBfdmFsID0gYlZhbHVlc1tfaV07XG4gICAgICAvLyBXZSBoYXZlIHRvIGNoZWNrIGlmIGEgcHJpbWl0aXZlIHZhbHVlIGlzIGFscmVhZHlcbiAgICAgIC8vIG1hdGNoaW5nIGFuZCBvbmx5IGlmIGl0J3Mgbm90LCBnbyBodW50aW5nIGZvciBpdC5cbiAgICAgIGlmIChfdHlwZW9mKF92YWwpID09PSAnb2JqZWN0JyAmJiBfdmFsICE9PSBudWxsKSB7XG4gICAgICAgIGlmICghc2V0SGFzRXF1YWxFbGVtZW50KHNldCwgX3ZhbCwgc3RyaWN0LCBtZW1vKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgfSBlbHNlIGlmICghc3RyaWN0ICYmICFhLmhhcyhfdmFsKSAmJiAhc2V0SGFzRXF1YWxFbGVtZW50KHNldCwgX3ZhbCwgc3RyaWN0LCBtZW1vKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzZXQuc2l6ZSA9PT0gMDtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cbmZ1bmN0aW9uIG1hcEhhc0VxdWFsRW50cnkoc2V0LCBtYXAsIGtleTEsIGl0ZW0xLCBzdHJpY3QsIG1lbW8pIHtcbiAgLy8gVG8gYmUgYWJsZSB0byBoYW5kbGUgY2FzZXMgbGlrZTpcbiAgLy8gICBNYXAoW1t7fSwgJ2EnXSwgW3t9LCAnYiddXSkgdnMgTWFwKFtbe30sICdiJ10sIFt7fSwgJ2EnXV0pXG4gIC8vIC4uLiB3ZSBuZWVkIHRvIGNvbnNpZGVyICphbGwqIG1hdGNoaW5nIGtleXMsIG5vdCBqdXN0IHRoZSBmaXJzdCB3ZSBmaW5kLlxuICB2YXIgc2V0VmFsdWVzID0gYXJyYXlGcm9tU2V0KHNldCk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc2V0VmFsdWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGtleTIgPSBzZXRWYWx1ZXNbaV07XG4gICAgaWYgKGlubmVyRGVlcEVxdWFsKGtleTEsIGtleTIsIHN0cmljdCwgbWVtbykgJiYgaW5uZXJEZWVwRXF1YWwoaXRlbTEsIG1hcC5nZXQoa2V5MiksIHN0cmljdCwgbWVtbykpIHtcbiAgICAgIHNldC5kZWxldGUoa2V5Mik7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuZnVuY3Rpb24gbWFwRXF1aXYoYSwgYiwgc3RyaWN0LCBtZW1vKSB7XG4gIHZhciBzZXQgPSBudWxsO1xuICB2YXIgYUVudHJpZXMgPSBhcnJheUZyb21NYXAoYSk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYUVudHJpZXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgX2FFbnRyaWVzJGkgPSBfc2xpY2VkVG9BcnJheShhRW50cmllc1tpXSwgMiksXG4gICAgICBrZXkgPSBfYUVudHJpZXMkaVswXSxcbiAgICAgIGl0ZW0xID0gX2FFbnRyaWVzJGlbMV07XG4gICAgaWYgKF90eXBlb2Yoa2V5KSA9PT0gJ29iamVjdCcgJiYga2V5ICE9PSBudWxsKSB7XG4gICAgICBpZiAoc2V0ID09PSBudWxsKSB7XG4gICAgICAgIHNldCA9IG5ldyBTZXQoKTtcbiAgICAgIH1cbiAgICAgIHNldC5hZGQoa2V5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gQnkgZGlyZWN0bHkgcmV0cmlldmluZyB0aGUgdmFsdWUgd2UgcHJldmVudCBhbm90aGVyIGIuaGFzKGtleSkgY2hlY2sgaW5cbiAgICAgIC8vIGFsbW9zdCBhbGwgcG9zc2libGUgY2FzZXMuXG4gICAgICB2YXIgaXRlbTIgPSBiLmdldChrZXkpO1xuICAgICAgaWYgKGl0ZW0yID09PSB1bmRlZmluZWQgJiYgIWIuaGFzKGtleSkgfHwgIWlubmVyRGVlcEVxdWFsKGl0ZW0xLCBpdGVtMiwgc3RyaWN0LCBtZW1vKSkge1xuICAgICAgICBpZiAoc3RyaWN0KSByZXR1cm4gZmFsc2U7XG4gICAgICAgIC8vIEZhc3QgcGF0aCB0byBkZXRlY3QgbWlzc2luZyBzdHJpbmcsIHN5bWJvbCwgdW5kZWZpbmVkIGFuZCBudWxsXG4gICAgICAgIC8vIGtleXMuXG4gICAgICAgIGlmICghbWFwTWlnaHRIYXZlTG9vc2VQcmltKGEsIGIsIGtleSwgaXRlbTEsIG1lbW8pKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGlmIChzZXQgPT09IG51bGwpIHtcbiAgICAgICAgICBzZXQgPSBuZXcgU2V0KCk7XG4gICAgICAgIH1cbiAgICAgICAgc2V0LmFkZChrZXkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBpZiAoc2V0ICE9PSBudWxsKSB7XG4gICAgdmFyIGJFbnRyaWVzID0gYXJyYXlGcm9tTWFwKGIpO1xuICAgIGZvciAodmFyIF9pMiA9IDA7IF9pMiA8IGJFbnRyaWVzLmxlbmd0aDsgX2kyKyspIHtcbiAgICAgIHZhciBfYkVudHJpZXMkX2kgPSBfc2xpY2VkVG9BcnJheShiRW50cmllc1tfaTJdLCAyKSxcbiAgICAgICAgX2tleSA9IF9iRW50cmllcyRfaVswXSxcbiAgICAgICAgaXRlbSA9IF9iRW50cmllcyRfaVsxXTtcbiAgICAgIGlmIChfdHlwZW9mKF9rZXkpID09PSAnb2JqZWN0JyAmJiBfa2V5ICE9PSBudWxsKSB7XG4gICAgICAgIGlmICghbWFwSGFzRXF1YWxFbnRyeShzZXQsIGEsIF9rZXksIGl0ZW0sIHN0cmljdCwgbWVtbykpIHJldHVybiBmYWxzZTtcbiAgICAgIH0gZWxzZSBpZiAoIXN0cmljdCAmJiAoIWEuaGFzKF9rZXkpIHx8ICFpbm5lckRlZXBFcXVhbChhLmdldChfa2V5KSwgaXRlbSwgZmFsc2UsIG1lbW8pKSAmJiAhbWFwSGFzRXF1YWxFbnRyeShzZXQsIGEsIF9rZXksIGl0ZW0sIGZhbHNlLCBtZW1vKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzZXQuc2l6ZSA9PT0gMDtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cbmZ1bmN0aW9uIG9iakVxdWl2KGEsIGIsIHN0cmljdCwga2V5cywgbWVtb3MsIGl0ZXJhdGlvblR5cGUpIHtcbiAgLy8gU2V0cyBhbmQgbWFwcyBkb24ndCBoYXZlIHRoZWlyIGVudHJpZXMgYWNjZXNzaWJsZSB2aWEgbm9ybWFsIG9iamVjdFxuICAvLyBwcm9wZXJ0aWVzLlxuICB2YXIgaSA9IDA7XG4gIGlmIChpdGVyYXRpb25UeXBlID09PSBrSXNTZXQpIHtcbiAgICBpZiAoIXNldEVxdWl2KGEsIGIsIHN0cmljdCwgbWVtb3MpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9IGVsc2UgaWYgKGl0ZXJhdGlvblR5cGUgPT09IGtJc01hcCkge1xuICAgIGlmICghbWFwRXF1aXYoYSwgYiwgc3RyaWN0LCBtZW1vcykpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoaXRlcmF0aW9uVHlwZSA9PT0ga0lzQXJyYXkpIHtcbiAgICBmb3IgKDsgaSA8IGEubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChoYXNPd25Qcm9wZXJ0eShhLCBpKSkge1xuICAgICAgICBpZiAoIWhhc093blByb3BlcnR5KGIsIGkpIHx8ICFpbm5lckRlZXBFcXVhbChhW2ldLCBiW2ldLCBzdHJpY3QsIG1lbW9zKSkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChoYXNPd25Qcm9wZXJ0eShiLCBpKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBBcnJheSBpcyBzcGFyc2UuXG4gICAgICAgIHZhciBrZXlzQSA9IE9iamVjdC5rZXlzKGEpO1xuICAgICAgICBmb3IgKDsgaSA8IGtleXNBLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgdmFyIGtleSA9IGtleXNBW2ldO1xuICAgICAgICAgIGlmICghaGFzT3duUHJvcGVydHkoYiwga2V5KSB8fCAhaW5uZXJEZWVwRXF1YWwoYVtrZXldLCBiW2tleV0sIHN0cmljdCwgbWVtb3MpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChrZXlzQS5sZW5ndGggIT09IE9iamVjdC5rZXlzKGIpLmxlbmd0aCkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBUaGUgcGFpciBtdXN0IGhhdmUgZXF1aXZhbGVudCB2YWx1ZXMgZm9yIGV2ZXJ5IGNvcnJlc3BvbmRpbmcga2V5LlxuICAvLyBQb3NzaWJseSBleHBlbnNpdmUgZGVlcCB0ZXN0OlxuICBmb3IgKGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBfa2V5MiA9IGtleXNbaV07XG4gICAgaWYgKCFpbm5lckRlZXBFcXVhbChhW19rZXkyXSwgYltfa2V5Ml0sIHN0cmljdCwgbWVtb3MpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlO1xufVxuZnVuY3Rpb24gaXNEZWVwRXF1YWwodmFsMSwgdmFsMikge1xuICByZXR1cm4gaW5uZXJEZWVwRXF1YWwodmFsMSwgdmFsMiwga0xvb3NlKTtcbn1cbmZ1bmN0aW9uIGlzRGVlcFN0cmljdEVxdWFsKHZhbDEsIHZhbDIpIHtcbiAgcmV0dXJuIGlubmVyRGVlcEVxdWFsKHZhbDEsIHZhbDIsIGtTdHJpY3QpO1xufVxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGlzRGVlcEVxdWFsOiBpc0RlZXBFcXVhbCxcbiAgaXNEZWVwU3RyaWN0RXF1YWw6IGlzRGVlcFN0cmljdEVxdWFsXG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIEdldEludHJpbnNpYyA9IHJlcXVpcmUoJ2dldC1pbnRyaW5zaWMnKTtcblxudmFyIGNhbGxCaW5kID0gcmVxdWlyZSgnLi8nKTtcblxudmFyICRpbmRleE9mID0gY2FsbEJpbmQoR2V0SW50cmluc2ljKCdTdHJpbmcucHJvdG90eXBlLmluZGV4T2YnKSk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY2FsbEJvdW5kSW50cmluc2ljKG5hbWUsIGFsbG93TWlzc2luZykge1xuXHR2YXIgaW50cmluc2ljID0gR2V0SW50cmluc2ljKG5hbWUsICEhYWxsb3dNaXNzaW5nKTtcblx0aWYgKHR5cGVvZiBpbnRyaW5zaWMgPT09ICdmdW5jdGlvbicgJiYgJGluZGV4T2YobmFtZSwgJy5wcm90b3R5cGUuJykgPiAtMSkge1xuXHRcdHJldHVybiBjYWxsQmluZChpbnRyaW5zaWMpO1xuXHR9XG5cdHJldHVybiBpbnRyaW5zaWM7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYmluZCA9IHJlcXVpcmUoJ2Z1bmN0aW9uLWJpbmQnKTtcbnZhciBHZXRJbnRyaW5zaWMgPSByZXF1aXJlKCdnZXQtaW50cmluc2ljJyk7XG52YXIgc2V0RnVuY3Rpb25MZW5ndGggPSByZXF1aXJlKCdzZXQtZnVuY3Rpb24tbGVuZ3RoJyk7XG5cbnZhciAkVHlwZUVycm9yID0gcmVxdWlyZSgnZXMtZXJyb3JzL3R5cGUnKTtcbnZhciAkYXBwbHkgPSBHZXRJbnRyaW5zaWMoJyVGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHklJyk7XG52YXIgJGNhbGwgPSBHZXRJbnRyaW5zaWMoJyVGdW5jdGlvbi5wcm90b3R5cGUuY2FsbCUnKTtcbnZhciAkcmVmbGVjdEFwcGx5ID0gR2V0SW50cmluc2ljKCclUmVmbGVjdC5hcHBseSUnLCB0cnVlKSB8fCBiaW5kLmNhbGwoJGNhbGwsICRhcHBseSk7XG5cbnZhciAkZGVmaW5lUHJvcGVydHkgPSByZXF1aXJlKCdlcy1kZWZpbmUtcHJvcGVydHknKTtcbnZhciAkbWF4ID0gR2V0SW50cmluc2ljKCclTWF0aC5tYXglJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY2FsbEJpbmQob3JpZ2luYWxGdW5jdGlvbikge1xuXHRpZiAodHlwZW9mIG9yaWdpbmFsRnVuY3Rpb24gIT09ICdmdW5jdGlvbicpIHtcblx0XHR0aHJvdyBuZXcgJFR5cGVFcnJvcignYSBmdW5jdGlvbiBpcyByZXF1aXJlZCcpO1xuXHR9XG5cdHZhciBmdW5jID0gJHJlZmxlY3RBcHBseShiaW5kLCAkY2FsbCwgYXJndW1lbnRzKTtcblx0cmV0dXJuIHNldEZ1bmN0aW9uTGVuZ3RoKFxuXHRcdGZ1bmMsXG5cdFx0MSArICRtYXgoMCwgb3JpZ2luYWxGdW5jdGlvbi5sZW5ndGggLSAoYXJndW1lbnRzLmxlbmd0aCAtIDEpKSxcblx0XHR0cnVlXG5cdCk7XG59O1xuXG52YXIgYXBwbHlCaW5kID0gZnVuY3Rpb24gYXBwbHlCaW5kKCkge1xuXHRyZXR1cm4gJHJlZmxlY3RBcHBseShiaW5kLCAkYXBwbHksIGFyZ3VtZW50cyk7XG59O1xuXG5pZiAoJGRlZmluZVByb3BlcnR5KSB7XG5cdCRkZWZpbmVQcm9wZXJ0eShtb2R1bGUuZXhwb3J0cywgJ2FwcGx5JywgeyB2YWx1ZTogYXBwbHlCaW5kIH0pO1xufSBlbHNlIHtcblx0bW9kdWxlLmV4cG9ydHMuYXBwbHkgPSBhcHBseUJpbmQ7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciAkZGVmaW5lUHJvcGVydHkgPSByZXF1aXJlKCdlcy1kZWZpbmUtcHJvcGVydHknKTtcblxudmFyICRTeW50YXhFcnJvciA9IHJlcXVpcmUoJ2VzLWVycm9ycy9zeW50YXgnKTtcbnZhciAkVHlwZUVycm9yID0gcmVxdWlyZSgnZXMtZXJyb3JzL3R5cGUnKTtcblxudmFyIGdvcGQgPSByZXF1aXJlKCdnb3BkJyk7XG5cbi8qKiBAdHlwZSB7aW1wb3J0KCcuJyl9ICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRlZmluZURhdGFQcm9wZXJ0eShcblx0b2JqLFxuXHRwcm9wZXJ0eSxcblx0dmFsdWVcbikge1xuXHRpZiAoIW9iaiB8fCAodHlwZW9mIG9iaiAhPT0gJ29iamVjdCcgJiYgdHlwZW9mIG9iaiAhPT0gJ2Z1bmN0aW9uJykpIHtcblx0XHR0aHJvdyBuZXcgJFR5cGVFcnJvcignYG9iamAgbXVzdCBiZSBhbiBvYmplY3Qgb3IgYSBmdW5jdGlvbmAnKTtcblx0fVxuXHRpZiAodHlwZW9mIHByb3BlcnR5ICE9PSAnc3RyaW5nJyAmJiB0eXBlb2YgcHJvcGVydHkgIT09ICdzeW1ib2wnKSB7XG5cdFx0dGhyb3cgbmV3ICRUeXBlRXJyb3IoJ2Bwcm9wZXJ0eWAgbXVzdCBiZSBhIHN0cmluZyBvciBhIHN5bWJvbGAnKTtcblx0fVxuXHRpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDMgJiYgdHlwZW9mIGFyZ3VtZW50c1szXSAhPT0gJ2Jvb2xlYW4nICYmIGFyZ3VtZW50c1szXSAhPT0gbnVsbCkge1xuXHRcdHRocm93IG5ldyAkVHlwZUVycm9yKCdgbm9uRW51bWVyYWJsZWAsIGlmIHByb3ZpZGVkLCBtdXN0IGJlIGEgYm9vbGVhbiBvciBudWxsJyk7XG5cdH1cblx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPiA0ICYmIHR5cGVvZiBhcmd1bWVudHNbNF0gIT09ICdib29sZWFuJyAmJiBhcmd1bWVudHNbNF0gIT09IG51bGwpIHtcblx0XHR0aHJvdyBuZXcgJFR5cGVFcnJvcignYG5vbldyaXRhYmxlYCwgaWYgcHJvdmlkZWQsIG11c3QgYmUgYSBib29sZWFuIG9yIG51bGwnKTtcblx0fVxuXHRpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDUgJiYgdHlwZW9mIGFyZ3VtZW50c1s1XSAhPT0gJ2Jvb2xlYW4nICYmIGFyZ3VtZW50c1s1XSAhPT0gbnVsbCkge1xuXHRcdHRocm93IG5ldyAkVHlwZUVycm9yKCdgbm9uQ29uZmlndXJhYmxlYCwgaWYgcHJvdmlkZWQsIG11c3QgYmUgYSBib29sZWFuIG9yIG51bGwnKTtcblx0fVxuXHRpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDYgJiYgdHlwZW9mIGFyZ3VtZW50c1s2XSAhPT0gJ2Jvb2xlYW4nKSB7XG5cdFx0dGhyb3cgbmV3ICRUeXBlRXJyb3IoJ2Bsb29zZWAsIGlmIHByb3ZpZGVkLCBtdXN0IGJlIGEgYm9vbGVhbicpO1xuXHR9XG5cblx0dmFyIG5vbkVudW1lcmFibGUgPSBhcmd1bWVudHMubGVuZ3RoID4gMyA/IGFyZ3VtZW50c1szXSA6IG51bGw7XG5cdHZhciBub25Xcml0YWJsZSA9IGFyZ3VtZW50cy5sZW5ndGggPiA0ID8gYXJndW1lbnRzWzRdIDogbnVsbDtcblx0dmFyIG5vbkNvbmZpZ3VyYWJsZSA9IGFyZ3VtZW50cy5sZW5ndGggPiA1ID8gYXJndW1lbnRzWzVdIDogbnVsbDtcblx0dmFyIGxvb3NlID0gYXJndW1lbnRzLmxlbmd0aCA+IDYgPyBhcmd1bWVudHNbNl0gOiBmYWxzZTtcblxuXHQvKiBAdHlwZSB7ZmFsc2UgfCBUeXBlZFByb3BlcnR5RGVzY3JpcHRvcjx1bmtub3duPn0gKi9cblx0dmFyIGRlc2MgPSAhIWdvcGQgJiYgZ29wZChvYmosIHByb3BlcnR5KTtcblxuXHRpZiAoJGRlZmluZVByb3BlcnR5KSB7XG5cdFx0JGRlZmluZVByb3BlcnR5KG9iaiwgcHJvcGVydHksIHtcblx0XHRcdGNvbmZpZ3VyYWJsZTogbm9uQ29uZmlndXJhYmxlID09PSBudWxsICYmIGRlc2MgPyBkZXNjLmNvbmZpZ3VyYWJsZSA6ICFub25Db25maWd1cmFibGUsXG5cdFx0XHRlbnVtZXJhYmxlOiBub25FbnVtZXJhYmxlID09PSBudWxsICYmIGRlc2MgPyBkZXNjLmVudW1lcmFibGUgOiAhbm9uRW51bWVyYWJsZSxcblx0XHRcdHZhbHVlOiB2YWx1ZSxcblx0XHRcdHdyaXRhYmxlOiBub25Xcml0YWJsZSA9PT0gbnVsbCAmJiBkZXNjID8gZGVzYy53cml0YWJsZSA6ICFub25Xcml0YWJsZVxuXHRcdH0pO1xuXHR9IGVsc2UgaWYgKGxvb3NlIHx8ICghbm9uRW51bWVyYWJsZSAmJiAhbm9uV3JpdGFibGUgJiYgIW5vbkNvbmZpZ3VyYWJsZSkpIHtcblx0XHQvLyBtdXN0IGZhbGwgYmFjayB0byBbW1NldF1dLCBhbmQgd2FzIG5vdCBleHBsaWNpdGx5IGFza2VkIHRvIG1ha2Ugbm9uLWVudW1lcmFibGUsIG5vbi13cml0YWJsZSwgb3Igbm9uLWNvbmZpZ3VyYWJsZVxuXHRcdG9ialtwcm9wZXJ0eV0gPSB2YWx1ZTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuXHR9IGVsc2Uge1xuXHRcdHRocm93IG5ldyAkU3ludGF4RXJyb3IoJ1RoaXMgZW52aXJvbm1lbnQgZG9lcyBub3Qgc3VwcG9ydCBkZWZpbmluZyBhIHByb3BlcnR5IGFzIG5vbi1jb25maWd1cmFibGUsIG5vbi13cml0YWJsZSwgb3Igbm9uLWVudW1lcmFibGUuJyk7XG5cdH1cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBrZXlzID0gcmVxdWlyZSgnb2JqZWN0LWtleXMnKTtcbnZhciBoYXNTeW1ib2xzID0gdHlwZW9mIFN5bWJvbCA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgU3ltYm9sKCdmb28nKSA9PT0gJ3N5bWJvbCc7XG5cbnZhciB0b1N0ciA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG52YXIgY29uY2F0ID0gQXJyYXkucHJvdG90eXBlLmNvbmNhdDtcbnZhciBkZWZpbmVEYXRhUHJvcGVydHkgPSByZXF1aXJlKCdkZWZpbmUtZGF0YS1wcm9wZXJ0eScpO1xuXG52YXIgaXNGdW5jdGlvbiA9IGZ1bmN0aW9uIChmbikge1xuXHRyZXR1cm4gdHlwZW9mIGZuID09PSAnZnVuY3Rpb24nICYmIHRvU3RyLmNhbGwoZm4pID09PSAnW29iamVjdCBGdW5jdGlvbl0nO1xufTtcblxudmFyIHN1cHBvcnRzRGVzY3JpcHRvcnMgPSByZXF1aXJlKCdoYXMtcHJvcGVydHktZGVzY3JpcHRvcnMnKSgpO1xuXG52YXIgZGVmaW5lUHJvcGVydHkgPSBmdW5jdGlvbiAob2JqZWN0LCBuYW1lLCB2YWx1ZSwgcHJlZGljYXRlKSB7XG5cdGlmIChuYW1lIGluIG9iamVjdCkge1xuXHRcdGlmIChwcmVkaWNhdGUgPT09IHRydWUpIHtcblx0XHRcdGlmIChvYmplY3RbbmFtZV0gPT09IHZhbHVlKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKCFpc0Z1bmN0aW9uKHByZWRpY2F0ZSkgfHwgIXByZWRpY2F0ZSgpKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHR9XG5cblx0aWYgKHN1cHBvcnRzRGVzY3JpcHRvcnMpIHtcblx0XHRkZWZpbmVEYXRhUHJvcGVydHkob2JqZWN0LCBuYW1lLCB2YWx1ZSwgdHJ1ZSk7XG5cdH0gZWxzZSB7XG5cdFx0ZGVmaW5lRGF0YVByb3BlcnR5KG9iamVjdCwgbmFtZSwgdmFsdWUpO1xuXHR9XG59O1xuXG52YXIgZGVmaW5lUHJvcGVydGllcyA9IGZ1bmN0aW9uIChvYmplY3QsIG1hcCkge1xuXHR2YXIgcHJlZGljYXRlcyA9IGFyZ3VtZW50cy5sZW5ndGggPiAyID8gYXJndW1lbnRzWzJdIDoge307XG5cdHZhciBwcm9wcyA9IGtleXMobWFwKTtcblx0aWYgKGhhc1N5bWJvbHMpIHtcblx0XHRwcm9wcyA9IGNvbmNhdC5jYWxsKHByb3BzLCBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKG1hcCkpO1xuXHR9XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpICs9IDEpIHtcblx0XHRkZWZpbmVQcm9wZXJ0eShvYmplY3QsIHByb3BzW2ldLCBtYXBbcHJvcHNbaV1dLCBwcmVkaWNhdGVzW3Byb3BzW2ldXSk7XG5cdH1cbn07XG5cbmRlZmluZVByb3BlcnRpZXMuc3VwcG9ydHNEZXNjcmlwdG9ycyA9ICEhc3VwcG9ydHNEZXNjcmlwdG9ycztcblxubW9kdWxlLmV4cG9ydHMgPSBkZWZpbmVQcm9wZXJ0aWVzO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgR2V0SW50cmluc2ljID0gcmVxdWlyZSgnZ2V0LWludHJpbnNpYycpO1xuXG4vKiogQHR5cGUge2ltcG9ydCgnLicpfSAqL1xudmFyICRkZWZpbmVQcm9wZXJ0eSA9IEdldEludHJpbnNpYygnJU9iamVjdC5kZWZpbmVQcm9wZXJ0eSUnLCB0cnVlKSB8fCBmYWxzZTtcbmlmICgkZGVmaW5lUHJvcGVydHkpIHtcblx0dHJ5IHtcblx0XHQkZGVmaW5lUHJvcGVydHkoe30sICdhJywgeyB2YWx1ZTogMSB9KTtcblx0fSBjYXRjaCAoZSkge1xuXHRcdC8vIElFIDggaGFzIGEgYnJva2VuIGRlZmluZVByb3BlcnR5XG5cdFx0JGRlZmluZVByb3BlcnR5ID0gZmFsc2U7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAkZGVmaW5lUHJvcGVydHk7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKiBAdHlwZSB7aW1wb3J0KCcuL2V2YWwnKX0gKi9cbm1vZHVsZS5leHBvcnRzID0gRXZhbEVycm9yO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKiogQHR5cGUge2ltcG9ydCgnLicpfSAqL1xubW9kdWxlLmV4cG9ydHMgPSBFcnJvcjtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqIEB0eXBlIHtpbXBvcnQoJy4vcmFuZ2UnKX0gKi9cbm1vZHVsZS5leHBvcnRzID0gUmFuZ2VFcnJvcjtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqIEB0eXBlIHtpbXBvcnQoJy4vcmVmJyl9ICovXG5tb2R1bGUuZXhwb3J0cyA9IFJlZmVyZW5jZUVycm9yO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKiogQHR5cGUge2ltcG9ydCgnLi9zeW50YXgnKX0gKi9cbm1vZHVsZS5leHBvcnRzID0gU3ludGF4RXJyb3I7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKiBAdHlwZSB7aW1wb3J0KCcuL3R5cGUnKX0gKi9cbm1vZHVsZS5leHBvcnRzID0gVHlwZUVycm9yO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKiogQHR5cGUge2ltcG9ydCgnLi91cmknKX0gKi9cbm1vZHVsZS5leHBvcnRzID0gVVJJRXJyb3I7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBpc0NhbGxhYmxlID0gcmVxdWlyZSgnaXMtY2FsbGFibGUnKTtcblxudmFyIHRvU3RyID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcbnZhciBoYXNPd25Qcm9wZXJ0eSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG5cbnZhciBmb3JFYWNoQXJyYXkgPSBmdW5jdGlvbiBmb3JFYWNoQXJyYXkoYXJyYXksIGl0ZXJhdG9yLCByZWNlaXZlcikge1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBhcnJheS5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBpZiAoaGFzT3duUHJvcGVydHkuY2FsbChhcnJheSwgaSkpIHtcbiAgICAgICAgICAgIGlmIChyZWNlaXZlciA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgaXRlcmF0b3IoYXJyYXlbaV0sIGksIGFycmF5KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaXRlcmF0b3IuY2FsbChyZWNlaXZlciwgYXJyYXlbaV0sIGksIGFycmF5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn07XG5cbnZhciBmb3JFYWNoU3RyaW5nID0gZnVuY3Rpb24gZm9yRWFjaFN0cmluZyhzdHJpbmcsIGl0ZXJhdG9yLCByZWNlaXZlcikge1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBzdHJpbmcubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgLy8gbm8gc3VjaCB0aGluZyBhcyBhIHNwYXJzZSBzdHJpbmcuXG4gICAgICAgIGlmIChyZWNlaXZlciA9PSBudWxsKSB7XG4gICAgICAgICAgICBpdGVyYXRvcihzdHJpbmcuY2hhckF0KGkpLCBpLCBzdHJpbmcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaXRlcmF0b3IuY2FsbChyZWNlaXZlciwgc3RyaW5nLmNoYXJBdChpKSwgaSwgc3RyaW5nKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbnZhciBmb3JFYWNoT2JqZWN0ID0gZnVuY3Rpb24gZm9yRWFjaE9iamVjdChvYmplY3QsIGl0ZXJhdG9yLCByZWNlaXZlcikge1xuICAgIGZvciAodmFyIGsgaW4gb2JqZWN0KSB7XG4gICAgICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgaykpIHtcbiAgICAgICAgICAgIGlmIChyZWNlaXZlciA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgaXRlcmF0b3Iob2JqZWN0W2tdLCBrLCBvYmplY3QpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpdGVyYXRvci5jYWxsKHJlY2VpdmVyLCBvYmplY3Rba10sIGssIG9iamVjdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG52YXIgZm9yRWFjaCA9IGZ1bmN0aW9uIGZvckVhY2gobGlzdCwgaXRlcmF0b3IsIHRoaXNBcmcpIHtcbiAgICBpZiAoIWlzQ2FsbGFibGUoaXRlcmF0b3IpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2l0ZXJhdG9yIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuICAgIH1cblxuICAgIHZhciByZWNlaXZlcjtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSAzKSB7XG4gICAgICAgIHJlY2VpdmVyID0gdGhpc0FyZztcbiAgICB9XG5cbiAgICBpZiAodG9TdHIuY2FsbChsaXN0KSA9PT0gJ1tvYmplY3QgQXJyYXldJykge1xuICAgICAgICBmb3JFYWNoQXJyYXkobGlzdCwgaXRlcmF0b3IsIHJlY2VpdmVyKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBsaXN0ID09PSAnc3RyaW5nJykge1xuICAgICAgICBmb3JFYWNoU3RyaW5nKGxpc3QsIGl0ZXJhdG9yLCByZWNlaXZlcik7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZm9yRWFjaE9iamVjdChsaXN0LCBpdGVyYXRvciwgcmVjZWl2ZXIpO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZm9yRWFjaDtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyogZXNsaW50IG5vLWludmFsaWQtdGhpczogMSAqL1xuXG52YXIgRVJST1JfTUVTU0FHRSA9ICdGdW5jdGlvbi5wcm90b3R5cGUuYmluZCBjYWxsZWQgb24gaW5jb21wYXRpYmxlICc7XG52YXIgdG9TdHIgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xudmFyIG1heCA9IE1hdGgubWF4O1xudmFyIGZ1bmNUeXBlID0gJ1tvYmplY3QgRnVuY3Rpb25dJztcblxudmFyIGNvbmNhdHR5ID0gZnVuY3Rpb24gY29uY2F0dHkoYSwgYikge1xuICAgIHZhciBhcnIgPSBbXTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYS5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBhcnJbaV0gPSBhW2ldO1xuICAgIH1cbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IGIubGVuZ3RoOyBqICs9IDEpIHtcbiAgICAgICAgYXJyW2ogKyBhLmxlbmd0aF0gPSBiW2pdO1xuICAgIH1cblxuICAgIHJldHVybiBhcnI7XG59O1xuXG52YXIgc2xpY3kgPSBmdW5jdGlvbiBzbGljeShhcnJMaWtlLCBvZmZzZXQpIHtcbiAgICB2YXIgYXJyID0gW107XG4gICAgZm9yICh2YXIgaSA9IG9mZnNldCB8fCAwLCBqID0gMDsgaSA8IGFyckxpa2UubGVuZ3RoOyBpICs9IDEsIGogKz0gMSkge1xuICAgICAgICBhcnJbal0gPSBhcnJMaWtlW2ldO1xuICAgIH1cbiAgICByZXR1cm4gYXJyO1xufTtcblxudmFyIGpvaW55ID0gZnVuY3Rpb24gKGFyciwgam9pbmVyKSB7XG4gICAgdmFyIHN0ciA9ICcnO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIHN0ciArPSBhcnJbaV07XG4gICAgICAgIGlmIChpICsgMSA8IGFyci5sZW5ndGgpIHtcbiAgICAgICAgICAgIHN0ciArPSBqb2luZXI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHN0cjtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYmluZCh0aGF0KSB7XG4gICAgdmFyIHRhcmdldCA9IHRoaXM7XG4gICAgaWYgKHR5cGVvZiB0YXJnZXQgIT09ICdmdW5jdGlvbicgfHwgdG9TdHIuYXBwbHkodGFyZ2V0KSAhPT0gZnVuY1R5cGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihFUlJPUl9NRVNTQUdFICsgdGFyZ2V0KTtcbiAgICB9XG4gICAgdmFyIGFyZ3MgPSBzbGljeShhcmd1bWVudHMsIDEpO1xuXG4gICAgdmFyIGJvdW5kO1xuICAgIHZhciBiaW5kZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzIGluc3RhbmNlb2YgYm91bmQpIHtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSB0YXJnZXQuYXBwbHkoXG4gICAgICAgICAgICAgICAgdGhpcyxcbiAgICAgICAgICAgICAgICBjb25jYXR0eShhcmdzLCBhcmd1bWVudHMpXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgaWYgKE9iamVjdChyZXN1bHQpID09PSByZXN1bHQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRhcmdldC5hcHBseShcbiAgICAgICAgICAgIHRoYXQsXG4gICAgICAgICAgICBjb25jYXR0eShhcmdzLCBhcmd1bWVudHMpXG4gICAgICAgICk7XG5cbiAgICB9O1xuXG4gICAgdmFyIGJvdW5kTGVuZ3RoID0gbWF4KDAsIHRhcmdldC5sZW5ndGggLSBhcmdzLmxlbmd0aCk7XG4gICAgdmFyIGJvdW5kQXJncyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYm91bmRMZW5ndGg7IGkrKykge1xuICAgICAgICBib3VuZEFyZ3NbaV0gPSAnJCcgKyBpO1xuICAgIH1cblxuICAgIGJvdW5kID0gRnVuY3Rpb24oJ2JpbmRlcicsICdyZXR1cm4gZnVuY3Rpb24gKCcgKyBqb2lueShib3VuZEFyZ3MsICcsJykgKyAnKXsgcmV0dXJuIGJpbmRlci5hcHBseSh0aGlzLGFyZ3VtZW50cyk7IH0nKShiaW5kZXIpO1xuXG4gICAgaWYgKHRhcmdldC5wcm90b3R5cGUpIHtcbiAgICAgICAgdmFyIEVtcHR5ID0gZnVuY3Rpb24gRW1wdHkoKSB7fTtcbiAgICAgICAgRW1wdHkucHJvdG90eXBlID0gdGFyZ2V0LnByb3RvdHlwZTtcbiAgICAgICAgYm91bmQucHJvdG90eXBlID0gbmV3IEVtcHR5KCk7XG4gICAgICAgIEVtcHR5LnByb3RvdHlwZSA9IG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIGJvdW5kO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGltcGxlbWVudGF0aW9uID0gcmVxdWlyZSgnLi9pbXBsZW1lbnRhdGlvbicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kIHx8IGltcGxlbWVudGF0aW9uO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdW5kZWZpbmVkO1xuXG52YXIgJEVycm9yID0gcmVxdWlyZSgnZXMtZXJyb3JzJyk7XG52YXIgJEV2YWxFcnJvciA9IHJlcXVpcmUoJ2VzLWVycm9ycy9ldmFsJyk7XG52YXIgJFJhbmdlRXJyb3IgPSByZXF1aXJlKCdlcy1lcnJvcnMvcmFuZ2UnKTtcbnZhciAkUmVmZXJlbmNlRXJyb3IgPSByZXF1aXJlKCdlcy1lcnJvcnMvcmVmJyk7XG52YXIgJFN5bnRheEVycm9yID0gcmVxdWlyZSgnZXMtZXJyb3JzL3N5bnRheCcpO1xudmFyICRUeXBlRXJyb3IgPSByZXF1aXJlKCdlcy1lcnJvcnMvdHlwZScpO1xudmFyICRVUklFcnJvciA9IHJlcXVpcmUoJ2VzLWVycm9ycy91cmknKTtcblxudmFyICRGdW5jdGlvbiA9IEZ1bmN0aW9uO1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY29uc2lzdGVudC1yZXR1cm5cbnZhciBnZXRFdmFsbGVkQ29uc3RydWN0b3IgPSBmdW5jdGlvbiAoZXhwcmVzc2lvblN5bnRheCkge1xuXHR0cnkge1xuXHRcdHJldHVybiAkRnVuY3Rpb24oJ1widXNlIHN0cmljdFwiOyByZXR1cm4gKCcgKyBleHByZXNzaW9uU3ludGF4ICsgJykuY29uc3RydWN0b3I7JykoKTtcblx0fSBjYXRjaCAoZSkge31cbn07XG5cbnZhciAkZ09QRCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I7XG5pZiAoJGdPUEQpIHtcblx0dHJ5IHtcblx0XHQkZ09QRCh7fSwgJycpO1xuXHR9IGNhdGNoIChlKSB7XG5cdFx0JGdPUEQgPSBudWxsOyAvLyB0aGlzIGlzIElFIDgsIHdoaWNoIGhhcyBhIGJyb2tlbiBnT1BEXG5cdH1cbn1cblxudmFyIHRocm93VHlwZUVycm9yID0gZnVuY3Rpb24gKCkge1xuXHR0aHJvdyBuZXcgJFR5cGVFcnJvcigpO1xufTtcbnZhciBUaHJvd1R5cGVFcnJvciA9ICRnT1BEXG5cdD8gKGZ1bmN0aW9uICgpIHtcblx0XHR0cnkge1xuXHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVudXNlZC1leHByZXNzaW9ucywgbm8tY2FsbGVyLCBuby1yZXN0cmljdGVkLXByb3BlcnRpZXNcblx0XHRcdGFyZ3VtZW50cy5jYWxsZWU7IC8vIElFIDggZG9lcyBub3QgdGhyb3cgaGVyZVxuXHRcdFx0cmV0dXJuIHRocm93VHlwZUVycm9yO1xuXHRcdH0gY2F0Y2ggKGNhbGxlZVRocm93cykge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0Ly8gSUUgOCB0aHJvd3Mgb24gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihhcmd1bWVudHMsICcnKVxuXHRcdFx0XHRyZXR1cm4gJGdPUEQoYXJndW1lbnRzLCAnY2FsbGVlJykuZ2V0O1xuXHRcdFx0fSBjYXRjaCAoZ09QRHRocm93cykge1xuXHRcdFx0XHRyZXR1cm4gdGhyb3dUeXBlRXJyb3I7XG5cdFx0XHR9XG5cdFx0fVxuXHR9KCkpXG5cdDogdGhyb3dUeXBlRXJyb3I7XG5cbnZhciBoYXNTeW1ib2xzID0gcmVxdWlyZSgnaGFzLXN5bWJvbHMnKSgpO1xudmFyIGhhc1Byb3RvID0gcmVxdWlyZSgnaGFzLXByb3RvJykoKTtcblxudmFyIGdldFByb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mIHx8IChcblx0aGFzUHJvdG9cblx0XHQ/IGZ1bmN0aW9uICh4KSB7IHJldHVybiB4Ll9fcHJvdG9fXzsgfSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXByb3RvXG5cdFx0OiBudWxsXG4pO1xuXG52YXIgbmVlZHNFdmFsID0ge307XG5cbnZhciBUeXBlZEFycmF5ID0gdHlwZW9mIFVpbnQ4QXJyYXkgPT09ICd1bmRlZmluZWQnIHx8ICFnZXRQcm90byA/IHVuZGVmaW5lZCA6IGdldFByb3RvKFVpbnQ4QXJyYXkpO1xuXG52YXIgSU5UUklOU0lDUyA9IHtcblx0X19wcm90b19fOiBudWxsLFxuXHQnJUFnZ3JlZ2F0ZUVycm9yJSc6IHR5cGVvZiBBZ2dyZWdhdGVFcnJvciA9PT0gJ3VuZGVmaW5lZCcgPyB1bmRlZmluZWQgOiBBZ2dyZWdhdGVFcnJvcixcblx0JyVBcnJheSUnOiBBcnJheSxcblx0JyVBcnJheUJ1ZmZlciUnOiB0eXBlb2YgQXJyYXlCdWZmZXIgPT09ICd1bmRlZmluZWQnID8gdW5kZWZpbmVkIDogQXJyYXlCdWZmZXIsXG5cdCclQXJyYXlJdGVyYXRvclByb3RvdHlwZSUnOiBoYXNTeW1ib2xzICYmIGdldFByb3RvID8gZ2V0UHJvdG8oW11bU3ltYm9sLml0ZXJhdG9yXSgpKSA6IHVuZGVmaW5lZCxcblx0JyVBc3luY0Zyb21TeW5jSXRlcmF0b3JQcm90b3R5cGUlJzogdW5kZWZpbmVkLFxuXHQnJUFzeW5jRnVuY3Rpb24lJzogbmVlZHNFdmFsLFxuXHQnJUFzeW5jR2VuZXJhdG9yJSc6IG5lZWRzRXZhbCxcblx0JyVBc3luY0dlbmVyYXRvckZ1bmN0aW9uJSc6IG5lZWRzRXZhbCxcblx0JyVBc3luY0l0ZXJhdG9yUHJvdG90eXBlJSc6IG5lZWRzRXZhbCxcblx0JyVBdG9taWNzJSc6IHR5cGVvZiBBdG9taWNzID09PSAndW5kZWZpbmVkJyA/IHVuZGVmaW5lZCA6IEF0b21pY3MsXG5cdCclQmlnSW50JSc6IHR5cGVvZiBCaWdJbnQgPT09ICd1bmRlZmluZWQnID8gdW5kZWZpbmVkIDogQmlnSW50LFxuXHQnJUJpZ0ludDY0QXJyYXklJzogdHlwZW9mIEJpZ0ludDY0QXJyYXkgPT09ICd1bmRlZmluZWQnID8gdW5kZWZpbmVkIDogQmlnSW50NjRBcnJheSxcblx0JyVCaWdVaW50NjRBcnJheSUnOiB0eXBlb2YgQmlnVWludDY0QXJyYXkgPT09ICd1bmRlZmluZWQnID8gdW5kZWZpbmVkIDogQmlnVWludDY0QXJyYXksXG5cdCclQm9vbGVhbiUnOiBCb29sZWFuLFxuXHQnJURhdGFWaWV3JSc6IHR5cGVvZiBEYXRhVmlldyA9PT0gJ3VuZGVmaW5lZCcgPyB1bmRlZmluZWQgOiBEYXRhVmlldyxcblx0JyVEYXRlJSc6IERhdGUsXG5cdCclZGVjb2RlVVJJJSc6IGRlY29kZVVSSSxcblx0JyVkZWNvZGVVUklDb21wb25lbnQlJzogZGVjb2RlVVJJQ29tcG9uZW50LFxuXHQnJWVuY29kZVVSSSUnOiBlbmNvZGVVUkksXG5cdCclZW5jb2RlVVJJQ29tcG9uZW50JSc6IGVuY29kZVVSSUNvbXBvbmVudCxcblx0JyVFcnJvciUnOiAkRXJyb3IsXG5cdCclZXZhbCUnOiBldmFsLCAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWV2YWxcblx0JyVFdmFsRXJyb3IlJzogJEV2YWxFcnJvcixcblx0JyVGbG9hdDMyQXJyYXklJzogdHlwZW9mIEZsb2F0MzJBcnJheSA9PT0gJ3VuZGVmaW5lZCcgPyB1bmRlZmluZWQgOiBGbG9hdDMyQXJyYXksXG5cdCclRmxvYXQ2NEFycmF5JSc6IHR5cGVvZiBGbG9hdDY0QXJyYXkgPT09ICd1bmRlZmluZWQnID8gdW5kZWZpbmVkIDogRmxvYXQ2NEFycmF5LFxuXHQnJUZpbmFsaXphdGlvblJlZ2lzdHJ5JSc6IHR5cGVvZiBGaW5hbGl6YXRpb25SZWdpc3RyeSA9PT0gJ3VuZGVmaW5lZCcgPyB1bmRlZmluZWQgOiBGaW5hbGl6YXRpb25SZWdpc3RyeSxcblx0JyVGdW5jdGlvbiUnOiAkRnVuY3Rpb24sXG5cdCclR2VuZXJhdG9yRnVuY3Rpb24lJzogbmVlZHNFdmFsLFxuXHQnJUludDhBcnJheSUnOiB0eXBlb2YgSW50OEFycmF5ID09PSAndW5kZWZpbmVkJyA/IHVuZGVmaW5lZCA6IEludDhBcnJheSxcblx0JyVJbnQxNkFycmF5JSc6IHR5cGVvZiBJbnQxNkFycmF5ID09PSAndW5kZWZpbmVkJyA/IHVuZGVmaW5lZCA6IEludDE2QXJyYXksXG5cdCclSW50MzJBcnJheSUnOiB0eXBlb2YgSW50MzJBcnJheSA9PT0gJ3VuZGVmaW5lZCcgPyB1bmRlZmluZWQgOiBJbnQzMkFycmF5LFxuXHQnJWlzRmluaXRlJSc6IGlzRmluaXRlLFxuXHQnJWlzTmFOJSc6IGlzTmFOLFxuXHQnJUl0ZXJhdG9yUHJvdG90eXBlJSc6IGhhc1N5bWJvbHMgJiYgZ2V0UHJvdG8gPyBnZXRQcm90byhnZXRQcm90byhbXVtTeW1ib2wuaXRlcmF0b3JdKCkpKSA6IHVuZGVmaW5lZCxcblx0JyVKU09OJSc6IHR5cGVvZiBKU09OID09PSAnb2JqZWN0JyA/IEpTT04gOiB1bmRlZmluZWQsXG5cdCclTWFwJSc6IHR5cGVvZiBNYXAgPT09ICd1bmRlZmluZWQnID8gdW5kZWZpbmVkIDogTWFwLFxuXHQnJU1hcEl0ZXJhdG9yUHJvdG90eXBlJSc6IHR5cGVvZiBNYXAgPT09ICd1bmRlZmluZWQnIHx8ICFoYXNTeW1ib2xzIHx8ICFnZXRQcm90byA/IHVuZGVmaW5lZCA6IGdldFByb3RvKG5ldyBNYXAoKVtTeW1ib2wuaXRlcmF0b3JdKCkpLFxuXHQnJU1hdGglJzogTWF0aCxcblx0JyVOdW1iZXIlJzogTnVtYmVyLFxuXHQnJU9iamVjdCUnOiBPYmplY3QsXG5cdCclcGFyc2VGbG9hdCUnOiBwYXJzZUZsb2F0LFxuXHQnJXBhcnNlSW50JSc6IHBhcnNlSW50LFxuXHQnJVByb21pc2UlJzogdHlwZW9mIFByb21pc2UgPT09ICd1bmRlZmluZWQnID8gdW5kZWZpbmVkIDogUHJvbWlzZSxcblx0JyVQcm94eSUnOiB0eXBlb2YgUHJveHkgPT09ICd1bmRlZmluZWQnID8gdW5kZWZpbmVkIDogUHJveHksXG5cdCclUmFuZ2VFcnJvciUnOiAkUmFuZ2VFcnJvcixcblx0JyVSZWZlcmVuY2VFcnJvciUnOiAkUmVmZXJlbmNlRXJyb3IsXG5cdCclUmVmbGVjdCUnOiB0eXBlb2YgUmVmbGVjdCA9PT0gJ3VuZGVmaW5lZCcgPyB1bmRlZmluZWQgOiBSZWZsZWN0LFxuXHQnJVJlZ0V4cCUnOiBSZWdFeHAsXG5cdCclU2V0JSc6IHR5cGVvZiBTZXQgPT09ICd1bmRlZmluZWQnID8gdW5kZWZpbmVkIDogU2V0LFxuXHQnJVNldEl0ZXJhdG9yUHJvdG90eXBlJSc6IHR5cGVvZiBTZXQgPT09ICd1bmRlZmluZWQnIHx8ICFoYXNTeW1ib2xzIHx8ICFnZXRQcm90byA/IHVuZGVmaW5lZCA6IGdldFByb3RvKG5ldyBTZXQoKVtTeW1ib2wuaXRlcmF0b3JdKCkpLFxuXHQnJVNoYXJlZEFycmF5QnVmZmVyJSc6IHR5cGVvZiBTaGFyZWRBcnJheUJ1ZmZlciA9PT0gJ3VuZGVmaW5lZCcgPyB1bmRlZmluZWQgOiBTaGFyZWRBcnJheUJ1ZmZlcixcblx0JyVTdHJpbmclJzogU3RyaW5nLFxuXHQnJVN0cmluZ0l0ZXJhdG9yUHJvdG90eXBlJSc6IGhhc1N5bWJvbHMgJiYgZ2V0UHJvdG8gPyBnZXRQcm90bygnJ1tTeW1ib2wuaXRlcmF0b3JdKCkpIDogdW5kZWZpbmVkLFxuXHQnJVN5bWJvbCUnOiBoYXNTeW1ib2xzID8gU3ltYm9sIDogdW5kZWZpbmVkLFxuXHQnJVN5bnRheEVycm9yJSc6ICRTeW50YXhFcnJvcixcblx0JyVUaHJvd1R5cGVFcnJvciUnOiBUaHJvd1R5cGVFcnJvcixcblx0JyVUeXBlZEFycmF5JSc6IFR5cGVkQXJyYXksXG5cdCclVHlwZUVycm9yJSc6ICRUeXBlRXJyb3IsXG5cdCclVWludDhBcnJheSUnOiB0eXBlb2YgVWludDhBcnJheSA9PT0gJ3VuZGVmaW5lZCcgPyB1bmRlZmluZWQgOiBVaW50OEFycmF5LFxuXHQnJVVpbnQ4Q2xhbXBlZEFycmF5JSc6IHR5cGVvZiBVaW50OENsYW1wZWRBcnJheSA9PT0gJ3VuZGVmaW5lZCcgPyB1bmRlZmluZWQgOiBVaW50OENsYW1wZWRBcnJheSxcblx0JyVVaW50MTZBcnJheSUnOiB0eXBlb2YgVWludDE2QXJyYXkgPT09ICd1bmRlZmluZWQnID8gdW5kZWZpbmVkIDogVWludDE2QXJyYXksXG5cdCclVWludDMyQXJyYXklJzogdHlwZW9mIFVpbnQzMkFycmF5ID09PSAndW5kZWZpbmVkJyA/IHVuZGVmaW5lZCA6IFVpbnQzMkFycmF5LFxuXHQnJVVSSUVycm9yJSc6ICRVUklFcnJvcixcblx0JyVXZWFrTWFwJSc6IHR5cGVvZiBXZWFrTWFwID09PSAndW5kZWZpbmVkJyA/IHVuZGVmaW5lZCA6IFdlYWtNYXAsXG5cdCclV2Vha1JlZiUnOiB0eXBlb2YgV2Vha1JlZiA9PT0gJ3VuZGVmaW5lZCcgPyB1bmRlZmluZWQgOiBXZWFrUmVmLFxuXHQnJVdlYWtTZXQlJzogdHlwZW9mIFdlYWtTZXQgPT09ICd1bmRlZmluZWQnID8gdW5kZWZpbmVkIDogV2Vha1NldFxufTtcblxuaWYgKGdldFByb3RvKSB7XG5cdHRyeSB7XG5cdFx0bnVsbC5lcnJvcjsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtZXhwcmVzc2lvbnNcblx0fSBjYXRjaCAoZSkge1xuXHRcdC8vIGh0dHBzOi8vZ2l0aHViLmNvbS90YzM5L3Byb3Bvc2FsLXNoYWRvd3JlYWxtL3B1bGwvMzg0I2lzc3VlY29tbWVudC0xMzY0MjY0MjI5XG5cdFx0dmFyIGVycm9yUHJvdG8gPSBnZXRQcm90byhnZXRQcm90byhlKSk7XG5cdFx0SU5UUklOU0lDU1snJUVycm9yLnByb3RvdHlwZSUnXSA9IGVycm9yUHJvdG87XG5cdH1cbn1cblxudmFyIGRvRXZhbCA9IGZ1bmN0aW9uIGRvRXZhbChuYW1lKSB7XG5cdHZhciB2YWx1ZTtcblx0aWYgKG5hbWUgPT09ICclQXN5bmNGdW5jdGlvbiUnKSB7XG5cdFx0dmFsdWUgPSBnZXRFdmFsbGVkQ29uc3RydWN0b3IoJ2FzeW5jIGZ1bmN0aW9uICgpIHt9Jyk7XG5cdH0gZWxzZSBpZiAobmFtZSA9PT0gJyVHZW5lcmF0b3JGdW5jdGlvbiUnKSB7XG5cdFx0dmFsdWUgPSBnZXRFdmFsbGVkQ29uc3RydWN0b3IoJ2Z1bmN0aW9uKiAoKSB7fScpO1xuXHR9IGVsc2UgaWYgKG5hbWUgPT09ICclQXN5bmNHZW5lcmF0b3JGdW5jdGlvbiUnKSB7XG5cdFx0dmFsdWUgPSBnZXRFdmFsbGVkQ29uc3RydWN0b3IoJ2FzeW5jIGZ1bmN0aW9uKiAoKSB7fScpO1xuXHR9IGVsc2UgaWYgKG5hbWUgPT09ICclQXN5bmNHZW5lcmF0b3IlJykge1xuXHRcdHZhciBmbiA9IGRvRXZhbCgnJUFzeW5jR2VuZXJhdG9yRnVuY3Rpb24lJyk7XG5cdFx0aWYgKGZuKSB7XG5cdFx0XHR2YWx1ZSA9IGZuLnByb3RvdHlwZTtcblx0XHR9XG5cdH0gZWxzZSBpZiAobmFtZSA9PT0gJyVBc3luY0l0ZXJhdG9yUHJvdG90eXBlJScpIHtcblx0XHR2YXIgZ2VuID0gZG9FdmFsKCclQXN5bmNHZW5lcmF0b3IlJyk7XG5cdFx0aWYgKGdlbiAmJiBnZXRQcm90bykge1xuXHRcdFx0dmFsdWUgPSBnZXRQcm90byhnZW4ucHJvdG90eXBlKTtcblx0XHR9XG5cdH1cblxuXHRJTlRSSU5TSUNTW25hbWVdID0gdmFsdWU7XG5cblx0cmV0dXJuIHZhbHVlO1xufTtcblxudmFyIExFR0FDWV9BTElBU0VTID0ge1xuXHRfX3Byb3RvX186IG51bGwsXG5cdCclQXJyYXlCdWZmZXJQcm90b3R5cGUlJzogWydBcnJheUJ1ZmZlcicsICdwcm90b3R5cGUnXSxcblx0JyVBcnJheVByb3RvdHlwZSUnOiBbJ0FycmF5JywgJ3Byb3RvdHlwZSddLFxuXHQnJUFycmF5UHJvdG9fZW50cmllcyUnOiBbJ0FycmF5JywgJ3Byb3RvdHlwZScsICdlbnRyaWVzJ10sXG5cdCclQXJyYXlQcm90b19mb3JFYWNoJSc6IFsnQXJyYXknLCAncHJvdG90eXBlJywgJ2ZvckVhY2gnXSxcblx0JyVBcnJheVByb3RvX2tleXMlJzogWydBcnJheScsICdwcm90b3R5cGUnLCAna2V5cyddLFxuXHQnJUFycmF5UHJvdG9fdmFsdWVzJSc6IFsnQXJyYXknLCAncHJvdG90eXBlJywgJ3ZhbHVlcyddLFxuXHQnJUFzeW5jRnVuY3Rpb25Qcm90b3R5cGUlJzogWydBc3luY0Z1bmN0aW9uJywgJ3Byb3RvdHlwZSddLFxuXHQnJUFzeW5jR2VuZXJhdG9yJSc6IFsnQXN5bmNHZW5lcmF0b3JGdW5jdGlvbicsICdwcm90b3R5cGUnXSxcblx0JyVBc3luY0dlbmVyYXRvclByb3RvdHlwZSUnOiBbJ0FzeW5jR2VuZXJhdG9yRnVuY3Rpb24nLCAncHJvdG90eXBlJywgJ3Byb3RvdHlwZSddLFxuXHQnJUJvb2xlYW5Qcm90b3R5cGUlJzogWydCb29sZWFuJywgJ3Byb3RvdHlwZSddLFxuXHQnJURhdGFWaWV3UHJvdG90eXBlJSc6IFsnRGF0YVZpZXcnLCAncHJvdG90eXBlJ10sXG5cdCclRGF0ZVByb3RvdHlwZSUnOiBbJ0RhdGUnLCAncHJvdG90eXBlJ10sXG5cdCclRXJyb3JQcm90b3R5cGUlJzogWydFcnJvcicsICdwcm90b3R5cGUnXSxcblx0JyVFdmFsRXJyb3JQcm90b3R5cGUlJzogWydFdmFsRXJyb3InLCAncHJvdG90eXBlJ10sXG5cdCclRmxvYXQzMkFycmF5UHJvdG90eXBlJSc6IFsnRmxvYXQzMkFycmF5JywgJ3Byb3RvdHlwZSddLFxuXHQnJUZsb2F0NjRBcnJheVByb3RvdHlwZSUnOiBbJ0Zsb2F0NjRBcnJheScsICdwcm90b3R5cGUnXSxcblx0JyVGdW5jdGlvblByb3RvdHlwZSUnOiBbJ0Z1bmN0aW9uJywgJ3Byb3RvdHlwZSddLFxuXHQnJUdlbmVyYXRvciUnOiBbJ0dlbmVyYXRvckZ1bmN0aW9uJywgJ3Byb3RvdHlwZSddLFxuXHQnJUdlbmVyYXRvclByb3RvdHlwZSUnOiBbJ0dlbmVyYXRvckZ1bmN0aW9uJywgJ3Byb3RvdHlwZScsICdwcm90b3R5cGUnXSxcblx0JyVJbnQ4QXJyYXlQcm90b3R5cGUlJzogWydJbnQ4QXJyYXknLCAncHJvdG90eXBlJ10sXG5cdCclSW50MTZBcnJheVByb3RvdHlwZSUnOiBbJ0ludDE2QXJyYXknLCAncHJvdG90eXBlJ10sXG5cdCclSW50MzJBcnJheVByb3RvdHlwZSUnOiBbJ0ludDMyQXJyYXknLCAncHJvdG90eXBlJ10sXG5cdCclSlNPTlBhcnNlJSc6IFsnSlNPTicsICdwYXJzZSddLFxuXHQnJUpTT05TdHJpbmdpZnklJzogWydKU09OJywgJ3N0cmluZ2lmeSddLFxuXHQnJU1hcFByb3RvdHlwZSUnOiBbJ01hcCcsICdwcm90b3R5cGUnXSxcblx0JyVOdW1iZXJQcm90b3R5cGUlJzogWydOdW1iZXInLCAncHJvdG90eXBlJ10sXG5cdCclT2JqZWN0UHJvdG90eXBlJSc6IFsnT2JqZWN0JywgJ3Byb3RvdHlwZSddLFxuXHQnJU9ialByb3RvX3RvU3RyaW5nJSc6IFsnT2JqZWN0JywgJ3Byb3RvdHlwZScsICd0b1N0cmluZyddLFxuXHQnJU9ialByb3RvX3ZhbHVlT2YlJzogWydPYmplY3QnLCAncHJvdG90eXBlJywgJ3ZhbHVlT2YnXSxcblx0JyVQcm9taXNlUHJvdG90eXBlJSc6IFsnUHJvbWlzZScsICdwcm90b3R5cGUnXSxcblx0JyVQcm9taXNlUHJvdG9fdGhlbiUnOiBbJ1Byb21pc2UnLCAncHJvdG90eXBlJywgJ3RoZW4nXSxcblx0JyVQcm9taXNlX2FsbCUnOiBbJ1Byb21pc2UnLCAnYWxsJ10sXG5cdCclUHJvbWlzZV9yZWplY3QlJzogWydQcm9taXNlJywgJ3JlamVjdCddLFxuXHQnJVByb21pc2VfcmVzb2x2ZSUnOiBbJ1Byb21pc2UnLCAncmVzb2x2ZSddLFxuXHQnJVJhbmdlRXJyb3JQcm90b3R5cGUlJzogWydSYW5nZUVycm9yJywgJ3Byb3RvdHlwZSddLFxuXHQnJVJlZmVyZW5jZUVycm9yUHJvdG90eXBlJSc6IFsnUmVmZXJlbmNlRXJyb3InLCAncHJvdG90eXBlJ10sXG5cdCclUmVnRXhwUHJvdG90eXBlJSc6IFsnUmVnRXhwJywgJ3Byb3RvdHlwZSddLFxuXHQnJVNldFByb3RvdHlwZSUnOiBbJ1NldCcsICdwcm90b3R5cGUnXSxcblx0JyVTaGFyZWRBcnJheUJ1ZmZlclByb3RvdHlwZSUnOiBbJ1NoYXJlZEFycmF5QnVmZmVyJywgJ3Byb3RvdHlwZSddLFxuXHQnJVN0cmluZ1Byb3RvdHlwZSUnOiBbJ1N0cmluZycsICdwcm90b3R5cGUnXSxcblx0JyVTeW1ib2xQcm90b3R5cGUlJzogWydTeW1ib2wnLCAncHJvdG90eXBlJ10sXG5cdCclU3ludGF4RXJyb3JQcm90b3R5cGUlJzogWydTeW50YXhFcnJvcicsICdwcm90b3R5cGUnXSxcblx0JyVUeXBlZEFycmF5UHJvdG90eXBlJSc6IFsnVHlwZWRBcnJheScsICdwcm90b3R5cGUnXSxcblx0JyVUeXBlRXJyb3JQcm90b3R5cGUlJzogWydUeXBlRXJyb3InLCAncHJvdG90eXBlJ10sXG5cdCclVWludDhBcnJheVByb3RvdHlwZSUnOiBbJ1VpbnQ4QXJyYXknLCAncHJvdG90eXBlJ10sXG5cdCclVWludDhDbGFtcGVkQXJyYXlQcm90b3R5cGUlJzogWydVaW50OENsYW1wZWRBcnJheScsICdwcm90b3R5cGUnXSxcblx0JyVVaW50MTZBcnJheVByb3RvdHlwZSUnOiBbJ1VpbnQxNkFycmF5JywgJ3Byb3RvdHlwZSddLFxuXHQnJVVpbnQzMkFycmF5UHJvdG90eXBlJSc6IFsnVWludDMyQXJyYXknLCAncHJvdG90eXBlJ10sXG5cdCclVVJJRXJyb3JQcm90b3R5cGUlJzogWydVUklFcnJvcicsICdwcm90b3R5cGUnXSxcblx0JyVXZWFrTWFwUHJvdG90eXBlJSc6IFsnV2Vha01hcCcsICdwcm90b3R5cGUnXSxcblx0JyVXZWFrU2V0UHJvdG90eXBlJSc6IFsnV2Vha1NldCcsICdwcm90b3R5cGUnXVxufTtcblxudmFyIGJpbmQgPSByZXF1aXJlKCdmdW5jdGlvbi1iaW5kJyk7XG52YXIgaGFzT3duID0gcmVxdWlyZSgnaGFzb3duJyk7XG52YXIgJGNvbmNhdCA9IGJpbmQuY2FsbChGdW5jdGlvbi5jYWxsLCBBcnJheS5wcm90b3R5cGUuY29uY2F0KTtcbnZhciAkc3BsaWNlQXBwbHkgPSBiaW5kLmNhbGwoRnVuY3Rpb24uYXBwbHksIEFycmF5LnByb3RvdHlwZS5zcGxpY2UpO1xudmFyICRyZXBsYWNlID0gYmluZC5jYWxsKEZ1bmN0aW9uLmNhbGwsIFN0cmluZy5wcm90b3R5cGUucmVwbGFjZSk7XG52YXIgJHN0clNsaWNlID0gYmluZC5jYWxsKEZ1bmN0aW9uLmNhbGwsIFN0cmluZy5wcm90b3R5cGUuc2xpY2UpO1xudmFyICRleGVjID0gYmluZC5jYWxsKEZ1bmN0aW9uLmNhbGwsIFJlZ0V4cC5wcm90b3R5cGUuZXhlYyk7XG5cbi8qIGFkYXB0ZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vbG9kYXNoL2xvZGFzaC9ibG9iLzQuMTcuMTUvZGlzdC9sb2Rhc2guanMjTDY3MzUtTDY3NDQgKi9cbnZhciByZVByb3BOYW1lID0gL1teJS5bXFxdXSt8XFxbKD86KC0/XFxkKyg/OlxcLlxcZCspPyl8KFtcIiddKSgoPzooPyFcXDIpW15cXFxcXXxcXFxcLikqPylcXDIpXFxdfCg/PSg/OlxcLnxcXFtcXF0pKD86XFwufFxcW1xcXXwlJCkpL2c7XG52YXIgcmVFc2NhcGVDaGFyID0gL1xcXFwoXFxcXCk/L2c7IC8qKiBVc2VkIHRvIG1hdGNoIGJhY2tzbGFzaGVzIGluIHByb3BlcnR5IHBhdGhzLiAqL1xudmFyIHN0cmluZ1RvUGF0aCA9IGZ1bmN0aW9uIHN0cmluZ1RvUGF0aChzdHJpbmcpIHtcblx0dmFyIGZpcnN0ID0gJHN0clNsaWNlKHN0cmluZywgMCwgMSk7XG5cdHZhciBsYXN0ID0gJHN0clNsaWNlKHN0cmluZywgLTEpO1xuXHRpZiAoZmlyc3QgPT09ICclJyAmJiBsYXN0ICE9PSAnJScpIHtcblx0XHR0aHJvdyBuZXcgJFN5bnRheEVycm9yKCdpbnZhbGlkIGludHJpbnNpYyBzeW50YXgsIGV4cGVjdGVkIGNsb3NpbmcgYCVgJyk7XG5cdH0gZWxzZSBpZiAobGFzdCA9PT0gJyUnICYmIGZpcnN0ICE9PSAnJScpIHtcblx0XHR0aHJvdyBuZXcgJFN5bnRheEVycm9yKCdpbnZhbGlkIGludHJpbnNpYyBzeW50YXgsIGV4cGVjdGVkIG9wZW5pbmcgYCVgJyk7XG5cdH1cblx0dmFyIHJlc3VsdCA9IFtdO1xuXHQkcmVwbGFjZShzdHJpbmcsIHJlUHJvcE5hbWUsIGZ1bmN0aW9uIChtYXRjaCwgbnVtYmVyLCBxdW90ZSwgc3ViU3RyaW5nKSB7XG5cdFx0cmVzdWx0W3Jlc3VsdC5sZW5ndGhdID0gcXVvdGUgPyAkcmVwbGFjZShzdWJTdHJpbmcsIHJlRXNjYXBlQ2hhciwgJyQxJykgOiBudW1iZXIgfHwgbWF0Y2g7XG5cdH0pO1xuXHRyZXR1cm4gcmVzdWx0O1xufTtcbi8qIGVuZCBhZGFwdGF0aW9uICovXG5cbnZhciBnZXRCYXNlSW50cmluc2ljID0gZnVuY3Rpb24gZ2V0QmFzZUludHJpbnNpYyhuYW1lLCBhbGxvd01pc3NpbmcpIHtcblx0dmFyIGludHJpbnNpY05hbWUgPSBuYW1lO1xuXHR2YXIgYWxpYXM7XG5cdGlmIChoYXNPd24oTEVHQUNZX0FMSUFTRVMsIGludHJpbnNpY05hbWUpKSB7XG5cdFx0YWxpYXMgPSBMRUdBQ1lfQUxJQVNFU1tpbnRyaW5zaWNOYW1lXTtcblx0XHRpbnRyaW5zaWNOYW1lID0gJyUnICsgYWxpYXNbMF0gKyAnJSc7XG5cdH1cblxuXHRpZiAoaGFzT3duKElOVFJJTlNJQ1MsIGludHJpbnNpY05hbWUpKSB7XG5cdFx0dmFyIHZhbHVlID0gSU5UUklOU0lDU1tpbnRyaW5zaWNOYW1lXTtcblx0XHRpZiAodmFsdWUgPT09IG5lZWRzRXZhbCkge1xuXHRcdFx0dmFsdWUgPSBkb0V2YWwoaW50cmluc2ljTmFtZSk7XG5cdFx0fVxuXHRcdGlmICh0eXBlb2YgdmFsdWUgPT09ICd1bmRlZmluZWQnICYmICFhbGxvd01pc3NpbmcpIHtcblx0XHRcdHRocm93IG5ldyAkVHlwZUVycm9yKCdpbnRyaW5zaWMgJyArIG5hbWUgKyAnIGV4aXN0cywgYnV0IGlzIG5vdCBhdmFpbGFibGUuIFBsZWFzZSBmaWxlIGFuIGlzc3VlIScpO1xuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHRhbGlhczogYWxpYXMsXG5cdFx0XHRuYW1lOiBpbnRyaW5zaWNOYW1lLFxuXHRcdFx0dmFsdWU6IHZhbHVlXG5cdFx0fTtcblx0fVxuXG5cdHRocm93IG5ldyAkU3ludGF4RXJyb3IoJ2ludHJpbnNpYyAnICsgbmFtZSArICcgZG9lcyBub3QgZXhpc3QhJyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIEdldEludHJpbnNpYyhuYW1lLCBhbGxvd01pc3NpbmcpIHtcblx0aWYgKHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJyB8fCBuYW1lLmxlbmd0aCA9PT0gMCkge1xuXHRcdHRocm93IG5ldyAkVHlwZUVycm9yKCdpbnRyaW5zaWMgbmFtZSBtdXN0IGJlIGEgbm9uLWVtcHR5IHN0cmluZycpO1xuXHR9XG5cdGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSAmJiB0eXBlb2YgYWxsb3dNaXNzaW5nICE9PSAnYm9vbGVhbicpIHtcblx0XHR0aHJvdyBuZXcgJFR5cGVFcnJvcignXCJhbGxvd01pc3NpbmdcIiBhcmd1bWVudCBtdXN0IGJlIGEgYm9vbGVhbicpO1xuXHR9XG5cblx0aWYgKCRleGVjKC9eJT9bXiVdKiU/JC8sIG5hbWUpID09PSBudWxsKSB7XG5cdFx0dGhyb3cgbmV3ICRTeW50YXhFcnJvcignYCVgIG1heSBub3QgYmUgcHJlc2VudCBhbnl3aGVyZSBidXQgYXQgdGhlIGJlZ2lubmluZyBhbmQgZW5kIG9mIHRoZSBpbnRyaW5zaWMgbmFtZScpO1xuXHR9XG5cdHZhciBwYXJ0cyA9IHN0cmluZ1RvUGF0aChuYW1lKTtcblx0dmFyIGludHJpbnNpY0Jhc2VOYW1lID0gcGFydHMubGVuZ3RoID4gMCA/IHBhcnRzWzBdIDogJyc7XG5cblx0dmFyIGludHJpbnNpYyA9IGdldEJhc2VJbnRyaW5zaWMoJyUnICsgaW50cmluc2ljQmFzZU5hbWUgKyAnJScsIGFsbG93TWlzc2luZyk7XG5cdHZhciBpbnRyaW5zaWNSZWFsTmFtZSA9IGludHJpbnNpYy5uYW1lO1xuXHR2YXIgdmFsdWUgPSBpbnRyaW5zaWMudmFsdWU7XG5cdHZhciBza2lwRnVydGhlckNhY2hpbmcgPSBmYWxzZTtcblxuXHR2YXIgYWxpYXMgPSBpbnRyaW5zaWMuYWxpYXM7XG5cdGlmIChhbGlhcykge1xuXHRcdGludHJpbnNpY0Jhc2VOYW1lID0gYWxpYXNbMF07XG5cdFx0JHNwbGljZUFwcGx5KHBhcnRzLCAkY29uY2F0KFswLCAxXSwgYWxpYXMpKTtcblx0fVxuXG5cdGZvciAodmFyIGkgPSAxLCBpc093biA9IHRydWU7IGkgPCBwYXJ0cy5sZW5ndGg7IGkgKz0gMSkge1xuXHRcdHZhciBwYXJ0ID0gcGFydHNbaV07XG5cdFx0dmFyIGZpcnN0ID0gJHN0clNsaWNlKHBhcnQsIDAsIDEpO1xuXHRcdHZhciBsYXN0ID0gJHN0clNsaWNlKHBhcnQsIC0xKTtcblx0XHRpZiAoXG5cdFx0XHQoXG5cdFx0XHRcdChmaXJzdCA9PT0gJ1wiJyB8fCBmaXJzdCA9PT0gXCInXCIgfHwgZmlyc3QgPT09ICdgJylcblx0XHRcdFx0fHwgKGxhc3QgPT09ICdcIicgfHwgbGFzdCA9PT0gXCInXCIgfHwgbGFzdCA9PT0gJ2AnKVxuXHRcdFx0KVxuXHRcdFx0JiYgZmlyc3QgIT09IGxhc3Rcblx0XHQpIHtcblx0XHRcdHRocm93IG5ldyAkU3ludGF4RXJyb3IoJ3Byb3BlcnR5IG5hbWVzIHdpdGggcXVvdGVzIG11c3QgaGF2ZSBtYXRjaGluZyBxdW90ZXMnKTtcblx0XHR9XG5cdFx0aWYgKHBhcnQgPT09ICdjb25zdHJ1Y3RvcicgfHwgIWlzT3duKSB7XG5cdFx0XHRza2lwRnVydGhlckNhY2hpbmcgPSB0cnVlO1xuXHRcdH1cblxuXHRcdGludHJpbnNpY0Jhc2VOYW1lICs9ICcuJyArIHBhcnQ7XG5cdFx0aW50cmluc2ljUmVhbE5hbWUgPSAnJScgKyBpbnRyaW5zaWNCYXNlTmFtZSArICclJztcblxuXHRcdGlmIChoYXNPd24oSU5UUklOU0lDUywgaW50cmluc2ljUmVhbE5hbWUpKSB7XG5cdFx0XHR2YWx1ZSA9IElOVFJJTlNJQ1NbaW50cmluc2ljUmVhbE5hbWVdO1xuXHRcdH0gZWxzZSBpZiAodmFsdWUgIT0gbnVsbCkge1xuXHRcdFx0aWYgKCEocGFydCBpbiB2YWx1ZSkpIHtcblx0XHRcdFx0aWYgKCFhbGxvd01pc3NpbmcpIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgJFR5cGVFcnJvcignYmFzZSBpbnRyaW5zaWMgZm9yICcgKyBuYW1lICsgJyBleGlzdHMsIGJ1dCB0aGUgcHJvcGVydHkgaXMgbm90IGF2YWlsYWJsZS4nKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gdm9pZCB1bmRlZmluZWQ7XG5cdFx0XHR9XG5cdFx0XHRpZiAoJGdPUEQgJiYgKGkgKyAxKSA+PSBwYXJ0cy5sZW5ndGgpIHtcblx0XHRcdFx0dmFyIGRlc2MgPSAkZ09QRCh2YWx1ZSwgcGFydCk7XG5cdFx0XHRcdGlzT3duID0gISFkZXNjO1xuXG5cdFx0XHRcdC8vIEJ5IGNvbnZlbnRpb24sIHdoZW4gYSBkYXRhIHByb3BlcnR5IGlzIGNvbnZlcnRlZCB0byBhbiBhY2Nlc3NvclxuXHRcdFx0XHQvLyBwcm9wZXJ0eSB0byBlbXVsYXRlIGEgZGF0YSBwcm9wZXJ0eSB0aGF0IGRvZXMgbm90IHN1ZmZlciBmcm9tXG5cdFx0XHRcdC8vIHRoZSBvdmVycmlkZSBtaXN0YWtlLCB0aGF0IGFjY2Vzc29yJ3MgZ2V0dGVyIGlzIG1hcmtlZCB3aXRoXG5cdFx0XHRcdC8vIGFuIGBvcmlnaW5hbFZhbHVlYCBwcm9wZXJ0eS4gSGVyZSwgd2hlbiB3ZSBkZXRlY3QgdGhpcywgd2Vcblx0XHRcdFx0Ly8gdXBob2xkIHRoZSBpbGx1c2lvbiBieSBwcmV0ZW5kaW5nIHRvIHNlZSB0aGF0IG9yaWdpbmFsIGRhdGFcblx0XHRcdFx0Ly8gcHJvcGVydHksIGkuZS4sIHJldHVybmluZyB0aGUgdmFsdWUgcmF0aGVyIHRoYW4gdGhlIGdldHRlclxuXHRcdFx0XHQvLyBpdHNlbGYuXG5cdFx0XHRcdGlmIChpc093biAmJiAnZ2V0JyBpbiBkZXNjICYmICEoJ29yaWdpbmFsVmFsdWUnIGluIGRlc2MuZ2V0KSkge1xuXHRcdFx0XHRcdHZhbHVlID0gZGVzYy5nZXQ7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dmFsdWUgPSB2YWx1ZVtwYXJ0XTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0aXNPd24gPSBoYXNPd24odmFsdWUsIHBhcnQpO1xuXHRcdFx0XHR2YWx1ZSA9IHZhbHVlW3BhcnRdO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoaXNPd24gJiYgIXNraXBGdXJ0aGVyQ2FjaGluZykge1xuXHRcdFx0XHRJTlRSSU5TSUNTW2ludHJpbnNpY1JlYWxOYW1lXSA9IHZhbHVlO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gdmFsdWU7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgR2V0SW50cmluc2ljID0gcmVxdWlyZSgnZ2V0LWludHJpbnNpYycpO1xuXG52YXIgJGdPUEQgPSBHZXRJbnRyaW5zaWMoJyVPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yJScsIHRydWUpO1xuXG5pZiAoJGdPUEQpIHtcblx0dHJ5IHtcblx0XHQkZ09QRChbXSwgJ2xlbmd0aCcpO1xuXHR9IGNhdGNoIChlKSB7XG5cdFx0Ly8gSUUgOCBoYXMgYSBicm9rZW4gZ09QRFxuXHRcdCRnT1BEID0gbnVsbDtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICRnT1BEO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgJGRlZmluZVByb3BlcnR5ID0gcmVxdWlyZSgnZXMtZGVmaW5lLXByb3BlcnR5Jyk7XG5cbnZhciBoYXNQcm9wZXJ0eURlc2NyaXB0b3JzID0gZnVuY3Rpb24gaGFzUHJvcGVydHlEZXNjcmlwdG9ycygpIHtcblx0cmV0dXJuICEhJGRlZmluZVByb3BlcnR5O1xufTtcblxuaGFzUHJvcGVydHlEZXNjcmlwdG9ycy5oYXNBcnJheUxlbmd0aERlZmluZUJ1ZyA9IGZ1bmN0aW9uIGhhc0FycmF5TGVuZ3RoRGVmaW5lQnVnKCkge1xuXHQvLyBub2RlIHYwLjYgaGFzIGEgYnVnIHdoZXJlIGFycmF5IGxlbmd0aHMgY2FuIGJlIFNldCBidXQgbm90IERlZmluZWRcblx0aWYgKCEkZGVmaW5lUHJvcGVydHkpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXHR0cnkge1xuXHRcdHJldHVybiAkZGVmaW5lUHJvcGVydHkoW10sICdsZW5ndGgnLCB7IHZhbHVlOiAxIH0pLmxlbmd0aCAhPT0gMTtcblx0fSBjYXRjaCAoZSkge1xuXHRcdC8vIEluIEZpcmVmb3ggNC0yMiwgZGVmaW5pbmcgbGVuZ3RoIG9uIGFuIGFycmF5IHRocm93cyBhbiBleGNlcHRpb24uXG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gaGFzUHJvcGVydHlEZXNjcmlwdG9ycztcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHRlc3QgPSB7XG5cdF9fcHJvdG9fXzogbnVsbCxcblx0Zm9vOiB7fVxufTtcblxudmFyICRPYmplY3QgPSBPYmplY3Q7XG5cbi8qKiBAdHlwZSB7aW1wb3J0KCcuJyl9ICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGhhc1Byb3RvKCkge1xuXHQvLyBAdHMtZXhwZWN0LWVycm9yOiBUUyBlcnJvcnMgb24gYW4gaW5oZXJpdGVkIHByb3BlcnR5IGZvciBzb21lIHJlYXNvblxuXHRyZXR1cm4geyBfX3Byb3RvX186IHRlc3QgfS5mb28gPT09IHRlc3QuZm9vXG5cdFx0JiYgISh0ZXN0IGluc3RhbmNlb2YgJE9iamVjdCk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgb3JpZ1N5bWJvbCA9IHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbDtcbnZhciBoYXNTeW1ib2xTaGFtID0gcmVxdWlyZSgnLi9zaGFtcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGhhc05hdGl2ZVN5bWJvbHMoKSB7XG5cdGlmICh0eXBlb2Ygb3JpZ1N5bWJvbCAhPT0gJ2Z1bmN0aW9uJykgeyByZXR1cm4gZmFsc2U7IH1cblx0aWYgKHR5cGVvZiBTeW1ib2wgIT09ICdmdW5jdGlvbicpIHsgcmV0dXJuIGZhbHNlOyB9XG5cdGlmICh0eXBlb2Ygb3JpZ1N5bWJvbCgnZm9vJykgIT09ICdzeW1ib2wnKSB7IHJldHVybiBmYWxzZTsgfVxuXHRpZiAodHlwZW9mIFN5bWJvbCgnYmFyJykgIT09ICdzeW1ib2wnKSB7IHJldHVybiBmYWxzZTsgfVxuXG5cdHJldHVybiBoYXNTeW1ib2xTaGFtKCk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKiBlc2xpbnQgY29tcGxleGl0eTogWzIsIDE4XSwgbWF4LXN0YXRlbWVudHM6IFsyLCAzM10gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaGFzU3ltYm9scygpIHtcblx0aWYgKHR5cGVvZiBTeW1ib2wgIT09ICdmdW5jdGlvbicgfHwgdHlwZW9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMgIT09ICdmdW5jdGlvbicpIHsgcmV0dXJuIGZhbHNlOyB9XG5cdGlmICh0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID09PSAnc3ltYm9sJykgeyByZXR1cm4gdHJ1ZTsgfVxuXG5cdHZhciBvYmogPSB7fTtcblx0dmFyIHN5bSA9IFN5bWJvbCgndGVzdCcpO1xuXHR2YXIgc3ltT2JqID0gT2JqZWN0KHN5bSk7XG5cdGlmICh0eXBlb2Ygc3ltID09PSAnc3RyaW5nJykgeyByZXR1cm4gZmFsc2U7IH1cblxuXHRpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHN5bSkgIT09ICdbb2JqZWN0IFN5bWJvbF0nKSB7IHJldHVybiBmYWxzZTsgfVxuXHRpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHN5bU9iaikgIT09ICdbb2JqZWN0IFN5bWJvbF0nKSB7IHJldHVybiBmYWxzZTsgfVxuXG5cdC8vIHRlbXAgZGlzYWJsZWQgcGVyIGh0dHBzOi8vZ2l0aHViLmNvbS9samhhcmIvb2JqZWN0LmFzc2lnbi9pc3N1ZXMvMTdcblx0Ly8gaWYgKHN5bSBpbnN0YW5jZW9mIFN5bWJvbCkgeyByZXR1cm4gZmFsc2U7IH1cblx0Ly8gdGVtcCBkaXNhYmxlZCBwZXIgaHR0cHM6Ly9naXRodWIuY29tL1dlYlJlZmxlY3Rpb24vZ2V0LW93bi1wcm9wZXJ0eS1zeW1ib2xzL2lzc3Vlcy80XG5cdC8vIGlmICghKHN5bU9iaiBpbnN0YW5jZW9mIFN5bWJvbCkpIHsgcmV0dXJuIGZhbHNlOyB9XG5cblx0Ly8gaWYgKHR5cGVvZiBTeW1ib2wucHJvdG90eXBlLnRvU3RyaW5nICE9PSAnZnVuY3Rpb24nKSB7IHJldHVybiBmYWxzZTsgfVxuXHQvLyBpZiAoU3RyaW5nKHN5bSkgIT09IFN5bWJvbC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChzeW0pKSB7IHJldHVybiBmYWxzZTsgfVxuXG5cdHZhciBzeW1WYWwgPSA0Mjtcblx0b2JqW3N5bV0gPSBzeW1WYWw7XG5cdGZvciAoc3ltIGluIG9iaikgeyByZXR1cm4gZmFsc2U7IH0gLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1yZXN0cmljdGVkLXN5bnRheCwgbm8tdW5yZWFjaGFibGUtbG9vcFxuXHRpZiAodHlwZW9mIE9iamVjdC5rZXlzID09PSAnZnVuY3Rpb24nICYmIE9iamVjdC5rZXlzKG9iaikubGVuZ3RoICE9PSAwKSB7IHJldHVybiBmYWxzZTsgfVxuXG5cdGlmICh0eXBlb2YgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMgPT09ICdmdW5jdGlvbicgJiYgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMob2JqKS5sZW5ndGggIT09IDApIHsgcmV0dXJuIGZhbHNlOyB9XG5cblx0dmFyIHN5bXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKG9iaik7XG5cdGlmIChzeW1zLmxlbmd0aCAhPT0gMSB8fCBzeW1zWzBdICE9PSBzeW0pIHsgcmV0dXJuIGZhbHNlOyB9XG5cblx0aWYgKCFPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwob2JqLCBzeW0pKSB7IHJldHVybiBmYWxzZTsgfVxuXG5cdGlmICh0eXBlb2YgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvciA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdHZhciBkZXNjcmlwdG9yID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmosIHN5bSk7XG5cdFx0aWYgKGRlc2NyaXB0b3IudmFsdWUgIT09IHN5bVZhbCB8fCBkZXNjcmlwdG9yLmVudW1lcmFibGUgIT09IHRydWUpIHsgcmV0dXJuIGZhbHNlOyB9XG5cdH1cblxuXHRyZXR1cm4gdHJ1ZTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBoYXNTeW1ib2xzID0gcmVxdWlyZSgnaGFzLXN5bWJvbHMvc2hhbXMnKTtcblxuLyoqIEB0eXBlIHtpbXBvcnQoJy4nKX0gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaGFzVG9TdHJpbmdUYWdTaGFtcygpIHtcblx0cmV0dXJuIGhhc1N5bWJvbHMoKSAmJiAhIVN5bWJvbC50b1N0cmluZ1RhZztcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBjYWxsID0gRnVuY3Rpb24ucHJvdG90eXBlLmNhbGw7XG52YXIgJGhhc093biA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG52YXIgYmluZCA9IHJlcXVpcmUoJ2Z1bmN0aW9uLWJpbmQnKTtcblxuLyoqIEB0eXBlIHtpbXBvcnQoJy4nKX0gKi9cbm1vZHVsZS5leHBvcnRzID0gYmluZC5jYWxsKGNhbGwsICRoYXNPd24pO1xuIiwiaWYgKHR5cGVvZiBPYmplY3QuY3JlYXRlID09PSAnZnVuY3Rpb24nKSB7XG4gIC8vIGltcGxlbWVudGF0aW9uIGZyb20gc3RhbmRhcmQgbm9kZS5qcyAndXRpbCcgbW9kdWxlXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgaWYgKHN1cGVyQ3Rvcikge1xuICAgICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICAgIGN0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckN0b3IucHJvdG90eXBlLCB7XG4gICAgICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICAgICAgdmFsdWU6IGN0b3IsXG4gICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICB9O1xufSBlbHNlIHtcbiAgLy8gb2xkIHNjaG9vbCBzaGltIGZvciBvbGQgYnJvd3NlcnNcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBpZiAoc3VwZXJDdG9yKSB7XG4gICAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgICAgdmFyIFRlbXBDdG9yID0gZnVuY3Rpb24gKCkge31cbiAgICAgIFRlbXBDdG9yLnByb3RvdHlwZSA9IHN1cGVyQ3Rvci5wcm90b3R5cGVcbiAgICAgIGN0b3IucHJvdG90eXBlID0gbmV3IFRlbXBDdG9yKClcbiAgICAgIGN0b3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gY3RvclxuICAgIH1cbiAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaGFzVG9TdHJpbmdUYWcgPSByZXF1aXJlKCdoYXMtdG9zdHJpbmd0YWcvc2hhbXMnKSgpO1xudmFyIGNhbGxCb3VuZCA9IHJlcXVpcmUoJ2NhbGwtYmluZC9jYWxsQm91bmQnKTtcblxudmFyICR0b1N0cmluZyA9IGNhbGxCb3VuZCgnT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZycpO1xuXG52YXIgaXNTdGFuZGFyZEFyZ3VtZW50cyA9IGZ1bmN0aW9uIGlzQXJndW1lbnRzKHZhbHVlKSB7XG5cdGlmIChoYXNUb1N0cmluZ1RhZyAmJiB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIFN5bWJvbC50b1N0cmluZ1RhZyBpbiB2YWx1ZSkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXHRyZXR1cm4gJHRvU3RyaW5nKHZhbHVlKSA9PT0gJ1tvYmplY3QgQXJndW1lbnRzXSc7XG59O1xuXG52YXIgaXNMZWdhY3lBcmd1bWVudHMgPSBmdW5jdGlvbiBpc0FyZ3VtZW50cyh2YWx1ZSkge1xuXHRpZiAoaXNTdGFuZGFyZEFyZ3VtZW50cyh2YWx1ZSkpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXHRyZXR1cm4gdmFsdWUgIT09IG51bGwgJiZcblx0XHR0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmXG5cdFx0dHlwZW9mIHZhbHVlLmxlbmd0aCA9PT0gJ251bWJlcicgJiZcblx0XHR2YWx1ZS5sZW5ndGggPj0gMCAmJlxuXHRcdCR0b1N0cmluZyh2YWx1ZSkgIT09ICdbb2JqZWN0IEFycmF5XScgJiZcblx0XHQkdG9TdHJpbmcodmFsdWUuY2FsbGVlKSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbn07XG5cbnZhciBzdXBwb3J0c1N0YW5kYXJkQXJndW1lbnRzID0gKGZ1bmN0aW9uICgpIHtcblx0cmV0dXJuIGlzU3RhbmRhcmRBcmd1bWVudHMoYXJndW1lbnRzKTtcbn0oKSk7XG5cbmlzU3RhbmRhcmRBcmd1bWVudHMuaXNMZWdhY3lBcmd1bWVudHMgPSBpc0xlZ2FjeUFyZ3VtZW50czsgLy8gZm9yIHRlc3RzXG5cbm1vZHVsZS5leHBvcnRzID0gc3VwcG9ydHNTdGFuZGFyZEFyZ3VtZW50cyA/IGlzU3RhbmRhcmRBcmd1bWVudHMgOiBpc0xlZ2FjeUFyZ3VtZW50cztcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGZuVG9TdHIgPSBGdW5jdGlvbi5wcm90b3R5cGUudG9TdHJpbmc7XG52YXIgcmVmbGVjdEFwcGx5ID0gdHlwZW9mIFJlZmxlY3QgPT09ICdvYmplY3QnICYmIFJlZmxlY3QgIT09IG51bGwgJiYgUmVmbGVjdC5hcHBseTtcbnZhciBiYWRBcnJheUxpa2U7XG52YXIgaXNDYWxsYWJsZU1hcmtlcjtcbmlmICh0eXBlb2YgcmVmbGVjdEFwcGx5ID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBPYmplY3QuZGVmaW5lUHJvcGVydHkgPT09ICdmdW5jdGlvbicpIHtcblx0dHJ5IHtcblx0XHRiYWRBcnJheUxpa2UgPSBPYmplY3QuZGVmaW5lUHJvcGVydHkoe30sICdsZW5ndGgnLCB7XG5cdFx0XHRnZXQ6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0dGhyb3cgaXNDYWxsYWJsZU1hcmtlcjtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRpc0NhbGxhYmxlTWFya2VyID0ge307XG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXRocm93LWxpdGVyYWxcblx0XHRyZWZsZWN0QXBwbHkoZnVuY3Rpb24gKCkgeyB0aHJvdyA0MjsgfSwgbnVsbCwgYmFkQXJyYXlMaWtlKTtcblx0fSBjYXRjaCAoXykge1xuXHRcdGlmIChfICE9PSBpc0NhbGxhYmxlTWFya2VyKSB7XG5cdFx0XHRyZWZsZWN0QXBwbHkgPSBudWxsO1xuXHRcdH1cblx0fVxufSBlbHNlIHtcblx0cmVmbGVjdEFwcGx5ID0gbnVsbDtcbn1cblxudmFyIGNvbnN0cnVjdG9yUmVnZXggPSAvXlxccypjbGFzc1xcYi87XG52YXIgaXNFUzZDbGFzc0ZuID0gZnVuY3Rpb24gaXNFUzZDbGFzc0Z1bmN0aW9uKHZhbHVlKSB7XG5cdHRyeSB7XG5cdFx0dmFyIGZuU3RyID0gZm5Ub1N0ci5jYWxsKHZhbHVlKTtcblx0XHRyZXR1cm4gY29uc3RydWN0b3JSZWdleC50ZXN0KGZuU3RyKTtcblx0fSBjYXRjaCAoZSkge1xuXHRcdHJldHVybiBmYWxzZTsgLy8gbm90IGEgZnVuY3Rpb25cblx0fVxufTtcblxudmFyIHRyeUZ1bmN0aW9uT2JqZWN0ID0gZnVuY3Rpb24gdHJ5RnVuY3Rpb25Ub1N0cih2YWx1ZSkge1xuXHR0cnkge1xuXHRcdGlmIChpc0VTNkNsYXNzRm4odmFsdWUpKSB7IHJldHVybiBmYWxzZTsgfVxuXHRcdGZuVG9TdHIuY2FsbCh2YWx1ZSk7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH0gY2F0Y2ggKGUpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn07XG52YXIgdG9TdHIgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xudmFyIG9iamVjdENsYXNzID0gJ1tvYmplY3QgT2JqZWN0XSc7XG52YXIgZm5DbGFzcyA9ICdbb2JqZWN0IEZ1bmN0aW9uXSc7XG52YXIgZ2VuQ2xhc3MgPSAnW29iamVjdCBHZW5lcmF0b3JGdW5jdGlvbl0nO1xudmFyIGRkYUNsYXNzID0gJ1tvYmplY3QgSFRNTEFsbENvbGxlY3Rpb25dJzsgLy8gSUUgMTFcbnZhciBkZGFDbGFzczIgPSAnW29iamVjdCBIVE1MIGRvY3VtZW50LmFsbCBjbGFzc10nO1xudmFyIGRkYUNsYXNzMyA9ICdbb2JqZWN0IEhUTUxDb2xsZWN0aW9uXSc7IC8vIElFIDktMTBcbnZhciBoYXNUb1N0cmluZ1RhZyA9IHR5cGVvZiBTeW1ib2wgPT09ICdmdW5jdGlvbicgJiYgISFTeW1ib2wudG9TdHJpbmdUYWc7IC8vIGJldHRlcjogdXNlIGBoYXMtdG9zdHJpbmd0YWdgXG5cbnZhciBpc0lFNjggPSAhKDAgaW4gWyxdKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1zcGFyc2UtYXJyYXlzLCBjb21tYS1zcGFjaW5nXG5cbnZhciBpc0REQSA9IGZ1bmN0aW9uIGlzRG9jdW1lbnREb3RBbGwoKSB7IHJldHVybiBmYWxzZTsgfTtcbmlmICh0eXBlb2YgZG9jdW1lbnQgPT09ICdvYmplY3QnKSB7XG5cdC8vIEZpcmVmb3ggMyBjYW5vbmljYWxpemVzIEREQSB0byB1bmRlZmluZWQgd2hlbiBpdCdzIG5vdCBhY2Nlc3NlZCBkaXJlY3RseVxuXHR2YXIgYWxsID0gZG9jdW1lbnQuYWxsO1xuXHRpZiAodG9TdHIuY2FsbChhbGwpID09PSB0b1N0ci5jYWxsKGRvY3VtZW50LmFsbCkpIHtcblx0XHRpc0REQSA9IGZ1bmN0aW9uIGlzRG9jdW1lbnREb3RBbGwodmFsdWUpIHtcblx0XHRcdC8qIGdsb2JhbHMgZG9jdW1lbnQ6IGZhbHNlICovXG5cdFx0XHQvLyBpbiBJRSA2LTgsIHR5cGVvZiBkb2N1bWVudC5hbGwgaXMgXCJvYmplY3RcIiBhbmQgaXQncyB0cnV0aHlcblx0XHRcdGlmICgoaXNJRTY4IHx8ICF2YWx1ZSkgJiYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JykpIHtcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHR2YXIgc3RyID0gdG9TdHIuY2FsbCh2YWx1ZSk7XG5cdFx0XHRcdFx0cmV0dXJuIChcblx0XHRcdFx0XHRcdHN0ciA9PT0gZGRhQ2xhc3Ncblx0XHRcdFx0XHRcdHx8IHN0ciA9PT0gZGRhQ2xhc3MyXG5cdFx0XHRcdFx0XHR8fCBzdHIgPT09IGRkYUNsYXNzMyAvLyBvcGVyYSAxMi4xNlxuXHRcdFx0XHRcdFx0fHwgc3RyID09PSBvYmplY3RDbGFzcyAvLyBJRSA2LThcblx0XHRcdFx0XHQpICYmIHZhbHVlKCcnKSA9PSBudWxsOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGVxZXFlcVxuXHRcdFx0XHR9IGNhdGNoIChlKSB7IC8qKi8gfVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH07XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSByZWZsZWN0QXBwbHlcblx0PyBmdW5jdGlvbiBpc0NhbGxhYmxlKHZhbHVlKSB7XG5cdFx0aWYgKGlzRERBKHZhbHVlKSkgeyByZXR1cm4gdHJ1ZTsgfVxuXHRcdGlmICghdmFsdWUpIHsgcmV0dXJuIGZhbHNlOyB9XG5cdFx0aWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgdmFsdWUgIT09ICdvYmplY3QnKSB7IHJldHVybiBmYWxzZTsgfVxuXHRcdHRyeSB7XG5cdFx0XHRyZWZsZWN0QXBwbHkodmFsdWUsIG51bGwsIGJhZEFycmF5TGlrZSk7XG5cdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0aWYgKGUgIT09IGlzQ2FsbGFibGVNYXJrZXIpIHsgcmV0dXJuIGZhbHNlOyB9XG5cdFx0fVxuXHRcdHJldHVybiAhaXNFUzZDbGFzc0ZuKHZhbHVlKSAmJiB0cnlGdW5jdGlvbk9iamVjdCh2YWx1ZSk7XG5cdH1cblx0OiBmdW5jdGlvbiBpc0NhbGxhYmxlKHZhbHVlKSB7XG5cdFx0aWYgKGlzRERBKHZhbHVlKSkgeyByZXR1cm4gdHJ1ZTsgfVxuXHRcdGlmICghdmFsdWUpIHsgcmV0dXJuIGZhbHNlOyB9XG5cdFx0aWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgdmFsdWUgIT09ICdvYmplY3QnKSB7IHJldHVybiBmYWxzZTsgfVxuXHRcdGlmIChoYXNUb1N0cmluZ1RhZykgeyByZXR1cm4gdHJ5RnVuY3Rpb25PYmplY3QodmFsdWUpOyB9XG5cdFx0aWYgKGlzRVM2Q2xhc3NGbih2YWx1ZSkpIHsgcmV0dXJuIGZhbHNlOyB9XG5cdFx0dmFyIHN0ckNsYXNzID0gdG9TdHIuY2FsbCh2YWx1ZSk7XG5cdFx0aWYgKHN0ckNsYXNzICE9PSBmbkNsYXNzICYmIHN0ckNsYXNzICE9PSBnZW5DbGFzcyAmJiAhKC9eXFxbb2JqZWN0IEhUTUwvKS50ZXN0KHN0ckNsYXNzKSkgeyByZXR1cm4gZmFsc2U7IH1cblx0XHRyZXR1cm4gdHJ5RnVuY3Rpb25PYmplY3QodmFsdWUpO1xuXHR9O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdG9TdHIgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xudmFyIGZuVG9TdHIgPSBGdW5jdGlvbi5wcm90b3R5cGUudG9TdHJpbmc7XG52YXIgaXNGblJlZ2V4ID0gL15cXHMqKD86ZnVuY3Rpb24pP1xcKi87XG52YXIgaGFzVG9TdHJpbmdUYWcgPSByZXF1aXJlKCdoYXMtdG9zdHJpbmd0YWcvc2hhbXMnKSgpO1xudmFyIGdldFByb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mO1xudmFyIGdldEdlbmVyYXRvckZ1bmMgPSBmdW5jdGlvbiAoKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgY29uc2lzdGVudC1yZXR1cm5cblx0aWYgKCFoYXNUb1N0cmluZ1RhZykge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXHR0cnkge1xuXHRcdHJldHVybiBGdW5jdGlvbigncmV0dXJuIGZ1bmN0aW9uKigpIHt9JykoKTtcblx0fSBjYXRjaCAoZSkge1xuXHR9XG59O1xudmFyIEdlbmVyYXRvckZ1bmN0aW9uO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzR2VuZXJhdG9yRnVuY3Rpb24oZm4pIHtcblx0aWYgKHR5cGVvZiBmbiAhPT0gJ2Z1bmN0aW9uJykge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXHRpZiAoaXNGblJlZ2V4LnRlc3QoZm5Ub1N0ci5jYWxsKGZuKSkpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXHRpZiAoIWhhc1RvU3RyaW5nVGFnKSB7XG5cdFx0dmFyIHN0ciA9IHRvU3RyLmNhbGwoZm4pO1xuXHRcdHJldHVybiBzdHIgPT09ICdbb2JqZWN0IEdlbmVyYXRvckZ1bmN0aW9uXSc7XG5cdH1cblx0aWYgKCFnZXRQcm90bykge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXHRpZiAodHlwZW9mIEdlbmVyYXRvckZ1bmN0aW9uID09PSAndW5kZWZpbmVkJykge1xuXHRcdHZhciBnZW5lcmF0b3JGdW5jID0gZ2V0R2VuZXJhdG9yRnVuYygpO1xuXHRcdEdlbmVyYXRvckZ1bmN0aW9uID0gZ2VuZXJhdG9yRnVuYyA/IGdldFByb3RvKGdlbmVyYXRvckZ1bmMpIDogZmFsc2U7XG5cdH1cblx0cmV0dXJuIGdldFByb3RvKGZuKSA9PT0gR2VuZXJhdG9yRnVuY3Rpb247XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKiBodHRwOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNi4wLyNzZWMtbnVtYmVyLmlzbmFuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNOYU4odmFsdWUpIHtcblx0cmV0dXJuIHZhbHVlICE9PSB2YWx1ZTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBjYWxsQmluZCA9IHJlcXVpcmUoJ2NhbGwtYmluZCcpO1xudmFyIGRlZmluZSA9IHJlcXVpcmUoJ2RlZmluZS1wcm9wZXJ0aWVzJyk7XG5cbnZhciBpbXBsZW1lbnRhdGlvbiA9IHJlcXVpcmUoJy4vaW1wbGVtZW50YXRpb24nKTtcbnZhciBnZXRQb2x5ZmlsbCA9IHJlcXVpcmUoJy4vcG9seWZpbGwnKTtcbnZhciBzaGltID0gcmVxdWlyZSgnLi9zaGltJyk7XG5cbnZhciBwb2x5ZmlsbCA9IGNhbGxCaW5kKGdldFBvbHlmaWxsKCksIE51bWJlcik7XG5cbi8qIGh0dHA6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi82LjAvI3NlYy1udW1iZXIuaXNuYW4gKi9cblxuZGVmaW5lKHBvbHlmaWxsLCB7XG5cdGdldFBvbHlmaWxsOiBnZXRQb2x5ZmlsbCxcblx0aW1wbGVtZW50YXRpb246IGltcGxlbWVudGF0aW9uLFxuXHRzaGltOiBzaGltXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBwb2x5ZmlsbDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGltcGxlbWVudGF0aW9uID0gcmVxdWlyZSgnLi9pbXBsZW1lbnRhdGlvbicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGdldFBvbHlmaWxsKCkge1xuXHRpZiAoTnVtYmVyLmlzTmFOICYmIE51bWJlci5pc05hTihOYU4pICYmICFOdW1iZXIuaXNOYU4oJ2EnKSkge1xuXHRcdHJldHVybiBOdW1iZXIuaXNOYU47XG5cdH1cblx0cmV0dXJuIGltcGxlbWVudGF0aW9uO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGRlZmluZSA9IHJlcXVpcmUoJ2RlZmluZS1wcm9wZXJ0aWVzJyk7XG52YXIgZ2V0UG9seWZpbGwgPSByZXF1aXJlKCcuL3BvbHlmaWxsJyk7XG5cbi8qIGh0dHA6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi82LjAvI3NlYy1udW1iZXIuaXNuYW4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzaGltTnVtYmVySXNOYU4oKSB7XG5cdHZhciBwb2x5ZmlsbCA9IGdldFBvbHlmaWxsKCk7XG5cdGRlZmluZShOdW1iZXIsIHsgaXNOYU46IHBvbHlmaWxsIH0sIHtcblx0XHRpc05hTjogZnVuY3Rpb24gdGVzdElzTmFOKCkge1xuXHRcdFx0cmV0dXJuIE51bWJlci5pc05hTiAhPT0gcG9seWZpbGw7XG5cdFx0fVxuXHR9KTtcblx0cmV0dXJuIHBvbHlmaWxsO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHdoaWNoVHlwZWRBcnJheSA9IHJlcXVpcmUoJ3doaWNoLXR5cGVkLWFycmF5Jyk7XG5cbi8qKiBAdHlwZSB7aW1wb3J0KCcuJyl9ICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzVHlwZWRBcnJheSh2YWx1ZSkge1xuXHRyZXR1cm4gISF3aGljaFR5cGVkQXJyYXkodmFsdWUpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIG51bWJlcklzTmFOID0gZnVuY3Rpb24gKHZhbHVlKSB7XG5cdHJldHVybiB2YWx1ZSAhPT0gdmFsdWU7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzKGEsIGIpIHtcblx0aWYgKGEgPT09IDAgJiYgYiA9PT0gMCkge1xuXHRcdHJldHVybiAxIC8gYSA9PT0gMSAvIGI7XG5cdH1cblx0aWYgKGEgPT09IGIpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXHRpZiAobnVtYmVySXNOYU4oYSkgJiYgbnVtYmVySXNOYU4oYikpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXHRyZXR1cm4gZmFsc2U7XG59O1xuXG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBkZWZpbmUgPSByZXF1aXJlKCdkZWZpbmUtcHJvcGVydGllcycpO1xudmFyIGNhbGxCaW5kID0gcmVxdWlyZSgnY2FsbC1iaW5kJyk7XG5cbnZhciBpbXBsZW1lbnRhdGlvbiA9IHJlcXVpcmUoJy4vaW1wbGVtZW50YXRpb24nKTtcbnZhciBnZXRQb2x5ZmlsbCA9IHJlcXVpcmUoJy4vcG9seWZpbGwnKTtcbnZhciBzaGltID0gcmVxdWlyZSgnLi9zaGltJyk7XG5cbnZhciBwb2x5ZmlsbCA9IGNhbGxCaW5kKGdldFBvbHlmaWxsKCksIE9iamVjdCk7XG5cbmRlZmluZShwb2x5ZmlsbCwge1xuXHRnZXRQb2x5ZmlsbDogZ2V0UG9seWZpbGwsXG5cdGltcGxlbWVudGF0aW9uOiBpbXBsZW1lbnRhdGlvbixcblx0c2hpbTogc2hpbVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gcG9seWZpbGw7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBpbXBsZW1lbnRhdGlvbiA9IHJlcXVpcmUoJy4vaW1wbGVtZW50YXRpb24nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBnZXRQb2x5ZmlsbCgpIHtcblx0cmV0dXJuIHR5cGVvZiBPYmplY3QuaXMgPT09ICdmdW5jdGlvbicgPyBPYmplY3QuaXMgOiBpbXBsZW1lbnRhdGlvbjtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBnZXRQb2x5ZmlsbCA9IHJlcXVpcmUoJy4vcG9seWZpbGwnKTtcbnZhciBkZWZpbmUgPSByZXF1aXJlKCdkZWZpbmUtcHJvcGVydGllcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHNoaW1PYmplY3RJcygpIHtcblx0dmFyIHBvbHlmaWxsID0gZ2V0UG9seWZpbGwoKTtcblx0ZGVmaW5lKE9iamVjdCwgeyBpczogcG9seWZpbGwgfSwge1xuXHRcdGlzOiBmdW5jdGlvbiB0ZXN0T2JqZWN0SXMoKSB7XG5cdFx0XHRyZXR1cm4gT2JqZWN0LmlzICE9PSBwb2x5ZmlsbDtcblx0XHR9XG5cdH0pO1xuXHRyZXR1cm4gcG9seWZpbGw7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIga2V5c1NoaW07XG5pZiAoIU9iamVjdC5rZXlzKSB7XG5cdC8vIG1vZGlmaWVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2VzLXNoaW1zL2VzNS1zaGltXG5cdHZhciBoYXMgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuXHR2YXIgdG9TdHIgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXHR2YXIgaXNBcmdzID0gcmVxdWlyZSgnLi9pc0FyZ3VtZW50cycpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGdsb2JhbC1yZXF1aXJlXG5cdHZhciBpc0VudW1lcmFibGUgPSBPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlO1xuXHR2YXIgaGFzRG9udEVudW1CdWcgPSAhaXNFbnVtZXJhYmxlLmNhbGwoeyB0b1N0cmluZzogbnVsbCB9LCAndG9TdHJpbmcnKTtcblx0dmFyIGhhc1Byb3RvRW51bUJ1ZyA9IGlzRW51bWVyYWJsZS5jYWxsKGZ1bmN0aW9uICgpIHt9LCAncHJvdG90eXBlJyk7XG5cdHZhciBkb250RW51bXMgPSBbXG5cdFx0J3RvU3RyaW5nJyxcblx0XHQndG9Mb2NhbGVTdHJpbmcnLFxuXHRcdCd2YWx1ZU9mJyxcblx0XHQnaGFzT3duUHJvcGVydHknLFxuXHRcdCdpc1Byb3RvdHlwZU9mJyxcblx0XHQncHJvcGVydHlJc0VudW1lcmFibGUnLFxuXHRcdCdjb25zdHJ1Y3Rvcidcblx0XTtcblx0dmFyIGVxdWFsc0NvbnN0cnVjdG9yUHJvdG90eXBlID0gZnVuY3Rpb24gKG8pIHtcblx0XHR2YXIgY3RvciA9IG8uY29uc3RydWN0b3I7XG5cdFx0cmV0dXJuIGN0b3IgJiYgY3Rvci5wcm90b3R5cGUgPT09IG87XG5cdH07XG5cdHZhciBleGNsdWRlZEtleXMgPSB7XG5cdFx0JGFwcGxpY2F0aW9uQ2FjaGU6IHRydWUsXG5cdFx0JGNvbnNvbGU6IHRydWUsXG5cdFx0JGV4dGVybmFsOiB0cnVlLFxuXHRcdCRmcmFtZTogdHJ1ZSxcblx0XHQkZnJhbWVFbGVtZW50OiB0cnVlLFxuXHRcdCRmcmFtZXM6IHRydWUsXG5cdFx0JGlubmVySGVpZ2h0OiB0cnVlLFxuXHRcdCRpbm5lcldpZHRoOiB0cnVlLFxuXHRcdCRvbm1vemZ1bGxzY3JlZW5jaGFuZ2U6IHRydWUsXG5cdFx0JG9ubW96ZnVsbHNjcmVlbmVycm9yOiB0cnVlLFxuXHRcdCRvdXRlckhlaWdodDogdHJ1ZSxcblx0XHQkb3V0ZXJXaWR0aDogdHJ1ZSxcblx0XHQkcGFnZVhPZmZzZXQ6IHRydWUsXG5cdFx0JHBhZ2VZT2Zmc2V0OiB0cnVlLFxuXHRcdCRwYXJlbnQ6IHRydWUsXG5cdFx0JHNjcm9sbExlZnQ6IHRydWUsXG5cdFx0JHNjcm9sbFRvcDogdHJ1ZSxcblx0XHQkc2Nyb2xsWDogdHJ1ZSxcblx0XHQkc2Nyb2xsWTogdHJ1ZSxcblx0XHQkc2VsZjogdHJ1ZSxcblx0XHQkd2Via2l0SW5kZXhlZERCOiB0cnVlLFxuXHRcdCR3ZWJraXRTdG9yYWdlSW5mbzogdHJ1ZSxcblx0XHQkd2luZG93OiB0cnVlXG5cdH07XG5cdHZhciBoYXNBdXRvbWF0aW9uRXF1YWxpdHlCdWcgPSAoZnVuY3Rpb24gKCkge1xuXHRcdC8qIGdsb2JhbCB3aW5kb3cgKi9cblx0XHRpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpIHsgcmV0dXJuIGZhbHNlOyB9XG5cdFx0Zm9yICh2YXIgayBpbiB3aW5kb3cpIHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdGlmICghZXhjbHVkZWRLZXlzWyckJyArIGtdICYmIGhhcy5jYWxsKHdpbmRvdywgaykgJiYgd2luZG93W2tdICE9PSBudWxsICYmIHR5cGVvZiB3aW5kb3dba10gPT09ICdvYmplY3QnKSB7XG5cdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdGVxdWFsc0NvbnN0cnVjdG9yUHJvdG90eXBlKHdpbmRvd1trXSk7XG5cdFx0XHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0oKSk7XG5cdHZhciBlcXVhbHNDb25zdHJ1Y3RvclByb3RvdHlwZUlmTm90QnVnZ3kgPSBmdW5jdGlvbiAobykge1xuXHRcdC8qIGdsb2JhbCB3aW5kb3cgKi9cblx0XHRpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcgfHwgIWhhc0F1dG9tYXRpb25FcXVhbGl0eUJ1Zykge1xuXHRcdFx0cmV0dXJuIGVxdWFsc0NvbnN0cnVjdG9yUHJvdG90eXBlKG8pO1xuXHRcdH1cblx0XHR0cnkge1xuXHRcdFx0cmV0dXJuIGVxdWFsc0NvbnN0cnVjdG9yUHJvdG90eXBlKG8pO1xuXHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdH07XG5cblx0a2V5c1NoaW0gPSBmdW5jdGlvbiBrZXlzKG9iamVjdCkge1xuXHRcdHZhciBpc09iamVjdCA9IG9iamVjdCAhPT0gbnVsbCAmJiB0eXBlb2Ygb2JqZWN0ID09PSAnb2JqZWN0Jztcblx0XHR2YXIgaXNGdW5jdGlvbiA9IHRvU3RyLmNhbGwob2JqZWN0KSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcblx0XHR2YXIgaXNBcmd1bWVudHMgPSBpc0FyZ3Mob2JqZWN0KTtcblx0XHR2YXIgaXNTdHJpbmcgPSBpc09iamVjdCAmJiB0b1N0ci5jYWxsKG9iamVjdCkgPT09ICdbb2JqZWN0IFN0cmluZ10nO1xuXHRcdHZhciB0aGVLZXlzID0gW107XG5cblx0XHRpZiAoIWlzT2JqZWN0ICYmICFpc0Z1bmN0aW9uICYmICFpc0FyZ3VtZW50cykge1xuXHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignT2JqZWN0LmtleXMgY2FsbGVkIG9uIGEgbm9uLW9iamVjdCcpO1xuXHRcdH1cblxuXHRcdHZhciBza2lwUHJvdG8gPSBoYXNQcm90b0VudW1CdWcgJiYgaXNGdW5jdGlvbjtcblx0XHRpZiAoaXNTdHJpbmcgJiYgb2JqZWN0Lmxlbmd0aCA+IDAgJiYgIWhhcy5jYWxsKG9iamVjdCwgMCkpIHtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgb2JqZWN0Lmxlbmd0aDsgKytpKSB7XG5cdFx0XHRcdHRoZUtleXMucHVzaChTdHJpbmcoaSkpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChpc0FyZ3VtZW50cyAmJiBvYmplY3QubGVuZ3RoID4gMCkge1xuXHRcdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBvYmplY3QubGVuZ3RoOyArK2opIHtcblx0XHRcdFx0dGhlS2V5cy5wdXNoKFN0cmluZyhqKSk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGZvciAodmFyIG5hbWUgaW4gb2JqZWN0KSB7XG5cdFx0XHRcdGlmICghKHNraXBQcm90byAmJiBuYW1lID09PSAncHJvdG90eXBlJykgJiYgaGFzLmNhbGwob2JqZWN0LCBuYW1lKSkge1xuXHRcdFx0XHRcdHRoZUtleXMucHVzaChTdHJpbmcobmFtZSkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKGhhc0RvbnRFbnVtQnVnKSB7XG5cdFx0XHR2YXIgc2tpcENvbnN0cnVjdG9yID0gZXF1YWxzQ29uc3RydWN0b3JQcm90b3R5cGVJZk5vdEJ1Z2d5KG9iamVjdCk7XG5cblx0XHRcdGZvciAodmFyIGsgPSAwOyBrIDwgZG9udEVudW1zLmxlbmd0aDsgKytrKSB7XG5cdFx0XHRcdGlmICghKHNraXBDb25zdHJ1Y3RvciAmJiBkb250RW51bXNba10gPT09ICdjb25zdHJ1Y3RvcicpICYmIGhhcy5jYWxsKG9iamVjdCwgZG9udEVudW1zW2tdKSkge1xuXHRcdFx0XHRcdHRoZUtleXMucHVzaChkb250RW51bXNba10pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiB0aGVLZXlzO1xuXHR9O1xufVxubW9kdWxlLmV4cG9ydHMgPSBrZXlzU2hpbTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlO1xudmFyIGlzQXJncyA9IHJlcXVpcmUoJy4vaXNBcmd1bWVudHMnKTtcblxudmFyIG9yaWdLZXlzID0gT2JqZWN0LmtleXM7XG52YXIga2V5c1NoaW0gPSBvcmlnS2V5cyA/IGZ1bmN0aW9uIGtleXMobykgeyByZXR1cm4gb3JpZ0tleXMobyk7IH0gOiByZXF1aXJlKCcuL2ltcGxlbWVudGF0aW9uJyk7XG5cbnZhciBvcmlnaW5hbEtleXMgPSBPYmplY3Qua2V5cztcblxua2V5c1NoaW0uc2hpbSA9IGZ1bmN0aW9uIHNoaW1PYmplY3RLZXlzKCkge1xuXHRpZiAoT2JqZWN0LmtleXMpIHtcblx0XHR2YXIga2V5c1dvcmtzV2l0aEFyZ3VtZW50cyA9IChmdW5jdGlvbiAoKSB7XG5cdFx0XHQvLyBTYWZhcmkgNS4wIGJ1Z1xuXHRcdFx0dmFyIGFyZ3MgPSBPYmplY3Qua2V5cyhhcmd1bWVudHMpO1xuXHRcdFx0cmV0dXJuIGFyZ3MgJiYgYXJncy5sZW5ndGggPT09IGFyZ3VtZW50cy5sZW5ndGg7XG5cdFx0fSgxLCAyKSk7XG5cdFx0aWYgKCFrZXlzV29ya3NXaXRoQXJndW1lbnRzKSB7XG5cdFx0XHRPYmplY3Qua2V5cyA9IGZ1bmN0aW9uIGtleXMob2JqZWN0KSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgZnVuYy1uYW1lLW1hdGNoaW5nXG5cdFx0XHRcdGlmIChpc0FyZ3Mob2JqZWN0KSkge1xuXHRcdFx0XHRcdHJldHVybiBvcmlnaW5hbEtleXMoc2xpY2UuY2FsbChvYmplY3QpKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gb3JpZ2luYWxLZXlzKG9iamVjdCk7XG5cdFx0XHR9O1xuXHRcdH1cblx0fSBlbHNlIHtcblx0XHRPYmplY3Qua2V5cyA9IGtleXNTaGltO1xuXHR9XG5cdHJldHVybiBPYmplY3Qua2V5cyB8fCBrZXlzU2hpbTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ga2V5c1NoaW07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB0b1N0ciA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNBcmd1bWVudHModmFsdWUpIHtcblx0dmFyIHN0ciA9IHRvU3RyLmNhbGwodmFsdWUpO1xuXHR2YXIgaXNBcmdzID0gc3RyID09PSAnW29iamVjdCBBcmd1bWVudHNdJztcblx0aWYgKCFpc0FyZ3MpIHtcblx0XHRpc0FyZ3MgPSBzdHIgIT09ICdbb2JqZWN0IEFycmF5XScgJiZcblx0XHRcdHZhbHVlICE9PSBudWxsICYmXG5cdFx0XHR0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmXG5cdFx0XHR0eXBlb2YgdmFsdWUubGVuZ3RoID09PSAnbnVtYmVyJyAmJlxuXHRcdFx0dmFsdWUubGVuZ3RoID49IDAgJiZcblx0XHRcdHRvU3RyLmNhbGwodmFsdWUuY2FsbGVlKSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcblx0fVxuXHRyZXR1cm4gaXNBcmdzO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLy8gbW9kaWZpZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vZXMtc2hpbXMvZXM2LXNoaW1cbnZhciBvYmplY3RLZXlzID0gcmVxdWlyZSgnb2JqZWN0LWtleXMnKTtcbnZhciBoYXNTeW1ib2xzID0gcmVxdWlyZSgnaGFzLXN5bWJvbHMvc2hhbXMnKSgpO1xudmFyIGNhbGxCb3VuZCA9IHJlcXVpcmUoJ2NhbGwtYmluZC9jYWxsQm91bmQnKTtcbnZhciB0b09iamVjdCA9IE9iamVjdDtcbnZhciAkcHVzaCA9IGNhbGxCb3VuZCgnQXJyYXkucHJvdG90eXBlLnB1c2gnKTtcbnZhciAkcHJvcElzRW51bWVyYWJsZSA9IGNhbGxCb3VuZCgnT2JqZWN0LnByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZScpO1xudmFyIG9yaWdpbmFsR2V0U3ltYm9scyA9IGhhc1N5bWJvbHMgPyBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzIDogbnVsbDtcblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVudXNlZC12YXJzXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGFzc2lnbih0YXJnZXQsIHNvdXJjZTEpIHtcblx0aWYgKHRhcmdldCA9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ3RhcmdldCBtdXN0IGJlIGFuIG9iamVjdCcpOyB9XG5cdHZhciB0byA9IHRvT2JqZWN0KHRhcmdldCk7IC8vIHN0ZXAgMVxuXHRpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuXHRcdHJldHVybiB0bzsgLy8gc3RlcCAyXG5cdH1cblx0Zm9yICh2YXIgcyA9IDE7IHMgPCBhcmd1bWVudHMubGVuZ3RoOyArK3MpIHtcblx0XHR2YXIgZnJvbSA9IHRvT2JqZWN0KGFyZ3VtZW50c1tzXSk7IC8vIHN0ZXAgMy5hLmlcblxuXHRcdC8vIHN0ZXAgMy5hLmlpOlxuXHRcdHZhciBrZXlzID0gb2JqZWN0S2V5cyhmcm9tKTtcblx0XHR2YXIgZ2V0U3ltYm9scyA9IGhhc1N5bWJvbHMgJiYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMgfHwgb3JpZ2luYWxHZXRTeW1ib2xzKTtcblx0XHRpZiAoZ2V0U3ltYm9scykge1xuXHRcdFx0dmFyIHN5bXMgPSBnZXRTeW1ib2xzKGZyb20pO1xuXHRcdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBzeW1zLmxlbmd0aDsgKytqKSB7XG5cdFx0XHRcdHZhciBrZXkgPSBzeW1zW2pdO1xuXHRcdFx0XHRpZiAoJHByb3BJc0VudW1lcmFibGUoZnJvbSwga2V5KSkge1xuXHRcdFx0XHRcdCRwdXNoKGtleXMsIGtleSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBzdGVwIDMuYS5paWk6XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgKytpKSB7XG5cdFx0XHR2YXIgbmV4dEtleSA9IGtleXNbaV07XG5cdFx0XHRpZiAoJHByb3BJc0VudW1lcmFibGUoZnJvbSwgbmV4dEtleSkpIHsgLy8gc3RlcCAzLmEuaWlpLjJcblx0XHRcdFx0dmFyIHByb3BWYWx1ZSA9IGZyb21bbmV4dEtleV07IC8vIHN0ZXAgMy5hLmlpaS4yLmFcblx0XHRcdFx0dG9bbmV4dEtleV0gPSBwcm9wVmFsdWU7IC8vIHN0ZXAgMy5hLmlpaS4yLmJcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gdG87IC8vIHN0ZXAgNFxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGltcGxlbWVudGF0aW9uID0gcmVxdWlyZSgnLi9pbXBsZW1lbnRhdGlvbicpO1xuXG52YXIgbGFja3NQcm9wZXJFbnVtZXJhdGlvbk9yZGVyID0gZnVuY3Rpb24gKCkge1xuXHRpZiAoIU9iamVjdC5hc3NpZ24pIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblx0Lypcblx0ICogdjgsIHNwZWNpZmljYWxseSBpbiBub2RlIDQueCwgaGFzIGEgYnVnIHdpdGggaW5jb3JyZWN0IHByb3BlcnR5IGVudW1lcmF0aW9uIG9yZGVyXG5cdCAqIG5vdGU6IHRoaXMgZG9lcyBub3QgZGV0ZWN0IHRoZSBidWcgdW5sZXNzIHRoZXJlJ3MgMjAgY2hhcmFjdGVyc1xuXHQgKi9cblx0dmFyIHN0ciA9ICdhYmNkZWZnaGlqa2xtbm9wcXJzdCc7XG5cdHZhciBsZXR0ZXJzID0gc3RyLnNwbGl0KCcnKTtcblx0dmFyIG1hcCA9IHt9O1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IGxldHRlcnMubGVuZ3RoOyArK2kpIHtcblx0XHRtYXBbbGV0dGVyc1tpXV0gPSBsZXR0ZXJzW2ldO1xuXHR9XG5cdHZhciBvYmogPSBPYmplY3QuYXNzaWduKHt9LCBtYXApO1xuXHR2YXIgYWN0dWFsID0gJyc7XG5cdGZvciAodmFyIGsgaW4gb2JqKSB7XG5cdFx0YWN0dWFsICs9IGs7XG5cdH1cblx0cmV0dXJuIHN0ciAhPT0gYWN0dWFsO1xufTtcblxudmFyIGFzc2lnbkhhc1BlbmRpbmdFeGNlcHRpb25zID0gZnVuY3Rpb24gKCkge1xuXHRpZiAoIU9iamVjdC5hc3NpZ24gfHwgIU9iamVjdC5wcmV2ZW50RXh0ZW5zaW9ucykge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXHQvKlxuXHQgKiBGaXJlZm94IDM3IHN0aWxsIGhhcyBcInBlbmRpbmcgZXhjZXB0aW9uXCIgbG9naWMgaW4gaXRzIE9iamVjdC5hc3NpZ24gaW1wbGVtZW50YXRpb24sXG5cdCAqIHdoaWNoIGlzIDcyJSBzbG93ZXIgdGhhbiBvdXIgc2hpbSwgYW5kIEZpcmVmb3ggNDAncyBuYXRpdmUgaW1wbGVtZW50YXRpb24uXG5cdCAqL1xuXHR2YXIgdGhyb3dlciA9IE9iamVjdC5wcmV2ZW50RXh0ZW5zaW9ucyh7IDE6IDIgfSk7XG5cdHRyeSB7XG5cdFx0T2JqZWN0LmFzc2lnbih0aHJvd2VyLCAneHknKTtcblx0fSBjYXRjaCAoZSkge1xuXHRcdHJldHVybiB0aHJvd2VyWzFdID09PSAneSc7XG5cdH1cblx0cmV0dXJuIGZhbHNlO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBnZXRQb2x5ZmlsbCgpIHtcblx0aWYgKCFPYmplY3QuYXNzaWduKSB7XG5cdFx0cmV0dXJuIGltcGxlbWVudGF0aW9uO1xuXHR9XG5cdGlmIChsYWNrc1Byb3BlckVudW1lcmF0aW9uT3JkZXIoKSkge1xuXHRcdHJldHVybiBpbXBsZW1lbnRhdGlvbjtcblx0fVxuXHRpZiAoYXNzaWduSGFzUGVuZGluZ0V4Y2VwdGlvbnMoKSkge1xuXHRcdHJldHVybiBpbXBsZW1lbnRhdGlvbjtcblx0fVxuXHRyZXR1cm4gT2JqZWN0LmFzc2lnbjtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKiBAdHlwZSB7aW1wb3J0KCcuJyl9ICovXG5tb2R1bGUuZXhwb3J0cyA9IFtcblx0J0Zsb2F0MzJBcnJheScsXG5cdCdGbG9hdDY0QXJyYXknLFxuXHQnSW50OEFycmF5Jyxcblx0J0ludDE2QXJyYXknLFxuXHQnSW50MzJBcnJheScsXG5cdCdVaW50OEFycmF5Jyxcblx0J1VpbnQ4Q2xhbXBlZEFycmF5Jyxcblx0J1VpbnQxNkFycmF5Jyxcblx0J1VpbnQzMkFycmF5Jyxcblx0J0JpZ0ludDY0QXJyYXknLFxuXHQnQmlnVWludDY0QXJyYXknXG5dO1xuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbi8vIGNhY2hlZCBmcm9tIHdoYXRldmVyIGdsb2JhbCBpcyBwcmVzZW50IHNvIHRoYXQgdGVzdCBydW5uZXJzIHRoYXQgc3R1YiBpdFxuLy8gZG9uJ3QgYnJlYWsgdGhpbmdzLiAgQnV0IHdlIG5lZWQgdG8gd3JhcCBpdCBpbiBhIHRyeSBjYXRjaCBpbiBjYXNlIGl0IGlzXG4vLyB3cmFwcGVkIGluIHN0cmljdCBtb2RlIGNvZGUgd2hpY2ggZG9lc24ndCBkZWZpbmUgYW55IGdsb2JhbHMuICBJdCdzIGluc2lkZSBhXG4vLyBmdW5jdGlvbiBiZWNhdXNlIHRyeS9jYXRjaGVzIGRlb3B0aW1pemUgaW4gY2VydGFpbiBlbmdpbmVzLlxuXG52YXIgY2FjaGVkU2V0VGltZW91dDtcbnZhciBjYWNoZWRDbGVhclRpbWVvdXQ7XG5cbmZ1bmN0aW9uIGRlZmF1bHRTZXRUaW1vdXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZXRUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG5mdW5jdGlvbiBkZWZhdWx0Q2xlYXJUaW1lb3V0ICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NsZWFyVGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuKGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIHNldFRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIGNsZWFyVGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICB9XG59ICgpKVxuZnVuY3Rpb24gcnVuVGltZW91dChmdW4pIHtcbiAgICBpZiAoY2FjaGVkU2V0VGltZW91dCA9PT0gc2V0VGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgLy8gaWYgc2V0VGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZFNldFRpbWVvdXQgPT09IGRlZmF1bHRTZXRUaW1vdXQgfHwgIWNhY2hlZFNldFRpbWVvdXQpICYmIHNldFRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9IGNhdGNoKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0IHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKG51bGwsIGZ1biwgMCk7XG4gICAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvclxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbCh0aGlzLCBmdW4sIDApO1xuICAgICAgICB9XG4gICAgfVxuXG5cbn1cbmZ1bmN0aW9uIHJ1bkNsZWFyVGltZW91dChtYXJrZXIpIHtcbiAgICBpZiAoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgLy8gaWYgY2xlYXJUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBkZWZhdWx0Q2xlYXJUaW1lb3V0IHx8ICFjYWNoZWRDbGVhclRpbWVvdXQpICYmIGNsZWFyVGltZW91dCkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfSBjYXRjaCAoZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgIHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwobnVsbCwgbWFya2VyKTtcbiAgICAgICAgfSBjYXRjaCAoZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvci5cbiAgICAgICAgICAgIC8vIFNvbWUgdmVyc2lvbnMgb2YgSS5FLiBoYXZlIGRpZmZlcmVudCBydWxlcyBmb3IgY2xlYXJUaW1lb3V0IHZzIHNldFRpbWVvdXRcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbCh0aGlzLCBtYXJrZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG5cblxufVxudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgaWYgKCFkcmFpbmluZyB8fCAhY3VycmVudFF1ZXVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gcnVuVGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgcnVuQ2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgcnVuVGltZW91dChkcmFpblF1ZXVlKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kT25jZUxpc3RlbmVyID0gbm9vcDtcblxucHJvY2Vzcy5saXN0ZW5lcnMgPSBmdW5jdGlvbiAobmFtZSkgeyByZXR1cm4gW10gfVxuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIEdldEludHJpbnNpYyA9IHJlcXVpcmUoJ2dldC1pbnRyaW5zaWMnKTtcbnZhciBkZWZpbmUgPSByZXF1aXJlKCdkZWZpbmUtZGF0YS1wcm9wZXJ0eScpO1xudmFyIGhhc0Rlc2NyaXB0b3JzID0gcmVxdWlyZSgnaGFzLXByb3BlcnR5LWRlc2NyaXB0b3JzJykoKTtcbnZhciBnT1BEID0gcmVxdWlyZSgnZ29wZCcpO1xuXG52YXIgJFR5cGVFcnJvciA9IHJlcXVpcmUoJ2VzLWVycm9ycy90eXBlJyk7XG52YXIgJGZsb29yID0gR2V0SW50cmluc2ljKCclTWF0aC5mbG9vciUnKTtcblxuLyoqIEB0eXBlZGVmIHsoLi4uYXJnczogdW5rbm93bltdKSA9PiB1bmtub3dufSBGdW5jICovXG5cbi8qKiBAdHlwZSB7PFQgZXh0ZW5kcyBGdW5jID0gRnVuYz4oZm46IFQsIGxlbmd0aDogbnVtYmVyLCBsb29zZT86IGJvb2xlYW4pID0+IFR9ICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHNldEZ1bmN0aW9uTGVuZ3RoKGZuLCBsZW5ndGgpIHtcblx0aWYgKHR5cGVvZiBmbiAhPT0gJ2Z1bmN0aW9uJykge1xuXHRcdHRocm93IG5ldyAkVHlwZUVycm9yKCdgZm5gIGlzIG5vdCBhIGZ1bmN0aW9uJyk7XG5cdH1cblx0aWYgKHR5cGVvZiBsZW5ndGggIT09ICdudW1iZXInIHx8IGxlbmd0aCA8IDAgfHwgbGVuZ3RoID4gMHhGRkZGRkZGRiB8fCAkZmxvb3IobGVuZ3RoKSAhPT0gbGVuZ3RoKSB7XG5cdFx0dGhyb3cgbmV3ICRUeXBlRXJyb3IoJ2BsZW5ndGhgIG11c3QgYmUgYSBwb3NpdGl2ZSAzMi1iaXQgaW50ZWdlcicpO1xuXHR9XG5cblx0dmFyIGxvb3NlID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgISFhcmd1bWVudHNbMl07XG5cblx0dmFyIGZ1bmN0aW9uTGVuZ3RoSXNDb25maWd1cmFibGUgPSB0cnVlO1xuXHR2YXIgZnVuY3Rpb25MZW5ndGhJc1dyaXRhYmxlID0gdHJ1ZTtcblx0aWYgKCdsZW5ndGgnIGluIGZuICYmIGdPUEQpIHtcblx0XHR2YXIgZGVzYyA9IGdPUEQoZm4sICdsZW5ndGgnKTtcblx0XHRpZiAoZGVzYyAmJiAhZGVzYy5jb25maWd1cmFibGUpIHtcblx0XHRcdGZ1bmN0aW9uTGVuZ3RoSXNDb25maWd1cmFibGUgPSBmYWxzZTtcblx0XHR9XG5cdFx0aWYgKGRlc2MgJiYgIWRlc2Mud3JpdGFibGUpIHtcblx0XHRcdGZ1bmN0aW9uTGVuZ3RoSXNXcml0YWJsZSA9IGZhbHNlO1xuXHRcdH1cblx0fVxuXG5cdGlmIChmdW5jdGlvbkxlbmd0aElzQ29uZmlndXJhYmxlIHx8IGZ1bmN0aW9uTGVuZ3RoSXNXcml0YWJsZSB8fCAhbG9vc2UpIHtcblx0XHRpZiAoaGFzRGVzY3JpcHRvcnMpIHtcblx0XHRcdGRlZmluZSgvKiogQHR5cGUge1BhcmFtZXRlcnM8ZGVmaW5lPlswXX0gKi8gKGZuKSwgJ2xlbmd0aCcsIGxlbmd0aCwgdHJ1ZSwgdHJ1ZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGRlZmluZSgvKiogQHR5cGUge1BhcmFtZXRlcnM8ZGVmaW5lPlswXX0gKi8gKGZuKSwgJ2xlbmd0aCcsIGxlbmd0aCk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBmbjtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzQnVmZmVyKGFyZykge1xuICByZXR1cm4gYXJnICYmIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnXG4gICAgJiYgdHlwZW9mIGFyZy5jb3B5ID09PSAnZnVuY3Rpb24nXG4gICAgJiYgdHlwZW9mIGFyZy5maWxsID09PSAnZnVuY3Rpb24nXG4gICAgJiYgdHlwZW9mIGFyZy5yZWFkVUludDggPT09ICdmdW5jdGlvbic7XG59IiwiLy8gQ3VycmVudGx5IGluIHN5bmMgd2l0aCBOb2RlLmpzIGxpYi9pbnRlcm5hbC91dGlsL3R5cGVzLmpzXG4vLyBodHRwczovL2dpdGh1Yi5jb20vbm9kZWpzL25vZGUvY29tbWl0LzExMmNjN2MyNzU1MTI1NGFhMmIxNzA5OGZiNzc0ODY3ZjA1ZWQwZDlcblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgaXNBcmd1bWVudHNPYmplY3QgPSByZXF1aXJlKCdpcy1hcmd1bWVudHMnKTtcbnZhciBpc0dlbmVyYXRvckZ1bmN0aW9uID0gcmVxdWlyZSgnaXMtZ2VuZXJhdG9yLWZ1bmN0aW9uJyk7XG52YXIgd2hpY2hUeXBlZEFycmF5ID0gcmVxdWlyZSgnd2hpY2gtdHlwZWQtYXJyYXknKTtcbnZhciBpc1R5cGVkQXJyYXkgPSByZXF1aXJlKCdpcy10eXBlZC1hcnJheScpO1xuXG5mdW5jdGlvbiB1bmN1cnJ5VGhpcyhmKSB7XG4gIHJldHVybiBmLmNhbGwuYmluZChmKTtcbn1cblxudmFyIEJpZ0ludFN1cHBvcnRlZCA9IHR5cGVvZiBCaWdJbnQgIT09ICd1bmRlZmluZWQnO1xudmFyIFN5bWJvbFN1cHBvcnRlZCA9IHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnO1xuXG52YXIgT2JqZWN0VG9TdHJpbmcgPSB1bmN1cnJ5VGhpcyhPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nKTtcblxudmFyIG51bWJlclZhbHVlID0gdW5jdXJyeVRoaXMoTnVtYmVyLnByb3RvdHlwZS52YWx1ZU9mKTtcbnZhciBzdHJpbmdWYWx1ZSA9IHVuY3VycnlUaGlzKFN0cmluZy5wcm90b3R5cGUudmFsdWVPZik7XG52YXIgYm9vbGVhblZhbHVlID0gdW5jdXJyeVRoaXMoQm9vbGVhbi5wcm90b3R5cGUudmFsdWVPZik7XG5cbmlmIChCaWdJbnRTdXBwb3J0ZWQpIHtcbiAgdmFyIGJpZ0ludFZhbHVlID0gdW5jdXJyeVRoaXMoQmlnSW50LnByb3RvdHlwZS52YWx1ZU9mKTtcbn1cblxuaWYgKFN5bWJvbFN1cHBvcnRlZCkge1xuICB2YXIgc3ltYm9sVmFsdWUgPSB1bmN1cnJ5VGhpcyhTeW1ib2wucHJvdG90eXBlLnZhbHVlT2YpO1xufVxuXG5mdW5jdGlvbiBjaGVja0JveGVkUHJpbWl0aXZlKHZhbHVlLCBwcm90b3R5cGVWYWx1ZU9mKSB7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHRyeSB7XG4gICAgcHJvdG90eXBlVmFsdWVPZih2YWx1ZSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gY2F0Y2goZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG5leHBvcnRzLmlzQXJndW1lbnRzT2JqZWN0ID0gaXNBcmd1bWVudHNPYmplY3Q7XG5leHBvcnRzLmlzR2VuZXJhdG9yRnVuY3Rpb24gPSBpc0dlbmVyYXRvckZ1bmN0aW9uO1xuZXhwb3J0cy5pc1R5cGVkQXJyYXkgPSBpc1R5cGVkQXJyYXk7XG5cbi8vIFRha2VuIGZyb20gaGVyZSBhbmQgbW9kaWZpZWQgZm9yIGJldHRlciBicm93c2VyIHN1cHBvcnRcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9zaW5kcmVzb3JodXMvcC1pcy1wcm9taXNlL2Jsb2IvY2RhMzVhNTEzYmRhMDNmOTc3YWQ1Y2RlM2EwNzlkMjM3ZTgyZDdlZi9pbmRleC5qc1xuZnVuY3Rpb24gaXNQcm9taXNlKGlucHV0KSB7XG5cdHJldHVybiAoXG5cdFx0KFxuXHRcdFx0dHlwZW9mIFByb21pc2UgIT09ICd1bmRlZmluZWQnICYmXG5cdFx0XHRpbnB1dCBpbnN0YW5jZW9mIFByb21pc2Vcblx0XHQpIHx8XG5cdFx0KFxuXHRcdFx0aW5wdXQgIT09IG51bGwgJiZcblx0XHRcdHR5cGVvZiBpbnB1dCA9PT0gJ29iamVjdCcgJiZcblx0XHRcdHR5cGVvZiBpbnB1dC50aGVuID09PSAnZnVuY3Rpb24nICYmXG5cdFx0XHR0eXBlb2YgaW5wdXQuY2F0Y2ggPT09ICdmdW5jdGlvbidcblx0XHQpXG5cdCk7XG59XG5leHBvcnRzLmlzUHJvbWlzZSA9IGlzUHJvbWlzZTtcblxuZnVuY3Rpb24gaXNBcnJheUJ1ZmZlclZpZXcodmFsdWUpIHtcbiAgaWYgKHR5cGVvZiBBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcgJiYgQXJyYXlCdWZmZXIuaXNWaWV3KSB7XG4gICAgcmV0dXJuIEFycmF5QnVmZmVyLmlzVmlldyh2YWx1ZSk7XG4gIH1cblxuICByZXR1cm4gKFxuICAgIGlzVHlwZWRBcnJheSh2YWx1ZSkgfHxcbiAgICBpc0RhdGFWaWV3KHZhbHVlKVxuICApO1xufVxuZXhwb3J0cy5pc0FycmF5QnVmZmVyVmlldyA9IGlzQXJyYXlCdWZmZXJWaWV3O1xuXG5cbmZ1bmN0aW9uIGlzVWludDhBcnJheSh2YWx1ZSkge1xuICByZXR1cm4gd2hpY2hUeXBlZEFycmF5KHZhbHVlKSA9PT0gJ1VpbnQ4QXJyYXknO1xufVxuZXhwb3J0cy5pc1VpbnQ4QXJyYXkgPSBpc1VpbnQ4QXJyYXk7XG5cbmZ1bmN0aW9uIGlzVWludDhDbGFtcGVkQXJyYXkodmFsdWUpIHtcbiAgcmV0dXJuIHdoaWNoVHlwZWRBcnJheSh2YWx1ZSkgPT09ICdVaW50OENsYW1wZWRBcnJheSc7XG59XG5leHBvcnRzLmlzVWludDhDbGFtcGVkQXJyYXkgPSBpc1VpbnQ4Q2xhbXBlZEFycmF5O1xuXG5mdW5jdGlvbiBpc1VpbnQxNkFycmF5KHZhbHVlKSB7XG4gIHJldHVybiB3aGljaFR5cGVkQXJyYXkodmFsdWUpID09PSAnVWludDE2QXJyYXknO1xufVxuZXhwb3J0cy5pc1VpbnQxNkFycmF5ID0gaXNVaW50MTZBcnJheTtcblxuZnVuY3Rpb24gaXNVaW50MzJBcnJheSh2YWx1ZSkge1xuICByZXR1cm4gd2hpY2hUeXBlZEFycmF5KHZhbHVlKSA9PT0gJ1VpbnQzMkFycmF5Jztcbn1cbmV4cG9ydHMuaXNVaW50MzJBcnJheSA9IGlzVWludDMyQXJyYXk7XG5cbmZ1bmN0aW9uIGlzSW50OEFycmF5KHZhbHVlKSB7XG4gIHJldHVybiB3aGljaFR5cGVkQXJyYXkodmFsdWUpID09PSAnSW50OEFycmF5Jztcbn1cbmV4cG9ydHMuaXNJbnQ4QXJyYXkgPSBpc0ludDhBcnJheTtcblxuZnVuY3Rpb24gaXNJbnQxNkFycmF5KHZhbHVlKSB7XG4gIHJldHVybiB3aGljaFR5cGVkQXJyYXkodmFsdWUpID09PSAnSW50MTZBcnJheSc7XG59XG5leHBvcnRzLmlzSW50MTZBcnJheSA9IGlzSW50MTZBcnJheTtcblxuZnVuY3Rpb24gaXNJbnQzMkFycmF5KHZhbHVlKSB7XG4gIHJldHVybiB3aGljaFR5cGVkQXJyYXkodmFsdWUpID09PSAnSW50MzJBcnJheSc7XG59XG5leHBvcnRzLmlzSW50MzJBcnJheSA9IGlzSW50MzJBcnJheTtcblxuZnVuY3Rpb24gaXNGbG9hdDMyQXJyYXkodmFsdWUpIHtcbiAgcmV0dXJuIHdoaWNoVHlwZWRBcnJheSh2YWx1ZSkgPT09ICdGbG9hdDMyQXJyYXknO1xufVxuZXhwb3J0cy5pc0Zsb2F0MzJBcnJheSA9IGlzRmxvYXQzMkFycmF5O1xuXG5mdW5jdGlvbiBpc0Zsb2F0NjRBcnJheSh2YWx1ZSkge1xuICByZXR1cm4gd2hpY2hUeXBlZEFycmF5KHZhbHVlKSA9PT0gJ0Zsb2F0NjRBcnJheSc7XG59XG5leHBvcnRzLmlzRmxvYXQ2NEFycmF5ID0gaXNGbG9hdDY0QXJyYXk7XG5cbmZ1bmN0aW9uIGlzQmlnSW50NjRBcnJheSh2YWx1ZSkge1xuICByZXR1cm4gd2hpY2hUeXBlZEFycmF5KHZhbHVlKSA9PT0gJ0JpZ0ludDY0QXJyYXknO1xufVxuZXhwb3J0cy5pc0JpZ0ludDY0QXJyYXkgPSBpc0JpZ0ludDY0QXJyYXk7XG5cbmZ1bmN0aW9uIGlzQmlnVWludDY0QXJyYXkodmFsdWUpIHtcbiAgcmV0dXJuIHdoaWNoVHlwZWRBcnJheSh2YWx1ZSkgPT09ICdCaWdVaW50NjRBcnJheSc7XG59XG5leHBvcnRzLmlzQmlnVWludDY0QXJyYXkgPSBpc0JpZ1VpbnQ2NEFycmF5O1xuXG5mdW5jdGlvbiBpc01hcFRvU3RyaW5nKHZhbHVlKSB7XG4gIHJldHVybiBPYmplY3RUb1N0cmluZyh2YWx1ZSkgPT09ICdbb2JqZWN0IE1hcF0nO1xufVxuaXNNYXBUb1N0cmluZy53b3JraW5nID0gKFxuICB0eXBlb2YgTWFwICE9PSAndW5kZWZpbmVkJyAmJlxuICBpc01hcFRvU3RyaW5nKG5ldyBNYXAoKSlcbik7XG5cbmZ1bmN0aW9uIGlzTWFwKHZhbHVlKSB7XG4gIGlmICh0eXBlb2YgTWFwID09PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiBpc01hcFRvU3RyaW5nLndvcmtpbmdcbiAgICA/IGlzTWFwVG9TdHJpbmcodmFsdWUpXG4gICAgOiB2YWx1ZSBpbnN0YW5jZW9mIE1hcDtcbn1cbmV4cG9ydHMuaXNNYXAgPSBpc01hcDtcblxuZnVuY3Rpb24gaXNTZXRUb1N0cmluZyh2YWx1ZSkge1xuICByZXR1cm4gT2JqZWN0VG9TdHJpbmcodmFsdWUpID09PSAnW29iamVjdCBTZXRdJztcbn1cbmlzU2V0VG9TdHJpbmcud29ya2luZyA9IChcbiAgdHlwZW9mIFNldCAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgaXNTZXRUb1N0cmluZyhuZXcgU2V0KCkpXG4pO1xuZnVuY3Rpb24gaXNTZXQodmFsdWUpIHtcbiAgaWYgKHR5cGVvZiBTZXQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIGlzU2V0VG9TdHJpbmcud29ya2luZ1xuICAgID8gaXNTZXRUb1N0cmluZyh2YWx1ZSlcbiAgICA6IHZhbHVlIGluc3RhbmNlb2YgU2V0O1xufVxuZXhwb3J0cy5pc1NldCA9IGlzU2V0O1xuXG5mdW5jdGlvbiBpc1dlYWtNYXBUb1N0cmluZyh2YWx1ZSkge1xuICByZXR1cm4gT2JqZWN0VG9TdHJpbmcodmFsdWUpID09PSAnW29iamVjdCBXZWFrTWFwXSc7XG59XG5pc1dlYWtNYXBUb1N0cmluZy53b3JraW5nID0gKFxuICB0eXBlb2YgV2Vha01hcCAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgaXNXZWFrTWFwVG9TdHJpbmcobmV3IFdlYWtNYXAoKSlcbik7XG5mdW5jdGlvbiBpc1dlYWtNYXAodmFsdWUpIHtcbiAgaWYgKHR5cGVvZiBXZWFrTWFwID09PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiBpc1dlYWtNYXBUb1N0cmluZy53b3JraW5nXG4gICAgPyBpc1dlYWtNYXBUb1N0cmluZyh2YWx1ZSlcbiAgICA6IHZhbHVlIGluc3RhbmNlb2YgV2Vha01hcDtcbn1cbmV4cG9ydHMuaXNXZWFrTWFwID0gaXNXZWFrTWFwO1xuXG5mdW5jdGlvbiBpc1dlYWtTZXRUb1N0cmluZyh2YWx1ZSkge1xuICByZXR1cm4gT2JqZWN0VG9TdHJpbmcodmFsdWUpID09PSAnW29iamVjdCBXZWFrU2V0XSc7XG59XG5pc1dlYWtTZXRUb1N0cmluZy53b3JraW5nID0gKFxuICB0eXBlb2YgV2Vha1NldCAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgaXNXZWFrU2V0VG9TdHJpbmcobmV3IFdlYWtTZXQoKSlcbik7XG5mdW5jdGlvbiBpc1dlYWtTZXQodmFsdWUpIHtcbiAgcmV0dXJuIGlzV2Vha1NldFRvU3RyaW5nKHZhbHVlKTtcbn1cbmV4cG9ydHMuaXNXZWFrU2V0ID0gaXNXZWFrU2V0O1xuXG5mdW5jdGlvbiBpc0FycmF5QnVmZmVyVG9TdHJpbmcodmFsdWUpIHtcbiAgcmV0dXJuIE9iamVjdFRvU3RyaW5nKHZhbHVlKSA9PT0gJ1tvYmplY3QgQXJyYXlCdWZmZXJdJztcbn1cbmlzQXJyYXlCdWZmZXJUb1N0cmluZy53b3JraW5nID0gKFxuICB0eXBlb2YgQXJyYXlCdWZmZXIgIT09ICd1bmRlZmluZWQnICYmXG4gIGlzQXJyYXlCdWZmZXJUb1N0cmluZyhuZXcgQXJyYXlCdWZmZXIoKSlcbik7XG5mdW5jdGlvbiBpc0FycmF5QnVmZmVyKHZhbHVlKSB7XG4gIGlmICh0eXBlb2YgQXJyYXlCdWZmZXIgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIGlzQXJyYXlCdWZmZXJUb1N0cmluZy53b3JraW5nXG4gICAgPyBpc0FycmF5QnVmZmVyVG9TdHJpbmcodmFsdWUpXG4gICAgOiB2YWx1ZSBpbnN0YW5jZW9mIEFycmF5QnVmZmVyO1xufVxuZXhwb3J0cy5pc0FycmF5QnVmZmVyID0gaXNBcnJheUJ1ZmZlcjtcblxuZnVuY3Rpb24gaXNEYXRhVmlld1RvU3RyaW5nKHZhbHVlKSB7XG4gIHJldHVybiBPYmplY3RUb1N0cmluZyh2YWx1ZSkgPT09ICdbb2JqZWN0IERhdGFWaWV3XSc7XG59XG5pc0RhdGFWaWV3VG9TdHJpbmcud29ya2luZyA9IChcbiAgdHlwZW9mIEFycmF5QnVmZmVyICE9PSAndW5kZWZpbmVkJyAmJlxuICB0eXBlb2YgRGF0YVZpZXcgIT09ICd1bmRlZmluZWQnICYmXG4gIGlzRGF0YVZpZXdUb1N0cmluZyhuZXcgRGF0YVZpZXcobmV3IEFycmF5QnVmZmVyKDEpLCAwLCAxKSlcbik7XG5mdW5jdGlvbiBpc0RhdGFWaWV3KHZhbHVlKSB7XG4gIGlmICh0eXBlb2YgRGF0YVZpZXcgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIGlzRGF0YVZpZXdUb1N0cmluZy53b3JraW5nXG4gICAgPyBpc0RhdGFWaWV3VG9TdHJpbmcodmFsdWUpXG4gICAgOiB2YWx1ZSBpbnN0YW5jZW9mIERhdGFWaWV3O1xufVxuZXhwb3J0cy5pc0RhdGFWaWV3ID0gaXNEYXRhVmlldztcblxuLy8gU3RvcmUgYSBjb3B5IG9mIFNoYXJlZEFycmF5QnVmZmVyIGluIGNhc2UgaXQncyBkZWxldGVkIGVsc2V3aGVyZVxudmFyIFNoYXJlZEFycmF5QnVmZmVyQ29weSA9IHR5cGVvZiBTaGFyZWRBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcgPyBTaGFyZWRBcnJheUJ1ZmZlciA6IHVuZGVmaW5lZDtcbmZ1bmN0aW9uIGlzU2hhcmVkQXJyYXlCdWZmZXJUb1N0cmluZyh2YWx1ZSkge1xuICByZXR1cm4gT2JqZWN0VG9TdHJpbmcodmFsdWUpID09PSAnW29iamVjdCBTaGFyZWRBcnJheUJ1ZmZlcl0nO1xufVxuZnVuY3Rpb24gaXNTaGFyZWRBcnJheUJ1ZmZlcih2YWx1ZSkge1xuICBpZiAodHlwZW9mIFNoYXJlZEFycmF5QnVmZmVyQ29weSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAodHlwZW9mIGlzU2hhcmVkQXJyYXlCdWZmZXJUb1N0cmluZy53b3JraW5nID09PSAndW5kZWZpbmVkJykge1xuICAgIGlzU2hhcmVkQXJyYXlCdWZmZXJUb1N0cmluZy53b3JraW5nID0gaXNTaGFyZWRBcnJheUJ1ZmZlclRvU3RyaW5nKG5ldyBTaGFyZWRBcnJheUJ1ZmZlckNvcHkoKSk7XG4gIH1cblxuICByZXR1cm4gaXNTaGFyZWRBcnJheUJ1ZmZlclRvU3RyaW5nLndvcmtpbmdcbiAgICA/IGlzU2hhcmVkQXJyYXlCdWZmZXJUb1N0cmluZyh2YWx1ZSlcbiAgICA6IHZhbHVlIGluc3RhbmNlb2YgU2hhcmVkQXJyYXlCdWZmZXJDb3B5O1xufVxuZXhwb3J0cy5pc1NoYXJlZEFycmF5QnVmZmVyID0gaXNTaGFyZWRBcnJheUJ1ZmZlcjtcblxuZnVuY3Rpb24gaXNBc3luY0Z1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiBPYmplY3RUb1N0cmluZyh2YWx1ZSkgPT09ICdbb2JqZWN0IEFzeW5jRnVuY3Rpb25dJztcbn1cbmV4cG9ydHMuaXNBc3luY0Z1bmN0aW9uID0gaXNBc3luY0Z1bmN0aW9uO1xuXG5mdW5jdGlvbiBpc01hcEl0ZXJhdG9yKHZhbHVlKSB7XG4gIHJldHVybiBPYmplY3RUb1N0cmluZyh2YWx1ZSkgPT09ICdbb2JqZWN0IE1hcCBJdGVyYXRvcl0nO1xufVxuZXhwb3J0cy5pc01hcEl0ZXJhdG9yID0gaXNNYXBJdGVyYXRvcjtcblxuZnVuY3Rpb24gaXNTZXRJdGVyYXRvcih2YWx1ZSkge1xuICByZXR1cm4gT2JqZWN0VG9TdHJpbmcodmFsdWUpID09PSAnW29iamVjdCBTZXQgSXRlcmF0b3JdJztcbn1cbmV4cG9ydHMuaXNTZXRJdGVyYXRvciA9IGlzU2V0SXRlcmF0b3I7XG5cbmZ1bmN0aW9uIGlzR2VuZXJhdG9yT2JqZWN0KHZhbHVlKSB7XG4gIHJldHVybiBPYmplY3RUb1N0cmluZyh2YWx1ZSkgPT09ICdbb2JqZWN0IEdlbmVyYXRvcl0nO1xufVxuZXhwb3J0cy5pc0dlbmVyYXRvck9iamVjdCA9IGlzR2VuZXJhdG9yT2JqZWN0O1xuXG5mdW5jdGlvbiBpc1dlYkFzc2VtYmx5Q29tcGlsZWRNb2R1bGUodmFsdWUpIHtcbiAgcmV0dXJuIE9iamVjdFRvU3RyaW5nKHZhbHVlKSA9PT0gJ1tvYmplY3QgV2ViQXNzZW1ibHkuTW9kdWxlXSc7XG59XG5leHBvcnRzLmlzV2ViQXNzZW1ibHlDb21waWxlZE1vZHVsZSA9IGlzV2ViQXNzZW1ibHlDb21waWxlZE1vZHVsZTtcblxuZnVuY3Rpb24gaXNOdW1iZXJPYmplY3QodmFsdWUpIHtcbiAgcmV0dXJuIGNoZWNrQm94ZWRQcmltaXRpdmUodmFsdWUsIG51bWJlclZhbHVlKTtcbn1cbmV4cG9ydHMuaXNOdW1iZXJPYmplY3QgPSBpc051bWJlck9iamVjdDtcblxuZnVuY3Rpb24gaXNTdHJpbmdPYmplY3QodmFsdWUpIHtcbiAgcmV0dXJuIGNoZWNrQm94ZWRQcmltaXRpdmUodmFsdWUsIHN0cmluZ1ZhbHVlKTtcbn1cbmV4cG9ydHMuaXNTdHJpbmdPYmplY3QgPSBpc1N0cmluZ09iamVjdDtcblxuZnVuY3Rpb24gaXNCb29sZWFuT2JqZWN0KHZhbHVlKSB7XG4gIHJldHVybiBjaGVja0JveGVkUHJpbWl0aXZlKHZhbHVlLCBib29sZWFuVmFsdWUpO1xufVxuZXhwb3J0cy5pc0Jvb2xlYW5PYmplY3QgPSBpc0Jvb2xlYW5PYmplY3Q7XG5cbmZ1bmN0aW9uIGlzQmlnSW50T2JqZWN0KHZhbHVlKSB7XG4gIHJldHVybiBCaWdJbnRTdXBwb3J0ZWQgJiYgY2hlY2tCb3hlZFByaW1pdGl2ZSh2YWx1ZSwgYmlnSW50VmFsdWUpO1xufVxuZXhwb3J0cy5pc0JpZ0ludE9iamVjdCA9IGlzQmlnSW50T2JqZWN0O1xuXG5mdW5jdGlvbiBpc1N5bWJvbE9iamVjdCh2YWx1ZSkge1xuICByZXR1cm4gU3ltYm9sU3VwcG9ydGVkICYmIGNoZWNrQm94ZWRQcmltaXRpdmUodmFsdWUsIHN5bWJvbFZhbHVlKTtcbn1cbmV4cG9ydHMuaXNTeW1ib2xPYmplY3QgPSBpc1N5bWJvbE9iamVjdDtcblxuZnVuY3Rpb24gaXNCb3hlZFByaW1pdGl2ZSh2YWx1ZSkge1xuICByZXR1cm4gKFxuICAgIGlzTnVtYmVyT2JqZWN0KHZhbHVlKSB8fFxuICAgIGlzU3RyaW5nT2JqZWN0KHZhbHVlKSB8fFxuICAgIGlzQm9vbGVhbk9iamVjdCh2YWx1ZSkgfHxcbiAgICBpc0JpZ0ludE9iamVjdCh2YWx1ZSkgfHxcbiAgICBpc1N5bWJvbE9iamVjdCh2YWx1ZSlcbiAgKTtcbn1cbmV4cG9ydHMuaXNCb3hlZFByaW1pdGl2ZSA9IGlzQm94ZWRQcmltaXRpdmU7XG5cbmZ1bmN0aW9uIGlzQW55QXJyYXlCdWZmZXIodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiBVaW50OEFycmF5ICE9PSAndW5kZWZpbmVkJyAmJiAoXG4gICAgaXNBcnJheUJ1ZmZlcih2YWx1ZSkgfHxcbiAgICBpc1NoYXJlZEFycmF5QnVmZmVyKHZhbHVlKVxuICApO1xufVxuZXhwb3J0cy5pc0FueUFycmF5QnVmZmVyID0gaXNBbnlBcnJheUJ1ZmZlcjtcblxuWydpc1Byb3h5JywgJ2lzRXh0ZXJuYWwnLCAnaXNNb2R1bGVOYW1lc3BhY2VPYmplY3QnXS5mb3JFYWNoKGZ1bmN0aW9uKG1ldGhvZCkge1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbWV0aG9kLCB7XG4gICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgdmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKG1ldGhvZCArICcgaXMgbm90IHN1cHBvcnRlZCBpbiB1c2VybGFuZCcpO1xuICAgIH1cbiAgfSk7XG59KTtcbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG52YXIgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzIHx8XG4gIGZ1bmN0aW9uIGdldE93blByb3BlcnR5RGVzY3JpcHRvcnMob2JqKSB7XG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvYmopO1xuICAgIHZhciBkZXNjcmlwdG9ycyA9IHt9O1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgZGVzY3JpcHRvcnNba2V5c1tpXV0gPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iaiwga2V5c1tpXSk7XG4gICAgfVxuICAgIHJldHVybiBkZXNjcmlwdG9ycztcbiAgfTtcblxudmFyIGZvcm1hdFJlZ0V4cCA9IC8lW3NkaiVdL2c7XG5leHBvcnRzLmZvcm1hdCA9IGZ1bmN0aW9uKGYpIHtcbiAgaWYgKCFpc1N0cmluZyhmKSkge1xuICAgIHZhciBvYmplY3RzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIG9iamVjdHMucHVzaChpbnNwZWN0KGFyZ3VtZW50c1tpXSkpO1xuICAgIH1cbiAgICByZXR1cm4gb2JqZWN0cy5qb2luKCcgJyk7XG4gIH1cblxuICB2YXIgaSA9IDE7XG4gIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICB2YXIgbGVuID0gYXJncy5sZW5ndGg7XG4gIHZhciBzdHIgPSBTdHJpbmcoZikucmVwbGFjZShmb3JtYXRSZWdFeHAsIGZ1bmN0aW9uKHgpIHtcbiAgICBpZiAoeCA9PT0gJyUlJykgcmV0dXJuICclJztcbiAgICBpZiAoaSA+PSBsZW4pIHJldHVybiB4O1xuICAgIHN3aXRjaCAoeCkge1xuICAgICAgY2FzZSAnJXMnOiByZXR1cm4gU3RyaW5nKGFyZ3NbaSsrXSk7XG4gICAgICBjYXNlICclZCc6IHJldHVybiBOdW1iZXIoYXJnc1tpKytdKTtcbiAgICAgIGNhc2UgJyVqJzpcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoYXJnc1tpKytdKTtcbiAgICAgICAgfSBjYXRjaCAoXykge1xuICAgICAgICAgIHJldHVybiAnW0NpcmN1bGFyXSc7XG4gICAgICAgIH1cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiB4O1xuICAgIH1cbiAgfSk7XG4gIGZvciAodmFyIHggPSBhcmdzW2ldOyBpIDwgbGVuOyB4ID0gYXJnc1srK2ldKSB7XG4gICAgaWYgKGlzTnVsbCh4KSB8fCAhaXNPYmplY3QoeCkpIHtcbiAgICAgIHN0ciArPSAnICcgKyB4O1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgKz0gJyAnICsgaW5zcGVjdCh4KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHN0cjtcbn07XG5cblxuLy8gTWFyayB0aGF0IGEgbWV0aG9kIHNob3VsZCBub3QgYmUgdXNlZC5cbi8vIFJldHVybnMgYSBtb2RpZmllZCBmdW5jdGlvbiB3aGljaCB3YXJucyBvbmNlIGJ5IGRlZmF1bHQuXG4vLyBJZiAtLW5vLWRlcHJlY2F0aW9uIGlzIHNldCwgdGhlbiBpdCBpcyBhIG5vLW9wLlxuZXhwb3J0cy5kZXByZWNhdGUgPSBmdW5jdGlvbihmbiwgbXNnKSB7XG4gIGlmICh0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgcHJvY2Vzcy5ub0RlcHJlY2F0aW9uID09PSB0cnVlKSB7XG4gICAgcmV0dXJuIGZuO1xuICB9XG5cbiAgLy8gQWxsb3cgZm9yIGRlcHJlY2F0aW5nIHRoaW5ncyBpbiB0aGUgcHJvY2VzcyBvZiBzdGFydGluZyB1cC5cbiAgaWYgKHR5cGVvZiBwcm9jZXNzID09PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBleHBvcnRzLmRlcHJlY2F0ZShmbiwgbXNnKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH1cblxuICB2YXIgd2FybmVkID0gZmFsc2U7XG4gIGZ1bmN0aW9uIGRlcHJlY2F0ZWQoKSB7XG4gICAgaWYgKCF3YXJuZWQpIHtcbiAgICAgIGlmIChwcm9jZXNzLnRocm93RGVwcmVjYXRpb24pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1zZyk7XG4gICAgICB9IGVsc2UgaWYgKHByb2Nlc3MudHJhY2VEZXByZWNhdGlvbikge1xuICAgICAgICBjb25zb2xlLnRyYWNlKG1zZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKG1zZyk7XG4gICAgICB9XG4gICAgICB3YXJuZWQgPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIHJldHVybiBkZXByZWNhdGVkO1xufTtcblxuXG52YXIgZGVidWdzID0ge307XG52YXIgZGVidWdFbnZSZWdleCA9IC9eJC87XG5cbmlmIChwcm9jZXNzLmVudi5OT0RFX0RFQlVHKSB7XG4gIHZhciBkZWJ1Z0VudiA9IHByb2Nlc3MuZW52Lk5PREVfREVCVUc7XG4gIGRlYnVnRW52ID0gZGVidWdFbnYucmVwbGFjZSgvW3xcXFxce30oKVtcXF1eJCs/Ll0vZywgJ1xcXFwkJicpXG4gICAgLnJlcGxhY2UoL1xcKi9nLCAnLionKVxuICAgIC5yZXBsYWNlKC8sL2csICckfF4nKVxuICAgIC50b1VwcGVyQ2FzZSgpO1xuICBkZWJ1Z0VudlJlZ2V4ID0gbmV3IFJlZ0V4cCgnXicgKyBkZWJ1Z0VudiArICckJywgJ2knKTtcbn1cbmV4cG9ydHMuZGVidWdsb2cgPSBmdW5jdGlvbihzZXQpIHtcbiAgc2V0ID0gc2V0LnRvVXBwZXJDYXNlKCk7XG4gIGlmICghZGVidWdzW3NldF0pIHtcbiAgICBpZiAoZGVidWdFbnZSZWdleC50ZXN0KHNldCkpIHtcbiAgICAgIHZhciBwaWQgPSBwcm9jZXNzLnBpZDtcbiAgICAgIGRlYnVnc1tzZXRdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBtc2cgPSBleHBvcnRzLmZvcm1hdC5hcHBseShleHBvcnRzLCBhcmd1bWVudHMpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCclcyAlZDogJXMnLCBzZXQsIHBpZCwgbXNnKTtcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlYnVnc1tzZXRdID0gZnVuY3Rpb24oKSB7fTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGRlYnVnc1tzZXRdO1xufTtcblxuXG4vKipcbiAqIEVjaG9zIHRoZSB2YWx1ZSBvZiBhIHZhbHVlLiBUcnlzIHRvIHByaW50IHRoZSB2YWx1ZSBvdXRcbiAqIGluIHRoZSBiZXN0IHdheSBwb3NzaWJsZSBnaXZlbiB0aGUgZGlmZmVyZW50IHR5cGVzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogVGhlIG9iamVjdCB0byBwcmludCBvdXQuXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0cyBPcHRpb25hbCBvcHRpb25zIG9iamVjdCB0aGF0IGFsdGVycyB0aGUgb3V0cHV0LlxuICovXG4vKiBsZWdhY3k6IG9iaiwgc2hvd0hpZGRlbiwgZGVwdGgsIGNvbG9ycyovXG5mdW5jdGlvbiBpbnNwZWN0KG9iaiwgb3B0cykge1xuICAvLyBkZWZhdWx0IG9wdGlvbnNcbiAgdmFyIGN0eCA9IHtcbiAgICBzZWVuOiBbXSxcbiAgICBzdHlsaXplOiBzdHlsaXplTm9Db2xvclxuICB9O1xuICAvLyBsZWdhY3kuLi5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gMykgY3R4LmRlcHRoID0gYXJndW1lbnRzWzJdO1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSA0KSBjdHguY29sb3JzID0gYXJndW1lbnRzWzNdO1xuICBpZiAoaXNCb29sZWFuKG9wdHMpKSB7XG4gICAgLy8gbGVnYWN5Li4uXG4gICAgY3R4LnNob3dIaWRkZW4gPSBvcHRzO1xuICB9IGVsc2UgaWYgKG9wdHMpIHtcbiAgICAvLyBnb3QgYW4gXCJvcHRpb25zXCIgb2JqZWN0XG4gICAgZXhwb3J0cy5fZXh0ZW5kKGN0eCwgb3B0cyk7XG4gIH1cbiAgLy8gc2V0IGRlZmF1bHQgb3B0aW9uc1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LnNob3dIaWRkZW4pKSBjdHguc2hvd0hpZGRlbiA9IGZhbHNlO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmRlcHRoKSkgY3R4LmRlcHRoID0gMjtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5jb2xvcnMpKSBjdHguY29sb3JzID0gZmFsc2U7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguY3VzdG9tSW5zcGVjdCkpIGN0eC5jdXN0b21JbnNwZWN0ID0gdHJ1ZTtcbiAgaWYgKGN0eC5jb2xvcnMpIGN0eC5zdHlsaXplID0gc3R5bGl6ZVdpdGhDb2xvcjtcbiAgcmV0dXJuIGZvcm1hdFZhbHVlKGN0eCwgb2JqLCBjdHguZGVwdGgpO1xufVxuZXhwb3J0cy5pbnNwZWN0ID0gaW5zcGVjdDtcblxuXG4vLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0FOU0lfZXNjYXBlX2NvZGUjZ3JhcGhpY3Ncbmluc3BlY3QuY29sb3JzID0ge1xuICAnYm9sZCcgOiBbMSwgMjJdLFxuICAnaXRhbGljJyA6IFszLCAyM10sXG4gICd1bmRlcmxpbmUnIDogWzQsIDI0XSxcbiAgJ2ludmVyc2UnIDogWzcsIDI3XSxcbiAgJ3doaXRlJyA6IFszNywgMzldLFxuICAnZ3JleScgOiBbOTAsIDM5XSxcbiAgJ2JsYWNrJyA6IFszMCwgMzldLFxuICAnYmx1ZScgOiBbMzQsIDM5XSxcbiAgJ2N5YW4nIDogWzM2LCAzOV0sXG4gICdncmVlbicgOiBbMzIsIDM5XSxcbiAgJ21hZ2VudGEnIDogWzM1LCAzOV0sXG4gICdyZWQnIDogWzMxLCAzOV0sXG4gICd5ZWxsb3cnIDogWzMzLCAzOV1cbn07XG5cbi8vIERvbid0IHVzZSAnYmx1ZScgbm90IHZpc2libGUgb24gY21kLmV4ZVxuaW5zcGVjdC5zdHlsZXMgPSB7XG4gICdzcGVjaWFsJzogJ2N5YW4nLFxuICAnbnVtYmVyJzogJ3llbGxvdycsXG4gICdib29sZWFuJzogJ3llbGxvdycsXG4gICd1bmRlZmluZWQnOiAnZ3JleScsXG4gICdudWxsJzogJ2JvbGQnLFxuICAnc3RyaW5nJzogJ2dyZWVuJyxcbiAgJ2RhdGUnOiAnbWFnZW50YScsXG4gIC8vIFwibmFtZVwiOiBpbnRlbnRpb25hbGx5IG5vdCBzdHlsaW5nXG4gICdyZWdleHAnOiAncmVkJ1xufTtcblxuXG5mdW5jdGlvbiBzdHlsaXplV2l0aENvbG9yKHN0ciwgc3R5bGVUeXBlKSB7XG4gIHZhciBzdHlsZSA9IGluc3BlY3Quc3R5bGVzW3N0eWxlVHlwZV07XG5cbiAgaWYgKHN0eWxlKSB7XG4gICAgcmV0dXJuICdcXHUwMDFiWycgKyBpbnNwZWN0LmNvbG9yc1tzdHlsZV1bMF0gKyAnbScgKyBzdHIgK1xuICAgICAgICAgICAnXFx1MDAxYlsnICsgaW5zcGVjdC5jb2xvcnNbc3R5bGVdWzFdICsgJ20nO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBzdHI7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBzdHlsaXplTm9Db2xvcihzdHIsIHN0eWxlVHlwZSkge1xuICByZXR1cm4gc3RyO1xufVxuXG5cbmZ1bmN0aW9uIGFycmF5VG9IYXNoKGFycmF5KSB7XG4gIHZhciBoYXNoID0ge307XG5cbiAgYXJyYXkuZm9yRWFjaChmdW5jdGlvbih2YWwsIGlkeCkge1xuICAgIGhhc2hbdmFsXSA9IHRydWU7XG4gIH0pO1xuXG4gIHJldHVybiBoYXNoO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFZhbHVlKGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcykge1xuICAvLyBQcm92aWRlIGEgaG9vayBmb3IgdXNlci1zcGVjaWZpZWQgaW5zcGVjdCBmdW5jdGlvbnMuXG4gIC8vIENoZWNrIHRoYXQgdmFsdWUgaXMgYW4gb2JqZWN0IHdpdGggYW4gaW5zcGVjdCBmdW5jdGlvbiBvbiBpdFxuICBpZiAoY3R4LmN1c3RvbUluc3BlY3QgJiZcbiAgICAgIHZhbHVlICYmXG4gICAgICBpc0Z1bmN0aW9uKHZhbHVlLmluc3BlY3QpICYmXG4gICAgICAvLyBGaWx0ZXIgb3V0IHRoZSB1dGlsIG1vZHVsZSwgaXQncyBpbnNwZWN0IGZ1bmN0aW9uIGlzIHNwZWNpYWxcbiAgICAgIHZhbHVlLmluc3BlY3QgIT09IGV4cG9ydHMuaW5zcGVjdCAmJlxuICAgICAgLy8gQWxzbyBmaWx0ZXIgb3V0IGFueSBwcm90b3R5cGUgb2JqZWN0cyB1c2luZyB0aGUgY2lyY3VsYXIgY2hlY2suXG4gICAgICAhKHZhbHVlLmNvbnN0cnVjdG9yICYmIHZhbHVlLmNvbnN0cnVjdG9yLnByb3RvdHlwZSA9PT0gdmFsdWUpKSB7XG4gICAgdmFyIHJldCA9IHZhbHVlLmluc3BlY3QocmVjdXJzZVRpbWVzLCBjdHgpO1xuICAgIGlmICghaXNTdHJpbmcocmV0KSkge1xuICAgICAgcmV0ID0gZm9ybWF0VmFsdWUoY3R4LCByZXQsIHJlY3Vyc2VUaW1lcyk7XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICAvLyBQcmltaXRpdmUgdHlwZXMgY2Fubm90IGhhdmUgcHJvcGVydGllc1xuICB2YXIgcHJpbWl0aXZlID0gZm9ybWF0UHJpbWl0aXZlKGN0eCwgdmFsdWUpO1xuICBpZiAocHJpbWl0aXZlKSB7XG4gICAgcmV0dXJuIHByaW1pdGl2ZTtcbiAgfVxuXG4gIC8vIExvb2sgdXAgdGhlIGtleXMgb2YgdGhlIG9iamVjdC5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh2YWx1ZSk7XG4gIHZhciB2aXNpYmxlS2V5cyA9IGFycmF5VG9IYXNoKGtleXMpO1xuXG4gIGlmIChjdHguc2hvd0hpZGRlbikge1xuICAgIGtleXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh2YWx1ZSk7XG4gIH1cblxuICAvLyBJRSBkb2Vzbid0IG1ha2UgZXJyb3IgZmllbGRzIG5vbi1lbnVtZXJhYmxlXG4gIC8vIGh0dHA6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS9pZS9kd3c1MnNidCh2PXZzLjk0KS5hc3B4XG4gIGlmIChpc0Vycm9yKHZhbHVlKVxuICAgICAgJiYgKGtleXMuaW5kZXhPZignbWVzc2FnZScpID49IDAgfHwga2V5cy5pbmRleE9mKCdkZXNjcmlwdGlvbicpID49IDApKSB7XG4gICAgcmV0dXJuIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgfVxuXG4gIC8vIFNvbWUgdHlwZSBvZiBvYmplY3Qgd2l0aG91dCBwcm9wZXJ0aWVzIGNhbiBiZSBzaG9ydGN1dHRlZC5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgICB2YXIgbmFtZSA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKCdbRnVuY3Rpb24nICsgbmFtZSArICddJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdyZWdleHAnKTtcbiAgICB9XG4gICAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShEYXRlLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ2RhdGUnKTtcbiAgICB9XG4gICAgaWYgKGlzRXJyb3IodmFsdWUpKSB7XG4gICAgICByZXR1cm4gZm9ybWF0RXJyb3IodmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBiYXNlID0gJycsIGFycmF5ID0gZmFsc2UsIGJyYWNlcyA9IFsneycsICd9J107XG5cbiAgLy8gTWFrZSBBcnJheSBzYXkgdGhhdCB0aGV5IGFyZSBBcnJheVxuICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICBhcnJheSA9IHRydWU7XG4gICAgYnJhY2VzID0gWydbJywgJ10nXTtcbiAgfVxuXG4gIC8vIE1ha2UgZnVuY3Rpb25zIHNheSB0aGF0IHRoZXkgYXJlIGZ1bmN0aW9uc1xuICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICB2YXIgbiA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgIGJhc2UgPSAnIFtGdW5jdGlvbicgKyBuICsgJ10nO1xuICB9XG5cbiAgLy8gTWFrZSBSZWdFeHBzIHNheSB0aGF0IHRoZXkgYXJlIFJlZ0V4cHNcbiAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBkYXRlcyB3aXRoIHByb3BlcnRpZXMgZmlyc3Qgc2F5IHRoZSBkYXRlXG4gIGlmIChpc0RhdGUodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIERhdGUucHJvdG90eXBlLnRvVVRDU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBlcnJvciB3aXRoIG1lc3NhZ2UgZmlyc3Qgc2F5IHRoZSBlcnJvclxuICBpZiAoaXNFcnJvcih2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgZm9ybWF0RXJyb3IodmFsdWUpO1xuICB9XG5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwICYmICghYXJyYXkgfHwgdmFsdWUubGVuZ3RoID09IDApKSB7XG4gICAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyBicmFjZXNbMV07XG4gIH1cblxuICBpZiAocmVjdXJzZVRpbWVzIDwgMCkge1xuICAgIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAncmVnZXhwJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZSgnW09iamVjdF0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuXG4gIGN0eC5zZWVuLnB1c2godmFsdWUpO1xuXG4gIHZhciBvdXRwdXQ7XG4gIGlmIChhcnJheSkge1xuICAgIG91dHB1dCA9IGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpO1xuICB9IGVsc2Uge1xuICAgIG91dHB1dCA9IGtleXMubWFwKGZ1bmN0aW9uKGtleSkge1xuICAgICAgcmV0dXJuIGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleSwgYXJyYXkpO1xuICAgIH0pO1xuICB9XG5cbiAgY3R4LnNlZW4ucG9wKCk7XG5cbiAgcmV0dXJuIHJlZHVjZVRvU2luZ2xlU3RyaW5nKG91dHB1dCwgYmFzZSwgYnJhY2VzKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRQcmltaXRpdmUoY3R4LCB2YWx1ZSkge1xuICBpZiAoaXNVbmRlZmluZWQodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgndW5kZWZpbmVkJywgJ3VuZGVmaW5lZCcpO1xuICBpZiAoaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgdmFyIHNpbXBsZSA9ICdcXCcnICsgSlNPTi5zdHJpbmdpZnkodmFsdWUpLnJlcGxhY2UoL15cInxcIiQvZywgJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFwiL2csICdcIicpICsgJ1xcJyc7XG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKHNpbXBsZSwgJ3N0cmluZycpO1xuICB9XG4gIGlmIChpc051bWJlcih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdudW1iZXInKTtcbiAgaWYgKGlzQm9vbGVhbih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdib29sZWFuJyk7XG4gIC8vIEZvciBzb21lIHJlYXNvbiB0eXBlb2YgbnVsbCBpcyBcIm9iamVjdFwiLCBzbyBzcGVjaWFsIGNhc2UgaGVyZS5cbiAgaWYgKGlzTnVsbCh2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCdudWxsJywgJ251bGwnKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRFcnJvcih2YWx1ZSkge1xuICByZXR1cm4gJ1snICsgRXJyb3IucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpICsgJ10nO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpIHtcbiAgdmFyIG91dHB1dCA9IFtdO1xuICBmb3IgKHZhciBpID0gMCwgbCA9IHZhbHVlLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuICAgIGlmIChoYXNPd25Qcm9wZXJ0eSh2YWx1ZSwgU3RyaW5nKGkpKSkge1xuICAgICAgb3V0cHV0LnB1c2goZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cyxcbiAgICAgICAgICBTdHJpbmcoaSksIHRydWUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0cHV0LnB1c2goJycpO1xuICAgIH1cbiAgfVxuICBrZXlzLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYgKCFrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICBvdXRwdXQucHVzaChmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLFxuICAgICAgICAgIGtleSwgdHJ1ZSkpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBvdXRwdXQ7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5LCBhcnJheSkge1xuICB2YXIgbmFtZSwgc3RyLCBkZXNjO1xuICBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih2YWx1ZSwga2V5KSB8fCB7IHZhbHVlOiB2YWx1ZVtrZXldIH07XG4gIGlmIChkZXNjLmdldCkge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tHZXR0ZXIvU2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbR2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tTZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cbiAgaWYgKCFoYXNPd25Qcm9wZXJ0eSh2aXNpYmxlS2V5cywga2V5KSkge1xuICAgIG5hbWUgPSAnWycgKyBrZXkgKyAnXSc7XG4gIH1cbiAgaWYgKCFzdHIpIHtcbiAgICBpZiAoY3R4LnNlZW4uaW5kZXhPZihkZXNjLnZhbHVlKSA8IDApIHtcbiAgICAgIGlmIChpc051bGwocmVjdXJzZVRpbWVzKSkge1xuICAgICAgICBzdHIgPSBmb3JtYXRWYWx1ZShjdHgsIGRlc2MudmFsdWUsIG51bGwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RyID0gZm9ybWF0VmFsdWUoY3R4LCBkZXNjLnZhbHVlLCByZWN1cnNlVGltZXMgLSAxKTtcbiAgICAgIH1cbiAgICAgIGlmIChzdHIuaW5kZXhPZignXFxuJykgPiAtMSkge1xuICAgICAgICBpZiAoYXJyYXkpIHtcbiAgICAgICAgICBzdHIgPSBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyAgJyArIGxpbmU7XG4gICAgICAgICAgfSkuam9pbignXFxuJykuc2xpY2UoMik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RyID0gJ1xcbicgKyBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyAgICcgKyBsaW5lO1xuICAgICAgICAgIH0pLmpvaW4oJ1xcbicpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbQ2lyY3VsYXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cbiAgaWYgKGlzVW5kZWZpbmVkKG5hbWUpKSB7XG4gICAgaWYgKGFycmF5ICYmIGtleS5tYXRjaCgvXlxcZCskLykpIHtcbiAgICAgIHJldHVybiBzdHI7XG4gICAgfVxuICAgIG5hbWUgPSBKU09OLnN0cmluZ2lmeSgnJyArIGtleSk7XG4gICAgaWYgKG5hbWUubWF0Y2goL15cIihbYS16QS1aX11bYS16QS1aXzAtOV0qKVwiJC8pKSB7XG4gICAgICBuYW1lID0gbmFtZS5zbGljZSgxLCAtMSk7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ25hbWUnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmFtZSA9IG5hbWUucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJylcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLyheXCJ8XCIkKS9nLCBcIidcIik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ3N0cmluZycpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuYW1lICsgJzogJyArIHN0cjtcbn1cblxuXG5mdW5jdGlvbiByZWR1Y2VUb1NpbmdsZVN0cmluZyhvdXRwdXQsIGJhc2UsIGJyYWNlcykge1xuICB2YXIgbnVtTGluZXNFc3QgPSAwO1xuICB2YXIgbGVuZ3RoID0gb3V0cHV0LnJlZHVjZShmdW5jdGlvbihwcmV2LCBjdXIpIHtcbiAgICBudW1MaW5lc0VzdCsrO1xuICAgIGlmIChjdXIuaW5kZXhPZignXFxuJykgPj0gMCkgbnVtTGluZXNFc3QrKztcbiAgICByZXR1cm4gcHJldiArIGN1ci5yZXBsYWNlKC9cXHUwMDFiXFxbXFxkXFxkP20vZywgJycpLmxlbmd0aCArIDE7XG4gIH0sIDApO1xuXG4gIGlmIChsZW5ndGggPiA2MCkge1xuICAgIHJldHVybiBicmFjZXNbMF0gK1xuICAgICAgICAgICAoYmFzZSA9PT0gJycgPyAnJyA6IGJhc2UgKyAnXFxuICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgb3V0cHV0LmpvaW4oJyxcXG4gICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgYnJhY2VzWzFdO1xuICB9XG5cbiAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyAnICcgKyBvdXRwdXQuam9pbignLCAnKSArICcgJyArIGJyYWNlc1sxXTtcbn1cblxuXG4vLyBOT1RFOiBUaGVzZSB0eXBlIGNoZWNraW5nIGZ1bmN0aW9ucyBpbnRlbnRpb25hbGx5IGRvbid0IHVzZSBgaW5zdGFuY2VvZmBcbi8vIGJlY2F1c2UgaXQgaXMgZnJhZ2lsZSBhbmQgY2FuIGJlIGVhc2lseSBmYWtlZCB3aXRoIGBPYmplY3QuY3JlYXRlKClgLlxuZXhwb3J0cy50eXBlcyA9IHJlcXVpcmUoJy4vc3VwcG9ydC90eXBlcycpO1xuXG5mdW5jdGlvbiBpc0FycmF5KGFyKSB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KGFyKTtcbn1cbmV4cG9ydHMuaXNBcnJheSA9IGlzQXJyYXk7XG5cbmZ1bmN0aW9uIGlzQm9vbGVhbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdib29sZWFuJztcbn1cbmV4cG9ydHMuaXNCb29sZWFuID0gaXNCb29sZWFuO1xuXG5mdW5jdGlvbiBpc051bGwoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IG51bGw7XG59XG5leHBvcnRzLmlzTnVsbCA9IGlzTnVsbDtcblxuZnVuY3Rpb24gaXNOdWxsT3JVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNOdWxsT3JVbmRlZmluZWQgPSBpc051bGxPclVuZGVmaW5lZDtcblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cbmV4cG9ydHMuaXNOdW1iZXIgPSBpc051bWJlcjtcblxuZnVuY3Rpb24gaXNTdHJpbmcoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnc3RyaW5nJztcbn1cbmV4cG9ydHMuaXNTdHJpbmcgPSBpc1N0cmluZztcblxuZnVuY3Rpb24gaXNTeW1ib2woYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnc3ltYm9sJztcbn1cbmV4cG9ydHMuaXNTeW1ib2wgPSBpc1N5bWJvbDtcblxuZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cbmV4cG9ydHMuaXNVbmRlZmluZWQgPSBpc1VuZGVmaW5lZDtcblxuZnVuY3Rpb24gaXNSZWdFeHAocmUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KHJlKSAmJiBvYmplY3RUb1N0cmluZyhyZSkgPT09ICdbb2JqZWN0IFJlZ0V4cF0nO1xufVxuZXhwb3J0cy5pc1JlZ0V4cCA9IGlzUmVnRXhwO1xuZXhwb3J0cy50eXBlcy5pc1JlZ0V4cCA9IGlzUmVnRXhwO1xuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNPYmplY3QgPSBpc09iamVjdDtcblxuZnVuY3Rpb24gaXNEYXRlKGQpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KGQpICYmIG9iamVjdFRvU3RyaW5nKGQpID09PSAnW29iamVjdCBEYXRlXSc7XG59XG5leHBvcnRzLmlzRGF0ZSA9IGlzRGF0ZTtcbmV4cG9ydHMudHlwZXMuaXNEYXRlID0gaXNEYXRlO1xuXG5mdW5jdGlvbiBpc0Vycm9yKGUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KGUpICYmXG4gICAgICAob2JqZWN0VG9TdHJpbmcoZSkgPT09ICdbb2JqZWN0IEVycm9yXScgfHwgZSBpbnN0YW5jZW9mIEVycm9yKTtcbn1cbmV4cG9ydHMuaXNFcnJvciA9IGlzRXJyb3I7XG5leHBvcnRzLnR5cGVzLmlzTmF0aXZlRXJyb3IgPSBpc0Vycm9yO1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cbmV4cG9ydHMuaXNGdW5jdGlvbiA9IGlzRnVuY3Rpb247XG5cbmZ1bmN0aW9uIGlzUHJpbWl0aXZlKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnYm9vbGVhbicgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdudW1iZXInIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnc3RyaW5nJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCcgfHwgIC8vIEVTNiBzeW1ib2xcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICd1bmRlZmluZWQnO1xufVxuZXhwb3J0cy5pc1ByaW1pdGl2ZSA9IGlzUHJpbWl0aXZlO1xuXG5leHBvcnRzLmlzQnVmZmVyID0gcmVxdWlyZSgnLi9zdXBwb3J0L2lzQnVmZmVyJyk7XG5cbmZ1bmN0aW9uIG9iamVjdFRvU3RyaW5nKG8pIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvKTtcbn1cblxuXG5mdW5jdGlvbiBwYWQobikge1xuICByZXR1cm4gbiA8IDEwID8gJzAnICsgbi50b1N0cmluZygxMCkgOiBuLnRvU3RyaW5nKDEwKTtcbn1cblxuXG52YXIgbW9udGhzID0gWydKYW4nLCAnRmViJywgJ01hcicsICdBcHInLCAnTWF5JywgJ0p1bicsICdKdWwnLCAnQXVnJywgJ1NlcCcsXG4gICAgICAgICAgICAgICdPY3QnLCAnTm92JywgJ0RlYyddO1xuXG4vLyAyNiBGZWIgMTY6MTk6MzRcbmZ1bmN0aW9uIHRpbWVzdGFtcCgpIHtcbiAgdmFyIGQgPSBuZXcgRGF0ZSgpO1xuICB2YXIgdGltZSA9IFtwYWQoZC5nZXRIb3VycygpKSxcbiAgICAgICAgICAgICAgcGFkKGQuZ2V0TWludXRlcygpKSxcbiAgICAgICAgICAgICAgcGFkKGQuZ2V0U2Vjb25kcygpKV0uam9pbignOicpO1xuICByZXR1cm4gW2QuZ2V0RGF0ZSgpLCBtb250aHNbZC5nZXRNb250aCgpXSwgdGltZV0uam9pbignICcpO1xufVxuXG5cbi8vIGxvZyBpcyBqdXN0IGEgdGhpbiB3cmFwcGVyIHRvIGNvbnNvbGUubG9nIHRoYXQgcHJlcGVuZHMgYSB0aW1lc3RhbXBcbmV4cG9ydHMubG9nID0gZnVuY3Rpb24oKSB7XG4gIGNvbnNvbGUubG9nKCclcyAtICVzJywgdGltZXN0YW1wKCksIGV4cG9ydHMuZm9ybWF0LmFwcGx5KGV4cG9ydHMsIGFyZ3VtZW50cykpO1xufTtcblxuXG4vKipcbiAqIEluaGVyaXQgdGhlIHByb3RvdHlwZSBtZXRob2RzIGZyb20gb25lIGNvbnN0cnVjdG9yIGludG8gYW5vdGhlci5cbiAqXG4gKiBUaGUgRnVuY3Rpb24ucHJvdG90eXBlLmluaGVyaXRzIGZyb20gbGFuZy5qcyByZXdyaXR0ZW4gYXMgYSBzdGFuZGFsb25lXG4gKiBmdW5jdGlvbiAobm90IG9uIEZ1bmN0aW9uLnByb3RvdHlwZSkuIE5PVEU6IElmIHRoaXMgZmlsZSBpcyB0byBiZSBsb2FkZWRcbiAqIGR1cmluZyBib290c3RyYXBwaW5nIHRoaXMgZnVuY3Rpb24gbmVlZHMgdG8gYmUgcmV3cml0dGVuIHVzaW5nIHNvbWUgbmF0aXZlXG4gKiBmdW5jdGlvbnMgYXMgcHJvdG90eXBlIHNldHVwIHVzaW5nIG5vcm1hbCBKYXZhU2NyaXB0IGRvZXMgbm90IHdvcmsgYXNcbiAqIGV4cGVjdGVkIGR1cmluZyBib290c3RyYXBwaW5nIChzZWUgbWlycm9yLmpzIGluIHIxMTQ5MDMpLlxuICpcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGN0b3IgQ29uc3RydWN0b3IgZnVuY3Rpb24gd2hpY2ggbmVlZHMgdG8gaW5oZXJpdCB0aGVcbiAqICAgICBwcm90b3R5cGUuXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBzdXBlckN0b3IgQ29uc3RydWN0b3IgZnVuY3Rpb24gdG8gaW5oZXJpdCBwcm90b3R5cGUgZnJvbS5cbiAqL1xuZXhwb3J0cy5pbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJyk7XG5cbmV4cG9ydHMuX2V4dGVuZCA9IGZ1bmN0aW9uKG9yaWdpbiwgYWRkKSB7XG4gIC8vIERvbid0IGRvIGFueXRoaW5nIGlmIGFkZCBpc24ndCBhbiBvYmplY3RcbiAgaWYgKCFhZGQgfHwgIWlzT2JqZWN0KGFkZCkpIHJldHVybiBvcmlnaW47XG5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhhZGQpO1xuICB2YXIgaSA9IGtleXMubGVuZ3RoO1xuICB3aGlsZSAoaS0tKSB7XG4gICAgb3JpZ2luW2tleXNbaV1dID0gYWRkW2tleXNbaV1dO1xuICB9XG4gIHJldHVybiBvcmlnaW47XG59O1xuXG5mdW5jdGlvbiBoYXNPd25Qcm9wZXJ0eShvYmosIHByb3ApIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApO1xufVxuXG52YXIga0N1c3RvbVByb21pc2lmaWVkU3ltYm9sID0gdHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgPyBTeW1ib2woJ3V0aWwucHJvbWlzaWZ5LmN1c3RvbScpIDogdW5kZWZpbmVkO1xuXG5leHBvcnRzLnByb21pc2lmeSA9IGZ1bmN0aW9uIHByb21pc2lmeShvcmlnaW5hbCkge1xuICBpZiAodHlwZW9mIG9yaWdpbmFsICE9PSAnZnVuY3Rpb24nKVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1RoZSBcIm9yaWdpbmFsXCIgYXJndW1lbnQgbXVzdCBiZSBvZiB0eXBlIEZ1bmN0aW9uJyk7XG5cbiAgaWYgKGtDdXN0b21Qcm9taXNpZmllZFN5bWJvbCAmJiBvcmlnaW5hbFtrQ3VzdG9tUHJvbWlzaWZpZWRTeW1ib2xdKSB7XG4gICAgdmFyIGZuID0gb3JpZ2luYWxba0N1c3RvbVByb21pc2lmaWVkU3ltYm9sXTtcbiAgICBpZiAodHlwZW9mIGZuICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdUaGUgXCJ1dGlsLnByb21pc2lmeS5jdXN0b21cIiBhcmd1bWVudCBtdXN0IGJlIG9mIHR5cGUgRnVuY3Rpb24nKTtcbiAgICB9XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGZuLCBrQ3VzdG9tUHJvbWlzaWZpZWRTeW1ib2wsIHtcbiAgICAgIHZhbHVlOiBmbiwgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiBmYWxzZSwgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgcmV0dXJuIGZuO1xuICB9XG5cbiAgZnVuY3Rpb24gZm4oKSB7XG4gICAgdmFyIHByb21pc2VSZXNvbHZlLCBwcm9taXNlUmVqZWN0O1xuICAgIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgcHJvbWlzZVJlc29sdmUgPSByZXNvbHZlO1xuICAgICAgcHJvbWlzZVJlamVjdCA9IHJlamVjdDtcbiAgICB9KTtcblxuICAgIHZhciBhcmdzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGFyZ3MucHVzaChhcmd1bWVudHNbaV0pO1xuICAgIH1cbiAgICBhcmdzLnB1c2goZnVuY3Rpb24gKGVyciwgdmFsdWUpIHtcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgcHJvbWlzZVJlamVjdChlcnIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcHJvbWlzZVJlc29sdmUodmFsdWUpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdHJ5IHtcbiAgICAgIG9yaWdpbmFsLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgcHJvbWlzZVJlamVjdChlcnIpO1xuICAgIH1cblxuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG5cbiAgT2JqZWN0LnNldFByb3RvdHlwZU9mKGZuLCBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob3JpZ2luYWwpKTtcblxuICBpZiAoa0N1c3RvbVByb21pc2lmaWVkU3ltYm9sKSBPYmplY3QuZGVmaW5lUHJvcGVydHkoZm4sIGtDdXN0b21Qcm9taXNpZmllZFN5bWJvbCwge1xuICAgIHZhbHVlOiBmbiwgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiBmYWxzZSwgY29uZmlndXJhYmxlOiB0cnVlXG4gIH0pO1xuICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoXG4gICAgZm4sXG4gICAgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhvcmlnaW5hbClcbiAgKTtcbn1cblxuZXhwb3J0cy5wcm9taXNpZnkuY3VzdG9tID0ga0N1c3RvbVByb21pc2lmaWVkU3ltYm9sXG5cbmZ1bmN0aW9uIGNhbGxiYWNraWZ5T25SZWplY3RlZChyZWFzb24sIGNiKSB7XG4gIC8vIGAhcmVhc29uYCBndWFyZCBpbnNwaXJlZCBieSBibHVlYmlyZCAoUmVmOiBodHRwczovL2dvby5nbC90NUlTNk0pLlxuICAvLyBCZWNhdXNlIGBudWxsYCBpcyBhIHNwZWNpYWwgZXJyb3IgdmFsdWUgaW4gY2FsbGJhY2tzIHdoaWNoIG1lYW5zIFwibm8gZXJyb3JcbiAgLy8gb2NjdXJyZWRcIiwgd2UgZXJyb3Itd3JhcCBzbyB0aGUgY2FsbGJhY2sgY29uc3VtZXIgY2FuIGRpc3Rpbmd1aXNoIGJldHdlZW5cbiAgLy8gXCJ0aGUgcHJvbWlzZSByZWplY3RlZCB3aXRoIG51bGxcIiBvciBcInRoZSBwcm9taXNlIGZ1bGZpbGxlZCB3aXRoIHVuZGVmaW5lZFwiLlxuICBpZiAoIXJlYXNvbikge1xuICAgIHZhciBuZXdSZWFzb24gPSBuZXcgRXJyb3IoJ1Byb21pc2Ugd2FzIHJlamVjdGVkIHdpdGggYSBmYWxzeSB2YWx1ZScpO1xuICAgIG5ld1JlYXNvbi5yZWFzb24gPSByZWFzb247XG4gICAgcmVhc29uID0gbmV3UmVhc29uO1xuICB9XG4gIHJldHVybiBjYihyZWFzb24pO1xufVxuXG5mdW5jdGlvbiBjYWxsYmFja2lmeShvcmlnaW5hbCkge1xuICBpZiAodHlwZW9mIG9yaWdpbmFsICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVGhlIFwib3JpZ2luYWxcIiBhcmd1bWVudCBtdXN0IGJlIG9mIHR5cGUgRnVuY3Rpb24nKTtcbiAgfVxuXG4gIC8vIFdlIERPIE5PVCByZXR1cm4gdGhlIHByb21pc2UgYXMgaXQgZ2l2ZXMgdGhlIHVzZXIgYSBmYWxzZSBzZW5zZSB0aGF0XG4gIC8vIHRoZSBwcm9taXNlIGlzIGFjdHVhbGx5IHNvbWVob3cgcmVsYXRlZCB0byB0aGUgY2FsbGJhY2sncyBleGVjdXRpb25cbiAgLy8gYW5kIHRoYXQgdGhlIGNhbGxiYWNrIHRocm93aW5nIHdpbGwgcmVqZWN0IHRoZSBwcm9taXNlLlxuICBmdW5jdGlvbiBjYWxsYmFja2lmaWVkKCkge1xuICAgIHZhciBhcmdzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGFyZ3MucHVzaChhcmd1bWVudHNbaV0pO1xuICAgIH1cblxuICAgIHZhciBtYXliZUNiID0gYXJncy5wb3AoKTtcbiAgICBpZiAodHlwZW9mIG1heWJlQ2IgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1RoZSBsYXN0IGFyZ3VtZW50IG11c3QgYmUgb2YgdHlwZSBGdW5jdGlvbicpO1xuICAgIH1cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGNiID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gbWF5YmVDYi5hcHBseShzZWxmLCBhcmd1bWVudHMpO1xuICAgIH07XG4gICAgLy8gSW4gdHJ1ZSBub2RlIHN0eWxlIHdlIHByb2Nlc3MgdGhlIGNhbGxiYWNrIG9uIGBuZXh0VGlja2Agd2l0aCBhbGwgdGhlXG4gICAgLy8gaW1wbGljYXRpb25zIChzdGFjaywgYHVuY2F1Z2h0RXhjZXB0aW9uYCwgYGFzeW5jX2hvb2tzYClcbiAgICBvcmlnaW5hbC5hcHBseSh0aGlzLCBhcmdzKVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmV0KSB7IHByb2Nlc3MubmV4dFRpY2soY2IuYmluZChudWxsLCBudWxsLCByZXQpKSB9LFxuICAgICAgICAgICAgZnVuY3Rpb24ocmVqKSB7IHByb2Nlc3MubmV4dFRpY2soY2FsbGJhY2tpZnlPblJlamVjdGVkLmJpbmQobnVsbCwgcmVqLCBjYikpIH0pO1xuICB9XG5cbiAgT2JqZWN0LnNldFByb3RvdHlwZU9mKGNhbGxiYWNraWZpZWQsIE9iamVjdC5nZXRQcm90b3R5cGVPZihvcmlnaW5hbCkpO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhjYWxsYmFja2lmaWVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKG9yaWdpbmFsKSk7XG4gIHJldHVybiBjYWxsYmFja2lmaWVkO1xufVxuZXhwb3J0cy5jYWxsYmFja2lmeSA9IGNhbGxiYWNraWZ5O1xuIiwiKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gICAgZGVmaW5lKFwid2ViZXh0ZW5zaW9uLXBvbHlmaWxsXCIsIFtcIm1vZHVsZVwiXSwgZmFjdG9yeSk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBmYWN0b3J5KG1vZHVsZSk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIG1vZCA9IHtcbiAgICAgIGV4cG9ydHM6IHt9XG4gICAgfTtcbiAgICBmYWN0b3J5KG1vZCk7XG4gICAgZ2xvYmFsLmJyb3dzZXIgPSBtb2QuZXhwb3J0cztcbiAgfVxufSkodHlwZW9mIGdsb2JhbFRoaXMgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxUaGlzIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdGhpcywgZnVuY3Rpb24gKG1vZHVsZSkge1xuICAvKiB3ZWJleHRlbnNpb24tcG9seWZpbGwgLSB2MC4xMC4wIC0gRnJpIEF1ZyAxMiAyMDIyIDE5OjQyOjQ0ICovXG5cbiAgLyogLSotIE1vZGU6IGluZGVudC10YWJzLW1vZGU6IG5pbDsganMtaW5kZW50LWxldmVsOiAyIC0qLSAqL1xuXG4gIC8qIHZpbTogc2V0IHN0cz0yIHN3PTIgZXQgdHc9ODA6ICovXG5cbiAgLyogVGhpcyBTb3VyY2UgQ29kZSBGb3JtIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zIG9mIHRoZSBNb3ppbGxhIFB1YmxpY1xuICAgKiBMaWNlbnNlLCB2LiAyLjAuIElmIGEgY29weSBvZiB0aGUgTVBMIHdhcyBub3QgZGlzdHJpYnV0ZWQgd2l0aCB0aGlzXG4gICAqIGZpbGUsIFlvdSBjYW4gb2J0YWluIG9uZSBhdCBodHRwOi8vbW96aWxsYS5vcmcvTVBMLzIuMC8uICovXG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIGlmICghZ2xvYmFsVGhpcy5jaHJvbWU/LnJ1bnRpbWU/LmlkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiVGhpcyBzY3JpcHQgc2hvdWxkIG9ubHkgYmUgbG9hZGVkIGluIGEgYnJvd3NlciBleHRlbnNpb24uXCIpO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBnbG9iYWxUaGlzLmJyb3dzZXIgPT09IFwidW5kZWZpbmVkXCIgfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKGdsb2JhbFRoaXMuYnJvd3NlcikgIT09IE9iamVjdC5wcm90b3R5cGUpIHtcbiAgICBjb25zdCBDSFJPTUVfU0VORF9NRVNTQUdFX0NBTExCQUNLX05PX1JFU1BPTlNFX01FU1NBR0UgPSBcIlRoZSBtZXNzYWdlIHBvcnQgY2xvc2VkIGJlZm9yZSBhIHJlc3BvbnNlIHdhcyByZWNlaXZlZC5cIjsgLy8gV3JhcHBpbmcgdGhlIGJ1bGsgb2YgdGhpcyBwb2x5ZmlsbCBpbiBhIG9uZS10aW1lLXVzZSBmdW5jdGlvbiBpcyBhIG1pbm9yXG4gICAgLy8gb3B0aW1pemF0aW9uIGZvciBGaXJlZm94LiBTaW5jZSBTcGlkZXJtb25rZXkgZG9lcyBub3QgZnVsbHkgcGFyc2UgdGhlXG4gICAgLy8gY29udGVudHMgb2YgYSBmdW5jdGlvbiB1bnRpbCB0aGUgZmlyc3QgdGltZSBpdCdzIGNhbGxlZCwgYW5kIHNpbmNlIGl0IHdpbGxcbiAgICAvLyBuZXZlciBhY3R1YWxseSBuZWVkIHRvIGJlIGNhbGxlZCwgdGhpcyBhbGxvd3MgdGhlIHBvbHlmaWxsIHRvIGJlIGluY2x1ZGVkXG4gICAgLy8gaW4gRmlyZWZveCBuZWFybHkgZm9yIGZyZWUuXG5cbiAgICBjb25zdCB3cmFwQVBJcyA9IGV4dGVuc2lvbkFQSXMgPT4ge1xuICAgICAgLy8gTk9URTogYXBpTWV0YWRhdGEgaXMgYXNzb2NpYXRlZCB0byB0aGUgY29udGVudCBvZiB0aGUgYXBpLW1ldGFkYXRhLmpzb24gZmlsZVxuICAgICAgLy8gYXQgYnVpbGQgdGltZSBieSByZXBsYWNpbmcgdGhlIGZvbGxvd2luZyBcImluY2x1ZGVcIiB3aXRoIHRoZSBjb250ZW50IG9mIHRoZVxuICAgICAgLy8gSlNPTiBmaWxlLlxuICAgICAgY29uc3QgYXBpTWV0YWRhdGEgPSB7XG4gICAgICAgIFwiYWxhcm1zXCI6IHtcbiAgICAgICAgICBcImNsZWFyXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiY2xlYXJBbGxcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRBbGxcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJib29rbWFya3NcIjoge1xuICAgICAgICAgIFwiY3JlYXRlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0XCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0Q2hpbGRyZW5cIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRSZWNlbnRcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRTdWJUcmVlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0VHJlZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcIm1vdmVcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDIsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJyZW1vdmVcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJyZW1vdmVUcmVlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwic2VhcmNoXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwidXBkYXRlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAyLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwiYnJvd3NlckFjdGlvblwiOiB7XG4gICAgICAgICAgXCJkaXNhYmxlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDEsXG4gICAgICAgICAgICBcImZhbGxiYWNrVG9Ob0NhbGxiYWNrXCI6IHRydWVcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZW5hYmxlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDEsXG4gICAgICAgICAgICBcImZhbGxiYWNrVG9Ob0NhbGxiYWNrXCI6IHRydWVcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0QmFkZ2VCYWNrZ3JvdW5kQ29sb3JcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRCYWRnZVRleHRcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRQb3B1cFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldFRpdGxlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwib3BlblBvcHVwXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwic2V0QmFkZ2VCYWNrZ3JvdW5kQ29sb3JcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwiZmFsbGJhY2tUb05vQ2FsbGJhY2tcIjogdHJ1ZVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJzZXRCYWRnZVRleHRcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwiZmFsbGJhY2tUb05vQ2FsbGJhY2tcIjogdHJ1ZVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJzZXRJY29uXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwic2V0UG9wdXBcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwiZmFsbGJhY2tUb05vQ2FsbGJhY2tcIjogdHJ1ZVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJzZXRUaXRsZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJmYWxsYmFja1RvTm9DYWxsYmFja1wiOiB0cnVlXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcImJyb3dzaW5nRGF0YVwiOiB7XG4gICAgICAgICAgXCJyZW1vdmVcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDIsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJyZW1vdmVDYWNoZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInJlbW92ZUNvb2tpZXNcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJyZW1vdmVEb3dubG9hZHNcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJyZW1vdmVGb3JtRGF0YVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInJlbW92ZUhpc3RvcnlcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJyZW1vdmVMb2NhbFN0b3JhZ2VcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJyZW1vdmVQYXNzd29yZHNcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJyZW1vdmVQbHVnaW5EYXRhXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwic2V0dGluZ3NcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJjb21tYW5kc1wiOiB7XG4gICAgICAgICAgXCJnZXRBbGxcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJjb250ZXh0TWVudXNcIjoge1xuICAgICAgICAgIFwicmVtb3ZlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwicmVtb3ZlQWxsXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwidXBkYXRlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAyLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwiY29va2llc1wiOiB7XG4gICAgICAgICAgXCJnZXRcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRBbGxcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRBbGxDb29raWVTdG9yZXNcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJyZW1vdmVcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJzZXRcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJkZXZ0b29sc1wiOiB7XG4gICAgICAgICAgXCJpbnNwZWN0ZWRXaW5kb3dcIjoge1xuICAgICAgICAgICAgXCJldmFsXCI6IHtcbiAgICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICAgIFwibWF4QXJnc1wiOiAyLFxuICAgICAgICAgICAgICBcInNpbmdsZUNhbGxiYWNrQXJnXCI6IGZhbHNlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInBhbmVsc1wiOiB7XG4gICAgICAgICAgICBcImNyZWF0ZVwiOiB7XG4gICAgICAgICAgICAgIFwibWluQXJnc1wiOiAzLFxuICAgICAgICAgICAgICBcIm1heEFyZ3NcIjogMyxcbiAgICAgICAgICAgICAgXCJzaW5nbGVDYWxsYmFja0FyZ1wiOiB0cnVlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJlbGVtZW50c1wiOiB7XG4gICAgICAgICAgICAgIFwiY3JlYXRlU2lkZWJhclBhbmVcIjoge1xuICAgICAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwiZG93bmxvYWRzXCI6IHtcbiAgICAgICAgICBcImNhbmNlbFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImRvd25sb2FkXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZXJhc2VcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRGaWxlSWNvblwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcIm9wZW5cIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwiZmFsbGJhY2tUb05vQ2FsbGJhY2tcIjogdHJ1ZVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJwYXVzZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInJlbW92ZUZpbGVcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJyZXN1bWVcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJzZWFyY2hcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJzaG93XCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDEsXG4gICAgICAgICAgICBcImZhbGxiYWNrVG9Ob0NhbGxiYWNrXCI6IHRydWVcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwiZXh0ZW5zaW9uXCI6IHtcbiAgICAgICAgICBcImlzQWxsb3dlZEZpbGVTY2hlbWVBY2Nlc3NcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJpc0FsbG93ZWRJbmNvZ25pdG9BY2Nlc3NcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJoaXN0b3J5XCI6IHtcbiAgICAgICAgICBcImFkZFVybFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImRlbGV0ZUFsbFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImRlbGV0ZVJhbmdlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZGVsZXRlVXJsXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0VmlzaXRzXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwic2VhcmNoXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwiaTE4blwiOiB7XG4gICAgICAgICAgXCJkZXRlY3RMYW5ndWFnZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldEFjY2VwdExhbmd1YWdlc1wiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcImlkZW50aXR5XCI6IHtcbiAgICAgICAgICBcImxhdW5jaFdlYkF1dGhGbG93XCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwiaWRsZVwiOiB7XG4gICAgICAgICAgXCJxdWVyeVN0YXRlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwibWFuYWdlbWVudFwiOiB7XG4gICAgICAgICAgXCJnZXRcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRBbGxcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRTZWxmXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwic2V0RW5hYmxlZFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMixcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInVuaW5zdGFsbFNlbGZcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJub3RpZmljYXRpb25zXCI6IHtcbiAgICAgICAgICBcImNsZWFyXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiY3JlYXRlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0QWxsXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0UGVybWlzc2lvbkxldmVsXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwidXBkYXRlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAyLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwicGFnZUFjdGlvblwiOiB7XG4gICAgICAgICAgXCJnZXRQb3B1cFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldFRpdGxlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiaGlkZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJmYWxsYmFja1RvTm9DYWxsYmFja1wiOiB0cnVlXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInNldEljb25cIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJzZXRQb3B1cFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJmYWxsYmFja1RvTm9DYWxsYmFja1wiOiB0cnVlXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInNldFRpdGxlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDEsXG4gICAgICAgICAgICBcImZhbGxiYWNrVG9Ob0NhbGxiYWNrXCI6IHRydWVcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwic2hvd1wiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJmYWxsYmFja1RvTm9DYWxsYmFja1wiOiB0cnVlXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcInBlcm1pc3Npb25zXCI6IHtcbiAgICAgICAgICBcImNvbnRhaW5zXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0QWxsXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwicmVtb3ZlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwicmVxdWVzdFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcInJ1bnRpbWVcIjoge1xuICAgICAgICAgIFwiZ2V0QmFja2dyb3VuZFBhZ2VcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRQbGF0Zm9ybUluZm9cIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJvcGVuT3B0aW9uc1BhZ2VcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJyZXF1ZXN0VXBkYXRlQ2hlY2tcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJzZW5kTWVzc2FnZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAzXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInNlbmROYXRpdmVNZXNzYWdlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAyLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwic2V0VW5pbnN0YWxsVVJMXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwic2Vzc2lvbnNcIjoge1xuICAgICAgICAgIFwiZ2V0RGV2aWNlc1wiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldFJlY2VudGx5Q2xvc2VkXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwicmVzdG9yZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcInN0b3JhZ2VcIjoge1xuICAgICAgICAgIFwibG9jYWxcIjoge1xuICAgICAgICAgICAgXCJjbGVhclwiOiB7XG4gICAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiZ2V0XCI6IHtcbiAgICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJnZXRCeXRlc0luVXNlXCI6IHtcbiAgICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJyZW1vdmVcIjoge1xuICAgICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInNldFwiOiB7XG4gICAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJtYW5hZ2VkXCI6IHtcbiAgICAgICAgICAgIFwiZ2V0XCI6IHtcbiAgICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJnZXRCeXRlc0luVXNlXCI6IHtcbiAgICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInN5bmNcIjoge1xuICAgICAgICAgICAgXCJjbGVhclwiOiB7XG4gICAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiZ2V0XCI6IHtcbiAgICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJnZXRCeXRlc0luVXNlXCI6IHtcbiAgICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJyZW1vdmVcIjoge1xuICAgICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInNldFwiOiB7XG4gICAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJ0YWJzXCI6IHtcbiAgICAgICAgICBcImNhcHR1cmVWaXNpYmxlVGFiXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiY3JlYXRlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZGV0ZWN0TGFuZ3VhZ2VcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJkaXNjYXJkXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZHVwbGljYXRlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZXhlY3V0ZVNjcmlwdFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldEN1cnJlbnRcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRab29tXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0Wm9vbVNldHRpbmdzXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ29CYWNrXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ29Gb3J3YXJkXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiaGlnaGxpZ2h0XCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiaW5zZXJ0Q1NTXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwibW92ZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMixcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcInF1ZXJ5XCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwicmVsb2FkXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwicmVtb3ZlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwicmVtb3ZlQ1NTXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwic2VuZE1lc3NhZ2VcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDIsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogM1xuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJzZXRab29tXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwic2V0Wm9vbVNldHRpbmdzXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwidXBkYXRlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwidG9wU2l0ZXNcIjoge1xuICAgICAgICAgIFwiZ2V0XCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwid2ViTmF2aWdhdGlvblwiOiB7XG4gICAgICAgICAgXCJnZXRBbGxGcmFtZXNcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRGcmFtZVwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcIndlYlJlcXVlc3RcIjoge1xuICAgICAgICAgIFwiaGFuZGxlckJlaGF2aW9yQ2hhbmdlZFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcIndpbmRvd3NcIjoge1xuICAgICAgICAgIFwiY3JlYXRlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0XCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0QWxsXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZ2V0Q3VycmVudFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldExhc3RGb2N1c2VkXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwicmVtb3ZlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwidXBkYXRlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAyLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIGlmIChPYmplY3Qua2V5cyhhcGlNZXRhZGF0YSkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcImFwaS1tZXRhZGF0YS5qc29uIGhhcyBub3QgYmVlbiBpbmNsdWRlZCBpbiBicm93c2VyLXBvbHlmaWxsXCIpO1xuICAgICAgfVxuICAgICAgLyoqXG4gICAgICAgKiBBIFdlYWtNYXAgc3ViY2xhc3Mgd2hpY2ggY3JlYXRlcyBhbmQgc3RvcmVzIGEgdmFsdWUgZm9yIGFueSBrZXkgd2hpY2ggZG9lc1xuICAgICAgICogbm90IGV4aXN0IHdoZW4gYWNjZXNzZWQsIGJ1dCBiZWhhdmVzIGV4YWN0bHkgYXMgYW4gb3JkaW5hcnkgV2Vha01hcFxuICAgICAgICogb3RoZXJ3aXNlLlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNyZWF0ZUl0ZW1cbiAgICAgICAqICAgICAgICBBIGZ1bmN0aW9uIHdoaWNoIHdpbGwgYmUgY2FsbGVkIGluIG9yZGVyIHRvIGNyZWF0ZSB0aGUgdmFsdWUgZm9yIGFueVxuICAgICAgICogICAgICAgIGtleSB3aGljaCBkb2VzIG5vdCBleGlzdCwgdGhlIGZpcnN0IHRpbWUgaXQgaXMgYWNjZXNzZWQuIFRoZVxuICAgICAgICogICAgICAgIGZ1bmN0aW9uIHJlY2VpdmVzLCBhcyBpdHMgb25seSBhcmd1bWVudCwgdGhlIGtleSBiZWluZyBjcmVhdGVkLlxuICAgICAgICovXG5cblxuICAgICAgY2xhc3MgRGVmYXVsdFdlYWtNYXAgZXh0ZW5kcyBXZWFrTWFwIHtcbiAgICAgICAgY29uc3RydWN0b3IoY3JlYXRlSXRlbSwgaXRlbXMgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBzdXBlcihpdGVtcyk7XG4gICAgICAgICAgdGhpcy5jcmVhdGVJdGVtID0gY3JlYXRlSXRlbTtcbiAgICAgICAgfVxuXG4gICAgICAgIGdldChrZXkpIHtcbiAgICAgICAgICBpZiAoIXRoaXMuaGFzKGtleSkpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0KGtleSwgdGhpcy5jcmVhdGVJdGVtKGtleSkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBzdXBlci5nZXQoa2V5KTtcbiAgICAgICAgfVxuXG4gICAgICB9XG4gICAgICAvKipcbiAgICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgZ2l2ZW4gb2JqZWN0IGlzIGFuIG9iamVjdCB3aXRoIGEgYHRoZW5gIG1ldGhvZCwgYW5kIGNhblxuICAgICAgICogdGhlcmVmb3JlIGJlIGFzc3VtZWQgdG8gYmVoYXZlIGFzIGEgUHJvbWlzZS5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byB0ZXN0LlxuICAgICAgICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgdGhlIHZhbHVlIGlzIHRoZW5hYmxlLlxuICAgICAgICovXG5cblxuICAgICAgY29uc3QgaXNUaGVuYWJsZSA9IHZhbHVlID0+IHtcbiAgICAgICAgcmV0dXJuIHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgdmFsdWUudGhlbiA9PT0gXCJmdW5jdGlvblwiO1xuICAgICAgfTtcbiAgICAgIC8qKlxuICAgICAgICogQ3JlYXRlcyBhbmQgcmV0dXJucyBhIGZ1bmN0aW9uIHdoaWNoLCB3aGVuIGNhbGxlZCwgd2lsbCByZXNvbHZlIG9yIHJlamVjdFxuICAgICAgICogdGhlIGdpdmVuIHByb21pc2UgYmFzZWQgb24gaG93IGl0IGlzIGNhbGxlZDpcbiAgICAgICAqXG4gICAgICAgKiAtIElmLCB3aGVuIGNhbGxlZCwgYGNocm9tZS5ydW50aW1lLmxhc3RFcnJvcmAgY29udGFpbnMgYSBub24tbnVsbCBvYmplY3QsXG4gICAgICAgKiAgIHRoZSBwcm9taXNlIGlzIHJlamVjdGVkIHdpdGggdGhhdCB2YWx1ZS5cbiAgICAgICAqIC0gSWYgdGhlIGZ1bmN0aW9uIGlzIGNhbGxlZCB3aXRoIGV4YWN0bHkgb25lIGFyZ3VtZW50LCB0aGUgcHJvbWlzZSBpc1xuICAgICAgICogICByZXNvbHZlZCB0byB0aGF0IHZhbHVlLlxuICAgICAgICogLSBPdGhlcndpc2UsIHRoZSBwcm9taXNlIGlzIHJlc29sdmVkIHRvIGFuIGFycmF5IGNvbnRhaW5pbmcgYWxsIG9mIHRoZVxuICAgICAgICogICBmdW5jdGlvbidzIGFyZ3VtZW50cy5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0ge29iamVjdH0gcHJvbWlzZVxuICAgICAgICogICAgICAgIEFuIG9iamVjdCBjb250YWluaW5nIHRoZSByZXNvbHV0aW9uIGFuZCByZWplY3Rpb24gZnVuY3Rpb25zIG9mIGFcbiAgICAgICAqICAgICAgICBwcm9taXNlLlxuICAgICAgICogQHBhcmFtIHtmdW5jdGlvbn0gcHJvbWlzZS5yZXNvbHZlXG4gICAgICAgKiAgICAgICAgVGhlIHByb21pc2UncyByZXNvbHV0aW9uIGZ1bmN0aW9uLlxuICAgICAgICogQHBhcmFtIHtmdW5jdGlvbn0gcHJvbWlzZS5yZWplY3RcbiAgICAgICAqICAgICAgICBUaGUgcHJvbWlzZSdzIHJlamVjdGlvbiBmdW5jdGlvbi5cbiAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBtZXRhZGF0YVxuICAgICAgICogICAgICAgIE1ldGFkYXRhIGFib3V0IHRoZSB3cmFwcGVkIG1ldGhvZCB3aGljaCBoYXMgY3JlYXRlZCB0aGUgY2FsbGJhY2suXG4gICAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IG1ldGFkYXRhLnNpbmdsZUNhbGxiYWNrQXJnXG4gICAgICAgKiAgICAgICAgV2hldGhlciBvciBub3QgdGhlIHByb21pc2UgaXMgcmVzb2x2ZWQgd2l0aCBvbmx5IHRoZSBmaXJzdFxuICAgICAgICogICAgICAgIGFyZ3VtZW50IG9mIHRoZSBjYWxsYmFjaywgYWx0ZXJuYXRpdmVseSBhbiBhcnJheSBvZiBhbGwgdGhlXG4gICAgICAgKiAgICAgICAgY2FsbGJhY2sgYXJndW1lbnRzIGlzIHJlc29sdmVkLiBCeSBkZWZhdWx0LCBpZiB0aGUgY2FsbGJhY2tcbiAgICAgICAqICAgICAgICBmdW5jdGlvbiBpcyBpbnZva2VkIHdpdGggb25seSBhIHNpbmdsZSBhcmd1bWVudCwgdGhhdCB3aWxsIGJlXG4gICAgICAgKiAgICAgICAgcmVzb2x2ZWQgdG8gdGhlIHByb21pc2UsIHdoaWxlIGFsbCBhcmd1bWVudHMgd2lsbCBiZSByZXNvbHZlZCBhc1xuICAgICAgICogICAgICAgIGFuIGFycmF5IGlmIG11bHRpcGxlIGFyZSBnaXZlbi5cbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJucyB7ZnVuY3Rpb259XG4gICAgICAgKiAgICAgICAgVGhlIGdlbmVyYXRlZCBjYWxsYmFjayBmdW5jdGlvbi5cbiAgICAgICAqL1xuXG5cbiAgICAgIGNvbnN0IG1ha2VDYWxsYmFjayA9IChwcm9taXNlLCBtZXRhZGF0YSkgPT4ge1xuICAgICAgICByZXR1cm4gKC4uLmNhbGxiYWNrQXJncykgPT4ge1xuICAgICAgICAgIGlmIChleHRlbnNpb25BUElzLnJ1bnRpbWUubGFzdEVycm9yKSB7XG4gICAgICAgICAgICBwcm9taXNlLnJlamVjdChuZXcgRXJyb3IoZXh0ZW5zaW9uQVBJcy5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlKSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChtZXRhZGF0YS5zaW5nbGVDYWxsYmFja0FyZyB8fCBjYWxsYmFja0FyZ3MubGVuZ3RoIDw9IDEgJiYgbWV0YWRhdGEuc2luZ2xlQ2FsbGJhY2tBcmcgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICBwcm9taXNlLnJlc29sdmUoY2FsbGJhY2tBcmdzWzBdKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcHJvbWlzZS5yZXNvbHZlKGNhbGxiYWNrQXJncyk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfTtcblxuICAgICAgY29uc3QgcGx1cmFsaXplQXJndW1lbnRzID0gbnVtQXJncyA9PiBudW1BcmdzID09IDEgPyBcImFyZ3VtZW50XCIgOiBcImFyZ3VtZW50c1wiO1xuICAgICAgLyoqXG4gICAgICAgKiBDcmVhdGVzIGEgd3JhcHBlciBmdW5jdGlvbiBmb3IgYSBtZXRob2Qgd2l0aCB0aGUgZ2l2ZW4gbmFtZSBhbmQgbWV0YWRhdGEuXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAgICAgICAqICAgICAgICBUaGUgbmFtZSBvZiB0aGUgbWV0aG9kIHdoaWNoIGlzIGJlaW5nIHdyYXBwZWQuXG4gICAgICAgKiBAcGFyYW0ge29iamVjdH0gbWV0YWRhdGFcbiAgICAgICAqICAgICAgICBNZXRhZGF0YSBhYm91dCB0aGUgbWV0aG9kIGJlaW5nIHdyYXBwZWQuXG4gICAgICAgKiBAcGFyYW0ge2ludGVnZXJ9IG1ldGFkYXRhLm1pbkFyZ3NcbiAgICAgICAqICAgICAgICBUaGUgbWluaW11bSBudW1iZXIgb2YgYXJndW1lbnRzIHdoaWNoIG11c3QgYmUgcGFzc2VkIHRvIHRoZVxuICAgICAgICogICAgICAgIGZ1bmN0aW9uLiBJZiBjYWxsZWQgd2l0aCBmZXdlciB0aGFuIHRoaXMgbnVtYmVyIG9mIGFyZ3VtZW50cywgdGhlXG4gICAgICAgKiAgICAgICAgd3JhcHBlciB3aWxsIHJhaXNlIGFuIGV4Y2VwdGlvbi5cbiAgICAgICAqIEBwYXJhbSB7aW50ZWdlcn0gbWV0YWRhdGEubWF4QXJnc1xuICAgICAgICogICAgICAgIFRoZSBtYXhpbXVtIG51bWJlciBvZiBhcmd1bWVudHMgd2hpY2ggbWF5IGJlIHBhc3NlZCB0byB0aGVcbiAgICAgICAqICAgICAgICBmdW5jdGlvbi4gSWYgY2FsbGVkIHdpdGggbW9yZSB0aGFuIHRoaXMgbnVtYmVyIG9mIGFyZ3VtZW50cywgdGhlXG4gICAgICAgKiAgICAgICAgd3JhcHBlciB3aWxsIHJhaXNlIGFuIGV4Y2VwdGlvbi5cbiAgICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gbWV0YWRhdGEuc2luZ2xlQ2FsbGJhY2tBcmdcbiAgICAgICAqICAgICAgICBXaGV0aGVyIG9yIG5vdCB0aGUgcHJvbWlzZSBpcyByZXNvbHZlZCB3aXRoIG9ubHkgdGhlIGZpcnN0XG4gICAgICAgKiAgICAgICAgYXJndW1lbnQgb2YgdGhlIGNhbGxiYWNrLCBhbHRlcm5hdGl2ZWx5IGFuIGFycmF5IG9mIGFsbCB0aGVcbiAgICAgICAqICAgICAgICBjYWxsYmFjayBhcmd1bWVudHMgaXMgcmVzb2x2ZWQuIEJ5IGRlZmF1bHQsIGlmIHRoZSBjYWxsYmFja1xuICAgICAgICogICAgICAgIGZ1bmN0aW9uIGlzIGludm9rZWQgd2l0aCBvbmx5IGEgc2luZ2xlIGFyZ3VtZW50LCB0aGF0IHdpbGwgYmVcbiAgICAgICAqICAgICAgICByZXNvbHZlZCB0byB0aGUgcHJvbWlzZSwgd2hpbGUgYWxsIGFyZ3VtZW50cyB3aWxsIGJlIHJlc29sdmVkIGFzXG4gICAgICAgKiAgICAgICAgYW4gYXJyYXkgaWYgbXVsdGlwbGUgYXJlIGdpdmVuLlxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm5zIHtmdW5jdGlvbihvYmplY3QsIC4uLiopfVxuICAgICAgICogICAgICAgVGhlIGdlbmVyYXRlZCB3cmFwcGVyIGZ1bmN0aW9uLlxuICAgICAgICovXG5cblxuICAgICAgY29uc3Qgd3JhcEFzeW5jRnVuY3Rpb24gPSAobmFtZSwgbWV0YWRhdGEpID0+IHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIGFzeW5jRnVuY3Rpb25XcmFwcGVyKHRhcmdldCwgLi4uYXJncykge1xuICAgICAgICAgIGlmIChhcmdzLmxlbmd0aCA8IG1ldGFkYXRhLm1pbkFyZ3MpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgYXQgbGVhc3QgJHttZXRhZGF0YS5taW5BcmdzfSAke3BsdXJhbGl6ZUFyZ3VtZW50cyhtZXRhZGF0YS5taW5BcmdzKX0gZm9yICR7bmFtZX0oKSwgZ290ICR7YXJncy5sZW5ndGh9YCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGFyZ3MubGVuZ3RoID4gbWV0YWRhdGEubWF4QXJncykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCBhdCBtb3N0ICR7bWV0YWRhdGEubWF4QXJnc30gJHtwbHVyYWxpemVBcmd1bWVudHMobWV0YWRhdGEubWF4QXJncyl9IGZvciAke25hbWV9KCksIGdvdCAke2FyZ3MubGVuZ3RofWApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBpZiAobWV0YWRhdGEuZmFsbGJhY2tUb05vQ2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgLy8gVGhpcyBBUEkgbWV0aG9kIGhhcyBjdXJyZW50bHkgbm8gY2FsbGJhY2sgb24gQ2hyb21lLCBidXQgaXQgcmV0dXJuIGEgcHJvbWlzZSBvbiBGaXJlZm94LFxuICAgICAgICAgICAgICAvLyBhbmQgc28gdGhlIHBvbHlmaWxsIHdpbGwgdHJ5IHRvIGNhbGwgaXQgd2l0aCBhIGNhbGxiYWNrIGZpcnN0LCBhbmQgaXQgd2lsbCBmYWxsYmFja1xuICAgICAgICAgICAgICAvLyB0byBub3QgcGFzc2luZyB0aGUgY2FsbGJhY2sgaWYgdGhlIGZpcnN0IGNhbGwgZmFpbHMuXG4gICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0W25hbWVdKC4uLmFyZ3MsIG1ha2VDYWxsYmFjayh7XG4gICAgICAgICAgICAgICAgICByZXNvbHZlLFxuICAgICAgICAgICAgICAgICAgcmVqZWN0XG4gICAgICAgICAgICAgICAgfSwgbWV0YWRhdGEpKTtcbiAgICAgICAgICAgICAgfSBjYXRjaCAoY2JFcnJvcikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgJHtuYW1lfSBBUEkgbWV0aG9kIGRvZXNuJ3Qgc2VlbSB0byBzdXBwb3J0IHRoZSBjYWxsYmFjayBwYXJhbWV0ZXIsIGAgKyBcImZhbGxpbmcgYmFjayB0byBjYWxsIGl0IHdpdGhvdXQgYSBjYWxsYmFjazogXCIsIGNiRXJyb3IpO1xuICAgICAgICAgICAgICAgIHRhcmdldFtuYW1lXSguLi5hcmdzKTsgLy8gVXBkYXRlIHRoZSBBUEkgbWV0aG9kIG1ldGFkYXRhLCBzbyB0aGF0IHRoZSBuZXh0IEFQSSBjYWxscyB3aWxsIG5vdCB0cnkgdG9cbiAgICAgICAgICAgICAgICAvLyB1c2UgdGhlIHVuc3VwcG9ydGVkIGNhbGxiYWNrIGFueW1vcmUuXG5cbiAgICAgICAgICAgICAgICBtZXRhZGF0YS5mYWxsYmFja1RvTm9DYWxsYmFjayA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIG1ldGFkYXRhLm5vQ2FsbGJhY2sgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChtZXRhZGF0YS5ub0NhbGxiYWNrKSB7XG4gICAgICAgICAgICAgIHRhcmdldFtuYW1lXSguLi5hcmdzKTtcbiAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGFyZ2V0W25hbWVdKC4uLmFyZ3MsIG1ha2VDYWxsYmFjayh7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSxcbiAgICAgICAgICAgICAgICByZWplY3RcbiAgICAgICAgICAgICAgfSwgbWV0YWRhdGEpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgIH07XG4gICAgICAvKipcbiAgICAgICAqIFdyYXBzIGFuIGV4aXN0aW5nIG1ldGhvZCBvZiB0aGUgdGFyZ2V0IG9iamVjdCwgc28gdGhhdCBjYWxscyB0byBpdCBhcmVcbiAgICAgICAqIGludGVyY2VwdGVkIGJ5IHRoZSBnaXZlbiB3cmFwcGVyIGZ1bmN0aW9uLiBUaGUgd3JhcHBlciBmdW5jdGlvbiByZWNlaXZlcyxcbiAgICAgICAqIGFzIGl0cyBmaXJzdCBhcmd1bWVudCwgdGhlIG9yaWdpbmFsIGB0YXJnZXRgIG9iamVjdCwgZm9sbG93ZWQgYnkgZWFjaCBvZlxuICAgICAgICogdGhlIGFyZ3VtZW50cyBwYXNzZWQgdG8gdGhlIG9yaWdpbmFsIG1ldGhvZC5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0ge29iamVjdH0gdGFyZ2V0XG4gICAgICAgKiAgICAgICAgVGhlIG9yaWdpbmFsIHRhcmdldCBvYmplY3QgdGhhdCB0aGUgd3JhcHBlZCBtZXRob2QgYmVsb25ncyB0by5cbiAgICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IG1ldGhvZFxuICAgICAgICogICAgICAgIFRoZSBtZXRob2QgYmVpbmcgd3JhcHBlZC4gVGhpcyBpcyB1c2VkIGFzIHRoZSB0YXJnZXQgb2YgdGhlIFByb3h5XG4gICAgICAgKiAgICAgICAgb2JqZWN0IHdoaWNoIGlzIGNyZWF0ZWQgdG8gd3JhcCB0aGUgbWV0aG9kLlxuICAgICAgICogQHBhcmFtIHtmdW5jdGlvbn0gd3JhcHBlclxuICAgICAgICogICAgICAgIFRoZSB3cmFwcGVyIGZ1bmN0aW9uIHdoaWNoIGlzIGNhbGxlZCBpbiBwbGFjZSBvZiBhIGRpcmVjdCBpbnZvY2F0aW9uXG4gICAgICAgKiAgICAgICAgb2YgdGhlIHdyYXBwZWQgbWV0aG9kLlxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm5zIHtQcm94eTxmdW5jdGlvbj59XG4gICAgICAgKiAgICAgICAgQSBQcm94eSBvYmplY3QgZm9yIHRoZSBnaXZlbiBtZXRob2QsIHdoaWNoIGludm9rZXMgdGhlIGdpdmVuIHdyYXBwZXJcbiAgICAgICAqICAgICAgICBtZXRob2QgaW4gaXRzIHBsYWNlLlxuICAgICAgICovXG5cblxuICAgICAgY29uc3Qgd3JhcE1ldGhvZCA9ICh0YXJnZXQsIG1ldGhvZCwgd3JhcHBlcikgPT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb3h5KG1ldGhvZCwge1xuICAgICAgICAgIGFwcGx5KHRhcmdldE1ldGhvZCwgdGhpc09iaiwgYXJncykge1xuICAgICAgICAgICAgcmV0dXJuIHdyYXBwZXIuY2FsbCh0aGlzT2JqLCB0YXJnZXQsIC4uLmFyZ3MpO1xuICAgICAgICAgIH1cblxuICAgICAgICB9KTtcbiAgICAgIH07XG5cbiAgICAgIGxldCBoYXNPd25Qcm9wZXJ0eSA9IEZ1bmN0aW9uLmNhbGwuYmluZChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5KTtcbiAgICAgIC8qKlxuICAgICAgICogV3JhcHMgYW4gb2JqZWN0IGluIGEgUHJveHkgd2hpY2ggaW50ZXJjZXB0cyBhbmQgd3JhcHMgY2VydGFpbiBtZXRob2RzXG4gICAgICAgKiBiYXNlZCBvbiB0aGUgZ2l2ZW4gYHdyYXBwZXJzYCBhbmQgYG1ldGFkYXRhYCBvYmplY3RzLlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0YXJnZXRcbiAgICAgICAqICAgICAgICBUaGUgdGFyZ2V0IG9iamVjdCB0byB3cmFwLlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbd3JhcHBlcnMgPSB7fV1cbiAgICAgICAqICAgICAgICBBbiBvYmplY3QgdHJlZSBjb250YWluaW5nIHdyYXBwZXIgZnVuY3Rpb25zIGZvciBzcGVjaWFsIGNhc2VzLiBBbnlcbiAgICAgICAqICAgICAgICBmdW5jdGlvbiBwcmVzZW50IGluIHRoaXMgb2JqZWN0IHRyZWUgaXMgY2FsbGVkIGluIHBsYWNlIG9mIHRoZVxuICAgICAgICogICAgICAgIG1ldGhvZCBpbiB0aGUgc2FtZSBsb2NhdGlvbiBpbiB0aGUgYHRhcmdldGAgb2JqZWN0IHRyZWUuIFRoZXNlXG4gICAgICAgKiAgICAgICAgd3JhcHBlciBtZXRob2RzIGFyZSBpbnZva2VkIGFzIGRlc2NyaWJlZCBpbiB7QHNlZSB3cmFwTWV0aG9kfS5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0ge29iamVjdH0gW21ldGFkYXRhID0ge31dXG4gICAgICAgKiAgICAgICAgQW4gb2JqZWN0IHRyZWUgY29udGFpbmluZyBtZXRhZGF0YSB1c2VkIHRvIGF1dG9tYXRpY2FsbHkgZ2VuZXJhdGVcbiAgICAgICAqICAgICAgICBQcm9taXNlLWJhc2VkIHdyYXBwZXIgZnVuY3Rpb25zIGZvciBhc3luY2hyb25vdXMuIEFueSBmdW5jdGlvbiBpblxuICAgICAgICogICAgICAgIHRoZSBgdGFyZ2V0YCBvYmplY3QgdHJlZSB3aGljaCBoYXMgYSBjb3JyZXNwb25kaW5nIG1ldGFkYXRhIG9iamVjdFxuICAgICAgICogICAgICAgIGluIHRoZSBzYW1lIGxvY2F0aW9uIGluIHRoZSBgbWV0YWRhdGFgIHRyZWUgaXMgcmVwbGFjZWQgd2l0aCBhblxuICAgICAgICogICAgICAgIGF1dG9tYXRpY2FsbHktZ2VuZXJhdGVkIHdyYXBwZXIgZnVuY3Rpb24sIGFzIGRlc2NyaWJlZCBpblxuICAgICAgICogICAgICAgIHtAc2VlIHdyYXBBc3luY0Z1bmN0aW9ufVxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm5zIHtQcm94eTxvYmplY3Q+fVxuICAgICAgICovXG5cbiAgICAgIGNvbnN0IHdyYXBPYmplY3QgPSAodGFyZ2V0LCB3cmFwcGVycyA9IHt9LCBtZXRhZGF0YSA9IHt9KSA9PiB7XG4gICAgICAgIGxldCBjYWNoZSA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgICAgIGxldCBoYW5kbGVycyA9IHtcbiAgICAgICAgICBoYXMocHJveHlUYXJnZXQsIHByb3ApIHtcbiAgICAgICAgICAgIHJldHVybiBwcm9wIGluIHRhcmdldCB8fCBwcm9wIGluIGNhY2hlO1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICBnZXQocHJveHlUYXJnZXQsIHByb3AsIHJlY2VpdmVyKSB7XG4gICAgICAgICAgICBpZiAocHJvcCBpbiBjYWNoZSkge1xuICAgICAgICAgICAgICByZXR1cm4gY2FjaGVbcHJvcF07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghKHByb3AgaW4gdGFyZ2V0KSkge1xuICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgdmFsdWUgPSB0YXJnZXRbcHJvcF07XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAvLyBUaGlzIGlzIGEgbWV0aG9kIG9uIHRoZSB1bmRlcmx5aW5nIG9iamVjdC4gQ2hlY2sgaWYgd2UgbmVlZCB0byBkb1xuICAgICAgICAgICAgICAvLyBhbnkgd3JhcHBpbmcuXG4gICAgICAgICAgICAgIGlmICh0eXBlb2Ygd3JhcHBlcnNbcHJvcF0gPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIC8vIFdlIGhhdmUgYSBzcGVjaWFsLWNhc2Ugd3JhcHBlciBmb3IgdGhpcyBtZXRob2QuXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB3cmFwTWV0aG9kKHRhcmdldCwgdGFyZ2V0W3Byb3BdLCB3cmFwcGVyc1twcm9wXSk7XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoaGFzT3duUHJvcGVydHkobWV0YWRhdGEsIHByb3ApKSB7XG4gICAgICAgICAgICAgICAgLy8gVGhpcyBpcyBhbiBhc3luYyBtZXRob2QgdGhhdCB3ZSBoYXZlIG1ldGFkYXRhIGZvci4gQ3JlYXRlIGFcbiAgICAgICAgICAgICAgICAvLyBQcm9taXNlIHdyYXBwZXIgZm9yIGl0LlxuICAgICAgICAgICAgICAgIGxldCB3cmFwcGVyID0gd3JhcEFzeW5jRnVuY3Rpb24ocHJvcCwgbWV0YWRhdGFbcHJvcF0pO1xuICAgICAgICAgICAgICAgIHZhbHVlID0gd3JhcE1ldGhvZCh0YXJnZXQsIHRhcmdldFtwcm9wXSwgd3JhcHBlcik7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gVGhpcyBpcyBhIG1ldGhvZCB0aGF0IHdlIGRvbid0IGtub3cgb3IgY2FyZSBhYm91dC4gUmV0dXJuIHRoZVxuICAgICAgICAgICAgICAgIC8vIG9yaWdpbmFsIG1ldGhvZCwgYm91bmQgdG8gdGhlIHVuZGVybHlpbmcgb2JqZWN0LlxuICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUuYmluZCh0YXJnZXQpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiAmJiB2YWx1ZSAhPT0gbnVsbCAmJiAoaGFzT3duUHJvcGVydHkod3JhcHBlcnMsIHByb3ApIHx8IGhhc093blByb3BlcnR5KG1ldGFkYXRhLCBwcm9wKSkpIHtcbiAgICAgICAgICAgICAgLy8gVGhpcyBpcyBhbiBvYmplY3QgdGhhdCB3ZSBuZWVkIHRvIGRvIHNvbWUgd3JhcHBpbmcgZm9yIHRoZSBjaGlsZHJlblxuICAgICAgICAgICAgICAvLyBvZi4gQ3JlYXRlIGEgc3ViLW9iamVjdCB3cmFwcGVyIGZvciBpdCB3aXRoIHRoZSBhcHByb3ByaWF0ZSBjaGlsZFxuICAgICAgICAgICAgICAvLyBtZXRhZGF0YS5cbiAgICAgICAgICAgICAgdmFsdWUgPSB3cmFwT2JqZWN0KHZhbHVlLCB3cmFwcGVyc1twcm9wXSwgbWV0YWRhdGFbcHJvcF0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChoYXNPd25Qcm9wZXJ0eShtZXRhZGF0YSwgXCIqXCIpKSB7XG4gICAgICAgICAgICAgIC8vIFdyYXAgYWxsIHByb3BlcnRpZXMgaW4gKiBuYW1lc3BhY2UuXG4gICAgICAgICAgICAgIHZhbHVlID0gd3JhcE9iamVjdCh2YWx1ZSwgd3JhcHBlcnNbcHJvcF0sIG1ldGFkYXRhW1wiKlwiXSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBXZSBkb24ndCBuZWVkIHRvIGRvIGFueSB3cmFwcGluZyBmb3IgdGhpcyBwcm9wZXJ0eSxcbiAgICAgICAgICAgICAgLy8gc28ganVzdCBmb3J3YXJkIGFsbCBhY2Nlc3MgdG8gdGhlIHVuZGVybHlpbmcgb2JqZWN0LlxuICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoY2FjaGUsIHByb3AsIHtcbiAgICAgICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcblxuICAgICAgICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiB0YXJnZXRbcHJvcF07XG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIHNldCh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgdGFyZ2V0W3Byb3BdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNhY2hlW3Byb3BdID0gdmFsdWU7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgfSxcblxuICAgICAgICAgIHNldChwcm94eVRhcmdldCwgcHJvcCwgdmFsdWUsIHJlY2VpdmVyKSB7XG4gICAgICAgICAgICBpZiAocHJvcCBpbiBjYWNoZSkge1xuICAgICAgICAgICAgICBjYWNoZVtwcm9wXSA9IHZhbHVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGFyZ2V0W3Byb3BdID0gdmFsdWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICBkZWZpbmVQcm9wZXJ0eShwcm94eVRhcmdldCwgcHJvcCwgZGVzYykge1xuICAgICAgICAgICAgcmV0dXJuIFJlZmxlY3QuZGVmaW5lUHJvcGVydHkoY2FjaGUsIHByb3AsIGRlc2MpO1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICBkZWxldGVQcm9wZXJ0eShwcm94eVRhcmdldCwgcHJvcCkge1xuICAgICAgICAgICAgcmV0dXJuIFJlZmxlY3QuZGVsZXRlUHJvcGVydHkoY2FjaGUsIHByb3ApO1xuICAgICAgICAgIH1cblxuICAgICAgICB9OyAvLyBQZXIgY29udHJhY3Qgb2YgdGhlIFByb3h5IEFQSSwgdGhlIFwiZ2V0XCIgcHJveHkgaGFuZGxlciBtdXN0IHJldHVybiB0aGVcbiAgICAgICAgLy8gb3JpZ2luYWwgdmFsdWUgb2YgdGhlIHRhcmdldCBpZiB0aGF0IHZhbHVlIGlzIGRlY2xhcmVkIHJlYWQtb25seSBhbmRcbiAgICAgICAgLy8gbm9uLWNvbmZpZ3VyYWJsZS4gRm9yIHRoaXMgcmVhc29uLCB3ZSBjcmVhdGUgYW4gb2JqZWN0IHdpdGggdGhlXG4gICAgICAgIC8vIHByb3RvdHlwZSBzZXQgdG8gYHRhcmdldGAgaW5zdGVhZCBvZiB1c2luZyBgdGFyZ2V0YCBkaXJlY3RseS5cbiAgICAgICAgLy8gT3RoZXJ3aXNlIHdlIGNhbm5vdCByZXR1cm4gYSBjdXN0b20gb2JqZWN0IGZvciBBUElzIHRoYXRcbiAgICAgICAgLy8gYXJlIGRlY2xhcmVkIHJlYWQtb25seSBhbmQgbm9uLWNvbmZpZ3VyYWJsZSwgc3VjaCBhcyBgY2hyb21lLmRldnRvb2xzYC5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gVGhlIHByb3h5IGhhbmRsZXJzIHRoZW1zZWx2ZXMgd2lsbCBzdGlsbCB1c2UgdGhlIG9yaWdpbmFsIGB0YXJnZXRgXG4gICAgICAgIC8vIGluc3RlYWQgb2YgdGhlIGBwcm94eVRhcmdldGAsIHNvIHRoYXQgdGhlIG1ldGhvZHMgYW5kIHByb3BlcnRpZXMgYXJlXG4gICAgICAgIC8vIGRlcmVmZXJlbmNlZCB2aWEgdGhlIG9yaWdpbmFsIHRhcmdldHMuXG5cbiAgICAgICAgbGV0IHByb3h5VGFyZ2V0ID0gT2JqZWN0LmNyZWF0ZSh0YXJnZXQpO1xuICAgICAgICByZXR1cm4gbmV3IFByb3h5KHByb3h5VGFyZ2V0LCBoYW5kbGVycyk7XG4gICAgICB9O1xuICAgICAgLyoqXG4gICAgICAgKiBDcmVhdGVzIGEgc2V0IG9mIHdyYXBwZXIgZnVuY3Rpb25zIGZvciBhbiBldmVudCBvYmplY3QsIHdoaWNoIGhhbmRsZXNcbiAgICAgICAqIHdyYXBwaW5nIG9mIGxpc3RlbmVyIGZ1bmN0aW9ucyB0aGF0IHRob3NlIG1lc3NhZ2VzIGFyZSBwYXNzZWQuXG4gICAgICAgKlxuICAgICAgICogQSBzaW5nbGUgd3JhcHBlciBpcyBjcmVhdGVkIGZvciBlYWNoIGxpc3RlbmVyIGZ1bmN0aW9uLCBhbmQgc3RvcmVkIGluIGFcbiAgICAgICAqIG1hcC4gU3Vic2VxdWVudCBjYWxscyB0byBgYWRkTGlzdGVuZXJgLCBgaGFzTGlzdGVuZXJgLCBvciBgcmVtb3ZlTGlzdGVuZXJgXG4gICAgICAgKiByZXRyaWV2ZSB0aGUgb3JpZ2luYWwgd3JhcHBlciwgc28gdGhhdCAgYXR0ZW1wdHMgdG8gcmVtb3ZlIGFcbiAgICAgICAqIHByZXZpb3VzbHktYWRkZWQgbGlzdGVuZXIgd29yayBhcyBleHBlY3RlZC5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0ge0RlZmF1bHRXZWFrTWFwPGZ1bmN0aW9uLCBmdW5jdGlvbj59IHdyYXBwZXJNYXBcbiAgICAgICAqICAgICAgICBBIERlZmF1bHRXZWFrTWFwIG9iamVjdCB3aGljaCB3aWxsIGNyZWF0ZSB0aGUgYXBwcm9wcmlhdGUgd3JhcHBlclxuICAgICAgICogICAgICAgIGZvciBhIGdpdmVuIGxpc3RlbmVyIGZ1bmN0aW9uIHdoZW4gb25lIGRvZXMgbm90IGV4aXN0LCBhbmQgcmV0cmlldmVcbiAgICAgICAqICAgICAgICBhbiBleGlzdGluZyBvbmUgd2hlbiBpdCBkb2VzLlxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm5zIHtvYmplY3R9XG4gICAgICAgKi9cblxuXG4gICAgICBjb25zdCB3cmFwRXZlbnQgPSB3cmFwcGVyTWFwID0+ICh7XG4gICAgICAgIGFkZExpc3RlbmVyKHRhcmdldCwgbGlzdGVuZXIsIC4uLmFyZ3MpIHtcbiAgICAgICAgICB0YXJnZXQuYWRkTGlzdGVuZXIod3JhcHBlck1hcC5nZXQobGlzdGVuZXIpLCAuLi5hcmdzKTtcbiAgICAgICAgfSxcblxuICAgICAgICBoYXNMaXN0ZW5lcih0YXJnZXQsIGxpc3RlbmVyKSB7XG4gICAgICAgICAgcmV0dXJuIHRhcmdldC5oYXNMaXN0ZW5lcih3cmFwcGVyTWFwLmdldChsaXN0ZW5lcikpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZUxpc3RlbmVyKHRhcmdldCwgbGlzdGVuZXIpIHtcbiAgICAgICAgICB0YXJnZXQucmVtb3ZlTGlzdGVuZXIod3JhcHBlck1hcC5nZXQobGlzdGVuZXIpKTtcbiAgICAgICAgfVxuXG4gICAgICB9KTtcblxuICAgICAgY29uc3Qgb25SZXF1ZXN0RmluaXNoZWRXcmFwcGVycyA9IG5ldyBEZWZhdWx0V2Vha01hcChsaXN0ZW5lciA9PiB7XG4gICAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXIgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgIHJldHVybiBsaXN0ZW5lcjtcbiAgICAgICAgfVxuICAgICAgICAvKipcbiAgICAgICAgICogV3JhcHMgYW4gb25SZXF1ZXN0RmluaXNoZWQgbGlzdGVuZXIgZnVuY3Rpb24gc28gdGhhdCBpdCB3aWxsIHJldHVybiBhXG4gICAgICAgICAqIGBnZXRDb250ZW50KClgIHByb3BlcnR5IHdoaWNoIHJldHVybnMgYSBgUHJvbWlzZWAgcmF0aGVyIHRoYW4gdXNpbmcgYVxuICAgICAgICAgKiBjYWxsYmFjayBBUEkuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSByZXFcbiAgICAgICAgICogICAgICAgIFRoZSBIQVIgZW50cnkgb2JqZWN0IHJlcHJlc2VudGluZyB0aGUgbmV0d29yayByZXF1ZXN0LlxuICAgICAgICAgKi9cblxuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBvblJlcXVlc3RGaW5pc2hlZChyZXEpIHtcbiAgICAgICAgICBjb25zdCB3cmFwcGVkUmVxID0gd3JhcE9iamVjdChyZXEsIHt9XG4gICAgICAgICAgLyogd3JhcHBlcnMgKi9cbiAgICAgICAgICAsIHtcbiAgICAgICAgICAgIGdldENvbnRlbnQ6IHtcbiAgICAgICAgICAgICAgbWluQXJnczogMCxcbiAgICAgICAgICAgICAgbWF4QXJnczogMFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGxpc3RlbmVyKHdyYXBwZWRSZXEpO1xuICAgICAgICB9O1xuICAgICAgfSk7XG4gICAgICBjb25zdCBvbk1lc3NhZ2VXcmFwcGVycyA9IG5ldyBEZWZhdWx0V2Vha01hcChsaXN0ZW5lciA9PiB7XG4gICAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXIgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgIHJldHVybiBsaXN0ZW5lcjtcbiAgICAgICAgfVxuICAgICAgICAvKipcbiAgICAgICAgICogV3JhcHMgYSBtZXNzYWdlIGxpc3RlbmVyIGZ1bmN0aW9uIHNvIHRoYXQgaXQgbWF5IHNlbmQgcmVzcG9uc2VzIGJhc2VkIG9uXG4gICAgICAgICAqIGl0cyByZXR1cm4gdmFsdWUsIHJhdGhlciB0aGFuIGJ5IHJldHVybmluZyBhIHNlbnRpbmVsIHZhbHVlIGFuZCBjYWxsaW5nIGFcbiAgICAgICAgICogY2FsbGJhY2suIElmIHRoZSBsaXN0ZW5lciBmdW5jdGlvbiByZXR1cm5zIGEgUHJvbWlzZSwgdGhlIHJlc3BvbnNlIGlzXG4gICAgICAgICAqIHNlbnQgd2hlbiB0aGUgcHJvbWlzZSBlaXRoZXIgcmVzb2x2ZXMgb3IgcmVqZWN0cy5cbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIHsqfSBtZXNzYWdlXG4gICAgICAgICAqICAgICAgICBUaGUgbWVzc2FnZSBzZW50IGJ5IHRoZSBvdGhlciBlbmQgb2YgdGhlIGNoYW5uZWwuXG4gICAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBzZW5kZXJcbiAgICAgICAgICogICAgICAgIERldGFpbHMgYWJvdXQgdGhlIHNlbmRlciBvZiB0aGUgbWVzc2FnZS5cbiAgICAgICAgICogQHBhcmFtIHtmdW5jdGlvbigqKX0gc2VuZFJlc3BvbnNlXG4gICAgICAgICAqICAgICAgICBBIGNhbGxiYWNrIHdoaWNoLCB3aGVuIGNhbGxlZCB3aXRoIGFuIGFyYml0cmFyeSBhcmd1bWVudCwgc2VuZHNcbiAgICAgICAgICogICAgICAgIHRoYXQgdmFsdWUgYXMgYSByZXNwb25zZS5cbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICAgICAqICAgICAgICBUcnVlIGlmIHRoZSB3cmFwcGVkIGxpc3RlbmVyIHJldHVybmVkIGEgUHJvbWlzZSwgd2hpY2ggd2lsbCBsYXRlclxuICAgICAgICAgKiAgICAgICAgeWllbGQgYSByZXNwb25zZS4gRmFsc2Ugb3RoZXJ3aXNlLlxuICAgICAgICAgKi9cblxuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBvbk1lc3NhZ2UobWVzc2FnZSwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpIHtcbiAgICAgICAgICBsZXQgZGlkQ2FsbFNlbmRSZXNwb25zZSA9IGZhbHNlO1xuICAgICAgICAgIGxldCB3cmFwcGVkU2VuZFJlc3BvbnNlO1xuICAgICAgICAgIGxldCBzZW5kUmVzcG9uc2VQcm9taXNlID0gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICAgICAgICB3cmFwcGVkU2VuZFJlc3BvbnNlID0gZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgIGRpZENhbGxTZW5kUmVzcG9uc2UgPSB0cnVlO1xuICAgICAgICAgICAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgbGV0IHJlc3VsdDtcblxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXN1bHQgPSBsaXN0ZW5lcihtZXNzYWdlLCBzZW5kZXIsIHdyYXBwZWRTZW5kUmVzcG9uc2UpO1xuICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgcmVzdWx0ID0gUHJvbWlzZS5yZWplY3QoZXJyKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBpc1Jlc3VsdFRoZW5hYmxlID0gcmVzdWx0ICE9PSB0cnVlICYmIGlzVGhlbmFibGUocmVzdWx0KTsgLy8gSWYgdGhlIGxpc3RlbmVyIGRpZG4ndCByZXR1cm5lZCB0cnVlIG9yIGEgUHJvbWlzZSwgb3IgY2FsbGVkXG4gICAgICAgICAgLy8gd3JhcHBlZFNlbmRSZXNwb25zZSBzeW5jaHJvbm91c2x5LCB3ZSBjYW4gZXhpdCBlYXJsaWVyXG4gICAgICAgICAgLy8gYmVjYXVzZSB0aGVyZSB3aWxsIGJlIG5vIHJlc3BvbnNlIHNlbnQgZnJvbSB0aGlzIGxpc3RlbmVyLlxuXG4gICAgICAgICAgaWYgKHJlc3VsdCAhPT0gdHJ1ZSAmJiAhaXNSZXN1bHRUaGVuYWJsZSAmJiAhZGlkQ2FsbFNlbmRSZXNwb25zZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH0gLy8gQSBzbWFsbCBoZWxwZXIgdG8gc2VuZCB0aGUgbWVzc2FnZSBpZiB0aGUgcHJvbWlzZSByZXNvbHZlc1xuICAgICAgICAgIC8vIGFuZCBhbiBlcnJvciBpZiB0aGUgcHJvbWlzZSByZWplY3RzIChhIHdyYXBwZWQgc2VuZE1lc3NhZ2UgaGFzXG4gICAgICAgICAgLy8gdG8gdHJhbnNsYXRlIHRoZSBtZXNzYWdlIGludG8gYSByZXNvbHZlZCBwcm9taXNlIG9yIGEgcmVqZWN0ZWRcbiAgICAgICAgICAvLyBwcm9taXNlKS5cblxuXG4gICAgICAgICAgY29uc3Qgc2VuZFByb21pc2VkUmVzdWx0ID0gcHJvbWlzZSA9PiB7XG4gICAgICAgICAgICBwcm9taXNlLnRoZW4obXNnID0+IHtcbiAgICAgICAgICAgICAgLy8gc2VuZCB0aGUgbWVzc2FnZSB2YWx1ZS5cbiAgICAgICAgICAgICAgc2VuZFJlc3BvbnNlKG1zZyk7XG4gICAgICAgICAgICB9LCBlcnJvciA9PiB7XG4gICAgICAgICAgICAgIC8vIFNlbmQgYSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBlcnJvciBpZiB0aGUgcmVqZWN0ZWQgdmFsdWVcbiAgICAgICAgICAgICAgLy8gaXMgYW4gaW5zdGFuY2Ugb2YgZXJyb3IsIG9yIHRoZSBvYmplY3QgaXRzZWxmIG90aGVyd2lzZS5cbiAgICAgICAgICAgICAgbGV0IG1lc3NhZ2U7XG5cbiAgICAgICAgICAgICAgaWYgKGVycm9yICYmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yIHx8IHR5cGVvZiBlcnJvci5tZXNzYWdlID09PSBcInN0cmluZ1wiKSkge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBlcnJvci5tZXNzYWdlO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBcIkFuIHVuZXhwZWN0ZWQgZXJyb3Igb2NjdXJyZWRcIjtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHNlbmRSZXNwb25zZSh7XG4gICAgICAgICAgICAgICAgX19tb3pXZWJFeHRlbnNpb25Qb2x5ZmlsbFJlamVjdF9fOiB0cnVlLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2VcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgICAvLyBQcmludCBhbiBlcnJvciBvbiB0aGUgY29uc29sZSBpZiB1bmFibGUgdG8gc2VuZCB0aGUgcmVzcG9uc2UuXG4gICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gc2VuZCBvbk1lc3NhZ2UgcmVqZWN0ZWQgcmVwbHlcIiwgZXJyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH07IC8vIElmIHRoZSBsaXN0ZW5lciByZXR1cm5lZCBhIFByb21pc2UsIHNlbmQgdGhlIHJlc29sdmVkIHZhbHVlIGFzIGFcbiAgICAgICAgICAvLyByZXN1bHQsIG90aGVyd2lzZSB3YWl0IHRoZSBwcm9taXNlIHJlbGF0ZWQgdG8gdGhlIHdyYXBwZWRTZW5kUmVzcG9uc2VcbiAgICAgICAgICAvLyBjYWxsYmFjayB0byByZXNvbHZlIGFuZCBzZW5kIGl0IGFzIGEgcmVzcG9uc2UuXG5cblxuICAgICAgICAgIGlmIChpc1Jlc3VsdFRoZW5hYmxlKSB7XG4gICAgICAgICAgICBzZW5kUHJvbWlzZWRSZXN1bHQocmVzdWx0KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2VuZFByb21pc2VkUmVzdWx0KHNlbmRSZXNwb25zZVByb21pc2UpO1xuICAgICAgICAgIH0gLy8gTGV0IENocm9tZSBrbm93IHRoYXQgdGhlIGxpc3RlbmVyIGlzIHJlcGx5aW5nLlxuXG5cbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCB3cmFwcGVkU2VuZE1lc3NhZ2VDYWxsYmFjayA9ICh7XG4gICAgICAgIHJlamVjdCxcbiAgICAgICAgcmVzb2x2ZVxuICAgICAgfSwgcmVwbHkpID0+IHtcbiAgICAgICAgaWYgKGV4dGVuc2lvbkFQSXMucnVudGltZS5sYXN0RXJyb3IpIHtcbiAgICAgICAgICAvLyBEZXRlY3Qgd2hlbiBub25lIG9mIHRoZSBsaXN0ZW5lcnMgcmVwbGllZCB0byB0aGUgc2VuZE1lc3NhZ2UgY2FsbCBhbmQgcmVzb2x2ZVxuICAgICAgICAgIC8vIHRoZSBwcm9taXNlIHRvIHVuZGVmaW5lZCBhcyBpbiBGaXJlZm94LlxuICAgICAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vbW96aWxsYS93ZWJleHRlbnNpb24tcG9seWZpbGwvaXNzdWVzLzEzMFxuICAgICAgICAgIGlmIChleHRlbnNpb25BUElzLnJ1bnRpbWUubGFzdEVycm9yLm1lc3NhZ2UgPT09IENIUk9NRV9TRU5EX01FU1NBR0VfQ0FMTEJBQ0tfTk9fUkVTUE9OU0VfTUVTU0FHRSkge1xuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZWplY3QobmV3IEVycm9yKGV4dGVuc2lvbkFQSXMucnVudGltZS5sYXN0RXJyb3IubWVzc2FnZSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChyZXBseSAmJiByZXBseS5fX21veldlYkV4dGVuc2lvblBvbHlmaWxsUmVqZWN0X18pIHtcbiAgICAgICAgICAvLyBDb252ZXJ0IGJhY2sgdGhlIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIGVycm9yIGludG9cbiAgICAgICAgICAvLyBhbiBFcnJvciBpbnN0YW5jZS5cbiAgICAgICAgICByZWplY3QobmV3IEVycm9yKHJlcGx5Lm1lc3NhZ2UpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXNvbHZlKHJlcGx5KTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgY29uc3Qgd3JhcHBlZFNlbmRNZXNzYWdlID0gKG5hbWUsIG1ldGFkYXRhLCBhcGlOYW1lc3BhY2VPYmosIC4uLmFyZ3MpID0+IHtcbiAgICAgICAgaWYgKGFyZ3MubGVuZ3RoIDwgbWV0YWRhdGEubWluQXJncykge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgYXQgbGVhc3QgJHttZXRhZGF0YS5taW5BcmdzfSAke3BsdXJhbGl6ZUFyZ3VtZW50cyhtZXRhZGF0YS5taW5BcmdzKX0gZm9yICR7bmFtZX0oKSwgZ290ICR7YXJncy5sZW5ndGh9YCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYXJncy5sZW5ndGggPiBtZXRhZGF0YS5tYXhBcmdzKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCBhdCBtb3N0ICR7bWV0YWRhdGEubWF4QXJnc30gJHtwbHVyYWxpemVBcmd1bWVudHMobWV0YWRhdGEubWF4QXJncyl9IGZvciAke25hbWV9KCksIGdvdCAke2FyZ3MubGVuZ3RofWApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICBjb25zdCB3cmFwcGVkQ2IgPSB3cmFwcGVkU2VuZE1lc3NhZ2VDYWxsYmFjay5iaW5kKG51bGwsIHtcbiAgICAgICAgICAgIHJlc29sdmUsXG4gICAgICAgICAgICByZWplY3RcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBhcmdzLnB1c2god3JhcHBlZENiKTtcbiAgICAgICAgICBhcGlOYW1lc3BhY2VPYmouc2VuZE1lc3NhZ2UoLi4uYXJncyk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcblxuICAgICAgY29uc3Qgc3RhdGljV3JhcHBlcnMgPSB7XG4gICAgICAgIGRldnRvb2xzOiB7XG4gICAgICAgICAgbmV0d29yazoge1xuICAgICAgICAgICAgb25SZXF1ZXN0RmluaXNoZWQ6IHdyYXBFdmVudChvblJlcXVlc3RGaW5pc2hlZFdyYXBwZXJzKVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgcnVudGltZToge1xuICAgICAgICAgIG9uTWVzc2FnZTogd3JhcEV2ZW50KG9uTWVzc2FnZVdyYXBwZXJzKSxcbiAgICAgICAgICBvbk1lc3NhZ2VFeHRlcm5hbDogd3JhcEV2ZW50KG9uTWVzc2FnZVdyYXBwZXJzKSxcbiAgICAgICAgICBzZW5kTWVzc2FnZTogd3JhcHBlZFNlbmRNZXNzYWdlLmJpbmQobnVsbCwgXCJzZW5kTWVzc2FnZVwiLCB7XG4gICAgICAgICAgICBtaW5BcmdzOiAxLFxuICAgICAgICAgICAgbWF4QXJnczogM1xuICAgICAgICAgIH0pXG4gICAgICAgIH0sXG4gICAgICAgIHRhYnM6IHtcbiAgICAgICAgICBzZW5kTWVzc2FnZTogd3JhcHBlZFNlbmRNZXNzYWdlLmJpbmQobnVsbCwgXCJzZW5kTWVzc2FnZVwiLCB7XG4gICAgICAgICAgICBtaW5BcmdzOiAyLFxuICAgICAgICAgICAgbWF4QXJnczogM1xuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBjb25zdCBzZXR0aW5nTWV0YWRhdGEgPSB7XG4gICAgICAgIGNsZWFyOiB7XG4gICAgICAgICAgbWluQXJnczogMSxcbiAgICAgICAgICBtYXhBcmdzOiAxXG4gICAgICAgIH0sXG4gICAgICAgIGdldDoge1xuICAgICAgICAgIG1pbkFyZ3M6IDEsXG4gICAgICAgICAgbWF4QXJnczogMVxuICAgICAgICB9LFxuICAgICAgICBzZXQ6IHtcbiAgICAgICAgICBtaW5BcmdzOiAxLFxuICAgICAgICAgIG1heEFyZ3M6IDFcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIGFwaU1ldGFkYXRhLnByaXZhY3kgPSB7XG4gICAgICAgIG5ldHdvcms6IHtcbiAgICAgICAgICBcIipcIjogc2V0dGluZ01ldGFkYXRhXG4gICAgICAgIH0sXG4gICAgICAgIHNlcnZpY2VzOiB7XG4gICAgICAgICAgXCIqXCI6IHNldHRpbmdNZXRhZGF0YVxuICAgICAgICB9LFxuICAgICAgICB3ZWJzaXRlczoge1xuICAgICAgICAgIFwiKlwiOiBzZXR0aW5nTWV0YWRhdGFcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHJldHVybiB3cmFwT2JqZWN0KGV4dGVuc2lvbkFQSXMsIHN0YXRpY1dyYXBwZXJzLCBhcGlNZXRhZGF0YSk7XG4gICAgfTsgLy8gVGhlIGJ1aWxkIHByb2Nlc3MgYWRkcyBhIFVNRCB3cmFwcGVyIGFyb3VuZCB0aGlzIGZpbGUsIHdoaWNoIG1ha2VzIHRoZVxuICAgIC8vIGBtb2R1bGVgIHZhcmlhYmxlIGF2YWlsYWJsZS5cblxuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSB3cmFwQVBJcyhjaHJvbWUpO1xuICB9IGVsc2Uge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZ2xvYmFsVGhpcy5icm93c2VyO1xuICB9XG59KTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWJyb3dzZXItcG9seWZpbGwuanMubWFwXG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBmb3JFYWNoID0gcmVxdWlyZSgnZm9yLWVhY2gnKTtcbnZhciBhdmFpbGFibGVUeXBlZEFycmF5cyA9IHJlcXVpcmUoJ2F2YWlsYWJsZS10eXBlZC1hcnJheXMnKTtcbnZhciBjYWxsQmluZCA9IHJlcXVpcmUoJ2NhbGwtYmluZCcpO1xudmFyIGNhbGxCb3VuZCA9IHJlcXVpcmUoJ2NhbGwtYmluZC9jYWxsQm91bmQnKTtcbnZhciBnT1BEID0gcmVxdWlyZSgnZ29wZCcpO1xuXG52YXIgJHRvU3RyaW5nID0gY2FsbEJvdW5kKCdPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nJyk7XG52YXIgaGFzVG9TdHJpbmdUYWcgPSByZXF1aXJlKCdoYXMtdG9zdHJpbmd0YWcvc2hhbXMnKSgpO1xuXG52YXIgZyA9IHR5cGVvZiBnbG9iYWxUaGlzID09PSAndW5kZWZpbmVkJyA/IGdsb2JhbCA6IGdsb2JhbFRoaXM7XG52YXIgdHlwZWRBcnJheXMgPSBhdmFpbGFibGVUeXBlZEFycmF5cygpO1xuXG52YXIgJHNsaWNlID0gY2FsbEJvdW5kKCdTdHJpbmcucHJvdG90eXBlLnNsaWNlJyk7XG52YXIgZ2V0UHJvdG90eXBlT2YgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Y7IC8vIHJlcXVpcmUoJ2dldHByb3RvdHlwZW9mJyk7XG5cbnZhciAkaW5kZXhPZiA9IGNhbGxCb3VuZCgnQXJyYXkucHJvdG90eXBlLmluZGV4T2YnLCB0cnVlKSB8fCAvKiogQHR5cGUgeyhhcnJheTogcmVhZG9ubHkgdW5rbm93bltdLCB2YWx1ZTogdW5rbm93bikgPT4ga2V5b2YgYXJyYXl9ICovIGZ1bmN0aW9uIGluZGV4T2YoYXJyYXksIHZhbHVlKSB7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpICs9IDEpIHtcblx0XHRpZiAoYXJyYXlbaV0gPT09IHZhbHVlKSB7XG5cdFx0XHRyZXR1cm4gaTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIC0xO1xufTtcblxuLyoqIEB0eXBlZGVmIHtJbnQ4QXJyYXkgfCBVaW50OEFycmF5IHwgVWludDhDbGFtcGVkQXJyYXkgfCBJbnQxNkFycmF5IHwgVWludDE2QXJyYXkgfCBJbnQzMkFycmF5IHwgVWludDMyQXJyYXkgfCBGbG9hdDMyQXJyYXkgfCBGbG9hdDY0QXJyYXkgfCBCaWdJbnQ2NEFycmF5IHwgQmlnVWludDY0QXJyYXl9IFR5cGVkQXJyYXkgKi9cbi8qKiBAdHlwZWRlZiB7J0ludDhBcnJheScgfCAnVWludDhBcnJheScgfCAnVWludDhDbGFtcGVkQXJyYXknIHwgJ0ludDE2QXJyYXknIHwgJ1VpbnQxNkFycmF5JyB8ICdJbnQzMkFycmF5JyB8ICdVaW50MzJBcnJheScgfCAnRmxvYXQzMkFycmF5JyB8ICdGbG9hdDY0QXJyYXknIHwgJ0JpZ0ludDY0QXJyYXknIHwgJ0JpZ1VpbnQ2NEFycmF5J30gVHlwZWRBcnJheU5hbWUgKi9cbi8qKiBAdHlwZSB7eyBbayBpbiBgXFwkJHtUeXBlZEFycmF5TmFtZX1gXT86IChyZWNlaXZlcjogVHlwZWRBcnJheSkgPT4gc3RyaW5nIHwgdHlwZW9mIFVpbnQ4QXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwgfCB0eXBlb2YgVWludDhBcnJheS5wcm90b3R5cGUuc2V0LmNhbGwgfSAmIHsgX19wcm90b19fOiBudWxsIH19ICovXG52YXIgY2FjaGUgPSB7IF9fcHJvdG9fXzogbnVsbCB9O1xuaWYgKGhhc1RvU3RyaW5nVGFnICYmIGdPUEQgJiYgZ2V0UHJvdG90eXBlT2YpIHtcblx0Zm9yRWFjaCh0eXBlZEFycmF5cywgZnVuY3Rpb24gKHR5cGVkQXJyYXkpIHtcblx0XHR2YXIgYXJyID0gbmV3IGdbdHlwZWRBcnJheV0oKTtcblx0XHRpZiAoU3ltYm9sLnRvU3RyaW5nVGFnIGluIGFycikge1xuXHRcdFx0dmFyIHByb3RvID0gZ2V0UHJvdG90eXBlT2YoYXJyKTtcblx0XHRcdC8vIEB0cy1leHBlY3QtZXJyb3IgVFMgd29uJ3QgbmFycm93IGluc2lkZSBhIGNsb3N1cmVcblx0XHRcdHZhciBkZXNjcmlwdG9yID0gZ09QRChwcm90bywgU3ltYm9sLnRvU3RyaW5nVGFnKTtcblx0XHRcdGlmICghZGVzY3JpcHRvcikge1xuXHRcdFx0XHR2YXIgc3VwZXJQcm90byA9IGdldFByb3RvdHlwZU9mKHByb3RvKTtcblx0XHRcdFx0Ly8gQHRzLWV4cGVjdC1lcnJvciBUUyB3b24ndCBuYXJyb3cgaW5zaWRlIGEgY2xvc3VyZVxuXHRcdFx0XHRkZXNjcmlwdG9yID0gZ09QRChzdXBlclByb3RvLCBTeW1ib2wudG9TdHJpbmdUYWcpO1xuXHRcdFx0fVxuXHRcdFx0Ly8gQHRzLWV4cGVjdC1lcnJvciBUT0RPOiBmaXhcblx0XHRcdGNhY2hlWyckJyArIHR5cGVkQXJyYXldID0gY2FsbEJpbmQoZGVzY3JpcHRvci5nZXQpO1xuXHRcdH1cblx0fSk7XG59IGVsc2Uge1xuXHRmb3JFYWNoKHR5cGVkQXJyYXlzLCBmdW5jdGlvbiAodHlwZWRBcnJheSkge1xuXHRcdHZhciBhcnIgPSBuZXcgZ1t0eXBlZEFycmF5XSgpO1xuXHRcdHZhciBmbiA9IGFyci5zbGljZSB8fCBhcnIuc2V0O1xuXHRcdGlmIChmbikge1xuXHRcdFx0Ly8gQHRzLWV4cGVjdC1lcnJvciBUT0RPOiBmaXhcblx0XHRcdGNhY2hlWyckJyArIHR5cGVkQXJyYXldID0gY2FsbEJpbmQoZm4pO1xuXHRcdH1cblx0fSk7XG59XG5cbi8qKiBAdHlwZSB7aW1wb3J0KCcuJyl9ICovXG52YXIgdHJ5VHlwZWRBcnJheXMgPSBmdW5jdGlvbiB0cnlBbGxUeXBlZEFycmF5cyh2YWx1ZSkge1xuXHQvKiogQHR5cGUge1JldHVyblR5cGU8dHJ5QWxsVHlwZWRBcnJheXM+fSAqLyB2YXIgZm91bmQgPSBmYWxzZTtcblx0Zm9yRWFjaChcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tZXh0cmEtcGFyZW5zXG5cdFx0LyoqIEB0eXBlIHtSZWNvcmQ8YFxcJCR7VHlwZWRBcnJheU5hbWV9YCwgdHlwZW9mIGNhY2hlPn0gKi8gLyoqIEB0eXBlIHthbnl9ICovIChjYWNoZSksXG5cdFx0LyoqIEB0eXBlIHsoZ2V0dGVyOiB0eXBlb2YgY2FjaGUsIG5hbWU6IGBcXCQke1R5cGVkQXJyYXlOYW1lfWApID0+IHZvaWR9ICovIGZ1bmN0aW9uIChnZXR0ZXIsIHR5cGVkQXJyYXkpIHtcblx0XHRcdGlmICghZm91bmQpIHtcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0Ly8gQHRzLWV4cGVjdC1lcnJvciBUT0RPOiBmaXhcblx0XHRcdFx0XHRpZiAoJyQnICsgZ2V0dGVyKHZhbHVlKSA9PT0gdHlwZWRBcnJheSkge1xuXHRcdFx0XHRcdFx0Zm91bmQgPSAkc2xpY2UodHlwZWRBcnJheSwgMSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGNhdGNoIChlKSB7IC8qKi8gfVxuXHRcdFx0fVxuXHRcdH1cblx0KTtcblx0cmV0dXJuIGZvdW5kO1xufTtcblxuLyoqIEB0eXBlIHtpbXBvcnQoJy4nKX0gKi9cbnZhciB0cnlTbGljZXMgPSBmdW5jdGlvbiB0cnlBbGxTbGljZXModmFsdWUpIHtcblx0LyoqIEB0eXBlIHtSZXR1cm5UeXBlPHRyeUFsbFNsaWNlcz59ICovIHZhciBmb3VuZCA9IGZhbHNlO1xuXHRmb3JFYWNoKFxuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1leHRyYS1wYXJlbnNcblx0XHQvKiogQHR5cGUge2FueX0gKi8gKGNhY2hlKSxcblx0XHQvKiogQHR5cGUgeyhnZXR0ZXI6IHR5cGVvZiBjYWNoZSwgbmFtZTogYFxcJCR7VHlwZWRBcnJheU5hbWV9YCkgPT4gdm9pZH0gKi8gZnVuY3Rpb24gKGdldHRlciwgbmFtZSkge1xuXHRcdFx0aWYgKCFmb3VuZCkge1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHQvLyBAdHMtZXhwZWN0LWVycm9yIFRPRE86IGZpeFxuXHRcdFx0XHRcdGdldHRlcih2YWx1ZSk7XG5cdFx0XHRcdFx0Zm91bmQgPSAkc2xpY2UobmFtZSwgMSk7XG5cdFx0XHRcdH0gY2F0Y2ggKGUpIHsgLyoqLyB9XG5cdFx0XHR9XG5cdFx0fVxuXHQpO1xuXHRyZXR1cm4gZm91bmQ7XG59O1xuXG4vKiogQHR5cGUge2ltcG9ydCgnLicpfSAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiB3aGljaFR5cGVkQXJyYXkodmFsdWUpIHtcblx0aWYgKCF2YWx1ZSB8fCB0eXBlb2YgdmFsdWUgIT09ICdvYmplY3QnKSB7IHJldHVybiBmYWxzZTsgfVxuXHRpZiAoIWhhc1RvU3RyaW5nVGFnKSB7XG5cdFx0dmFyIHRhZyA9ICRzbGljZSgkdG9TdHJpbmcodmFsdWUpLCA4LCAtMSk7XG5cdFx0aWYgKCRpbmRleE9mKHR5cGVkQXJyYXlzLCB0YWcpID4gLTEpIHtcblx0XHRcdHJldHVybiB0YWc7XG5cdFx0fVxuXHRcdGlmICh0YWcgIT09ICdPYmplY3QnKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdC8vIG5vZGUgPCAwLjYgaGl0cyBoZXJlIG9uIHJlYWwgVHlwZWQgQXJyYXlzXG5cdFx0cmV0dXJuIHRyeVNsaWNlcyh2YWx1ZSk7XG5cdH1cblx0aWYgKCFnT1BEKSB7IHJldHVybiBudWxsOyB9IC8vIHVua25vd24gZW5naW5lXG5cdHJldHVybiB0cnlUeXBlZEFycmF5cyh2YWx1ZSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgcG9zc2libGVOYW1lcyA9IHJlcXVpcmUoJ3Bvc3NpYmxlLXR5cGVkLWFycmF5LW5hbWVzJyk7XG5cbnZhciBnID0gdHlwZW9mIGdsb2JhbFRoaXMgPT09ICd1bmRlZmluZWQnID8gZ2xvYmFsIDogZ2xvYmFsVGhpcztcblxuLyoqIEB0eXBlIHtpbXBvcnQoJy4nKX0gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gYXZhaWxhYmxlVHlwZWRBcnJheXMoKSB7XG5cdHZhciAvKiogQHR5cGUge1JldHVyblR5cGU8dHlwZW9mIGF2YWlsYWJsZVR5cGVkQXJyYXlzPn0gKi8gb3V0ID0gW107XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgcG9zc2libGVOYW1lcy5sZW5ndGg7IGkrKykge1xuXHRcdGlmICh0eXBlb2YgZ1twb3NzaWJsZU5hbWVzW2ldXSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0Ly8gQHRzLWV4cGVjdC1lcnJvclxuXHRcdFx0b3V0W291dC5sZW5ndGhdID0gcG9zc2libGVOYW1lc1tpXTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIG91dDtcbn07XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbl9fd2VicGFja19yZXF1aXJlX18ubiA9IChtb2R1bGUpID0+IHtcblx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG5cdFx0KCkgPT4gKG1vZHVsZVsnZGVmYXVsdCddKSA6XG5cdFx0KCkgPT4gKG1vZHVsZSk7XG5cdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsIHsgYTogZ2V0dGVyIH0pO1xuXHRyZXR1cm4gZ2V0dGVyO1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLmcgPSAoZnVuY3Rpb24oKSB7XG5cdGlmICh0eXBlb2YgZ2xvYmFsVGhpcyA9PT0gJ29iamVjdCcpIHJldHVybiBnbG9iYWxUaGlzO1xuXHR0cnkge1xuXHRcdHJldHVybiB0aGlzIHx8IG5ldyBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuXHR9IGNhdGNoIChlKSB7XG5cdFx0aWYgKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnKSByZXR1cm4gd2luZG93O1xuXHR9XG59KSgpOyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCIvKipcclxuICogbm9pbnNwZWN0aW9uIEZ1bmN0aW9uTmFtaW5nQ29udmVudGlvbkpTLEpTVW51c2VkR2xvYmFsU3ltYm9sc1xyXG4gKi9cclxuXHJcbi8qIFZlcnkgSW5pdGlhbCByZWZhY3RvciB0byBKUyB1c2luZyBDaGF0R1BUNFxyXG5OT1RFOiBBbG1vc3QgYWxsIG9mIHRoaXMgY29kZSBoYXMgaGFkIHRvIGJlIHJld3JpdHRlbiBzaW5jZSB0aGVuLlxyXG5BbmQgc3RhcnRpbmcgdG8gY29udmVydCB0byB0c1xyXG4gKi9cclxuXHJcbmltcG9ydCBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcclxuaW1wb3J0IHtEb3dubG9hZHMsIHJ1bnRpbWV9IGZyb20gJ3dlYmV4dGVuc2lvbi1wb2x5ZmlsbCdcclxuaW1wb3J0IHtEaWN0LCBJQ2FudmFzRGF0YSwgSU1vZHVsZURhdGEsIElNb2R1bGVJdGVtRGF0YSwgSVBhZ2VEYXRhLCBMb29rVXBUYWJsZSwgTW9kdWxlSXRlbVR5cGV9IGZyb20gXCIuL2NhbnZhc0RhdGFEZWZzXCI7XHJcbmltcG9ydCBEb3dubG9hZE9wdGlvbnNUeXBlID0gRG93bmxvYWRzLkRvd25sb2FkT3B0aW9uc1R5cGU7XHJcblxyXG5jb25zdCBIT01FVElMRV9XSURUSCA9IDUwMDtcclxuXHJcblxyXG5pbnRlcmZhY2UgSUNhbnZhc0NhbGxDb25maWcgZXh0ZW5kcyBEaWN0IHtcclxuICAgIGZldGNoSW5pdD86IFJlcXVlc3RJbml0LFxyXG4gICAgcXVlcnlQYXJhbXM/OiBEaWN0XHJcbn1cclxuXHJcbmludGVyZmFjZSBJVXBkYXRlQ2FsbGJhY2sge1xyXG4gICAgKGN1cnJlbnQ6IG51bWJlciwgdG90YWw6IG51bWJlcikgOiBQcm9taXNlPG51bWJlcj5cclxufVxyXG5cclxuXHJcbmNvbnN0IHR5cGVfbHV0OiBEaWN0ID0ge1xyXG4gICAgJ0Fzc2lnbm1lbnQnOiAnYXNzaWdubWVudCcsXHJcbiAgICAnRGlzY3Vzc2lvbic6ICdkaXNjdXNzaW9uX3RvcGljJyxcclxuICAgICdRdWl6JzogJ3F1aXonLFxyXG4gICAgJ0F0dGFjaG1lbnQnOiAnYXR0YWNobWVudCcsXHJcbiAgICAnRXh0ZXJuYWwgVG9vbCc6ICdleHRlcm5hbF90b29sJyxcclxuICAgICdGaWxlJzogJ2ZpbGUnLFxyXG4gICAgJ1BhZ2UnOiAnd2lraV9wYWdlJ1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBkb3dubG9hZEZpbGUob3B0aW9uczogRG93bmxvYWRPcHRpb25zVHlwZSkge1xyXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBydW50aW1lLnNlbmRNZXNzYWdlKCdkb3dubG9hZEZpbGUnLCBvcHRpb25zKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHJlc2l6ZWRJbWFnZShpbWdTcmM6IHN0cmluZywgdGFyZ2V0V2lkdGg6IG51bWJlciwgdGFyZ2V0SGVpZ2h0OiBudWxsIHwgbnVtYmVyPW51bGwpOiBQcm9taXNlPEltYWdlRGF0YT4ge1xyXG4gICAgYXNzZXJ0KGRvY3VtZW50KTtcclxuICAgIGNvbnN0IGltYWdlID0gbmV3IEltYWdlKCk7XHJcbiAgICBpbWFnZS5sb2FkaW5nID0gJ2VhZ2VyJztcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgbGV0IGNhbGxiYWNrID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkxvYWRlZFwiKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coaW1hZ2Uuc3JjLCBpbWFnZS5oZWlnaHQsIGltYWdlLndpZHRoKTtcclxuICAgICAgICAgICAgY29uc3QgdGFyZ2V0Q2FudmFzID0gIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG4gICAgICAgICAgICBjb25zdCB0Q3R4ID0gdGFyZ2V0Q2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgICAgICAgICAgIGlmKCF0Q3R4KSB7XHJcbiAgICAgICAgICAgICAgICByZWplY3QoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0Q3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIHRDdHguaW1hZ2VTbW9vdGhpbmdRdWFsaXR5ID0gXCJoaWdoXCI7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBhc3BlY3RSYXRpbyA9IGltYWdlLndpZHRoIC8gaW1hZ2UuaGVpZ2h0O1xyXG4gICAgICAgICAgICB0YXJnZXRIZWlnaHQgPSB0YXJnZXRIZWlnaHQ/IHRhcmdldEhlaWdodCA6IHRhcmdldFdpZHRoIC8gYXNwZWN0UmF0aW87XHJcbiAgICAgICAgICAgIHRhcmdldENhbnZhcy53aWR0aCA9IHRhcmdldFdpZHRoOyB0YXJnZXRDYW52YXMuaGVpZ2h0ID0gdGFyZ2V0SGVpZ2h0O1xyXG4gICAgICAgICAgICB0Q3R4LmRyYXdJbWFnZShpbWFnZSwgMCwgMCwgdGFyZ2V0V2lkdGgsIHRhcmdldEhlaWdodCk7XHJcbiAgICAgICAgICAgIHJlc29sdmUodEN0eC5nZXRJbWFnZURhdGEoMCwwLHRhcmdldFdpZHRoLCB0YXJnZXRIZWlnaHQpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJsb2FkaW5nXCIsIGltZ1NyYyk7XHJcbiAgICAgICAgaW1hZ2Uuc3JjID0gaW1nU3JjO1xyXG4gICAgICAgIGlmIChpbWFnZS5jb21wbGV0ZSkge1xyXG4gICAgICAgICAgICBjYWxsYmFjaygpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgaW1hZ2UuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGNhbGxiYWNrKTtcclxuICAgICAgICAgICBpbWFnZS5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIChlKSA9PiB7XHJcbiAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xyXG4gICAgICAgICAgICAgICBjb25zb2xlLmxvZyhpbWFnZSk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZm9ybURhdGFpZnkoZGF0YTogRGljdCkge1xyXG4gICAgY29uc29sZS5sb2coJ2Zvcm0nLCBkYXRhKTtcclxuICAgIGxldCBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xyXG4gICAgZm9yIChsZXQga2V5IGluIGRhdGEpIHtcclxuICAgICAgICBhZGRUb0Zvcm1EYXRhKGZvcm1EYXRhLCBrZXksIGRhdGFba2V5XSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGRvY3VtZW50KSB7XHJcbiAgICAgICAgY29uc3QgZWw6IEhUTUxJbnB1dEVsZW1lbnQgfCBudWxsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImlucHV0W25hbWU9J2F1dGhlbnRpY2l0eV90b2tlbiddXCIpO1xyXG4gICAgICAgIGNvbnN0IGF1dGhlbnRpY2l0eVRva2VuID0gZWwgPyBlbC52YWx1ZSA6IG51bGw7XHJcbiAgICAgICAgaWYgKGF1dGhlbnRpY2l0eVRva2VuKSBmb3JtRGF0YS5hcHBlbmQoJ2F1dGhlbnRpY2l0eV90b2tlbicsIGF1dGhlbnRpY2l0eVRva2VuKTtcclxuICAgIH1cclxuICAgIGZvcihsZXQgZW50cnkgb2YgZm9ybURhdGEuZW50cmllcygpKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coZW50cnlbMF0sIGVudHJ5WzFdKTtcclxuICAgIH1cclxuICAgIHJldHVybiBmb3JtRGF0YTtcclxufVxyXG5cclxuZnVuY3Rpb24gbGVnYWN5QWRkVG9Gb3JtRGF0YShmb3JtRGF0YTogRm9ybURhdGEsIGtleTogc3RyaW5nLCB2YWx1ZTogYW55KSB7XHJcbiAgICBmb3JtRGF0YS5hcHBlbmQoa2V5LCB2YWx1ZSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFkZFRvRm9ybURhdGEoZm9ybURhdGE6IEZvcm1EYXRhLCBrZXk6IHN0cmluZywgdmFsdWU6IGFueSB8IERpY3QgfCBbXSkge1xyXG4gICAgaWYoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcclxuICAgICAgICBmb3IobGV0IGl0ZW0gb2YgdmFsdWUpIHtcclxuICAgICAgICAgICAgYWRkVG9Gb3JtRGF0YShmb3JtRGF0YSwgYCR7a2V5fVtdYCwgaXRlbSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgZm9yKGxldCBpdGVtS2V5IGluIHZhbHVlKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGl0ZW1WYWx1ZSA9IHZhbHVlW2l0ZW1LZXldO1xyXG4gICAgICAgICAgICBhZGRUb0Zvcm1EYXRhKGZvcm1EYXRhLCBrZXkubGVuZ3RoID4gMD8gYCR7a2V5fVske2l0ZW1LZXl9XWAgOiBpdGVtS2V5LCBpdGVtVmFsdWUpO1xyXG4gICAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZm9ybURhdGEuYXBwZW5kKGtleSwgdmFsdWUudG9TdHJpbmcoKSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRNb2R1bGVXZWVrTnVtYmVyKG1vZHVsZTogRGljdCkge1xyXG4gICAgY29uc3QgcmVnZXggPSAvKHdlZWt8bW9kdWxlKSAoXFxkKykvaTtcclxuICAgIGxldCBtYXRjaCA9IG1vZHVsZS5uYW1lLm1hdGNoKHJlZ2V4KTtcclxuICAgIGxldCB3ZWVrTnVtYmVyID0gIW1hdGNoPyBudWxsIDogTnVtYmVyKG1hdGNoWzFdKTtcclxuICAgIGlmICghd2Vla051bWJlcikge1xyXG4gICAgICAgIGZvciAobGV0IG1vZHVsZUl0ZW0gb2YgbW9kdWxlLml0ZW1zKSB7XHJcbiAgICAgICAgICAgIGlmICghbW9kdWxlSXRlbS5oYXNPd25Qcm9wZXJ0eSgndGl0bGUnKSkge1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IG1hdGNoID0gbW9kdWxlSXRlbS50aXRsZS5tYXRjaChyZWdleCk7XHJcbiAgICAgICAgICAgIGlmIChtYXRjaCkge1xyXG4gICAgICAgICAgICAgICAgd2Vla051bWJlciA9IG1hdGNoWzJdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHdlZWtOdW1iZXI7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUYWtlcyBpbiBhIG1vZHVsZSBpdGVtIGFuZCByZXR1cm5zIGFuIG9iamVjdCBzcGVjaWZ5aW5nIGl0cyB0eXBlIGFuZCBjb250ZW50IGlkXHJcbiAqIEBwYXJhbSBpdGVtXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0SXRlbVR5cGVBbmRJZChcclxuICAgIGl0ZW06IElNb2R1bGVJdGVtRGF0YVxyXG4pIDogUHJvbWlzZTx7dHlwZTogTW9kdWxlSXRlbVR5cGUsIGlkOiBudW1iZXJ9PntcclxuICAgIGxldCBpZDtcclxuICAgIGxldCB0eXBlO1xyXG4gICAgYXNzZXJ0KHR5cGVfbHV0Lmhhc093blByb3BlcnR5KGl0ZW0udHlwZSksIFwiVW5leHBlY3RlZCB0eXBlIFwiICsgaXRlbS50eXBlKTtcclxuXHJcbiAgICB0eXBlID0gdHlwZV9sdXRbaXRlbS50eXBlXTtcclxuICAgIGlmICh0eXBlID09PSBcIndpa2lfcGFnZVwiKSB7XHJcbiAgICAgICAgYXNzZXJ0KGl0ZW0udXJsKTsgLy93aWtpX3BhZ2UgaXRlbXMgYWx3YXlzIGhhdmUgYSB1cmwgcGFyYW1cclxuICAgICAgICBjb25zdCBwYWdlRGF0YSA9IGF3YWl0IGZldGNoSnNvbihpdGVtLnVybCkgYXMgSVBhZ2VEYXRhO1xyXG4gICAgICAgIGlkID0gcGFnZURhdGEucGFnZV9pZDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaWQgPSBpdGVtLmNvbnRlbnRfaWQ7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHt0eXBlLCBpZH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEBwYXJhbSBxdWVyeVBhcmFtc1xyXG4gKiBAcmV0dXJucyB7VVJMU2VhcmNoUGFyYW1zfSBUaGUgY29ycmVjdGx5IGZvcm1hdHRlZCBwYXJhbWV0ZXJzXHJcbiAqL1xyXG5mdW5jdGlvbiBzZWFyY2hQYXJhbXNGcm9tT2JqZWN0KHF1ZXJ5UGFyYW1zOiBzdHJpbmdbXVtdIHwgUmVjb3JkPHN0cmluZywgc3RyaW5nPik6IFVSTFNlYXJjaFBhcmFtcyB7XHJcbiAgICByZXR1cm4gbmV3IFVSTFNlYXJjaFBhcmFtcyhxdWVyeVBhcmFtcyk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGdldEFwaVBhZ2VkRGF0YSh1cmw6IHN0cmluZywgY29uZmlnIDogSUNhbnZhc0NhbGxDb25maWcgfCBudWxsID0gbnVsbCk6IFByb21pc2U8SUNhbnZhc0RhdGFbXT4ge1xyXG4gICAgcmV0dXJuIGF3YWl0IGdldFBhZ2VkRGF0YShgL2FwaS92MS8ke3VybH1gLCBjb25maWcpXHJcbn1cclxuXHJcblxyXG4vKipcclxuICogQHBhcmFtIHVybCBUaGUgZW50aXJlIHBhdGggb2YgdGhlIHVybFxyXG4gKiBAcGFyYW0gY29uZmlnIGEgY29uZmlndXJhdGlvbiBvYmplY3Qgb2YgdHlwZSBJQ2FudmFzQ2FsbENvbmZpZ1xyXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxEaWN0W10+fVxyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gZ2V0UGFnZWREYXRhKFxyXG4gICAgdXJsOiBzdHJpbmcsIGNvbmZpZyA6IElDYW52YXNDYWxsQ29uZmlnIHwgbnVsbCA9IG51bGwpOiBQcm9taXNlPElDYW52YXNEYXRhW10+IHtcclxuXHJcbiAgICBpZiAoY29uZmlnPy5xdWVyeVBhcmFtcykge1xyXG4gICAgICAgIHVybCArPSAnPycgKyBzZWFyY2hQYXJhbXNGcm9tT2JqZWN0KGNvbmZpZy5xdWVyeVBhcmFtcyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyogUmV0dXJucyBhIGxpc3Qgb2YgZGF0YSBmcm9tIGEgR0VUIHJlcXVlc3QsIGdvaW5nIHRocm91Z2ggbXVsdGlwbGUgcGFnZXMgb2YgZGF0YSByZXF1ZXN0cyBhcyBuZWNlc3NhcnkgKi9cclxuICAgIGxldCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCwgY29uZmlnPy5mZXRjaEluaXQpO1xyXG4gICAgbGV0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XHJcbiAgICBpZiAodHlwZW9mIGRhdGEgPT09ICdvYmplY3QnICYmICFBcnJheS5pc0FycmF5KGRhdGEpKSB7XHJcbiAgICAgICAgbGV0IHZhbHVlcyA9IEFycmF5LmZyb20oT2JqZWN0LnZhbHVlcyhkYXRhKSk7XHJcbiAgICAgICAgaWYgKHZhbHVlcykge1xyXG4gICAgICAgICAgICBkYXRhID0gdmFsdWVzLmZpbmQoKGEpID0+IEFycmF5LmlzQXJyYXkoYSkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGFzc2VydChBcnJheS5pc0FycmF5KGRhdGEpKTtcclxuXHJcbiAgICBsZXQgbmV4dF9wYWdlX2xpbmsgPSBcIiFcIjtcclxuICAgIHdoaWxlIChuZXh0X3BhZ2VfbGluay5sZW5ndGggIT09IDAgJiZcclxuICAgIHJlc3BvbnNlICYmXHJcbiAgICByZXNwb25zZS5oZWFkZXJzLmhhcyhcIkxpbmtcIikgJiYgcmVzcG9uc2Uub2spIHtcclxuICAgICAgICBjb25zdCBsaW5rID0gcmVzcG9uc2UuaGVhZGVycy5nZXQoXCJMaW5rXCIpO1xyXG4gICAgICAgIGFzc2VydChsaW5rKTtcclxuICAgICAgICBjb25zdCBwYWdpbmF0aW9uTGlua3MgPSBsaW5rLnNwbGl0KFwiLFwiKTtcclxuXHJcbiAgICAgICAgY29uc3QgbmV4dExpbmsgPSBwYWdpbmF0aW9uTGlua3MuZmluZCgobGluaykgPT4gbGluay5pbmNsdWRlcygnbmV4dCcpKTtcclxuICAgICAgICBpZiAobmV4dExpbmspIHtcclxuICAgICAgICAgICAgbmV4dF9wYWdlX2xpbmsgPSBuZXh0TGluay5zcGxpdChcIjtcIilbMF0uc3BsaXQoXCI8XCIpWzFdLnNwbGl0KFwiPlwiKVswXTtcclxuICAgICAgICAgICAgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChuZXh0X3BhZ2VfbGluaywgY29uZmlnPy5mZXRjaEluaXQpO1xyXG4gICAgICAgICAgICBsZXQgcmVzcG9uc2VEYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHJlc3BvbnNlRGF0YSA9PT0gJ29iamVjdCcgJiYgIUFycmF5LmlzQXJyYXkoZGF0YSkpIHtcclxuICAgICAgICAgICAgICAgIGxldCB2YWx1ZXMgPSBBcnJheS5mcm9tKE9iamVjdC52YWx1ZXMoZGF0YSkpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlcykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlRGF0YSA9IHZhbHVlcz8uZmluZCgoYSkgPT4gQXJyYXkuaXNBcnJheShhKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGRhdGEgPSBkYXRhLmNvbmNhdChyZXNwb25zZURhdGEpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIG5leHRfcGFnZV9saW5rID0gXCJcIjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGRhdGE7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGZldGNoSnNvbihcclxuICAgIHVybDogc3RyaW5nLCBjb25maWc6IElDYW52YXNDYWxsQ29uZmlnIHwgbnVsbCA9IG51bGwpOiBQcm9taXNlPElDYW52YXNEYXRhfElDYW52YXNEYXRhW10+IHtcclxuICAgIGlmIChjb25maWc/LnF1ZXJ5UGFyYW1zKSB7XHJcbiAgICAgICAgdXJsICs9ICc/JyArIG5ldyBVUkxTZWFyY2hQYXJhbXMoY29uZmlnLnF1ZXJ5UGFyYW1zKTtcclxuICAgIH1cclxuICAgIGNvbmZpZyA/Pz0ge307XHJcbiAgICBpZiAoIWRvY3VtZW50KSB7XHJcbiAgICAgICAgY29uZmlnLmZldGNoSW5pdCA/Pz0ge307XHJcbiAgICAgICAgY29uZmlnLmZldGNoSW5pdC5oZWFkZXJzID0gW107XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwsIGNvbmZpZy5mZXRjaEluaXQpO1xyXG4gICAgcmV0dXJuIGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEZldGNoZXMgYSBqc29uIG9iamVjdCBmcm9tIC9hcGkvdjEvJHt1cmx9XHJcbiAqIEBwYXJhbSB1cmxcclxuICogQHBhcmFtIGNvbmZpZyBxdWVyeSBhbmQgZmV0Y2ggcGFyYW1zXHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBmZXRjaEFwaUpzb24odXJsOiBzdHJpbmcsIGNvbmZpZzogSUNhbnZhc0NhbGxDb25maWd8IG51bGwgPSBudWxsKSB7XHJcbiAgICB1cmwgPSBgL2FwaS92MS8ke3VybH1gO1xyXG4gICAgcmV0dXJuIGF3YWl0IGZldGNoSnNvbih1cmwsIGNvbmZpZyk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGZldGNoT25lQXBpSnNvbih1cmw6IHN0cmluZywgY29uZmlnOiBJQ2FudmFzQ2FsbENvbmZpZyB8IG51bGwgPSBudWxsKSB7XHJcbiAgICBsZXQgcmVzdWx0ID0gYXdhaXQgZmV0Y2hBcGlKc29uKHVybCwgY29uZmlnKTtcclxuICAgIGlmIChBcnJheS5pc0FycmF5KHJlc3VsdCkpIHJldHVybiByZXN1bHRbMF07XHJcbiAgICByZXR1cm4gPElDYW52YXNEYXRhPiByZXN1bHQ7XHJcbn1cclxuLyoqXHJcbiAqICBBIGJhc2UgY2xhc3MgZm9yIG9iamVjdHMgdGhhdCBpbnRlcmFjdCB3aXRoIHRoZSBDYW52YXMgQVBJXHJcbiAqL1xyXG5cclxuZXhwb3J0IGNsYXNzIEJhc2VDYW52YXNPYmplY3Qge1xyXG4gICAgc3RhdGljIGlkUHJvcGVydHkgPSAnaWQnOyAvLyBUaGUgZmllbGQgbmFtZSBvZiB0aGUgaWQgb2YgdGhlIGNhbnZhcyBvYmplY3QgdHlwZVxyXG4gICAgc3RhdGljIG5hbWVQcm9wZXJ0eTogc3RyaW5nIHwgbnVsbCA9IG51bGw7IC8vIFRoZSBmaWVsZCBuYW1lIG9mIHRoZSBwcmltYXJ5IG5hbWUgb2YgdGhlIGNhbnZhcyBvYmplY3QgdHlwZVxyXG4gICAgc3RhdGljIGNvbnRlbnRVcmxUZW1wbGF0ZTpzdHJpbmcgfCBudWxsID0gbnVsbDsgLy8gQSB0ZW1wbGF0ZWQgdXJsIHRvIGdldCBhIHNpbmdsZSBpdGVtXHJcbiAgICBzdGF0aWMgYWxsQ29udGVudFVybFRlbXBsYXRlOiBzdHJpbmcgfCBudWxsID0gbnVsbDsgLy8gQSB0ZW1wbGF0ZWQgdXJsIHRvIGdldCBhbGwgaXRlbXNcclxuICAgIHByb3RlY3RlZCBjYW52YXNEYXRhOiBJQ2FudmFzRGF0YTtcclxuICAgIHByb3RlY3RlZCBhY2NvdW50SWQ6IG51bGwgfCBudW1iZXIgPSBudWxsO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGRhdGE6IElDYW52YXNEYXRhKSB7XHJcbiAgICAgICAgdGhpcy5jYW52YXNEYXRhID0gZGF0YSB8fCB7fTsgLy8gQSBkaWN0IGhvbGRpbmcgdGhlIGRlY29kZWQganNvbiByZXByZXNlbnRhdGlvbiBvZiB0aGUgb2JqZWN0IGluIENhbnZhc1xyXG4gICAgfVxyXG5cclxuICAgIGdldENsYXNzKCk6IHR5cGVvZiBCYXNlQ29udGVudEl0ZW0ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdG9yIGFzIHR5cGVvZiBCYXNlQ29udGVudEl0ZW07XHJcbiAgICB9XHJcblxyXG4gICAgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHRoaXMuY2FudmFzRGF0YSk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0SXRlbShpdGVtOiBzdHJpbmcpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jYW52YXNEYXRhW2l0ZW1dIHx8IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IG15Q2xhc3MoKSB7IHJldHVybiAoPHR5cGVvZiBCYXNlQ29udGVudEl0ZW0+IHRoaXMuY29uc3RydWN0b3IpfVxyXG4gICAgZ2V0IG5hbWVLZXkoKSB7XHJcbiAgICAgICAgYXNzZXJ0KHRoaXMubXlDbGFzcy5uYW1lUHJvcGVydHkpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLm15Q2xhc3MubmFtZVByb3BlcnR5O1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBnZXQgY29udGVudFVybFBhdGgoKTogbnVsbCB8IHN0cmluZyB7XHJcbiAgICAgICAgY29uc3QgY29uc3RydWN0b3IgPSA8dHlwZW9mIEJhc2VDYW52YXNPYmplY3Q+dGhpcy5jb25zdHJ1Y3RvcjtcclxuXHJcbiAgICAgICAgYXNzZXJ0KHR5cGVvZiB0aGlzLmFjY291bnRJZCA9PT0gJ251bWJlcicpO1xyXG4gICAgICAgIGFzc2VydCh0eXBlb2YgY29uc3RydWN0b3IuY29udGVudFVybFRlbXBsYXRlID09PSAnc3RyaW5nJyk7XHJcbiAgICAgICAgcmV0dXJuIGNvbnN0cnVjdG9yLmNvbnRlbnRVcmxUZW1wbGF0ZVxyXG4gICAgICAgICAgICAucmVwbGFjZSgne2NvbnRlbnRfaWR9JywgdGhpcy5pZC50b1N0cmluZygpKVxyXG4gICAgICAgICAgICAucmVwbGFjZSgne2FjY291bnRfaWR9JywgdGhpcy5hY2NvdW50SWQudG9TdHJpbmcoKSk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGh0bWxDb250ZW50VXJsKCkge1xyXG4gICAgICAgIHJldHVybiBgLyR7dGhpcy5jb250ZW50VXJsUGF0aH1gO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCByYXdEYXRhKCk6IElDYW52YXNEYXRhIHtcclxuICAgICAgICBjb25zdCBvdXQ6IElDYW52YXNEYXRhID0ge1xyXG4gICAgICAgICAgICBpZDogTmFOLFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgZm9yIChsZXQga2V5IGluIHRoaXMuY2FudmFzRGF0YSkge1xyXG4gICAgICAgICAgICBvdXRba2V5XSA9IHRoaXMuY2FudmFzRGF0YVtrZXldO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gb3V0O1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBhc3luYyBnZXREYXRhQnlJZChjb250ZW50SWQ6IG51bWJlciwgY291cnNlOiBDb3Vyc2UgfCBudWxsID0gbnVsbCwgY29uZmlnIDogSUNhbnZhc0NhbGxDb25maWcgfCBudWxsID0gbnVsbCk6IFByb21pc2U8SUNhbnZhc0RhdGE+IHtcclxuICAgICAgICBsZXQgdXJsID0gdGhpcy5nZXRVcmxQYXRoRnJvbUlkcyhjb250ZW50SWQsIGNvdXJzZSA/IGNvdXJzZS5pZCA6IG51bGwpO1xyXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gIGF3YWl0IGZldGNoQXBpSnNvbih1cmwsIGNvbmZpZyk7XHJcbiAgICAgICAgYXNzZXJ0KCFBcnJheS5pc0FycmF5KHJlc3BvbnNlKSk7XHJcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBhc3luYyBnZXRCeUlkKGNvbnRlbnRJZDogbnVtYmVyLCBjb3Vyc2UgOiBDb3Vyc2UpIHtcclxuICAgICAgICByZXR1cm4gbmV3IHRoaXMoYXdhaXQgdGhpcy5nZXREYXRhQnlJZChjb250ZW50SWQsIGNvdXJzZSkpXHJcbiAgICB9XHJcbiAgICBzdGF0aWMgZ2V0VXJsUGF0aEZyb21JZHMoXHJcbiAgICAgICAgY29udGVudElkOiBudW1iZXIsXHJcbiAgICAgICAgY291cnNlSWQ6IG51bWJlciB8IG51bGwpIHtcclxuICAgICAgICBhc3NlcnQodHlwZW9mIHRoaXMuY29udGVudFVybFRlbXBsYXRlID09PSAnc3RyaW5nJyk7XHJcbiAgICAgICAgbGV0IHVybCA9IHRoaXMuY29udGVudFVybFRlbXBsYXRlXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKCd7Y29udGVudF9pZH0nLCBjb250ZW50SWQudG9TdHJpbmcoKSk7XHJcblxyXG4gICAgICAgIGlmIChjb3Vyc2VJZCkgdXJsID0gdXJsLnJlcGxhY2UoJ3tjb3Vyc2VfaWR9JywgY291cnNlSWQudG9TdHJpbmcoKSk7XHJcblxyXG4gICAgICAgIHJldHVybiB1cmw7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIGNvdXJzZUlkIC0gVGhlIGNvdXJzZSBJRCB0byBnZXQgZWxlbWVudHMgd2l0aGluLCBpZiBhcHBsaWNhYmxlXHJcbiAgICAgKiBAcGFyYW0gYWNjb3VudElkIC0gVGhlIGFjY291bnQgSUQgdG8gZ2V0IGVsZW1lbnRzIHdpdGhpbiwgaWYgYXBwbGljYWJsZVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgZ2V0QWxsVXJsKGNvdXJzZUlkOiBudW1iZXIgfCBudWxsID0gbnVsbCwgYWNjb3VudElkOiBudW1iZXIgfCBudWxsID0gbnVsbCkge1xyXG4gICAgICAgIGFzc2VydCh0eXBlb2YgdGhpcy5hbGxDb250ZW50VXJsVGVtcGxhdGUgPT09ICdzdHJpbmcnKTtcclxuICAgICAgICBsZXQgcmVwbGFjZWQgPSB0aGlzLmFsbENvbnRlbnRVcmxUZW1wbGF0ZTtcclxuXHJcbiAgICAgICAgaWYoY291cnNlSWQpIHJlcGxhY2VkID0gcmVwbGFjZWQucmVwbGFjZSgne2NvdXJzZV9pZH0nLCBjb3Vyc2VJZC50b1N0cmluZygpKTtcclxuICAgICAgICBpZihhY2NvdW50SWQpIHJlcGxhY2VkID0gcmVwbGFjZWQucmVwbGFjZSgne2FjY291bnRfaWR9JywgYWNjb3VudElkLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgIHJldHVybiByZXBsYWNlZDtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYXN5bmMgZ2V0QWxsKGNvbmZpZzogSUNhbnZhc0NhbGxDb25maWcgfCBudWxsID0gbnVsbCkge1xyXG4gICAgICAgIGxldCB1cmwgPSB0aGlzLmdldEFsbFVybCgpO1xyXG4gICAgICAgIGxldCBkYXRhID0gYXdhaXQgZ2V0QXBpUGFnZWREYXRhKHVybCwgY29uZmlnKTtcclxuICAgICAgICByZXR1cm4gZGF0YS5tYXAoaXRlbSA9PiBuZXcgdGhpcyhpdGVtKSk7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIGdldCBpZCgpIDogbnVtYmVyIHtcclxuICAgICAgICBjb25zdCBpZCA9IHRoaXMuY2FudmFzRGF0YVsoPHR5cGVvZiBCYXNlQ2FudmFzT2JqZWN0PiB0aGlzLmNvbnN0cnVjdG9yKS5pZFByb3BlcnR5XTtcclxuICAgICAgICByZXR1cm4gcGFyc2VJbnQoaWQpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBuYW1lKCkge1xyXG4gICAgICAgIGxldCBuYW1lUHJvcGVydHkgPSB0aGlzLmdldENsYXNzKCkubmFtZVByb3BlcnR5O1xyXG4gICAgICAgIGFzc2VydChuYW1lUHJvcGVydHkpXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0SXRlbShuYW1lUHJvcGVydHkpO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIHNhdmVEYXRhKGRhdGE6IERpY3QpIHtcclxuICAgICAgICBhc3NlcnQodGhpcy5jb250ZW50VXJsUGF0aCk7XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IGZldGNoQXBpSnNvbih0aGlzLmNvbnRlbnRVcmxQYXRoLCB7ZmV0Y2hJbml0IDoge1xyXG4gICAgICAgICAgICBtZXRob2Q6ICdQVVQnLFxyXG4gICAgICAgICAgICBib2R5OiBmb3JtRGF0YWlmeShkYXRhKVxyXG4gICAgICAgIH19KTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgZGVsZXRlKCkge1xyXG4gICAgICAgIGFzc2VydCh0aGlzLmNvbnRlbnRVcmxQYXRoKTtcclxuICAgICAgICByZXR1cm4gYXdhaXQgZmV0Y2hBcGlKc29uKHRoaXMuY29udGVudFVybFBhdGgsIHsgZmV0Y2hJbml0OiB7bWV0aG9kOiAnREVMRVRFJ319KVxyXG4gICAgfVxyXG5cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEFjY291bnQgZXh0ZW5kcyBCYXNlQ2FudmFzT2JqZWN0IHtcclxuICAgIHN0YXRpYyBuYW1lUHJvcGVydHkgPSAnbmFtZSc7IC8vIFRoZSBmaWVsZCBuYW1lIG9mIHRoZSBwcmltYXJ5IG5hbWUgb2YgdGhlIGNhbnZhcyBvYmplY3QgdHlwZVxyXG4gICAgc3RhdGljIGNvbnRlbnRVcmxUZW1wbGF0ZSA9ICdhY2NvdW50cy97Y29udGVudF9pZH0nOyAvLyBBIHRlbXBsYXRlZCB1cmwgdG8gZ2V0IGEgc2luZ2xlIGl0ZW1cclxuICAgIHN0YXRpYyBhbGxDb250ZW50VXJsVGVtcGxhdGUgPSAnYWNjb3VudHMnOyAvLyBBIHRlbXBsYXRlZCB1cmwgdG8gZ2V0IGFsbCBpdGVtc1xyXG4gICAgcHJpdmF0ZSBzdGF0aWMgYWNjb3VudDogQWNjb3VudDtcclxuICAgIHN0YXRpYyBhc3luYyBnZXRGcm9tVXJsKHVybDogc3RyaW5nIHwgbnVsbCA9IG51bGwpIHtcclxuICAgICAgICBpZiAodXJsID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHVybCA9IGRvY3VtZW50LmRvY3VtZW50VVJJO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgbWF0Y2ggPSAvYWNjb3VudHNcXC8oXFxkKykvLmV4ZWModXJsKTtcclxuICAgICAgICBpZiAobWF0Y2gpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2cobWF0Y2gpO1xyXG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5nZXRCeUlkKHBhcnNlSW50KG1hdGNoWzFdKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBhc3luYyBnZXRCeUlkKGFjY291bnRJZDogbnVtYmVyLCBjb25maWc6IElDYW52YXNDYWxsQ29uZmlnIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHRoaXMuZ2V0RGF0YUJ5SWQoYWNjb3VudElkLCBudWxsLCBjb25maWcpXHJcbiAgICAgICAgY29uc29sZS5hc3NlcnQoKVxyXG4gICAgICAgIHJldHVybiBuZXcgQWNjb3VudChkYXRhKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYXN5bmMgZ2V0Um9vdEFjY291bnQocmVzZXRDYWNoZSA9IGZhbHNlKSB7XHJcbiAgICAgICAgbGV0IGFjY291bnRzOiBBY2NvdW50W10gPSA8QWNjb3VudFtdPiBhd2FpdCB0aGlzLmdldEFsbCgpO1xyXG4gICAgICAgIGlmICghcmVzZXRDYWNoZSAmJiB0aGlzLmhhc093blByb3BlcnR5KCdhY2NvdW50JykgJiYgdGhpcy5hY2NvdW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFjY291bnQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCByb290ID0gYWNjb3VudHMuZmluZCgoYSkgPT4gYS5yb290QWNjb3VudElkID09PSBudWxsKTtcclxuICAgICAgICBhc3NlcnQocm9vdCk7XHJcbiAgICAgICAgdGhpcy5hY2NvdW50ID0gcm9vdDtcclxuICAgICAgICByZXR1cm4gcm9vdDtcclxuICAgIH1cclxuXHJcblxyXG4gICAgZ2V0IHJvb3RBY2NvdW50SWQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FudmFzRGF0YVsncm9vdF9hY2NvdW50X2lkJ11cclxuICAgIH1cclxuXHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBDb3Vyc2UgZXh0ZW5kcyBCYXNlQ2FudmFzT2JqZWN0IHtcclxuICAgIHN0YXRpYyBDT0RFX1JFR0VYID0gL14oLitbXl9dKT9fPyhcXHd7NH1cXGR7M30pL2k7IC8vIEFkYXB0ZWQgdG8gSmF2YVNjcmlwdCdzIHJlZ2V4IHN5bnRheC5cclxuICAgIHByaXZhdGUgX21vZHVsZXM6IElNb2R1bGVEYXRhW10gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XHJcbiAgICBwcml2YXRlIG1vZHVsZXNCeVdlZWtOdW1iZXI6IExvb2tVcFRhYmxlPElNb2R1bGVEYXRhPiB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcclxuICAgIHByaXZhdGUgc3RhdGljIGNvbnRlbnRDbGFzc2VzOiAodHlwZW9mIEJhc2VDb250ZW50SXRlbSlbXSA9IFtdO1xyXG5cclxuICAgIHN0YXRpYyBhc3luYyBnZXRGcm9tVXJsKHVybDogc3RyaW5nIHwgbnVsbCA9IG51bGwpIHtcclxuICAgICAgICBpZiAodXJsID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHVybCA9IGRvY3VtZW50LmRvY3VtZW50VVJJO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgbWF0Y2ggPSAvY291cnNlc1xcLyhcXGQrKS8uZXhlYyh1cmwpO1xyXG4gICAgICAgIGlmIChtYXRjaCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhtYXRjaCk7XHJcbiAgICAgICAgICAgIGNvbnN0IGlkID0gdGhpcy5nZXRJZEZyb21VcmwodXJsKTtcclxuICAgICAgICAgICAgaWYoIWlkKSByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuZ2V0QnlJZChpZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBnZXRJZEZyb21VcmwodXJsOiBzdHJpbmcpIHtcclxuICAgICAgICBsZXQgbWF0Y2ggPSAvY291cnNlc1xcLyhcXGQrKS8uZXhlYyh1cmwpO1xyXG4gICAgICAgIGlmIChtYXRjaCkge1xyXG4gICAgICAgICAgICByZXR1cm4gcGFyc2VJbnQobWF0Y2hbMV0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoaXMgbGlicmFyeSdzIGNsYXNzIGNvcnJlc3BvbmRpbmcgdG8gdGhlIGN1cnJlbnQgdXJsLCBkcmF3aW5nIGZyb20gQ291cnNlLmNvbnRlbnRDbGFzc2VzLlxyXG4gICAgICogQ2xhc3NlcyBjYW4gYmUgaW5jbHVkZWQgaW4gQ291cnNlLmNvbnRlbnRDbGFzc2VzIHVzaW5nIHRoZSBkZWNvcmF0b3IgQGNvbnRlbnRDbGFzc1xyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB1cmxcclxuICAgICAqL1xyXG4gICAgc3RhdGljIGdldENvbnRlbnRDbGFzc0Zyb21VcmwodXJsOiBzdHJpbmd8IG51bGwgPSBudWxsKSB7XHJcbiAgICAgICAgaWYgKCF1cmwpIHVybCA9IGRvY3VtZW50LmRvY3VtZW50VVJJO1xyXG5cclxuXHJcbiAgICAgICAgZm9yKGxldCBjbGFzc18gb2YgdGhpcy5jb250ZW50Q2xhc3Nlcykge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhjbGFzc18sIGNsYXNzXy5jb250ZW50VXJsUGFydCk7XHJcbiAgICAgICAgICAgIGlmKGNsYXNzXy5jb250ZW50VXJsUGFydCAmJiB1cmwuaW5jbHVkZXMoY2xhc3NfLmNvbnRlbnRVcmxQYXJ0KSkgcmV0dXJuIGNsYXNzXztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHN0YXRpYyBhc3luYyBnZXRCeUlkKGNvdXJzZUlkOiBudW1iZXIsIGNvbmZpZzogSUNhbnZhc0NhbGxDb25maWcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQpIHtcclxuICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgZmV0Y2hPbmVBcGlKc29uKGBjb3Vyc2VzLyR7Y291cnNlSWR9YCwgY29uZmlnKTtcclxuICAgICAgICByZXR1cm4gbmV3IENvdXJzZShkYXRhKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyBhc3luYyBnZXRDb3Vyc2VzQnlTdHJpbmcoY29kZTpzdHJpbmcsIHRlcm06IFRlcm0gfCBudWxsID0gbnVsbCwgY29uZmlnOiBJQ2FudmFzQ2FsbENvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgbGV0IGNvdXJzZURhdGFMaXN0OiBJQ2FudmFzRGF0YVtdIHwgbnVsbCA9IG51bGw7XHJcbiAgICAgICAgY29uc3QgYWNjb3VudElkc0J5TmFtZSA9IGF3YWl0IENvdXJzZS5nZXRBY2NvdW50SWRzQnlOYW1lKCk7XHJcbiAgICAgICAgZm9yIChsZXQgYWNjb3VudEtleSBpbiBhY2NvdW50SWRzQnlOYW1lKSB7XHJcbiAgICAgICAgICAgIGxldCBhY2NvdW50SWQgPSBhY2NvdW50SWRzQnlOYW1lW2FjY291bnRLZXldO1xyXG4gICAgICAgICAgICBsZXQgdXJsID0gYGFjY291bnRzLyR7YWNjb3VudElkfS9jb3Vyc2VzYDtcclxuICAgICAgICAgICAgY29uZmlnLnF1ZXJ5UGFyYW1zID0gY29uZmlnLnF1ZXJ5UGFyYW1zIHx8IHt9O1xyXG4gICAgICAgICAgICBjb25maWcucXVlcnlQYXJhbXNbJ3NlYXJjaF90ZXJtJ10gPSBjb2RlO1xyXG4gICAgICAgICAgICBpZiAodGVybSAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgY29uZmlnLnF1ZXJ5UGFyYW1zWydlbnJvbGxtZW50X3Rlcm1faWQnXSA9IHRlcm0uaWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY291cnNlRGF0YUxpc3QgPSBhd2FpdCBnZXRBcGlQYWdlZERhdGEodXJsLCBjb25maWcpO1xyXG4gICAgICAgICAgICBpZiAoY291cnNlRGF0YUxpc3QgJiYgY291cnNlRGF0YUxpc3QubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghY291cnNlRGF0YUxpc3QgfHwgY291cnNlRGF0YUxpc3QubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGNvdXJzZURhdGFMaXN0Lmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgY291cnNlRGF0YUxpc3Quc29ydCgoYSwgYikgPT4gYi5pZCAtIGEuaWQpOyAvLyBTb3J0IGNvdXJzZXMgYnkgSUQgaW4gZGVzY2VuZGluZyBvcmRlclxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGNvdXJzZURhdGFMaXN0Lm1hcChjb3Vyc2VEYXRhID0+IG5ldyBDb3Vyc2UoY291cnNlRGF0YSkpO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIGFzeW5jIGdldEFsbEJ5Q29kZShjb2RlOiBzdHJpbmcsIHRlcm06IFRlcm0gfCBudWxsID0gbnVsbCwgY29uZmlnOiBJQ2FudmFzQ2FsbENvbmZpZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldENvdXJzZXNCeVN0cmluZyhjb2RlLCB0ZXJtLCBjb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBhc3luYyBnZXRCeUNvZGUoY29kZTogc3RyaW5nLCB0ZXJtIDogVGVybSB8IG51bGwgPSBudWxsLCBjb25maWc6IElDYW52YXNDYWxsQ29uZmlnIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkKVxyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGNvdXJzZXMgPSBhd2FpdCB0aGlzLmdldENvdXJzZXNCeVN0cmluZyhjb2RlLCB0ZXJtLCBjb25maWcpO1xyXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KGNvdXJzZXMpKSByZXR1cm4gY291cnNlc1swXTtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYXN5bmMgZ2V0QWNjb3VudElkc0J5TmFtZSgpOiBQcm9taXNlPERpY3Q+IHtcclxuICAgICAgICBsZXQgY291cnNlID0gYXdhaXQgQ291cnNlLmdldEZyb21VcmwoKTtcclxuICAgICAgICBpZiAoIWNvdXJzZSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCJZb3UgbXVzdCBiZSBvbiBhIGNhbnZhcyBwYWdlIHRvIGdldCBhY2NvdW50c1wiKTtcclxuICAgICAgICAgICAgcmV0dXJuIHt9O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAncm9vdCc6IGNvdXJzZS5jYW52YXNEYXRhWydyb290X2FjY291bnRfaWQnXSxcclxuICAgICAgICAgICAgJ2N1cnJlbnQnOiBjb3Vyc2UuY2FudmFzRGF0YVsnYWNjb3VudElkJ11cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vIHN0YXRpYyBhc3luYyBjb3Vyc2VFdmVudChjb3Vyc2VzOiBDb3Vyc2VbXSwgZXZlbnQ6IHN0cmluZywgYWNjb3VudElkOiBudW1iZXIpIHtcclxuICAgIC8vICAgICBjb25zdCB1cmwgPSBgYWNjb3VudHMvJHthY2NvdW50SWR9L2NvdXJzZXNgOyAvLyBBc3N1bWluZyBBUElfVVJMIGFuZCBBQ0NPVU5UX0lEIGFyZSBkZWZpbmVkIGVsc2V3aGVyZVxyXG4gICAgLy8gICAgIGNvbnN0IGRhdGEgPSB7XHJcbiAgICAvLyAgICAgICAgICdldmVudCc6IGV2ZW50LFxyXG4gICAgLy8gICAgICAgICAnY291cnNlX2lkc1tdJzogY291cnNlcy5tYXAoY291cnNlID0+IGNvdXJzZS5pZClcclxuICAgIC8vICAgICB9O1xyXG4gICAgLy8gICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLCB7XHJcbiAgICAvLyAgICAgICAgIG1ldGhvZDogJ1BVVCcsXHJcbiAgICAvLyAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGRhdGEpXHJcbiAgICAvLyAgICAgfSk7XHJcbiAgICAvLyAgICAgaWYgKCFyZXNwb25zZS5vaykge1xyXG4gICAgLy8gICAgICAgICBjb25zb2xlLmVycm9yKGF3YWl0IHJlc3BvbnNlLnRleHQoKSk7XHJcbiAgICAvLyAgICAgfVxyXG4gICAgLy8gfVxyXG5cclxuICAgIGdldCBjb250ZW50VXJsUGF0aCgpIHtcclxuICAgICAgICByZXR1cm4gYGNvdXJzZXMvJHt0aGlzLmlkfWA7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGNvdXJzZVVybCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5odG1sQ29udGVudFVybDtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgY291cnNlQ29kZSgpOiBudWxsIHwgc3RyaW5nIHtcclxuICAgICAgICBsZXQgbWF0Y2ggPSB0aGlzLmNvZGVNYXRjaDtcclxuICAgICAgICBpZiAoIW1hdGNoKSByZXR1cm4gbnVsbDtcclxuICAgICAgICBsZXQgcHJlZml4ID0gbWF0Y2hbMV0gfHwgXCJcIjtcclxuICAgICAgICBsZXQgY291cnNlQ29kZSA9IG1hdGNoWzJdIHx8IFwiXCI7XHJcbiAgICAgICAgcmV0dXJuIGAke3ByZWZpeH1fJHtjb3Vyc2VDb2RlfWA7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGNvZGVNYXRjaCgpIHtcclxuICAgICAgICByZXR1cm4gQ291cnNlLkNPREVfUkVHRVguZXhlYyh0aGlzLmNhbnZhc0RhdGEuY291cnNlX2NvZGUpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBiYXNlQ29kZSgpIHtcclxuICAgICAgICBsZXQgbWF0Y2ggPSB0aGlzLmNvZGVNYXRjaDtcclxuICAgICAgICByZXR1cm4gbWF0Y2ggPyBtYXRjaFsyXSA6ICcnO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBjb2RlUHJlZml4KCkge1xyXG4gICAgICAgIGxldCBtYXRjaCA9IHRoaXMuY29kZU1hdGNoO1xyXG4gICAgICAgIHJldHVybiBtYXRjaCA/IG1hdGNoWzFdIDogJyc7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGlzQmx1ZXByaW50KCkge1xyXG4gICAgICAgIHJldHVybiAnYmx1ZXByaW50JyBpbiB0aGlzLmNhbnZhc0RhdGEgJiYgdGhpcy5jYW52YXNEYXRhWydibHVlcHJpbnQnXTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgaXNQdWJsaXNoZWQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FudmFzRGF0YVsnd29ya2Zsb3dfc3RhdGUnXSA9PT0gJ2F2YWlsYWJsZSc7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgZ2V0TW9kdWxlcygpOiBQcm9taXNlPElNb2R1bGVEYXRhW10+IHtcclxuICAgICAgICBpZih0aGlzLl9tb2R1bGVzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9tb2R1bGVzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgbW9kdWxlcyA9IDxJTW9kdWxlRGF0YVtdPiBhd2FpdCBnZXRBcGlQYWdlZERhdGEoYCR7dGhpcy5jb250ZW50VXJsUGF0aH0vbW9kdWxlcz9pbmNsdWRlW109aXRlbXMmaW5jbHVkZVtdPWNvbnRlbnRfZGV0YWlsc2ApO1xyXG4gICAgICAgIHRoaXMuX21vZHVsZXMgPSBtb2R1bGVzO1xyXG4gICAgICAgIHJldHVybiBtb2R1bGVzO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGdldENvbnRlbnRJdGVtRnJvbVVybCh1cmw6c3RyaW5nIHwgbnVsbCA9IG51bGwpIHtcclxuICAgICAgICBsZXQgQ29udGVudENsYXNzID0gQ291cnNlLmdldENvbnRlbnRDbGFzc0Zyb21VcmwodXJsKTtcclxuICAgICAgICBpZighQ29udGVudENsYXNzKSByZXR1cm4gbnVsbDtcclxuICAgICAgICByZXR1cm4gQ29udGVudENsYXNzLmdldEZyb21VcmwodXJsKTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBnZXRNb2R1bGVzQnlXZWVrTnVtYmVyKCkge1xyXG4gICAgICAgIGlmICh0aGlzLm1vZHVsZXNCeVdlZWtOdW1iZXIpIHJldHVybiB0aGlzLm1vZHVsZXNCeVdlZWtOdW1iZXI7XHJcbiAgICAgICAgbGV0IG1vZHVsZXMgPSBhd2FpdCB0aGlzLmdldE1vZHVsZXMoKTtcclxuICAgICAgICBsZXQgbW9kdWxlc0J5V2Vla051bWJlcjogTG9va1VwVGFibGU8SU1vZHVsZURhdGE+ID0ge307XHJcbiAgICAgICAgZm9yKGxldCBtb2R1bGUgb2YgbW9kdWxlcykgIHtcclxuICAgICAgICAgICAgbGV0IHdlZWtOdW1iZXIgPSBnZXRNb2R1bGVXZWVrTnVtYmVyKG1vZHVsZSk7XHJcbiAgICAgICAgICAgIGlmICh3ZWVrTnVtYmVyKSB7XHJcbiAgICAgICAgICAgICAgICBtb2R1bGVzQnlXZWVrTnVtYmVyW3dlZWtOdW1iZXJdID0gbW9kdWxlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMubW9kdWxlc0J5V2Vla051bWJlciA9IG1vZHVsZXNCeVdlZWtOdW1iZXI7XHJcbiAgICAgICAgcmV0dXJuIG1vZHVsZXNCeVdlZWtOdW1iZXI7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgZ2V0TW9kdWxlSXRlbUxpbmsobW9kdWxlT3JXZWVrTnVtYmVyOiBudW1iZXIgfCBEaWN0LCB0YXJnZXQ6IElNb2R1bGVJdGVtRGF0YSB8IHtcclxuICAgICAgICB0eXBlOiBNb2R1bGVJdGVtVHlwZSxcclxuICAgICAgICBzZWFyY2g/OiBzdHJpbmcsXHJcbiAgICAgICAgaW5kZXg/OiBudW1iZXIsXHJcbiAgICB9KSB7XHJcbiAgICAgICAgYXNzZXJ0KHRhcmdldC5oYXNPd25Qcm9wZXJ0eSgndHlwZScpKTtcclxuICAgICAgICBsZXQgdGFyZ2V0VHlwZTogTW9kdWxlSXRlbVR5cGUgPSB0YXJnZXQudHlwZTtcclxuICAgICAgICBsZXQgdXJsOiBzdHJpbmd8IG51bGwgPSBudWxsO1xyXG4gICAgICAgIGxldCBjb250ZW50U2VhcmNoU3RyaW5nID0gdGFyZ2V0Lmhhc093blByb3BlcnR5KCdzZWFyY2gnKT8gdGFyZ2V0LnNlYXJjaCA6IG51bGw7XHJcbiAgICAgICAgbGV0IHRhcmdldEluZGV4ID0gdGFyZ2V0Lmhhc093blByb3BlcnR5KCdpbmRleCcpID8gdGFyZ2V0LmluZGV4IDogbnVsbDtcclxuICAgICAgICBsZXQgdGFyZ2V0TW9kdWxlV2Vla051bWJlcjtcclxuICAgICAgICBsZXQgdGFyZ2V0TW9kdWxlO1xyXG4gICAgICAgIGlmICh0eXBlb2YgbW9kdWxlT3JXZWVrTnVtYmVyID09PSAnbnVtYmVyJykge1xyXG4gICAgICAgICAgICBsZXQgbW9kdWxlcyA9IGF3YWl0IHRoaXMuZ2V0TW9kdWxlc0J5V2Vla051bWJlcigpO1xyXG4gICAgICAgICAgICBhc3NlcnQobW9kdWxlcy5oYXNPd25Qcm9wZXJ0eShtb2R1bGVPcldlZWtOdW1iZXIpKTtcclxuICAgICAgICAgICAgdGFyZ2V0TW9kdWxlV2Vla051bWJlciA9IG1vZHVsZU9yV2Vla051bWJlcjtcclxuICAgICAgICAgICAgdGFyZ2V0TW9kdWxlID0gbW9kdWxlc1t0YXJnZXRNb2R1bGVXZWVrTnVtYmVyXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0YXJnZXRNb2R1bGUgPSBtb2R1bGVPcldlZWtOdW1iZXI7XHJcbiAgICAgICAgICAgIHRhcmdldE1vZHVsZVdlZWtOdW1iZXIgPSBnZXRNb2R1bGVXZWVrTnVtYmVyKHRhcmdldE1vZHVsZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGFyZ2V0TW9kdWxlICYmIHR5cGVvZiB0YXJnZXRUeXBlICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAvL0lmIGl0J3MgYSBwYWdlLCBqdXN0IHNlYXJjaCBmb3IgdGhlIHBhcmFtZXRlciBzdHJpbmdcclxuICAgICAgICAgICAgaWYodGFyZ2V0VHlwZSA9PT0gJ1BhZ2UnICYmIGNvbnRlbnRTZWFyY2hTdHJpbmcpIHtcclxuICAgICAgICAgICAgICAgIHVybCA9IGAvY291cnNlcy8ke3RoaXMuaWR9L3BhZ2VzPyR7bmV3IFVSTFNlYXJjaFBhcmFtcyhbWydzZWFyY2hfdGVybScsIGNvbnRlbnRTZWFyY2hTdHJpbmddXSl9YDtcclxuXHJcbiAgICAgICAgICAgIC8vSWYgaXQncyBhbnl0aGluZyBlbHNlLCBnZXQgb25seSB0aG9zZSBpdGVtcyBpbiB0aGUgbW9kdWxlIGFuZCBzZXQgdXJsIHRvIHRoZSB0YXJnZXRJbmRleHRoIG9uZS5cclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0YXJnZXRUeXBlICYmIHRhcmdldEluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICAvL2J1bXAgaW5kZXggZm9yIHdlZWsgMSB0byBhY2NvdW50IGZvciBpbnRybyBkaXNjdXNzaW9uIC8gY2hlY2tpbmcgZm9yIHJ1YnJpYyB3b3VsZCByZXF1aXJlIHB1bGxpbmcgdG9vIG11Y2ggZGF0YVxyXG4gICAgICAgICAgICAgICAgLy9hbmQgdG9vIG11Y2ggcGVyZm9ybWFuY2Ugb3ZlcmhlYWRcclxuICAgICAgICAgICAgICAgIGlmICh0YXJnZXRUeXBlID09PSAnRGlzY3Vzc2lvbicgJiYgdGFyZ2V0TW9kdWxlV2Vla051bWJlciA9PT0gMSApIHRhcmdldEluZGV4Kys7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBtYXRjaGluZ1R5cGVJdGVtcyA9IHRhcmdldE1vZHVsZS5pdGVtcy5maWx0ZXIoIChhOiBEaWN0KSA9PiBhLnR5cGUgPT09IHRhcmdldFR5cGUpO1xyXG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoaW5nVHlwZUl0ZW1zLmxlbmd0aCA+PSB0YXJnZXRJbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vV2UgZGlzY3VzcyBhbmQgbnVtYmVyIHRoZSBhc3NpZ25tZW50cyBpbmRleGVkIGF0IDEsIGJ1dCB0aGUgYXJyYXkgaXMgaW5kZXhlZCBhdCAwXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdGFyZ2V0SXRlbSA9IG1hdGNoaW5nVHlwZUl0ZW1zW3RhcmdldEluZGV4IC0gMV07XHJcbiAgICAgICAgICAgICAgICAgICAgdXJsID0gdGFyZ2V0SXRlbVsnaHRtbF91cmwnXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdXJsO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGdldFN5bGxhYnVzKCk6IFByb21pc2U8c3RyaW5nPiB7XHJcbiAgICAgICAgaWYgKCEoJ3N5bGxhYnVzX2JvZHknIGluIHRoaXMuY2FudmFzRGF0YSkpIHtcclxuICAgICAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IENvdXJzZS5nZXRCeUlkKHRoaXMuaWQsIHsnaW5jbHVkZVtdJzogJ3N5bGxhYnVzX2JvZHknfSk7XHJcbiAgICAgICAgICAgIHRoaXMuY2FudmFzRGF0YVsnc3lsbGFidXNfYm9keSddID0gZGF0YS5jYW52YXNEYXRhWydzeWxsYWJ1c19ib2R5J107XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLmNhbnZhc0RhdGFbJ3N5bGxhYnVzX2JvZHknXTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIGdldHMgYWxsIGFzc2lnbm1lbnRzIGluIGEgY291cnNlXHJcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxBc3NpZ25tZW50W10+fVxyXG4gICAgICogQHBhcmFtIGNvbmZpZ1xyXG4gICAgICovXHJcbiAgICBhc3luYyBnZXRBc3NpZ25tZW50cyhjb25maWcgOiBJQ2FudmFzQ2FsbENvbmZpZyA9IHtcclxuICAgICAgICBxdWVyeVBhcmFtczogeydpbmNsdWRlJzogWydkdWVfYXQnXX1cclxuICAgIH0pOiBQcm9taXNlPEFzc2lnbm1lbnRbXT4ge1xyXG4gICAgICAgIHJldHVybiA8QXNzaWdubWVudFtdPiBhd2FpdCBBc3NpZ25tZW50LmdldEFsbEluQ291cnNlKHRoaXMsIGNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKkdldHMgYWxsIHF1aXp6ZXMgaW4gYSBjb3Vyc2VcclxuICAgICAqIEBwYXJhbSBxdWVyeVBhcmFtcyBhIGpzb24gb2JqZWN0IHJlcHJlc2VudGluZyB0aGUgcXVlcnkgcGFyYW0gc3RyaW5nLiBEZWZhdWx0cyB0byBpbmNsdWRpbmcgZHVlIGRhdGVzICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxRdWl6W10+fVxyXG4gICAgICovXHJcbiAgICBhc3luYyBnZXRRdWl6emVzKHF1ZXJ5UGFyYW1zID0geydpbmNsdWRlJzogWydkdWVfYXQnXX0pOiBQcm9taXNlPFF1aXpbXT4ge1xyXG4gICAgICAgIHJldHVybiA8UXVpeltdPiBhd2FpdCBRdWl6LmdldEFsbEluQ291cnNlKHRoaXMsIHtxdWVyeVBhcmFtc30pO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGdldEFzc29jaWF0ZWRDb3Vyc2VzKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5pc0JsdWVwcmludCkgcmV0dXJuIG51bGw7XHJcblxyXG4gICAgICAgIGNvbnN0IHVybCA9IGBjb3Vyc2VzLyR7dGhpcy5pZH0vYmx1ZXByaW50X3RlbXBsYXRlcy9kZWZhdWx0L2Fzc29jaWF0ZWRfY291cnNlc2A7XHJcbiAgICAgICAgY29uc3QgY291cnNlcyA9IGF3YWl0IGdldEFwaVBhZ2VkRGF0YSh1cmwsIHtxdWVyeVBhcmFtczoge3Blcl9wYWdlOiA1MH19KTtcclxuICAgICAgICByZXR1cm4gY291cnNlcy5tYXAoY291cnNlRGF0YSA9PiBuZXcgQ291cnNlKGNvdXJzZURhdGEpKTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBnZXRTdWJzZWN0aW9ucygpIHtcclxuICAgICAgICBjb25zdCB1cmwgPSBgL2FwaS92MS9jb3Vyc2VzLyR7dGhpcy5pZH0vc2VjdGlvbnNgO1xyXG4gICAgICAgIHJldHVybiBhd2FpdCBmZXRjaEFwaUpzb24odXJsKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgZ2V0VGFicygpIHtcclxuICAgICAgICByZXR1cm4gYXdhaXQgZmV0Y2hBcGlKc29uKGBjb3Vyc2VzLyR7dGhpcy5pZH0vdGFic2ApO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGdldEZyb250UGFnZSgpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgZmV0Y2hPbmVBcGlKc29uKGAke3RoaXMuY29udGVudFVybFBhdGh9L2Zyb250X3BhZ2VgKTtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBQYWdlKGRhdGEsIHRoaXMpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBnZXRUYWIobGFiZWw6IHN0cmluZykge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNhbnZhc0RhdGEudGFicy5maW5kKCh0YWI6IERpY3QpID0+IHRhYi5sYWJlbCA9PT0gbGFiZWwpIHx8IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgc2V0TmF2aWdhdGlvblRhYkhpZGRlbihsYWJlbDogc3RyaW5nLCB2YWx1ZTogYm9vbGVhbikge1xyXG4gICAgICAgIGNvbnN0IHRhYiA9IHRoaXMuZ2V0VGFiKGxhYmVsKTtcclxuICAgICAgICBpZiAoIXRhYikgcmV0dXJuIG51bGw7XHJcblxyXG4gICAgICAgIHJldHVybiBhd2FpdCBmZXRjaEFwaUpzb24oYGNvdXJzZXMvJHt0aGlzLmlkfS90YWJzLyR7dGFiLmlkfWAsIHtcclxuICAgICAgICAgICAgcXVlcnlQYXJhbXMgOiB7J2hpZGRlbic6IHZhbHVlfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGNoYW5nZVN5bGxhYnVzKG5ld0h0bWw6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuY2FudmFzRGF0YVsnc3lsbGFidXNfYm9keSddID0gbmV3SHRtbDtcclxuICAgICAgICByZXR1cm4gYXdhaXQgZmV0Y2hBcGlKc29uKGBjb3Vyc2VzLyR7dGhpcy5pZH1gLCB7XHJcbiAgICAgICAgICAgIGZldGNoSW5pdDoge1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnUFVUJyxcclxuICAgICAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsnY291cnNlW3N5bGxhYnVzX2JvZHldJzogbmV3SHRtbH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBnZXRQb3RlbnRpYWxTZWN0aW9ucyh0ZXJtOiBUZXJtKSB7XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IENvdXJzZS5nZXRBbGxCeUNvZGUodGhpcy5iYXNlQ29kZSwgdGVybSk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgbG9ja0JsdWVwcmludCgpIHtcclxuICAgICAgICBjb25zdCBtb2R1bGVzID0gYXdhaXQgdGhpcy5nZXRNb2R1bGVzKCk7XHJcbiAgICAgICAgbGV0IGl0ZW1zOiBJTW9kdWxlSXRlbURhdGFbXSA9IFtdO1xyXG4gICAgICAgIGl0ZW1zID0gaXRlbXMuY29uY2F0KC4uLm1vZHVsZXMubWFwKChhKSA9Pig8SU1vZHVsZUl0ZW1EYXRhW10+IFtdICkuY29uY2F0KC4uLmEuaXRlbXMpKSk7XHJcbiAgICAgICAgY29uc3QgcHJvbWlzZXMgPSBpdGVtcy5tYXAoYXN5bmMgKGl0ZW0pID0+IHtcclxuICAgICAgICAgICAgY29uc3QgdXJsID0gYCR7dGhpcy5jb250ZW50VXJsUGF0aH0vYmx1ZXByaW50X3RlbXBsYXRlcy9kZWZhdWx0L3Jlc3RyaWN0X2l0ZW1gO1xyXG4gICAgICAgICAgICBsZXQge3R5cGUsIGlkfSA9IGF3YWl0IGdldEl0ZW1UeXBlQW5kSWQoaXRlbSk7XHJcbiAgICAgICAgICAgIGxldCBib2R5ID0ge1xyXG4gICAgICAgICAgICAgICAgXCJjb250ZW50X3R5cGVcIjogdHlwZSxcclxuICAgICAgICAgICAgICAgIFwiY29udGVudF9pZFwiOiBpZCxcclxuICAgICAgICAgICAgICAgIFwicmVzdHJpY3RlZFwiOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgXCJfbWV0aG9kXCI6ICdQVVQnXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGJvZHkpO1xyXG4gICAgICAgICAgICBhd2FpdCBmZXRjaEFwaUpzb24odXJsLCB7ZmV0Y2hJbml0OntcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BVVCcsXHJcbiAgICAgICAgICAgICAgICBib2R5OiBmb3JtRGF0YWlmeShib2R5KVxyXG4gICAgICAgICAgICB9fSk7XHJcblxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGF3YWl0IFByb21pc2UuYWxsKHByb21pc2VzKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgc2V0QXNCbHVlcHJpbnQoKSB7XHJcbiAgICAgICAgY29uc3QgdXJsID0gYGNvdXJzZXMvJHt0aGlzLmlkfWA7XHJcbiAgICAgICAgY29uc3QgcGF5bG9hZCA9IHtcclxuICAgICAgICAgICAgJ2NvdXJzZVtibHVlcHJpbnRdJzogdHJ1ZSxcclxuICAgICAgICAgICAgJ2NvdXJzZVt1c2VfYmx1ZXByaW50X3Jlc3RyaWN0aW9uc19ieV9vYmplY3RfdHlwZV0nOiAwLFxyXG4gICAgICAgICAgICAnY291cnNlW2JsdWVwcmludF9yZXN0cmljdGlvbnNdW2NvbnRlbnRdJzogMSxcclxuICAgICAgICAgICAgJ2NvdXJzZVtibHVlcHJpbnRfcmVzdHJpY3Rpb25zXVtwb2ludHNdJzogMSxcclxuICAgICAgICAgICAgJ2NvdXJzZVtibHVlcHJpbnRfcmVzdHJpY3Rpb25zXVtkdWVfZGF0ZXNdJzogMSxcclxuICAgICAgICAgICAgJ2NvdXJzZVtibHVlcHJpbnRfcmVzdHJpY3Rpb25zXVthdmFpbGFiaWxpdHlfZGF0ZXNdJzogMSxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmNhbnZhc0RhdGEgPSBhd2FpdCBmZXRjaE9uZUFwaUpzb24odXJsLHtmZXRjaEluaXQ6e1xyXG4gICAgICAgICAgICBtZXRob2Q6ICdQVVQnLFxyXG4gICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShwYXlsb2FkKVxyXG4gICAgICAgIH19KTtcclxuICAgICAgICB0aGlzLnJlc2V0Q2FjaGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyB1bnNldEFzQmx1ZXByaW50KCkge1xyXG4gICAgICAgIGNvbnN0IHVybCA9IGBjb3Vyc2VzLyR7dGhpcy5pZH1gO1xyXG4gICAgICAgIGNvbnN0IHBheWxvYWQgPSB7XHJcbiAgICAgICAgICAgICdjb3Vyc2VbYmx1ZXByaW50XSc6IGZhbHNlLFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5jYW52YXNEYXRhID0gYXdhaXQgZmV0Y2hPbmVBcGlKc29uKHVybCwge2ZldGNoSW5pdDp7XHJcbiAgICAgICAgICAgIG1ldGhvZDogJ1BVVCcsXHJcbiAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHBheWxvYWQpXHJcbiAgICAgICAgfX0pO1xyXG4gICAgICAgIHRoaXMucmVzZXRDYWNoZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHJlc2V0Q2FjaGUoKSB7XHJcbiAgICAgICAgLy9kZWxldGUgdGhpcy5zdWJzZWN0aW9ucztcclxuICAgICAgICAvL2RlbGV0ZSB0aGlzLmFzc29jaWF0ZWRDb3Vyc2VzO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIHB1Ymxpc2goKSB7XHJcbiAgICAgICAgY29uc3QgdXJsID0gYGNvdXJzZXMvJHt0aGlzLmlkfWA7XHJcbiAgICAgICAgY29uc3QgY291cnNlRGF0YSA9IGF3YWl0IGZldGNoT25lQXBpSnNvbih1cmwsIHtmZXRjaEluaXQ6e1xyXG4gICAgICAgICAgICBtZXRob2Q6ICdQVVQnLFxyXG4gICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7J29mZmVyJzogdHJ1ZX0pXHJcbiAgICAgICAgfX0pO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGNvdXJzZURhdGEpO1xyXG4gICAgICAgIHRoaXMuY2FudmFzRGF0YSA9IGNvdXJzZURhdGE7XHJcbiAgICAgICAgdGhpcy5yZXNldENhY2hlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgdW5wdWJsaXNoKCkge1xyXG4gICAgICAgIGNvbnN0IHVybCA9IGBjb3Vyc2VzLyR7dGhpcy5pZH1gO1xyXG4gICAgICAgIGF3YWl0IGZldGNoQXBpSnNvbih1cmwsIHtmZXRjaEluaXQ6e1xyXG4gICAgICAgICAgICBtZXRob2Q6ICdQVVQnLFxyXG4gICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7J2NvdXJzZVtldmVudF0nOiAnY2xhaW0nfSlcclxuICAgICAgICB9fSk7XHJcbiAgICAgICAgdGhpcy5jYW52YXNEYXRhID0gKGF3YWl0IENvdXJzZS5nZXRCeUlkKHRoaXMuaWQpICkucmF3RGF0YTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBjb250ZW50VXBkYXRlc0FuZEZpeGVzKF9maXhlc1RvUnVuID0gbnVsbCkge1xyXG4gICAgICAgIHRocm93IG5ldyBOb3RJbXBsZW1lbnRlZEV4Y2VwdGlvbigpO1xyXG4gICAgICAgIC8vIGF3YWl0IHRoaXMuc2V0TmF2aWdhdGlvblRhYkhpZGRlbignRHJvcG91dCBEZXRlY3RpdmUnLCBmYWxzZSk7XHJcbiAgICAgICAgLy8gYXdhaXQgdGhpcy5zZXROYXZpZ2F0aW9uVGFiSGlkZGVuKCdCaWdCbHVlQnV0dG9uJywgZmFsc2UpO1xyXG4gICAgICAgIC8vXHJcbiAgICAgICAgLy8gY29uc3QgYXBwbGllZFRvID0gW107XHJcbiAgICAgICAgLy8gaWYgKGZpeGVzVG9SdW4gPT09IG51bGwpIHtcclxuICAgICAgICAvLyAgICAgZml4ZXNUb1J1biA9IHRoaXMuZml4ZXNUb1J1bjtcclxuICAgICAgICAvLyB9XHJcbiAgICAgICAgLy9cclxuICAgICAgICAvLyBmb3IgKGNvbnN0IHBhZ2Ugb2YgRXZhbEZpeC5maW5kQ29udGVudCh0aGlzKSkge1xyXG4gICAgICAgIC8vICAgICBwYWdlLmRlbGV0ZSgpO1xyXG4gICAgICAgIC8vICAgICBhcHBsaWVkVG8ucHVzaChwYWdlKTtcclxuICAgICAgICAvLyB9XHJcbiAgICAgICAgLy9cclxuICAgICAgICAvLyBmb3IgKGNvbnN0IGZpeFNldCBvZiBmaXhlc1RvUnVuKSB7XHJcbiAgICAgICAgLy8gICAgIGNvbnN0IHBhZ2VzID0gZml4U2V0LmZpbmRDb250ZW50KHRoaXMpO1xyXG4gICAgICAgIC8vICAgICBmb3IgKGNvbnN0IHBhZ2Ugb2YgcGFnZXMpIHtcclxuICAgICAgICAvLyAgICAgICAgIGNvbnN0IHRleHQgPSBmaXhTZXQuZml4KHBhZ2UuYm9keSk7XHJcbiAgICAgICAgLy8gICAgICAgICBwYWdlLnVwZGF0ZUNvbnRlbnQodGV4dCk7XHJcbiAgICAgICAgLy8gICAgICAgICBhcHBsaWVkVG8ucHVzaChwYWdlKTtcclxuICAgICAgICAvLyAgICAgfVxyXG4gICAgICAgIC8vIH1cclxuICAgICAgICAvL1xyXG4gICAgICAgIC8vIGNvbnN0IHN5bGxhYnVzID0gU3lsbGFidXNGaXguZml4KHRoaXMuc3lsbGFidXMpO1xyXG4gICAgICAgIC8vIGF3YWl0IGZldGNoQXBpSnNvbihgY291cnNlcy8ke3RoaXMuaWR9YCwge30sIHtcclxuICAgICAgICAvLyAgICAgbWV0aG9kOiAnUFVUJyxcclxuICAgICAgICAvLyAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeydjb3Vyc2Vbc3lsbGFidXNfYm9keV0nOiBzeWxsYWJ1c30pXHJcbiAgICAgICAgLy8gfSk7XHJcbiAgICAgICAgLy8gdGhpcy5jYW52YXNEYXRhWydzeWxsYWJ1c19ib2R5J10gPSBzeWxsYWJ1cztcclxuICAgICAgICAvLyByZXR1cm4gYXBwbGllZFRvO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIHJlc2V0KHByb21wdCA9IHRydWUpIHtcclxuICAgICAgICBpZiAocHJvbXB0ICYmICFjb25maXJtKGBBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gcmVzZXQgJHt0aGlzLmNvdXJzZUNvZGV9P2ApKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHVybCA9IGAvY291cnNlcy8ke3RoaXMuaWR9L3Jlc2V0X2NvbnRlbnRgO1xyXG4gICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBmZXRjaE9uZUFwaUpzb24odXJsLCB7IGZldGNoSW5pdDoge21ldGhvZDogJ1BPU1QnfX0pO1xyXG4gICAgICAgIHRoaXMuY2FudmFzRGF0YVsnaWQnXSA9IGRhdGEuaWQ7XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIE5PVCBJTVBMRU1FTlRFRFxyXG4gICAgICogQHBhcmFtIHByb21wdCBFaXRoZXIgYSBib29sZWFuIG9yIGFuIGFzeW5jIGZ1bmN0aW9uIHRoYXQgdGFrZXMgaW4gYSBzb3VyY2UgYW5kIGRlc3RpbmF0aW9uIGNvdXJzZSBhbmQgcmV0dXJucyBhIGJvb2xlYW5cclxuICAgICAqIEBwYXJhbSB1cGRhdGVDYWxsYmFja1xyXG4gICAgICovXHJcbiAgICBhc3luYyBpbXBvcnREZXZDb3Vyc2UoXHJcbiAgICAgICAgcHJvbXB0OiAoKHNvdXJjZTogQ291cnNlLCBkZXN0aW5hdGlvbjogQ291cnNlKSA9PiBQcm9taXNlPGJvb2xlYW4+KSB8IGZhbHNlID0gZmFsc2UsXHJcbiAgICAgICAgdXBkYXRlQ2FsbGJhY2s6IElVcGRhdGVDYWxsYmFjayB8IHVuZGVmaW5lZFxyXG4gICAgKSB7XHJcbiAgICAgICAgY29uc3QgZGV2Q291cnNlID0gYXdhaXQgdGhpcy5nZXRQYXJlbnRDb3Vyc2UoKTtcclxuXHJcbiAgICAgICAgaWYgKCFkZXZDb3Vyc2UpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IENvdXJzZU5vdEZvdW5kRXhjZXB0aW9uKGBERVYgbm90IGZvdW5kIGZvciAke3RoaXMubmFtZX0uYClcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChwcm9tcHQpIHtcclxuICAgICAgICAgICAgY29uc3QgY2FuQ29udGludWUgPSBhd2FpdCBwcm9tcHQoZGV2Q291cnNlLCB0aGlzKTtcclxuICAgICAgICAgICAgaWYoIWNhbkNvbnRpbnVlKSByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgIGF3YWl0IHRoaXMuaW1wb3J0Q291cnNlKGRldkNvdXJzZSwgdXBkYXRlQ2FsbGJhY2spO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBhc3luYyBpbXBvcnRDb3Vyc2UoY291cnNlOiBDb3Vyc2UsIHVwZGF0ZUNhbGxiYWNrOiBJVXBkYXRlQ2FsbGJhY2sgfCB1bmRlZmluZWQpIHtcclxuICAgICAgICB0aHJvdyBuZXcgTm90SW1wbGVtZW50ZWRFeGNlcHRpb24oKTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBnZXRQYXJlbnRDb3Vyc2UocmV0dXJuX2Rldl9zZWFyY2ggPSBmYWxzZSkge1xyXG4gICAgICAgIGxldCBtaWdyYXRpb25zID0gYXdhaXQgZ2V0QXBpUGFnZWREYXRhKGBjb3Vyc2VzLyR7dGhpcy5pZH0vY29udGVudF9taWdyYXRpb25zYCk7XHJcblxyXG4gICAgICAgIGlmIChtaWdyYXRpb25zLmxlbmd0aCA8IDEpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ25vIG1pZ3JhdGlvbnMgZm91bmQnKTtcclxuICAgICAgICAgICAgaWYgKHJldHVybl9kZXZfc2VhcmNoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gQ291cnNlLmdldEJ5Q29kZSgnREVWXycgKyB0aGlzLmJhc2VDb2RlKTtcclxuICAgICAgICAgICAgfSBlbHNlIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBtaWdyYXRpb25zLnNvcnQoKGEsIGIpID0+IGIuaWQgLSBhLmlkKTtcclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgZm9yIChsZXQgbWlncmF0aW9uIG9mIG1pZ3JhdGlvbnMpIHtcclxuICAgICAgICAgICAgICAgIGxldCBjb3Vyc2UgPSBhd2FpdCBDb3Vyc2UuZ2V0QnlJZChtaWdyYXRpb25bJ3NldHRpbmdzJ11bJ3NvdXJjZV9jb3Vyc2VfaWQnXSlcclxuICAgICAgICAgICAgICAgIGlmIChjb3Vyc2UuY29kZVByZWZpeCA9PT0gXCJERVZcIikgcmV0dXJuIGNvdXJzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGF3YWl0IENvdXJzZS5nZXRCeUNvZGUoJ0RFVl8nICsgdGhpcy5iYXNlQ29kZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGdlbmVyYXRlSG9tZVRpbGVzKCkge1xyXG4gICAgICAgIGNvbnN0IG1vZHVsZXMgPSBhd2FpdCB0aGlzLmdldE1vZHVsZXMoKTtcclxuICAgICAgICBjb25zdCBwcm9taXNlczogUHJvbWlzZTx2b2lkPltdID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgbW9kdWxlIG9mIG1vZHVsZXMpIHtcclxuICAgICAgICAgICAgcHJvbWlzZXMucHVzaCh0aGlzLmdlbmVyYXRlSG9tZVRpbGUobW9kdWxlKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGF3YWl0IFByb21pc2UuYWxsKHByb21pc2VzKTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBnZW5lcmF0ZUhvbWVUaWxlKG1vZHVsZTogSU1vZHVsZURhdGEpIHtcclxuXHJcbiAgICAgICAgbGV0IG92ZXJ2aWV3ID0gbW9kdWxlLml0ZW1zLmZpbmQoaXRlbSA9PlxyXG4gICAgICAgICAgICBpdGVtLnR5cGUgPT09IFwiUGFnZVwiICYmXHJcbiAgICAgICAgICAgIGl0ZW0udGl0bGUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcygnb3ZlcnZpZXcnKVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgaWYgKCFvdmVydmlldz8udXJsKSByZXR1cm47XHJcblxyXG4gICAgICAgIGFzc2VydChvdmVydmlldy51cmwpO1xyXG4gICAgICAgIGNvbnN0IHVybCA9IG92ZXJ2aWV3LnVybC5yZXBsYWNlKC9odHRwczpcXC9cXC8uKmFwaVxcL3YxLywgJy9hcGkvdjEnKVxyXG4gICAgICAgIGNvbnN0IHBhZ2VEYXRhID0gYXdhaXQgZmV0Y2hKc29uKHVybCkgYXMgSUNhbnZhc0RhdGE7XHJcbiAgICAgICAgY29uc3Qgb3ZlcnZpZXdQYWdlID0gbmV3IFBhZ2UocGFnZURhdGEsIHRoaXMpO1xyXG4gICAgICAgIGNvbnN0IHBhZ2VCb2R5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaHRtbCcpO1xyXG4gICAgICAgIHBhZ2VCb2R5LmlubmVySFRNTCA9IG92ZXJ2aWV3UGFnZS5ib2R5O1xyXG4gICAgICAgIGxldCBiYW5uZXJJbWcgOiBIVE1MSW1hZ2VFbGVtZW50IHwgbnVsbCA9IHBhZ2VCb2R5LnF1ZXJ5U2VsZWN0b3IoJy5jYnQtYmFubmVyLWltYWdlIGltZycpXHJcblxyXG4gICAgICAgIGFzc2VydChiYW5uZXJJbWcsIFwiUGFnZSBoYXMgbm8gYmFubmVyXCIpO1xyXG4gICAgICAgIGxldCBkb3dubG9hZCA9IGF3YWl0IGRvd25sb2FkRmlsZSh7XHJcbiAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXHJcbiAgICAgICAgICAgIHVybDogYmFubmVySW1nLnNyYyxcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gY29uc3QgaW1nID0gYXdhaXQgcmVzaXplZEltYWdlKGJhbm5lckltZy5zcmMsIDUwMCk7XHJcbiAgICAgICAgLy8gY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgICAgICAgLy8gY29uc3QgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgICAgICAgLy8gY29uc3QgYmxvYjogQmxvYiA9IGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IGNhbnZhcy50b0Jsb2IocmVzb2x2ZSBhcyBCbG9iQ2FsbGJhY2spKTtcclxuICAgICAgICAvLyBjb25zdCBob21lVGlsZU5hbWUgPSBgaG9tZXRpbGUke21vZHVsZS5wb3NpdGlvbn0ucG5nYFxyXG4gICAgICAgIC8vIGF3YWl0IHRoaXMudXBsb2FkRmlsZShcclxuICAgICAgICAvLyAgICAgbmV3IEZpbGUoW2Jsb2JdLCBob21lVGlsZU5hbWUpLFxyXG4gICAgICAgIC8vICAgICAnL0ltYWdlcy9ob21ldGlsZScpO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIHVwbG9hZEZpbGUoZmlsZTogRmlsZSwgcGF0aDogc3RyaW5nKSB7XHJcbiAgICAgICAgbGV0IHVybCA9IGAvYXBpL3YxL2NvdXJzZXMvJHt0aGlzLmlkfS9maWxlc2A7XHJcbiAgICAgICAgZmlsZS5uYW1lO1xyXG4gICAgICAgIGNvbnN0IGluaXRpYWxQYXJhbXMgPSB7XHJcbiAgICAgICAgICAgIG5hbWU6IGZpbGUubmFtZSxcclxuICAgICAgICAgICAgbm9fcmVkaXJlY3Q6IHRydWUsXHJcbiAgICAgICAgICAgIHBhcmVudF9mb2xkZXI6IHBhdGgsXHJcbiAgICAgICAgICAgIG9uX2R1cGxpY2F0ZTogJ292ZXJ3cml0ZSdcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLCB7XHJcbiAgICAgICAgICAgIGJvZHk6IGZvcm1EYXRhaWZ5KGluaXRpYWxQYXJhbXMpLFxyXG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGFzc2VydChyZXNwb25zZS5vaywgYXdhaXQgcmVzcG9uc2UuanNvbigpKTtcclxuICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xyXG5cclxuICAgICAgICBjb25zdCB1cGxvYWRQYXJhbXMgPSBkYXRhLnVwbG9hZF9wYXJhbXM7XHJcbiAgICAgICAgY29uc3QgdXBsb2FkRm9ybURhdGEgPSBmb3JtRGF0YWlmeSh1cGxvYWRQYXJhbXMpO1xyXG4gICAgICAgIHVwbG9hZEZvcm1EYXRhLmFwcGVuZCgnZmlsZScsIGZpbGUpO1xyXG4gICAgICAgIHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXBsb2FkUGFyYW1zLnVybCwge1xyXG4gICAgICAgICAgICBib2R5OiB1cGxvYWRGb3JtRGF0YSxcclxuICAgICAgICB9KVxyXG4gICAgICAgIGFzc2VydChyZXNwb25zZS5vaywgYXdhaXQgcmVzcG9uc2UudGV4dCgpKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgcmVnaXN0ZXJDb250ZW50Q2xhc3MoY29udGVudENsYXNzOiB0eXBlb2YgQmFzZUNvbnRlbnRJdGVtKSB7XHJcbiAgICAgICAgdGhpcy5jb250ZW50Q2xhc3Nlcy5wdXNoKGNvbnRlbnRDbGFzcyk7XHJcbiAgICB9XHJcbn1cclxuXHJcblxyXG5leHBvcnQgY2xhc3MgQmFzZUNvbnRlbnRJdGVtIGV4dGVuZHMgQmFzZUNhbnZhc09iamVjdCB7XHJcbiAgICBzdGF0aWMgYm9keVByb3BlcnR5OiBzdHJpbmc7XHJcblxyXG4gICAgX2NvdXJzZTogQ291cnNlO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNhbnZhc0RhdGE6IElDYW52YXNEYXRhLCBjb3Vyc2U6IENvdXJzZSkge1xyXG4gICAgICAgIHN1cGVyKGNhbnZhc0RhdGEpO1xyXG4gICAgICAgIHRoaXMuX2NvdXJzZSA9IGNvdXJzZTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgZ2V0IGNvbnRlbnRVcmxQYXJ0KCkge1xyXG4gICAgICAgIGFzc2VydCh0aGlzLmFsbENvbnRlbnRVcmxUZW1wbGF0ZSwgXCJOb3QgYSBjb250ZW50IHVybCB0ZW1wbGF0ZVwiKTtcclxuICAgICAgICBjb25zdCB1cmxUZXJtTWF0Y2ggPSAvXFwvKFtcXHdfXSspJC8uZXhlYyh0aGlzLmFsbENvbnRlbnRVcmxUZW1wbGF0ZSk7XHJcbiAgICAgICAgY29uc29sZS5sb2codGhpcy5hbGxDb250ZW50VXJsVGVtcGxhdGUsIHVybFRlcm1NYXRjaCk7XHJcbiAgICAgICAgaWYoIXVybFRlcm1NYXRjaCkgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgY29uc3QgdXJsVGVybSA9IHVybFRlcm1NYXRjaFsxXTtcclxuICAgICAgICByZXR1cm4gdXJsVGVybTtcclxuXHJcbiAgICB9XHJcbiAgICBzdGF0aWMgZ2V0SWRGcm9tVXJsKHVybDogc3RyaW5nKSB7XHJcbiAgICAgICAgICAgIC8vbGV0IF9jb250ZW50VXJsVGVtcGxhdGUgPSBcImNvdXJzZXMve2NvdXJzZV9pZH0vZGlzY3Vzc2lvbl90b3BpY3Mve2NvbnRlbnRfaWR9XCI7XHJcbiAgICAgICAgYXNzZXJ0KHRoaXMuY29udGVudFVybFRlbXBsYXRlKTtcclxuICAgICAgICAvLyB1c2UgdGhlIGNvbnRlbnQgdXJsIHRlbXBsYXRlIGFzIGEgYmFzaXMgdG8gZ2VuZXJhdGVcclxuICAgICAgICBsZXQgcmVnZXggPSBuZXcgUmVnRXhwKHRoaXMuY29udGVudFVybFRlbXBsYXRlPy5yZXBsYWNlKC9cXHsuKlxcfS8sICcoZCspJykpO1xyXG4gICAgICAgIGxldCBtYXRjaCA9IC9jb3Vyc2VzXFwvKFxcZCspLy5leGVjKHVybCk7XHJcbiAgICAgICAgaWYgKG1hdGNoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBwYXJzZUludChtYXRjaFsxXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG5cclxuICAgIH1cclxuICAgIHN0YXRpYyBhc3luYyBnZXRBbGxJbkNvdXJzZShjb3Vyc2U6IENvdXJzZSwgY29uZmlnOiBJQ2FudmFzQ2FsbENvbmZpZykge1xyXG4gICAgICAgIGxldCB1cmwgPSB0aGlzLmdldEFsbFVybChjb3Vyc2UuaWQpO1xyXG4gICAgICAgIGxldCBkYXRhID0gYXdhaXQgZ2V0QXBpUGFnZWREYXRhKHVybCwgY29uZmlnKTtcclxuICAgICAgICByZXR1cm4gZGF0YS5tYXAoaXRlbSA9PiBuZXcgdGhpcyhpdGVtLCBjb3Vyc2UpKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgY2xlYXJBZGRlZENvbnRlbnRUYWdzKHRleHQ6IHN0cmluZykge1xyXG4gICAgICAgIGxldCBvdXQgPSB0ZXh0LnJlcGxhY2UoLzxcXC8/bGlua1tePl0qPi9nLCAnJyk7XHJcbiAgICAgICAgb3V0ID0gb3V0LnJlcGxhY2UoLzxcXC8/c2NyaXB0W14+XSo+L2csICcnKTtcclxuICAgICAgICByZXR1cm4gb3V0O1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBhc3luYyBnZXRGcm9tVXJsKHVybDogc3RyaW5nIHwgbnVsbCA9IG51bGwsIGNvdXJzZTogbnVsbCB8IENvdXJzZSA9IG51bGwpIHtcclxuICAgICAgICBpZiAodXJsID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHVybCA9IGRvY3VtZW50LmRvY3VtZW50VVJJO1xyXG4gICAgICAgIH1cclxuICAgICAgICB1cmwgPSB1cmwucmVwbGFjZSgvXFwuY29tLywgJy5jb20vYXBpL3YxJylcclxuICAgICAgICBsZXQgZGF0YSA9IGF3YWl0IGZldGNoSnNvbih1cmwpO1xyXG4gICAgICAgIGlmICghY291cnNlKSB7XHJcbiAgICAgICAgICAgIGNvdXJzZSA9IGF3YWl0IENvdXJzZS5nZXRGcm9tVXJsKCk7XHJcbiAgICAgICAgICAgIGlmKCFjb3Vyc2UpIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvL0lmIHRoaXMgaXMgYSBjb2xsZWN0aW9uIG9mIGRhdGEsIHdlIGNhbid0IHByb2Nlc3MgaXQgYXMgYSBDYW52YXMgT2JqZWN0XHJcbiAgICAgICAgaWYoQXJyYXkuaXNBcnJheShkYXRhKSkgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgYXNzZXJ0KCFBcnJheS5pc0FycmF5KGRhdGEpKTtcclxuICAgICAgICBpZiAoZGF0YSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IHRoaXMoZGF0YSwgY291cnNlKVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcblxyXG4gICAgZ2V0IGJvZHlLZXkoKSB7cmV0dXJuIHRoaXMubXlDbGFzcy5ib2R5UHJvcGVydHk7fVxyXG5cclxuICAgIGdldCBib2R5KCkge1xyXG4gICAgICAgIGlmICghdGhpcy5ib2R5S2V5KSByZXR1cm4gbnVsbDtcclxuICAgICAgICByZXR1cm4gdGhpcy5teUNsYXNzLmNsZWFyQWRkZWRDb250ZW50VGFncyh0aGlzLmNhbnZhc0RhdGFbdGhpcy5ib2R5S2V5XSk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGR1ZUF0KCkge1xyXG4gICAgICAgIGlmICghdGhpcy5jYW52YXNEYXRhLmhhc093blByb3BlcnR5KCdkdWVfYXQnKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKHRoaXMuY2FudmFzRGF0YS5kdWVfYXQpO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIHNldER1ZUF0KGRhdGU6IERhdGUpOiBQcm9taXNlPERpY3Q+IHtcclxuICAgICAgICB0aHJvdyBuZXcgTm90SW1wbGVtZW50ZWRFeGNlcHRpb24oKTtcclxuICAgIH1cclxuICAgIGFzeW5jIGR1ZUF0VGltZURlbHRhKHRpbWVEZWx0YTogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmR1ZUF0KSByZXR1cm4gbnVsbDtcclxuICAgICAgICBsZXQgcmVzdWx0ID0gbmV3IERhdGUodGhpcy5kdWVBdCk7XHJcbiAgICAgICAgcmVzdWx0LnNldERhdGUocmVzdWx0LmdldERhdGUoKSArIHRpbWVEZWx0YSlcclxuXHJcblxyXG4gICAgICAgIHJldHVybiBhd2FpdCB0aGlzLnNldER1ZUF0KHJlc3VsdCk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGNvbnRlbnRVcmxQYXRoKCkge1xyXG4gICAgICAgIGxldCB1cmwgPSAoPHR5cGVvZiBCYXNlQ29udGVudEl0ZW0+IHRoaXMuY29uc3RydWN0b3IpLmNvbnRlbnRVcmxUZW1wbGF0ZTtcclxuICAgICAgICBhc3NlcnQodXJsKTtcclxuICAgICAgICB1cmwgPSB1cmwucmVwbGFjZSgne2NvdXJzZV9pZH0nLCB0aGlzLmNvdXJzZS5pZC50b1N0cmluZygpKTtcclxuICAgICAgICB1cmwgPSB1cmwucmVwbGFjZSgne2NvbnRlbnRfaWR9JywgdGhpcy5pZC50b1N0cmluZygpKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHVybDtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgY291cnNlKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9jb3Vyc2U7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgdXBkYXRlQ29udGVudCh0ZXh0ID0gbnVsbCwgbmFtZSA9IG51bGwpIHtcclxuICAgICAgICBjb25zdCBkYXRhOiBEaWN0ID0ge307XHJcbiAgICAgICAgY29uc3QgY29uc3RydWN0b3IgPSA8dHlwZW9mIEJhc2VDb250ZW50SXRlbT4gdGhpcy5jb25zdHJ1Y3RvcjtcclxuICAgICAgICBhc3NlcnQoY29uc3RydWN0b3IuYm9keVByb3BlcnR5KTtcclxuICAgICAgICBhc3NlcnQoY29uc3RydWN0b3IubmFtZVByb3BlcnR5KTtcclxuICAgICAgICBjb25zdCBuYW1lUHJvcCA9IGNvbnN0cnVjdG9yLm5hbWVQcm9wZXJ0eTtcclxuICAgICAgICBjb25zdCBib2R5UHJvcCA9IGNvbnN0cnVjdG9yLmJvZHlQcm9wZXJ0eTtcclxuICAgICAgICBpZiAodGV4dCAmJiBib2R5UHJvcCkge1xyXG4gICAgICAgICAgICB0aGlzLmNhbnZhc0RhdGFbYm9keVByb3BdID0gdGV4dDtcclxuICAgICAgICAgICAgZGF0YVtib2R5UHJvcF0gPSB0ZXh0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG5hbWUgJiYgbmFtZVByb3ApIHtcclxuICAgICAgICAgICAgdGhpcy5jYW52YXNEYXRhW25hbWVQcm9wXSA9IG5hbWU7XHJcbiAgICAgICAgICAgIGRhdGFbbmFtZVByb3BdID0gbmFtZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLnNhdmVEYXRhKGRhdGEpO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGdldE1lSW5Bbm90aGVyQ291cnNlKHRhcmdldENvdXJzZTogQ291cnNlKSB7XHJcbiAgICAgICAgbGV0IENvbnRlbnRDbGFzcyA9IHRoaXMuY29uc3RydWN0b3IgYXMgdHlwZW9mIEJhc2VDb250ZW50SXRlbVxyXG4gICAgICAgIGxldCB0YXJnZXRzID0gYXdhaXQgQ29udGVudENsYXNzLmdldEFsbEluQ291cnNlKHRhcmdldENvdXJzZSx7cXVlcnlQYXJhbXM6IHtzZWFyY2hfdGVybTogdGhpcy5uYW1lfX0pXHJcbiAgICAgICAgcmV0dXJuIHRhcmdldHMuZmluZCgodGFyZ2V0OiBCYXNlQ29udGVudEl0ZW0pID0+IHRhcmdldC5uYW1lID09IHRoaXMubmFtZSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbkBjb250ZW50Q2xhc3NcclxuZXhwb3J0IGNsYXNzIERpc2N1c3Npb24gZXh0ZW5kcyBCYXNlQ29udGVudEl0ZW0ge1xyXG4gICAgc3RhdGljIG5hbWVQcm9wZXJ0eSA9ICd0aXRsZSc7XHJcbiAgICBzdGF0aWMgYm9keVByb3BlcnR5ID0gJ21lc3NhZ2UnO1xyXG4gICAgc3RhdGljIGNvbnRlbnRVcmxUZW1wbGF0ZSA9IFwiY291cnNlcy97Y291cnNlX2lkfS9kaXNjdXNzaW9uX3RvcGljcy97Y29udGVudF9pZH1cIjtcclxuICAgIHN0YXRpYyBhbGxDb250ZW50VXJsVGVtcGxhdGUgPSBcImNvdXJzZXMve2NvdXJzZV9pZH0vZGlzY3Vzc2lvbl90b3BpY3NcIlxyXG5cclxufVxyXG5cclxuQGNvbnRlbnRDbGFzc1xyXG5leHBvcnQgY2xhc3MgQXNzaWdubWVudCBleHRlbmRzIEJhc2VDb250ZW50SXRlbSB7XHJcbiAgICBzdGF0aWMgbmFtZVByb3BlcnR5ID0gJ25hbWUnO1xyXG4gICAgc3RhdGljIGJvZHlQcm9wZXJ0eSA9ICdkZXNjcmlwdGlvbic7XHJcbiAgICBzdGF0aWMgY29udGVudFVybFRlbXBsYXRlID0gXCJjb3Vyc2VzL3tjb3Vyc2VfaWR9L2Fzc2lnbm1lbnRzL3tjb250ZW50X2lkfVwiO1xyXG4gICAgc3RhdGljIGFsbENvbnRlbnRVcmxUZW1wbGF0ZSA9IFwiY291cnNlcy97Y291cnNlX2lkfS9hc3NpZ25tZW50c1wiO1xyXG5cclxuICAgIGFzeW5jIHNldER1ZUF0KGR1ZUF0OiBEYXRlKSB7XHJcbiAgICAgICAgbGV0IGRhdGEgPSBhd2FpdCB0aGlzLnNhdmVEYXRhKHsnYXNzaWdubWVudFtkdWVfYXRdJzogZHVlQXQudG9JU09TdHJpbmcoKX0pO1xyXG4gICAgICAgIHRoaXMuY2FudmFzRGF0YVsnZHVlX2F0J10gPSBkdWVBdC50b0lTT1N0cmluZygpO1xyXG4gICAgICAgIHJldHVybiBkYXRhO1xyXG5cclxuICAgIH1cclxufVxyXG5cclxuQGNvbnRlbnRDbGFzc1xyXG5leHBvcnQgY2xhc3MgUXVpeiBleHRlbmRzIEJhc2VDb250ZW50SXRlbSB7XHJcbiAgICBzdGF0aWMgbmFtZVByb3BlcnR5ID0gJ3RpdGxlJztcclxuICAgIHN0YXRpYyBib2R5UHJvcGVydHkgPSAnZGVzY3JpcHRpb24nO1xyXG4gICAgc3RhdGljIGNvbnRlbnRVcmxUZW1wbGF0ZSA9IFwiY291cnNlcy97Y291cnNlX2lkfS9xdWl6emVzL3tjb250ZW50X2lkfVwiO1xyXG4gICAgc3RhdGljIGFsbENvbnRlbnRVcmxUZW1wbGF0ZSA9IFwiY291cnNlcy97Y291cnNlX2lkfS9xdWl6emVzXCI7XHJcblxyXG4gICAgYXN5bmMgc2V0RHVlQXQoZHVlQXQ6IERhdGUgKSB7XHJcbiAgICAgICAgbGV0IHJlc3VsdCA9IGF3YWl0IHRoaXMuc2F2ZURhdGEoeydxdWl6W2R1ZV9hdF0nOiBkdWVBdC50b0lTT1N0cmluZygpfSlcclxuICAgICAgICB0aGlzLmNhbnZhc0RhdGFbJ2R1ZV9hdCddID0gZHVlQXQudG9JU09TdHJpbmcoKTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG5cclxufVxyXG5cclxuQGNvbnRlbnRDbGFzc1xyXG5leHBvcnQgY2xhc3MgUGFnZSBleHRlbmRzIEJhc2VDb250ZW50SXRlbSB7XHJcbiAgICBzdGF0aWMgaWRQcm9wZXJ0eSA9ICdwYWdlX2lkJztcclxuICAgIHN0YXRpYyBuYW1lUHJvcGVydHkgPSAndGl0bGUnO1xyXG4gICAgc3RhdGljIGJvZHlQcm9wZXJ0eSA9ICdib2R5JztcclxuICAgIHN0YXRpYyBjb250ZW50VXJsVGVtcGxhdGUgPSBcImNvdXJzZXMve2NvdXJzZV9pZH0vcGFnZXMve2NvbnRlbnRfaWR9XCI7XHJcbiAgICBzdGF0aWMgYWxsQ29udGVudFVybFRlbXBsYXRlID0gXCJjb3Vyc2VzL3tjb3Vyc2VfaWR9L3BhZ2VzL1wiO1xyXG5cclxuICAgIGFzeW5jIGdldFJldmlzaW9ucygpIHtcclxuICAgICAgICByZXR1cm4gZ2V0UGFnZWREYXRhKGAke3RoaXMuY29udGVudFVybFBhdGh9L3JldmlzaW9uc2ApO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIHJldmVydExhc3RDaGFuZ2VTZXQoc3RlcHNCYWNrID0gMSkge1xyXG4gICAgICAgIGxldCByZXZpc2lvbnMgPSBhd2FpdCB0aGlzLmdldFJldmlzaW9ucygpO1xyXG4gICAgICAgIHJldmlzaW9ucy5zb3J0KChhLCBiKSA9PiBiWydyZXZpc2lvbl9pZCddIC0gYVsncmV2aXNpb25faWQnXSk7XHJcbiAgICAgICAgaWYgKHJldmlzaW9ucy5sZW5ndGggPD0gc3RlcHNCYWNrKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgVHJpZWQgdG8gcmV2ZXJ0ICR7dGhpcy5uYW1lfSBidXQgdGhlcmUgaXNuJ3QgYSBwcmV2aW91cyByZXZpc2lvbmApO1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHJldmlzaW9uID0gcmV2aXNpb25zW3N0ZXBzQmFja107XHJcbiAgICAgICAgYXdhaXQgdGhpcy5hcHBseVJldmlzaW9uKHJldmlzaW9uKTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyByZXNldENvbnRlbnQocmV2aXNpb25JZCA9IDEpIHtcclxuICAgICAgICBsZXQgcmV2aXNpb25zID0gYXdhaXQgdGhpcy5nZXRSZXZpc2lvbnMoKTtcclxuICAgICAgICBsZXQgcmV2aXNpb24gPSByZXZpc2lvbnMuZmluZChyID0+IHJbJ3JldmlzaW9uX2lkJ10gPT09IHJldmlzaW9uSWQpO1xyXG4gICAgICAgIGlmICghcmV2aXNpb24pIHRocm93IG5ldyBFcnJvcihgTm8gcmV2aXNpb24gZm91bmQgZm9yICR7cmV2aXNpb25JZH1gKTtcclxuICAgICAgICBhd2FpdCB0aGlzLmFwcGx5UmV2aXNpb24ocmV2aXNpb24pO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGFwcGx5UmV2aXNpb24ocmV2aXNpb246IERpY3QpIHtcclxuICAgICAgICBjb25zdCByZXZpc2lvbklkID0gcmV2aXNpb25bJ3JldmlzaW9uX2lkJ107XHJcbiAgICAgICAgbGV0IHJlc3VsdCA9IGF3YWl0IGZldGNoT25lQXBpSnNvbihgJHt0aGlzLmNvbnRlbnRVcmxQYXRofS9yZXZpc2lvbnMvJHtyZXZpc2lvbklkfT9yZXZpc2lvbl9pZD0ke3JldmlzaW9uSWR9YCk7XHJcbiAgICAgICAgdGhpcy5jYW52YXNEYXRhW3RoaXMuYm9keUtleV0gPSByZXN1bHRbJ2JvZHknXTtcclxuICAgICAgICB0aGlzLmNhbnZhc0RhdGFbdGhpcy5uYW1lS2V5XSA9IHJlc3VsdFsndGl0bGUnXTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgYm9keSgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNhbnZhc0RhdGFbdGhpcy5ib2R5S2V5XTtcclxuICAgIH1cclxuICAgIGFzeW5jIHVwZGF0ZUNvbnRlbnQodGV4dCA9IG51bGwsIG5hbWUgPSBudWxsKSB7XHJcbiAgICAgICAgbGV0IGRhdGE6IERpY3QgPSB7fTtcclxuICAgICAgICBpZiAodGV4dCkge1xyXG4gICAgICAgICAgICB0aGlzLmNhbnZhc0RhdGFbdGhpcy5ib2R5S2V5XSA9IHRleHQ7XHJcbiAgICAgICAgICAgIGRhdGFbJ3dpa2lfcGFnZVtib2R5XSddID0gdGV4dDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG5hbWUpIHtcclxuICAgICAgICAgICAgdGhpcy5jYW52YXNEYXRhW3RoaXMubmFtZUtleV0gPSBuYW1lO1xyXG4gICAgICAgICAgICBkYXRhW3RoaXMubmFtZUtleV0gPSBuYW1lO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc2F2ZURhdGEoZGF0YSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBSdWJyaWMgZXh0ZW5kcyBCYXNlQ29udGVudEl0ZW0ge1xyXG4gICAgc3RhdGljIG5hbWVQcm9wZXJ0eSA9ICd0aXRsZSc7XHJcbiAgICBzdGF0aWMgY29udGVudFVybFRlbXBsYXRlID0gXCJjb3Vyc2VzL3tjb3Vyc2VfaWR9L3J1YnJpY3Mve2NvbnRlbnRfaWR9XCI7XHJcbiAgICBzdGF0aWMgYWxsQ29udGVudFVybFRlbXBsYXRlID0gXCJjb3Vyc2VzL3tjb3Vyc2VfaWR9L3J1YnJpY3NcIjtcclxuXHJcbiAgICBhc3luYyBhc3NvY2lhdGlvbnMocmVsb2FkID0gZmFsc2UpIHtcclxuICAgICAgICBpZiAoJ2Fzc29jaWF0aW9ucycgaW4gdGhpcy5jYW52YXNEYXRhICYmICFyZWxvYWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2FudmFzRGF0YVsnYXNzb2NpYXRpb25zJ107XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgZGF0YSA9IGF3YWl0IHRoaXMubXlDbGFzcy5nZXREYXRhQnlJZCh0aGlzLmlkLCB0aGlzLmNvdXJzZSwge3BhcmFtczogeydpbmNsdWRlJzogWydhc3NvY2lhdGlvbnMnXX19KTtcclxuICAgICAgICBsZXQgYXNzb2NpYXRpb25zID0gZGF0YVsnYXNzb2NpYXRpb25zJ10ubWFwKChkYXRhOiBJQ2FudmFzRGF0YSkgPT4gbmV3IFJ1YnJpY0Fzc29jaWF0aW9uKGRhdGEsIHRoaXMuY291cnNlKSk7XHJcbiAgICAgICAgdGhpcy5jYW52YXNEYXRhWydhc3NvY2lhdGlvbnMnXSA9IGFzc29jaWF0aW9ucztcclxuICAgICAgICByZXR1cm4gYXNzb2NpYXRpb25zO1xyXG4gICAgfVxyXG59XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIFJ1YnJpY0Fzc29jaWF0aW9uIGV4dGVuZHMgQmFzZUNvbnRlbnRJdGVtIHtcclxuICAgIHN0YXRpYyBjb250ZW50VXJsVGVtcGxhdGUgPSBcImNvdXJzZXMve2NvdXJzZV9pZH0vcnVicmljX2Fzc29jaWF0aW9ucy97Y29udGVudF9pZH1cIjtcclxuICAgIHN0YXRpYyBhbGxDb250ZW50VXJsVGVtcGxhdGUgPSBcImNvdXJzZXMve2NvdXJzZV9pZH0vcnVicmljX2Fzc29jaWF0aW9uc1wiO1xyXG5cclxuICAgIGdldCB1c2VGb3JHcmFkaW5nKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNhbnZhc0RhdGFbJ3VzZV9mb3JfZ3JhZGluZyddO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIHNldFVzZUZvckdyYWRpbmcodmFsdWU6IGJvb2xlYW4pIHtcclxuICAgICAgICB0aGlzLmNhbnZhc0RhdGFbJ3VzZV9mb3JfZ3JhZGluZyddID0gdmFsdWU7XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuc2F2ZURhdGEoeydydWJyaWNfYXNzb2NpYXRpb25bdXNlX2Zvcl9ncmFkaW5nXSc6IHZhbHVlfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBUZXJtIGV4dGVuZHMgQmFzZUNhbnZhc09iamVjdCB7XHJcblxyXG4gICAgZ2V0IGNvZGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FudmFzRGF0YVsnbmFtZSddO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBhc3luYyBnZXRUZXJtIChjb2RlOiBzdHJpbmcsIHdvcmtmbG93U3RhdGU6IHN0cmluZyA9ICdhbnknLCBjb25maWc6IElDYW52YXNDYWxsQ29uZmlnIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgY29uc3QgdGVybXMgPSBhd2FpdCB0aGlzLnNlYXJjaFRlcm1zKGNvZGUsIHdvcmtmbG93U3RhdGUsIGNvbmZpZyk7XHJcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHRlcm1zKSB8fCB0ZXJtcy5sZW5ndGggPD0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRlcm1zWzBdO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBhc3luYyBnZXRBbGxBY3RpdmVUZXJtcyhjb25maWc6IElDYW52YXNDYWxsQ29uZmlnIHwgbnVsbCA9IG51bGwpIHtcclxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zZWFyY2hUZXJtcyhudWxsLCAnYWN0aXZlJywgY29uZmlnKTtcclxuICAgIH1cclxuICAgIHN0YXRpYyBhc3luYyBzZWFyY2hUZXJtcyhcclxuICAgICAgICBjb2RlOiBzdHJpbmcgfCBudWxsID0gbnVsbCxcclxuICAgICAgICB3b3JrZmxvd1N0YXRlID0gJ2FsbCcsXHJcbiAgICAgICAgY29uZmlnOiBJQ2FudmFzQ2FsbENvbmZpZyB8IG51bGwgPSBudWxsKSB7XHJcblxyXG4gICAgICAgIGNvbmZpZyA9IGNvbmZpZyB8fCB7fTtcclxuICAgICAgICBjb25maWcucXVlcnlQYXJhbXMgPSBjb25maWcucXVlcnlQYXJhbXMgfHwge307XHJcblxyXG4gICAgICAgIGxldCBxdWVyeVBhcmFtcyA9IGNvbmZpZy5xdWVyeVBhcmFtcztcclxuICAgICAgICBpZiAod29ya2Zsb3dTdGF0ZSkgcXVlcnlQYXJhbXNbJ3dvcmtmbG93X3N0YXRlJ10gPSB3b3JrZmxvd1N0YXRlO1xyXG4gICAgICAgIGlmIChjb2RlKSBxdWVyeVBhcmFtc1sndGVybV9uYW1lJ10gPSBjb2RlO1xyXG4gICAgICAgIGxldCByb290QWNjb3VudCA9IGF3YWl0IEFjY291bnQuZ2V0Um9vdEFjY291bnQoKTtcclxuICAgICAgICBsZXQgdXJsID0gYGFjY291bnRzLyR7cm9vdEFjY291bnQ/LmlkfS90ZXJtc2A7XHJcbiAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IGdldEFwaVBhZ2VkRGF0YSh1cmwsIGNvbmZpZyk7XHJcbiAgICAgICAgbGV0IHRlcm1zOiBJQ2FudmFzRGF0YVtdID0gW107XHJcbiAgICAgICAgdGVybXMuY29uY2F0KC4uLmRhdGEubWFwKCAoZGF0dW0pID0+IFsuLi5kYXR1bVsnZW5yb2xsbWVudF90ZXJtcyddXSkpO1xyXG5cclxuICAgICAgICBpZiAoIWRhdGEgfHwgIWRhdGEuaGFzT3duUHJvcGVydHkoJ2Vucm9sbG1lbnRfdGVybXMnKSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYE5vIGVucm9sbG1lbnQgdGVybXMgZm91bmQgZm9yICR7Y29kZX1gKTtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXRlcm1zIHx8IHRlcm1zLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRlcm1zLm1hcCh0ZXJtID0+IG5ldyBUZXJtKHRlcm0pKTtcclxuICAgIH1cclxufVxyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBOb3RJbXBsZW1lbnRlZEV4Y2VwdGlvbiBleHRlbmRzIEVycm9yIHt9XHJcbmV4cG9ydCBjbGFzcyBDb3Vyc2VOb3RGb3VuZEV4Y2VwdGlvbiBleHRlbmRzIEVycm9yIHt9XHJcblxyXG5cclxuXHJcbmZ1bmN0aW9uIGNvbnRlbnRDbGFzcyhvcmlnaW5hbENsYXNzOiB0eXBlb2YgQmFzZUNvbnRlbnRJdGVtLCBfY29udGV4dDogQ2xhc3NEZWNvcmF0b3JDb250ZXh0KSB7XHJcbiAgICBDb3Vyc2UucmVnaXN0ZXJDb250ZW50Q2xhc3Mob3JpZ2luYWxDbGFzcyk7XHJcbiAgICAvL29yaWdpbmFsQ2xhc3MuY29udGVudFVybFBhcnQgPVxyXG59Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9