"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.countTotalProblems = countTotalProblems;
exports.getCountByArrayColumnsProblem = getCountByArrayColumnsProblem;
exports.getCountByColumnProblem = getCountByColumnProblem;
exports.getCountSolutionStatusProblem = getCountSolutionStatusProblem;
exports.getSubtotalsByComponentProblem = getSubtotalsByComponentProblem;
exports.getValuesByRangeProblem = getValuesByRangeProblem;
exports.problemCounterRoute = problemCounterRoute;
exports.problemParamFilterRoute = problemParamFilterRoute;

var _needle = _interopRequireDefault(require("needle"));

var _config = require("bc/config/config.js");

var _logger = _interopRequireDefault(require("bc/config/logger.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return generator._invoke = function (innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; }(innerFn, self, context), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; this._invoke = function (method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (object) { var keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var getNewFilter = function getNewFilter(filters, body, withPrefix) {
  var prefix = '';

  if (withPrefix) {
    prefix = "".concat(_config.PROBLEM_TABLE, ".");
  }

  if (body.problemtype) {
    var problemtype = body.problemtype.split(',');
    var problemtypeIn = problemtype.map(function (s) {
      return "'".concat(s, "'");
    });
    filters += " and ".concat(prefix).concat(_config.PROPSPROBLEMTABLES.problem_boundary[8], " in (").concat(problemtypeIn.join(','), ")");
  }

  if (body.cost && body.cost.length !== 0) {
    var column = "".concat(prefix).concat(_config.PROPSPROBLEMTABLES.problem_boundary[0]);
    var minPair = body.cost[0];
    var maxPair = body.cost[body.cost.length - 1];
    var minimumValue = minPair.split(',')[0];
    var maximumValue = maxPair.split(',')[1];
    filters += " and ".concat(column, " between ").concat(minimumValue, " and ").concat(maximumValue);
  }

  if (body.solutionstatus) {
    filters += " and ".concat(prefix).concat(_config.PROPSPROBLEMTABLES.problem_boundary[1], " in (").concat(body.solutionstatus, ")");
  }

  if (body.priority) {
    var priorities = body.priority.split(',');
    var prioritiesIn = priorities.map(function (s) {
      return "'".concat(s, "'");
    });
    filters += " and ".concat(prefix).concat(_config.PROPSPROBLEMTABLES.problem_boundary[7], " in (").concat(prioritiesIn.join(','), ")");
  }

  if (body.county) {
    var counties = body.county.split(',');
    var countiesIn = counties.map(function (s) {
      if (s.includes(' County')) {
        s = s.substring(0, s.length - ' County'.length);
      }

      return "'".concat(s, "'");
    });
    filters += " and ".concat(prefix, "county in (").concat(countiesIn.join(','), ")");
  }

  if (body.servicearea) {
    var serviceareas = body.servicearea.split(',');
    var serviceareasIn = serviceareas.map(function (s) {
      if (s.includes(' Service Area')) {
        s = s.substring(0, s.length - ' Service Area'.length);
      }

      return "'".concat(s, "'");
    });
    filters += " and ".concat(prefix).concat(_config.PROPSPROBLEMTABLES.problem_boundary[9], " in (").concat(serviceareasIn.join(','), ")");
  }

  if (body.jurisdiction) {
    filters += " and ".concat(prefix).concat(_config.PROPSPROBLEMTABLES.problem_boundary[2], " = '").concat(body.jurisdiction, "'");
  }

  if (body.mhfdmanager) {
    filters += " and ".concat(prefix).concat(_config.PROPSPROBLEMTABLES.problem_boundary[3], " = '").concat(body.mhfdmanager, "'");
  }

  return filters;
};

function getCountByArrayColumnsProblem(_x, _x2, _x3, _x4, _x5) {
  return _getCountByArrayColumnsProblem.apply(this, arguments);
}

function _getCountByArrayColumnsProblem() {
  _getCountByArrayColumnsProblem = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(table, column, columns, bounds, body) {
    var result, coords, filters, _iterator, _step, value, query, counter, data;

    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            result = [];
            _context.prev = 1;
            coords = bounds.split(',');
            filters = "(ST_Contains(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), the_geom) or ");
            filters += "ST_Intersects(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), the_geom))");
            filters = getNewFilter(filters, body);
            _iterator = _createForOfIteratorHelper(columns);
            _context.prev = 7;

            _iterator.s();

          case 9:
            if ((_step = _iterator.n()).done) {
              _context.next = 20;
              break;
            }

            value = _step.value;
            query = {
              q: "select ".concat(column, " as column, count(*) as count from ").concat(table, " \n             where ").concat(column, "='").concat(value, "' and ").concat(filters, " group by ").concat(column, " order by ").concat(column, " ")
            };
            counter = 0;
            _context.next = 15;
            return (0, _needle["default"])('post', _config.CARTO_URL, query, {
              json: true
            });

          case 15:
            data = _context.sent;

            //console.log('STATUS', data.statusCode);
            if (data.statusCode === 200) {
              //const result1 = data.body.rows;
              if (data.body.rows.length > 0) {
                counter = data.body.rows[0].count;
              }
            } else {
              console.log('data.statusCode', data.statusCode);
              console.log('data.body', data.body);
            }

            result.push({
              value: value,
              counter: counter
            });

          case 18:
            _context.next = 9;
            break;

          case 20:
            _context.next = 25;
            break;

          case 22:
            _context.prev = 22;
            _context.t0 = _context["catch"](7);

            _iterator.e(_context.t0);

          case 25:
            _context.prev = 25;

            _iterator.f();

            return _context.finish(25);

          case 28:
            _context.next = 34;
            break;

          case 30:
            _context.prev = 30;
            _context.t1 = _context["catch"](1);

            _logger["default"].error(_context.t1);

            _logger["default"].error("getCountByArrayColumns Table: ".concat(table, ", Column: ").concat(column, " Connection error"));

          case 34:
            return _context.abrupt("return", result);

          case 35:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[1, 30], [7, 22, 25, 28]]);
  }));
  return _getCountByArrayColumnsProblem.apply(this, arguments);
}

