"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.componentCounterRoute = componentCounterRoute;
exports.componentParamFilterRoute = componentParamFilterRoute;
exports.countTotalComponent = countTotalComponent;
exports.getComponentsValuesByColumnWithCountWithFilter = getComponentsValuesByColumnWithCountWithFilter;
exports.getComponentsValuesByColumnWithFilter = getComponentsValuesByColumnWithFilter;
exports.getCountByYearStudyWithFilter = getCountByYearStudyWithFilter;
exports.getCounterComponentsWithFilter = getCounterComponentsWithFilter;
exports.getQuintilComponentValuesWithFilter = getQuintilComponentValuesWithFilter;

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

var distanceInYears = 1;
var TABLES_COMPONENTS = ['grade_control_structure', 'pipe_appurtenances', 'special_item_point', 'special_item_linear', 'special_item_area', 'channel_improvements_linear', 'channel_improvements_area', 'removal_line', 'removal_area', 'storm_drain', 'detention_facilities', 'maintenance_trails', 'land_acquisition', 'landscaping_area'];

function CapitalLetter(chain) {
  return chain.split('_').map(function (word) {
    return word.charAt(0).toUpperCase() + word.substring(1);
  }).join(' ');
}

var getNewFilter = function getNewFilter(filters, body) {
  if (body.status) {
    var statuses = body.status.split(',');
    var statusesIn = statuses.map(function (s) {
      return "'".concat(s, "'");
    });
    filters += " and status in (".concat(statusesIn.join(','), ")");
  }

  if (body.component_type) {
    var componentTypes = body.component_type.split(',');
    var componentTypesIn = componentTypes.map(function (s) {
      return "'".concat(CapitalLetter(s), "'");
    });
    filters += " and type in (".concat(componentTypesIn.join(','), ")");
  }

  if (body.estimatedcost && body.estimatedcost.length !== 0) {
    var column = 'estimated_cost';
    var minPair = body.estimatedcost[0];
    var maxPair = body.estimatedcost[body.estimatedcost.length - 1];
    var minimumValue = minPair.split(',')[0];
    var maximumValue = maxPair.split(',')[1];
    filters += " and ".concat(column, " between ").concat(minimumValue, " and ").concat(maximumValue);
  }

  if (body.yearofstudy) {
    var splitted = body.yearofstudy.split(',');
    var _column = 'year_of_study';
    var _minimumValue = splitted[0];
    var _maximumValue = splitted[splitted.length - 1];
    _maximumValue = _maximumValue === 2020 ? Number(_maximumValue) + 10 : Number(_maximumValue) + (distanceInYears - 1);
    filters += "and ".concat(_column, " between ").concat(_minimumValue, " and ").concat(_maximumValue);
  }

  if (body.jurisdiction) {
    filters += " and jurisdiction = '".concat(body.jurisdiction, "'");
  }

  if (body.mhfdmanager) {
    filters += " and mhfdmanager = '".concat(body.mhfdmanager, "'");
  }

  if (body.county) {
    var counties = body.county.split(',');
    var countiesIn = counties.map(function (s) {
      if (s.includes(' County')) {
        s = s.substring(0, s.length - ' County'.length);
      }

      return "'".concat(s, "'");
    });
    console.log('countiesIn', countiesIn.join(','));
    filters += " and county in (".concat(countiesIn.join(','), ")");
  }

  if (body.servicearea) {
    var serviceareas = body.servicearea.split(',');
    var serviceareasIn = serviceareas.map(function (s) {
      return "'".concat(s, "'");
    });
    filters += " and servicearea in (".concat(serviceareasIn.join(','), ")");
  }

  return filters;
};

function getCounterComponentsWithFilter(_x, _x2) {
  return _getCounterComponentsWithFilter.apply(this, arguments);
}

function _getCounterComponentsWithFilter() {
  _getCounterComponentsWithFilter = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(bounds, body) {
    var result, coords, filters, _iterator, _step, component, answer, SQL, query, data;

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
            _iterator = _createForOfIteratorHelper(TABLES_COMPONENTS);
            _context.prev = 7;

            _iterator.s();

          case 9:
            if ((_step = _iterator.n()).done) {
              _context.next = 21;
              break;
            }

            component = _step.value;
            answer = [];
            SQL = "SELECT type FROM ".concat(component, " where ").concat(filters, " group by type ");
            query = {
              q: " ".concat(SQL, " ")
            };
            _context.next = 16;
            return (0, _needle["default"])('post', _config.CARTO_URL, query, {
              json: true
            });

          case 16:
            data = _context.sent;

            if (data.statusCode === 200) {
              answer = data.body.rows;
            } else if (data.statusCode === 400) {
              _logger["default"].error('data.statusCode 400', data.body);
            } else {
              _logger["default"].error('Error on getCounterComponentsWithFilter');

              _logger["default"].error(data.statusCode);

              _logger["default"].error(data.body);
            }

            result.push({
              key: component,
              value: CapitalLetter(component)
            });

          case 19:
            _context.next = 9;
            break;

          case 21:
            _context.next = 26;
            break;

          case 23:
            _context.prev = 23;
            _context.t0 = _context["catch"](7);

            _iterator.e(_context.t0);

          case 26:
            _context.prev = 26;

            _iterator.f();

            return _context.finish(26);

          case 29:
            _context.next = 35;
            break;

          case 31:
            _context.prev = 31;
            _context.t1 = _context["catch"](1);

            _logger["default"].error(_context.t1);

            _logger["default"].error("getCounterComponents Connection error");

          case 35:
            return _context.abrupt("return", result);

          case 36:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[1, 31], [7, 23, 26, 29]]);
  }));
  return _getCounterComponentsWithFilter.apply(this, arguments);
}

function getComponentsValuesByColumnWithFilter(_x3, _x4, _x5) {
  return _getComponentsValuesByColumnWithFilter.apply(this, arguments);
}

function _getComponentsValuesByColumnWithFilter() {
  _getComponentsValuesByColumnWithFilter = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(column, bounds, body) {
    var result, coords, filters, LINE_SQL, query, data, answer, _iterator2, _step2, _loop;

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
            LINE_SQL = TABLES_COMPONENTS.map(function (t) {
              return "SELECT ".concat(column, " as column FROM ").concat(t, " where ").concat(filters, " group by ").concat(column);
            }).join(' union ');
            query = {
              q: " ".concat(LINE_SQL, " ")
            };
            _context2.next = 10;
            return (0, _needle["default"])('post', _config.CARTO_URL, query, {
              json: true
            });

          case 10:
            data = _context2.sent;
            answer = [];

            if (data.statusCode === 200) {
              answer = data.body.rows;
            } else {
              _logger["default"].error('Error on getComponentsValuesByColumnWithFilter');

              _logger["default"].error(data.statusCode);

              _logger["default"].error(data.body);
            }

            _iterator2 = _createForOfIteratorHelper(answer);

            try {
              _loop = function _loop() {
                var row = _step2.value;
                var search = result.filter(function (item) {
                  return item.value === row.column;
                });

                if (search.length === 0) {
                  var sum = answer.filter(function (item) {
                    return item.column === row.column;
                  }).map(function (item) {
                    return item.count;
                  }).reduce(function (prev, next) {
                    return prev + next;
                  });
                  result.push({
                    value: row.column,
                    counter: sum
                  });
                }
              };

              for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                _loop();
              }
            } catch (err) {
              _iterator2.e(err);
            } finally {
              _iterator2.f();
            }

            _context2.next = 21;
            break;

          case 17:
            _context2.prev = 17;
            _context2.t0 = _context2["catch"](1);

            _logger["default"].error(_context2.t0);

            _logger["default"].error("getComponentsValuesByColumnWithFilter, Column ".concat(column, " Connection error"));

          case 21:
            return _context2.abrupt("return", result);

          case 22:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[1, 17]]);
  }));
  return _getComponentsValuesByColumnWithFilter.apply(this, arguments);
}

function getCountByYearStudyWithFilter(_x6, _x7) {
  return _getCountByYearStudyWithFilter.apply(this, arguments);
}