function getCountByColumnProblem(_x6, _x7, _x8, _x9) {
  return _getCountByColumnProblem.apply(this, arguments);
}

function _getCountByColumnProblem() {
  _getCountByColumnProblem = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(table, column, bounds, body) {
    var result, coords, filters, query, data;
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            result = [];
            _context2.prev = 1;
            coords = bounds.split(',');
            filters = "(ST_Contains(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), the_geom) or ");
            filters += "ST_Intersects(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), the_geom))");
            filters = getNewFilter(filters, body);
            query = {
              q: "select ".concat(column, " as value, count(*) as counter from ").concat(table, " \n             where ").concat(filters, " group by ").concat(column, " order by ").concat(column, " ")
            };
            _context2.next = 9;
            return (0, _needle["default"])('post', _config.CARTO_URL, query, {
              json: true
            });

          case 9:
            data = _context2.sent;

            if (data.statusCode === 200) {
              if (data.body.rows.length > 0) {
                result = result.concat(data.body.rows);
              }
            }

            _context2.next = 17;
            break;

          case 13:
            _context2.prev = 13;
            _context2.t0 = _context2["catch"](1);

            _logger["default"].error(_context2.t0);

            _logger["default"].error("getCountByColumnProblem Table: ".concat(table, ", Column: ").concat(column, " Connection error"));

          case 17:
            return _context2.abrupt("return", result);

          case 18:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[1, 13]]);
  }));
  return _getCountByColumnProblem.apply(this, arguments);
}

function getCountSolutionStatusProblem(_x10, _x11, _x12) {
  return _getCountSolutionStatusProblem.apply(this, arguments);
}

function _getCountSolutionStatusProblem() {
  _getCountSolutionStatusProblem = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(range, bounds, body) {
    var result, coords, filters, _iterator2, _step2, value, endValue, query, data, counter;

    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            result = [];
            _context3.prev = 1;
            coords = bounds.split(',');
            filters = "(ST_Contains(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), the_geom) or ");
            filters += "ST_Intersects(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), the_geom))");
            filters = getNewFilter(filters, body);
            _iterator2 = _createForOfIteratorHelper(range);
            _context3.prev = 7;

            _iterator2.s();

          case 9:
            if ((_step2 = _iterator2.n()).done) {
              _context3.next = 22;
              break;
            }

            value = _step2.value;
            endValue = 0;

            if (value === 75) {
              endValue = value + 25;
            } else {
              endValue = value + 24;
            }

            query = {
              q: "select count(*) as count from ".concat(_config.PROBLEM_TABLE, " where ").concat(filters, " and ").concat(_config.PROPSPROBLEMTABLES.problem_boundary[1], " between ").concat(value, " and ").concat(endValue, " ")
            };
            _context3.next = 16;
            return (0, _needle["default"])('post', _config.CARTO_URL, query, {
              json: true
            });

          case 16:
            data = _context3.sent;
            counter = 0;

            if (data.statusCode === 200) {
              if (data.body.rows.length > 0) {
                counter = data.body.rows[0].count;
              }
            } else {
              _logger["default"].error('getCountSolutionStatusProblem error');

              _logger["default"].error(data.statusCode);

              _logger["default"].error(data.body);
            }

            result.push({
              value: value,
              counter: counter
            });

          case 20:
            _context3.next = 9;
            break;

          case 22:
            _context3.next = 27;
            break;

          case 24:
            _context3.prev = 24;
            _context3.t0 = _context3["catch"](7);

            _iterator2.e(_context3.t0);

          case 27:
            _context3.prev = 27;

            _iterator2.f();

            return _context3.finish(27);

          case 30:
            _context3.next = 36;
            break;

          case 32:
            _context3.prev = 32;
            _context3.t1 = _context3["catch"](1);

            _logger["default"].error(_context3.t1);

            _logger["default"].error("getCountSolutionStatus Connection error");

          case 36:
            return _context3.abrupt("return", result);

          case 37:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[1, 32], [7, 24, 27, 30]]);
  }));
  return _getCountSolutionStatusProblem.apply(this, arguments);
}