function _getCountByYearStudyWithFilter() {
  _getCountByYearStudyWithFilter = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(bounds, body) {
    var result, y;
    return _regeneratorRuntime().wrap(function _callee4$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            result = [];
            _context5.prev = 1;
            return _context5.delegateYield( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3() {
              var coords, filters, values, _loop2, _i, _values;

              return _regeneratorRuntime().wrap(function _callee3$(_context4) {
                while (1) {
                  switch (_context4.prev = _context4.next) {
                    case 0:
                      coords = bounds.split(',');
                      filters = "(ST_Contains(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), the_geom) or ");
                      filters += "ST_Intersects(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), the_geom))");
                      filters = getNewFilter(filters, body);
                      values = [];

                      for (y = 1970; y <= 2030; y += distanceInYears) {
                        values.push(y);
                      }

                      _loop2 = /*#__PURE__*/_regeneratorRuntime().mark(function _loop2() {
                        var value, initValue, endValue, SQL, query, data, counter;
                        return _regeneratorRuntime().wrap(function _loop2$(_context3) {
                          while (1) {
                            switch (_context3.prev = _context3.next) {
                              case 0:
                                value = _values[_i];
                                initValue = Number(value);
                                endValue = 0;

                                if (value === 2030) {
                                  endValue = initValue + 10;
                                } else {
                                  endValue = initValue + (distanceInYears - 1);
                                }

                                SQL = TABLES_COMPONENTS.map(function (t) {
                                  return "SELECT count(*) as count FROM ".concat(t, " where ").concat(filters, " and year_of_study between ").concat(initValue, " and ").concat(endValue);
                                }).join(' union ');
                                query = {
                                  q: " ".concat(SQL, " ")
                                };
                                _context3.next = 8;
                                return (0, _needle["default"])('post', _config.CARTO_URL, query, {
                                  json: true
                                });

                              case 8:
                                data = _context3.sent;
                                counter = 0;

                                if (data.statusCode === 200) {
                                  result.push({
                                    value: value,
                                    count: counter
                                  });
                                } else {
                                  _logger["default"].error('Error on getCountByYearStudyWithFilter');

                                  _logger["default"].error(data.statusCode);

                                  _logger["default"].error(data.body);
                                }

                              case 11:
                              case "end":
                                return _context3.stop();
                            }
                          }
                        }, _loop2);
                      });
                      _i = 0, _values = values;

                    case 8:
                      if (!(_i < _values.length)) {
                        _context4.next = 13;
                        break;
                      }

                      return _context4.delegateYield(_loop2(), "t0", 10);

                    case 10:
                      _i++;
                      _context4.next = 8;
                      break;

                    case 13:
                    case "end":
                      return _context4.stop();
                  }
                }
              }, _callee3);
            })(), "t0", 3);

          case 3:
            _context5.next = 9;
            break;

          case 5:
            _context5.prev = 5;
            _context5.t1 = _context5["catch"](1);

            _logger["default"].error(_context5.t1);

            _logger["default"].error("CountByYearStudy, Values: ".concat(values, " Connection error"));

          case 9:
            return _context5.abrupt("return", result);

          case 10:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee4, null, [[1, 5]]);
  }));
  return _getCountByYearStudyWithFilter.apply(this, arguments);
}

function getComponentsValuesByColumnWithCountWithFilter(_x8, _x9, _x10, _x11) {
  return _getComponentsValuesByColumnWithCountWithFilter.apply(this, arguments);
}

function _getComponentsValuesByColumnWithCountWithFilter() {
  _getComponentsValuesByColumnWithCountWithFilter = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(column, bounds, body, needCount) {
    var result, coords, filters, LINE_SQL, query, data, _answer, _iterator3, _step3, _loop3;

    return _regeneratorRuntime().wrap(function _callee5$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            result = [];
            _context6.prev = 1;
            coords = bounds.split(',');
            filters = "(ST_Contains(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), the_geom) or ");
            filters += "ST_Intersects(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), the_geom))");
            filters = getNewFilter(filters, body);
            LINE_SQL = TABLES_COMPONENTS.map(function (t) {
              return "SELECT ".concat(needCount ? 'count(*) as count, ' : '', " ").concat(column, " as column FROM ").concat(t, " where ").concat(filters, " group by ").concat(column);
            }).join(' union ');
            query = {
              q: " ".concat(LINE_SQL, " ")
            };
            _context6.next = 10;
            return (0, _needle["default"])('post', _config.CARTO_URL, query, {
              json: true
            });

          case 10:
            data = _context6.sent;
            _answer = [];

            if (data.statusCode === 200) {
              _answer = data.body.rows;
            } else {
              _logger["default"].error('Error on getComponentsValuesByColumnWithCountWithFilter');

              _logger["default"].error(data.statusCode);

              _logger["default"].error(data.body);
            }

            _iterator3 = _createForOfIteratorHelper(_answer);

            try {
              _loop3 = function _loop3() {
                var row = _step3.value;
                var search = result.filter(function (item) {
                  return item.value === row.column;
                });

                if (search.length === 0) {
                  var sum = _answer.filter(function (item) {
                    return item.column === row.column;
                  }).map(function (item) {
                    return item.count;
                  }).reduce(function (prev, next) {
                    return prev + next;
                  });

                  result.push({
                    value: row.column,
                    counter: sum
                  });
                }
              };

              for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
                _loop3();
              }
            } catch (err) {
              _iterator3.e(err);
            } finally {
              _iterator3.f();
            }

            _context6.next = 21;
            break;

          case 17:
            _context6.prev = 17;
            _context6.t0 = _context6["catch"](1);

            _logger["default"].error(_context6.t0);

            _logger["default"].error("getComponentsValuesByColumnWithCountWithFilter, Column ".concat(column, " Connection error"));

          case 21:
            return _context6.abrupt("return", result);

          case 22:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee5, null, [[1, 17]]);
  }));
  return _getComponentsValuesByColumnWithCountWithFilter.apply(this, arguments);
}

function getQuintilComponentValuesWithFilter(_x12, _x13, _x14) {
  return _getQuintilComponentValuesWithFilter.apply(this, arguments);
}

function _getQuintilComponentValuesWithFilter() {
  _getQuintilComponentValuesWithFilter = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6(column, bounds, body) {
    var finalResult, coords, filters, MINMAXSQL, lineQuery, lineData, lineResult, max, min, numberOfPartitions, difference, label, minRange, maxRange, intervalWidth, lenRange, result2, epsilon, i, isLast, _values2;

    return _regeneratorRuntime().wrap(function _callee6$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            finalResult = [];
            _context7.prev = 1;
            coords = bounds.split(',');
            filters = "(ST_Contains(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), the_geom) or ");
            filters += "ST_Intersects(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), the_geom))");
            filters = getNewFilter(filters, body);
            MINMAXSQL = '';
            MINMAXSQL = TABLES_COMPONENTS.map(function (t) {
              return "SELECT max(".concat(column, ") as max, min(").concat(column, ") as min FROM ").concat(t, " where ").concat(filters);
            }).join(' union ');
            lineQuery = {
              q: " ".concat(MINMAXSQL, " ")
            };
            _context7.next = 11;
            return (0, _needle["default"])('post', _config.CARTO_URL, lineQuery, {
              json: true
            });

          case 11:
            lineData = _context7.sent;
            lineResult = lineData.body.rows;
            max = Math.max.apply(Math, lineResult.map(function (element) {
              return element.max;
            }));
            min = Math.min.apply(Math, lineResult.map(function (element) {
              return element.min;
            }));
            numberOfPartitions = 20;
            difference = Math.round((max - min) / numberOfPartitions);
            label = '';

            if (max < 1000000) {
              label = 'K';
            } else {
              label = 'M';
            } // for (let i = 0; i < numberOfPartitions; i++) {
            //   let min1 = Math.round(min);
            //   let max1 = 0;
            //   let limitCount = 0;
            //   let counter = 0;
            //   if (i === numberOfPartitions - 1) {
            //     max1 = max;
            //     limitCount = max;
            //   } else {
            //     max1 = Math.round(difference * (i + 1));
            //     limitCount = max1;
            //   }
            //   finalResult.push({ min: min1, max: max1, label: label });
            //   min = (difference * (i + 1));
            // }


            minRange = 0;
            maxRange = 50000000;
            intervalWidth = 1000000;
            lenRange = maxRange / intervalWidth + 1;
            result2 = [];
            epsilon = 0.001;

            for (i = 0; i < lenRange; i++) {
              isLast = i === lenRange - 1;
              _values2 = {
                min: minRange + i * intervalWidth,
                max: minRange + (i + 1) * intervalWidth - (isLast ? 0 : epsilon)
              };
              finalResult.push({
                min: _values2.min,
                max: _values2.max,
                label: 'M'
              });
            }

            _context7.next = 32;
            break;

          case 28:
            _context7.prev = 28;
            _context7.t0 = _context7["catch"](1);

            _logger["default"].error(_context7.t0);

            _logger["default"].error("Quintil By Components, Column ".concat(column, " Connection error"));

          case 32:
            return _context7.abrupt("return", finalResult);

          case 33:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee6, null, [[1, 28]]);
  }));
  return _getQuintilComponentValuesWithFilter.apply(this, arguments);
}

function countTotalComponent(_x15, _x16) {
  return _countTotalComponent.apply(this, arguments);
}