function getSubtotalsByComponentProblem(_x13, _x14, _x15, _x16) {
  return _getSubtotalsByComponentProblem.apply(this, arguments);
}

function _getSubtotalsByComponentProblem() {
  _getSubtotalsByComponentProblem = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(table, column, bounds, body) {
    var result, coords, COMPONENTS, _i, _COMPONENTS, tablename, _table, filters, query, data, counter;

    return _regeneratorRuntime().wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            result = [];
            _context4.prev = 1;
            coords = bounds.split(',');
            COMPONENTS = ['Grade Control Structure', 'Pipe Appurtenances', 'Special Item Point', 'Special Item Linear', 'Special Item Area', 'Channel Improvements Linear', 'Channel Improvements Area', 'Removal Line', 'Removal Area', 'Storm Drain', 'Detention Facilities', 'Maintenance Trails', 'Land Acquisition', 'Landscaping Area'];
            _i = 0, _COMPONENTS = COMPONENTS;

          case 5:
            if (!(_i < _COMPONENTS.length)) {
              _context4.next = 21;
              break;
            }

            tablename = _COMPONENTS[_i];
            _table = tablename.toLowerCase().split(' ').join('_');
            filters = "(ST_Contains(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), ").concat(_table, ".the_geom) or ");
            filters += "ST_Intersects(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), ").concat(_table, ".the_geom))");
            filters = getNewFilter(filters, body, true);
            query = {
              q: "select count(*) from ".concat(_table, ", ").concat(_config.PROBLEM_TABLE, " where ").concat(_config.PROBLEM_TABLE, ".").concat(column, "= ").concat(_table, ".").concat(column, " and ").concat(filters, " ")
            };
            _context4.next = 14;
            return (0, _needle["default"])('post', _config.CARTO_URL, query, {
              json: true
            });

          case 14:
            data = _context4.sent;
            counter = 0;

            if (data.statusCode === 200) {
              if (data.body.rows.length > 0) {
                counter = data.body.rows[0].count;
              }
            } else {
              _logger["default"].error('getSubtotalsByComponentProblem error');

              _logger["default"].error(data.statusCode);

              _logger["default"].error(data.body);
            }

            result.push({
              key: _table,
              value: tablename,
              counter: counter
            });

          case 18:
            _i++;
            _context4.next = 5;
            break;

          case 21:
            _context4.next = 27;
            break;

          case 23:
            _context4.prev = 23;
            _context4.t0 = _context4["catch"](1);

            _logger["default"].error(_context4.t0);

            _logger["default"].error("getSubtotalsByComponent Connection error");

          case 27:
            return _context4.abrupt("return", result);

          case 28:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[1, 23]]);
  }));
  return _getSubtotalsByComponentProblem.apply(this, arguments);
}

function getValuesByRangeProblem(_x17, _x18, _x19, _x20, _x21) {
  return _getValuesByRangeProblem.apply(this, arguments);
}

function _getValuesByRangeProblem() {
  _getValuesByRangeProblem = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6(table, column, range, bounds, body) {
    var result, coords, filters, newProm1;
    return _regeneratorRuntime().wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            result = [];
            _context6.prev = 1;
            coords = bounds.split(',');
            filters = "(ST_Contains(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), the_geom) or ");
            filters += "ST_Intersects(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), the_geom))");
            filters = getNewFilter(filters, body);
            newProm1 = new Promise( /*#__PURE__*/function () {
              var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(resolve, reject) {
                var minRange, maxRange, bodyColumn, minPair, maxPair, minimumValue, maximumValue, minMaxQuery, minMaxData, minMaxResult, width, lenRange, intervalWidth, result2, epsilon, i, isLast, values, counter, query, data, rows;
                return _regeneratorRuntime().wrap(function _callee5$(_context5) {
                  while (1) {
                    switch (_context5.prev = _context5.next) {
                      case 0:
                        bodyColumn = column === _config.PROPSPROBLEMTABLES.problem_boundary[0] ? body['cost'] : body[column];

                        if (!(column === _config.PROPSPROBLEMTABLES.problem_boundary[0])) {
                          _context5.next = 6;
                          break;
                        }

                        minRange = 0;
                        maxRange = 12000000;
                        _context5.next = 22;
                        break;

                      case 6:
                        if (!(bodyColumn && bodyColumn.length !== 0)) {
                          _context5.next = 15;
                          break;
                        }

                        minPair = bodyColumn[0];
                        maxPair = bodyColumn[bodyColumn.length - 1];
                        minimumValue = minPair.split(',')[0];
                        maximumValue = maxPair.split(',')[1];
                        minRange = +minimumValue;
                        maxRange = +maximumValue;
                        _context5.next = 22;
                        break;

                      case 15:
                        minMaxQuery = {
                          q: "SELECT max(".concat(column, ") as max, min(").concat(column, ") as min FROM ").concat(table, " where ").concat(filters)
                        };
                        _context5.next = 18;
                        return (0, _needle["default"])('post', _config.CARTO_URL, minMaxQuery, {
                          json: true
                        });

                      case 18:
                        minMaxData = _context5.sent;
                        minMaxResult = minMaxData.body.rows || [];
                        minRange = Math.min.apply(Math, minMaxResult.map(function (element) {
                          return element.min;
                        }));
                        maxRange = Math.max.apply(Math, minMaxResult.map(function (element) {
                          return element.max;
                        }));

                      case 22:
                        width = maxRange - minRange;
                        lenRange = column === _config.PROPSPROBLEMTABLES.problem_boundary[0] ? 13 : 20;
                        intervalWidth = column === _config.PROPSPROBLEMTABLES.problem_boundary[0] ? 1000000 : width / lenRange;
                        result2 = [];
                        epsilon = 0.001;
                        i = 0;

                      case 28:
                        if (!(i < lenRange)) {
                          _context5.next = 41;
                          break;
                        }

                        isLast = i === lenRange - 1;
                        values = {
                          min: minRange + i * intervalWidth,
                          max: minRange + (i + 1) * intervalWidth - (isLast ? 0 : epsilon)
                        };
                        counter = 0;
                        query = {
                          q: "select count(*) from ".concat(table, " where (").concat(column, " between ").concat(values.min, " and ").concat(values.max, ") and ").concat(filters, " ")
                        };
                        _context5.next = 35;
                        return (0, _needle["default"])('post', _config.CARTO_URL, query, {
                          json: true
                        });

                      case 35:
                        data = _context5.sent;

                        if (data.statusCode === 200) {
                          rows = data.body.rows;
                          counter = rows[0].count;
                        }

                        result2.push({
                          min: values.min,
                          max: values.max,
                          counter: counter,
                          last: isLast
                        });

                      case 38:
                        i++;
                        _context5.next = 28;
                        break;

                      case 41:
                        resolve(result2);

                      case 42:
                      case "end":
                        return _context5.stop();
                    }
                  }
                }, _callee5);
              }));

              return function (_x28, _x29) {
                return _ref.apply(this, arguments);
              };
            }());
            _context6.next = 9;
            return newProm1;

          case 9:
            result = _context6.sent;
            _context6.next = 16;
            break;

          case 12:
            _context6.prev = 12;
            _context6.t0 = _context6["catch"](1);

            _logger["default"].error(_context6.t0);

            _logger["default"].error("Range By Value, Column ".concat(column, " Connection error"));

          case 16:
            return _context6.abrupt("return", result);

          case 17:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, null, [[1, 12]]);
  }));
  return _getValuesByRangeProblem.apply(this, arguments);
}

function countTotalProblems(_x22, _x23) {
  return _countTotalProblems.apply(this, arguments);
}