function _countTotalComponent() {
  _countTotalComponent = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7(bounds, body) {
    var coords, filters, COUNTSQL, query, lineData, total;
    return _regeneratorRuntime().wrap(function _callee7$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            coords = bounds.split(',');
            filters = "(ST_Contains(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), the_geom) or ");
            filters += "ST_Intersects(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), the_geom))");
            filters = getNewFilter(filters, body);
            COUNTSQL = TABLES_COMPONENTS.map(function (t) {
              return "SELECT count(*) FROM ".concat(t, " where ").concat(filters);
            }).join(' union ');
            query = {
              q: " ".concat(COUNTSQL, " ")
            };
            _context8.next = 8;
            return (0, _needle["default"])('post', _config.CARTO_URL, query, {
              json: true
            });

          case 8:
            lineData = _context8.sent;

            if (!(lineData.statusCode === 200)) {
              _context8.next = 14;
              break;
            }

            total = lineData.body.rows.reduce(function (p, c) {
              return p + c.count;
            }, 0);
            return _context8.abrupt("return", total);

          case 14:
            _logger["default"].error('countTotalComponent error');

            _logger["default"].error(lineData.statusCode);

            _logger["default"].error(lineData.body);

          case 17:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee7);
  }));
  return _countTotalComponent.apply(this, arguments);
}

function componentCounterRoute(_x17, _x18) {
  return _componentCounterRoute.apply(this, arguments);
}

function _componentCounterRoute() {
  _componentCounterRoute = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee8(req, res) {
    var bounds, body, total;
    return _regeneratorRuntime().wrap(function _callee8$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            _context9.prev = 0;
            bounds = req.query.bounds;
            body = req.body;
            _context9.next = 5;
            return countTotalComponent(bounds, body);

          case 5:
            total = _context9.sent;
            res.status(200).send({
              total: total
            });
            _context9.next = 13;
            break;

          case 9:
            _context9.prev = 9;
            _context9.t0 = _context9["catch"](0);

            _logger["default"].error(_context9.t0);

            _logger["default"].error("countTotalComponent Connection error");

          case 13:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee8, null, [[0, 9]]);
  }));
  return _componentCounterRoute.apply(this, arguments);
}

function componentParamFilterRoute(_x19, _x20) {
  return _componentParamFilterRoute.apply(this, arguments);
}

function _componentParamFilterRoute() {
  _componentParamFilterRoute = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee9(req, res) {
    var bounds, body, requests, promises, _result;

    return _regeneratorRuntime().wrap(function _callee9$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            _context10.prev = 0;
            bounds = req.query.bounds;
            body = req.body;
            requests = [];
            requests.push(getCounterComponentsWithFilter(bounds, body));
            requests.push(getComponentsValuesByColumnWithFilter('status', bounds, body));
            requests.push(getCountByYearStudyWithFilter(bounds, body));
            requests.push(getComponentsValuesByColumnWithCountWithFilter('mhfdmanager', bounds, body));
            requests.push(getQuintilComponentValuesWithFilter('estimated_cost', bounds, body));
            requests.push(getComponentsValuesByColumnWithCountWithFilter('jurisdiction', bounds, body));
            requests.push(getComponentsValuesByColumnWithCountWithFilter('county', bounds, body, true));
            requests.push(getComponentsValuesByColumnWithCountWithFilter('servicearea', bounds, body, true));
            _context10.next = 14;
            return Promise.allSettled(requests);

          case 14:
            promises = _context10.sent;
            _result = {
              "component_type": promises[0].status === 'fulfilled' ? promises[0].value : null,
              "status": promises[1].status === 'fulfilled' ? promises[1].value : null,
              "yearofstudy": promises[2].status === 'fulfilled' ? promises[2].value : null,
              "watershed": promises[3].status === 'fulfilled' ? promises[3].value : null,
              "estimatedcost": promises[4].status === 'fulfilled' ? promises[4].value : null,
              "jurisdiction": promises[5].status === 'fulfilled' ? promises[5].value : null,
              "county": promises[6].status === 'fulfilled' ? promises[6].value : null,
              "servicearea": promises[7].status === 'fulfilled' ? promises[7].value : null
            };
            res.status(200).send(_result);
            _context10.next = 23;
            break;

          case 19:
            _context10.prev = 19;
            _context10.t0 = _context10["catch"](0);

            _logger["default"].error(_context10.t0);

            _logger["default"].error("getSubtotalsByComponent Connection error");

          case 23:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee9, null, [[0, 19]]);
  }));
  return _componentParamFilterRoute.apply(this, arguments);
}