function _countTotalProblems() {
  _countTotalProblems = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7(bounds, body) {
    var coords, filters, COUNTSQL, query, lineData, total;
    return _regeneratorRuntime().wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            coords = bounds.split(',');
            filters = "(ST_Contains(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), the_geom) or ");
            filters += "ST_Intersects(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), the_geom))");
            filters = getNewFilter(filters, body);
            COUNTSQL = "SELECT count(*) FROM ".concat(_config.PROBLEM_TABLE, " where ").concat(filters);
            query = {
              q: " ".concat(COUNTSQL, " ")
            };
            _context7.next = 8;
            return (0, _needle["default"])('post', _config.CARTO_URL, query, {
              json: true
            });

          case 8:
            lineData = _context7.sent;
            total = lineData.body.rows[0].count;
            return _context7.abrupt("return", total);

          case 11:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7);
  }));
  return _countTotalProblems.apply(this, arguments);
}

function problemCounterRoute(_x24, _x25) {
  return _problemCounterRoute.apply(this, arguments);
}

function _problemCounterRoute() {
  _problemCounterRoute = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee8(req, res) {
    var bounds, body, total;
    return _regeneratorRuntime().wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _context8.prev = 0;
            bounds = req.query.bounds;
            body = req.body;
            _context8.next = 5;
            return countTotalProblems(bounds, body);

          case 5:
            total = _context8.sent;
            res.status(200).send({
              total: total
            });
            _context8.next = 13;
            break;

          case 9:
            _context8.prev = 9;
            _context8.t0 = _context8["catch"](0);

            _logger["default"].error(_context8.t0);

            _logger["default"].error("countTotalProblems Connection error");

          case 13:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8, null, [[0, 9]]);
  }));
  return _problemCounterRoute.apply(this, arguments);
}

function problemParamFilterRoute(_x26, _x27) {
  return _problemParamFilterRoute.apply(this, arguments);
}

function _problemParamFilterRoute() {
  _problemParamFilterRoute = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee9(req, res) {
    var bounds, body, requests, problemTypesConst, rangeSolution, promises, result;
    return _regeneratorRuntime().wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            _context9.prev = 0;
            bounds = req.query.bounds;
            body = req.body;
            requests = [];
            problemTypesConst = ['Flood Hazard', 'Stream Function', 'Watershed Change'];
            requests.push(getCountByArrayColumnsProblem(_config.PROBLEM_TABLE, _config.PROPSPROBLEMTABLES.problem_boundary[7], ['High', 'Medium', 'Low'], bounds, body));
            requests.push(getCountSolutionStatusProblem([0, 25, 50, 75], bounds, body));
            requests.push(getCountByColumnProblem(_config.PROBLEM_TABLE, _config.PROPSPROBLEMTABLES.problem_boundary[3], bounds, body));
            requests.push(getCountByColumnProblem(_config.PROBLEM_TABLE, _config.PROPSPROBLEMTABLES.problem_boundary[14], bounds, body));
            requests.push(getSubtotalsByComponentProblem(_config.PROBLEM_TABLE, _config.PROPSPROBLEMTABLES.problem_boundary[5], bounds, body));
            rangeSolution = [{
              min: 0,
              max: 1000000
            }, {
              min: 1000001,
              max: 3000000
            }, {
              min: 3000001,
              max: 5000000
            }, {
              min: 5000001,
              max: 50000000
            }];
            requests.push(getValuesByRangeProblem(_config.PROBLEM_TABLE, _config.PROPSPROBLEMTABLES.problem_boundary[0], rangeSolution, bounds, body));
            requests.push(getCountByColumnProblem(_config.PROBLEM_TABLE, _config.PROPSPROBLEMTABLES.problem_boundary[2], bounds, body));
            requests.push(getCountByColumnProblem(_config.PROBLEM_TABLE, _config.PROPSPROBLEMTABLES.problem_boundary[9], bounds, body));
            requests.push(getCountByColumnProblem(_config.PROBLEM_TABLE, 'county', bounds, body));
            requests.push(getCountByArrayColumnsProblem(_config.PROBLEM_TABLE, _config.PROPSPROBLEMTABLES.problem_boundary[8], problemTypesConst, bounds, body));
            _context9.next = 18;
            return Promise.all(requests);

          case 18:
            promises = _context9.sent;
            result = {
              "problemtype": promises[9],
              "priority": promises[0],
              "solutionstatus": promises[1],
              "county": promises[8],
              "jurisdiction": promises[6],
              "mhfdmanager": promises[2],
              "source": promises[3],
              "components": promises[4],
              "cost": promises[5],
              "servicearea": promises[7]
            };
            res.status(200).send(result);
            _context9.next = 27;
            break;

          case 23:
            _context9.prev = 23;
            _context9.t0 = _context9["catch"](0);

            _logger["default"].error(_context9.t0);

            _logger["default"].error("getSubtotalsByComponent Connection error");

          case 27:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9, null, [[0, 23]]);
  }));
  return _problemParamFilterRoute.apply(this, arguments);
}