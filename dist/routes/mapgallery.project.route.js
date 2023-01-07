"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.projectCounterRoute = projectCounterRoute;
exports.projectParamFilterRoute = projectParamFilterRoute;
exports.projectStatistics = void 0;

var _needle = _interopRequireDefault(require("needle"));

var _config = require("bc/config/config.js");

var _logger = _interopRequireDefault(require("bc/config/logger.js"));

var _galleryConstants = require("bc/lib/gallery.constants.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return generator._invoke = function (innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; }(innerFn, self, context), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; this._invoke = function (method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (object) { var keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var PROJECT_TABLES = [_config.MAIN_PROJECT_TABLE];
var COMPLETE_YEAR_COLUMN = 'completeyear';

var getNewFilter = function getNewFilter(filters, body) {
  if (body.status) {
    var statuses = body.status.split(',');
    var statusesIn = statuses.map(function (s) {
      return "'".concat(s, "'");
    });
    filters += " and status in (".concat(statusesIn.join(','), ")");
  }

  if (body.projecttype) {
    var projecttype = body.projecttype.split(',');
    var projecttypeIn = projecttype.map(function (s) {
      return "'".concat(s, "'");
    });
    filters += " and projecttype in (".concat(projecttypeIn.join(','), ")");
  }

  if (body.mhfddollarsallocated && body.mhfddollarsallocated.length !== 0) {
    var column = 'mhfddollarsallocated';
    var minPair = body.mhfddollarsallocated[0];
    var maxPair = body.mhfddollarsallocated[body.mhfddollarsallocated.length - 1];
    var minimumValue = minPair.split(',')[0];
    var maximumValue = maxPair.split(',')[1];
    filters += " and cast(".concat(column, " as real) between ").concat(minimumValue, " and ").concat(maximumValue);
  }

  if (body.totalcost && body.totalcost.length !== 0) {
    var _column = 'estimatedcost';
    var _minPair = body.totalcost[0];
    var _maxPair = body.totalcost[body.totalcost.length - 1];

    var _minimumValue = _minPair.split(',')[0];

    var _maximumValue = _maxPair.split(',')[1];

    filters += " and cast(".concat(_column, " as real) between ").concat(_minimumValue, " and ").concat(_maximumValue);
  }

  if (body.lgmanager) {
    filters += " and lgmanager = '".concat(body.lgmanager, "'");
  }

  if (body.streamname) {
    filters += " and streamname = '".concat(body.streamname, "'");
  }

  if (body.contractor) {
    filters += " and contractor = '".concat(body.contractor, "'");
  }

  if (body.completedyear) {
    var splitted = body.completedyear.split(',');
    var _column2 = COMPLETE_YEAR_COLUMN;
    var _minimumValue2 = splitted[0];
    var _maximumValue2 = splitted[splitted.length - 1];
    filters += "and ".concat(_column2, " between ").concat(_minimumValue2, " and ").concat(_maximumValue2);
  }

  if (body.startyear) {
    var _splitted = body.startyear.split(',');

    var _column3 = 'startyear';
    var _minimumValue3 = _splitted[0];
    var _maximumValue3 = _splitted[_splitted.length - 1];
    filters += "and ".concat(_column3, " between ").concat(_minimumValue3, " and ").concat(_maximumValue3);
  }

  if (body.consultant) {
    filters += " and consultant = '".concat(body.consultant, "'");
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
      return "'".concat(s.trim(), "'");
    });
    filters += " and county in (".concat(countiesIn.join(','), ")");
  }

  if (body.servicearea) {
    var serviceareas = body.servicearea.split(',');
    var serviceareasIn = serviceareas.map(function (s) {
      return "'".concat(s.trim(), "'");
    });
    filters += " and servicearea in (".concat(serviceareasIn.join(','), ")");
  }

  return filters;
};

function getValuesByColumnWithOutCountProject(_x, _x2, _x3, _x4) {
  return _getValuesByColumnWithOutCountProject.apply(this, arguments);
}

function _getValuesByColumnWithOutCountProject() {
  _getValuesByColumnWithOutCountProject = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(column, bounds, body, needCount) {
    var result, answer, coords, filters, _iterator, _step, _table, _query, _data, _iterator2, _step2, table1, query, data, _iterator3, _step3, _loop;

    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            result = [];
            _context2.prev = 1;
            answer = [];
            coords = bounds.split(',');
            filters = "(ST_Contains(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), the_geom) or ");
            filters += "ST_Intersects(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), the_geom))");
            filters = getNewFilter(filters, body);
            _iterator = _createForOfIteratorHelper(PROJECT_TABLES);
            _context2.prev = 8;

            _iterator.s();

          case 10:
            if ((_step = _iterator.n()).done) {
              _context2.next = 19;
              break;
            }

            _table = _step.value;
            _query = {
              q: "select ".concat(needCount ? 'count(*) as counter, ' : '', " ").concat(column, " as value from ").concat(_table, " where ").concat(filters, " group by ").concat(column, " order by ").concat(column, " ")
            };
            _context2.next = 15;
            return (0, _needle["default"])('post', _config.CARTO_URL, _query, {
              json: true
            });

          case 15:
            _data = _context2.sent;

            if (_data.statusCode === 200) {
              answer = answer.concat(_data.body.rows);
            } else {
              console.log('data.statusCode', _data.statusCode, column, _data.body);
              console.log('query.q', _query.q);
            }

          case 17:
            _context2.next = 10;
            break;

          case 19:
            _context2.next = 24;
            break;

          case 21:
            _context2.prev = 21;
            _context2.t0 = _context2["catch"](8);

            _iterator.e(_context2.t0);

          case 24:
            _context2.prev = 24;

            _iterator.f();

            return _context2.finish(24);

          case 27:
            if (!(column === 'startyear' || column === COMPLETE_YEAR_COLUMN)) {
              _context2.next = 48;
              break;
            }

            _iterator2 = _createForOfIteratorHelper(PROJECT_TABLES);
            _context2.prev = 29;

            _iterator2.s();

          case 31:
            if ((_step2 = _iterator2.n()).done) {
              _context2.next = 40;
              break;
            }

            table1 = _step2.value;
            query = {
              q: "select DISTINCT(".concat(column, ") as value from ").concat(table1, " order by ").concat(column, " ")
            };
            _context2.next = 36;
            return (0, _needle["default"])('post', _config.CARTO_URL, query, {
              json: true
            });

          case 36:
            data = _context2.sent;

            if (data.statusCode === 200) {
              answer = answer.concat(data.body.rows.map(function (r) {
                return {
                  value: r.value,
                  counter: 0
                };
              }));
              answer = answer.filter(function (r) {
                return r.value >= 2000;
              });
              answer.sort(function (a, b) {
                return a.value - b.value;
              });

              while (answer[answer.length - 1].value < 2030) {
                answer.push({
                  value: answer[answer.length - 1].value + 1,
                  count: 0
                });
              }
            }

          case 38:
            _context2.next = 31;
            break;

          case 40:
            _context2.next = 45;
            break;

          case 42:
            _context2.prev = 42;
            _context2.t1 = _context2["catch"](29);

            _iterator2.e(_context2.t1);

          case 45:
            _context2.prev = 45;

            _iterator2.f();

            return _context2.finish(45);

          case 48:
            _iterator3 = _createForOfIteratorHelper(answer);

            try {
              _loop = function _loop() {
                var row = _step3.value;

                if (row.value) {
                  var search = result.filter(function (item) {
                    return item.value === row.value;
                  });
                  var counter = 0;

                  if (search.length === 0) {
                    counter = answer.filter(function (item) {
                      return item.value === row.value;
                    }).map(function (item) {
                      return item.counter;
                    }).reduce(function (prev, next) {
                      return prev + next;
                    }, 0);
                    result.push({
                      value: row.value,
                      counter: counter
                    });
                  }
                }
              };

              for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
                _loop();
              }
            } catch (err) {
              _iterator3.e(err);
            } finally {
              _iterator3.f();
            }

            if (!column.includes('year')) {
              result = result.sort(function (a, b) {
                return a > b ? 1 : -1;
              });
            }

            _context2.next = 57;
            break;

          case 53:
            _context2.prev = 53;
            _context2.t2 = _context2["catch"](1);

            _logger["default"].error(_context2.t2);

            _logger["default"].error("Get Value by Column, Column: ".concat(column, " Connection error"));

          case 57:
            return _context2.abrupt("return", result);

          case 58:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[1, 53], [8, 21, 24, 27], [29, 42, 45, 48]]);
  }));
  return _getValuesByColumnWithOutCountProject.apply(this, arguments);
}

function getCountByArrayColumnsProject(_x5, _x6, _x7, _x8, _x9) {
  return _getCountByArrayColumnsProject.apply(this, arguments);
}

function _getCountByArrayColumnsProject() {
  _getCountByArrayColumnsProject = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(column, columns, bounds, body, needsCount) {
    var result, coords, filters, _iterator4, _step4, value, _answer, counter, _iterator5, _step5, table1, query, data, _iterator6, _step6, _loop2;

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
            _iterator4 = _createForOfIteratorHelper(columns);
            _context3.prev = 7;

            _iterator4.s();

          case 9:
            if ((_step4 = _iterator4.n()).done) {
              _context3.next = 38;
              break;
            }

            value = _step4.value;
            _answer = [];
            counter = 0;
            _iterator5 = _createForOfIteratorHelper(PROJECT_TABLES);
            _context3.prev = 14;

            _iterator5.s();

          case 16:
            if ((_step5 = _iterator5.n()).done) {
              _context3.next = 25;
              break;
            }

            table1 = _step5.value;
            query = {
              q: "select ".concat(needsCount ? 'count(*) as count, ' : '', " ").concat(column, " as column from ").concat(table1, " \n       where ").concat(column, "='").concat(value, "' and ").concat(filters, " group by ").concat(column, " order by ").concat(column, " ")
            };
            _context3.next = 21;
            return (0, _needle["default"])('post', _config.CARTO_URL, query, {
              json: true
            });

          case 21:
            data = _context3.sent;

            if (data.statusCode === 200) {
              if (data.body.rows.length > 0) {
                _answer = _answer.concat(data.body.rows);
              }
            } else {
              console.log('data.statusCode', data.statusCode, column, data.body);
              console.log('query.q', query.q);
            }

          case 23:
            _context3.next = 16;
            break;

          case 25:
            _context3.next = 30;
            break;

          case 27:
            _context3.prev = 27;
            _context3.t0 = _context3["catch"](14);

            _iterator5.e(_context3.t0);

          case 30:
            _context3.prev = 30;

            _iterator5.f();

            return _context3.finish(30);

          case 33:
            _iterator6 = _createForOfIteratorHelper(_answer);

            try {
              _loop2 = function _loop2() {
                var row = _step6.value;
                var search = result.filter(function (item) {
                  return item.value === row.column;
                });

                if (search.length === 0) {
                  counter = _answer.filter(function (item) {
                    return item.column === row.column;
                  }).map(function (item) {
                    return item.count;
                  }).reduce(function (prev, next) {
                    return prev + next;
                  });
                }
              };

              for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
                _loop2();
              }
            } catch (err) {
              _iterator6.e(err);
            } finally {
              _iterator6.f();
            }

            result.push({
              value: value,
              counter: counter
            });

          case 36:
            _context3.next = 9;
            break;

          case 38:
            _context3.next = 43;
            break;

          case 40:
            _context3.prev = 40;
            _context3.t1 = _context3["catch"](7);

            _iterator4.e(_context3.t1);

          case 43:
            _context3.prev = 43;

            _iterator4.f();

            return _context3.finish(43);

          case 46:
            _context3.next = 52;
            break;

          case 48:
            _context3.prev = 48;
            _context3.t2 = _context3["catch"](1);

            _logger["default"].error(_context3.t2);

            _logger["default"].error("getCountByArrayColumnsProject Column: ".concat(column, " Connection error"));

          case 52:
            return _context3.abrupt("return", result);

          case 53:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[1, 48], [7, 40, 43, 46], [14, 27, 30, 33]]);
  }));
  return _getCountByArrayColumnsProject.apply(this, arguments);
}

function getValuesByRangeProject(_x10, _x11, _x12) {
  return _getValuesByRangeProject.apply(this, arguments);
}

function _getValuesByRangeProject() {
  _getValuesByRangeProject = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(column, bounds, body) {
    var result, coords, filters, newProm1;
    return _regeneratorRuntime().wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            result = [];
            _context5.prev = 1;
            coords = bounds.split(',');
            filters = "(ST_Contains(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), the_geom) or ");
            filters += "ST_Intersects(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), the_geom))");
            filters = getNewFilter(filters, body);
            newProm1 = new Promise( /*#__PURE__*/function () {
              var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(resolve, reject) {
                var minRange, maxRange, intervalWidth, lenRange, result2, epsilon, i, isLast, values;
                return _regeneratorRuntime().wrap(function _callee4$(_context4) {
                  while (1) {
                    switch (_context4.prev = _context4.next) {
                      case 0:
                        minRange = 0;
                        maxRange = 60000000;
                        intervalWidth = 1000000;
                        lenRange = maxRange / intervalWidth + 1;
                        result2 = [];
                        epsilon = 0.001;

                        for (i = 0; i < lenRange; i++) {
                          isLast = i === lenRange - 1;
                          values = {
                            min: minRange + i * intervalWidth,
                            max: minRange + (i + 1) * intervalWidth - (isLast ? 0 : epsilon)
                          };
                          result2.push({
                            min: values.min,
                            max: values.max,
                            last: isLast
                          });
                        }

                        resolve(result2);

                      case 8:
                      case "end":
                        return _context4.stop();
                    }
                  }
                }, _callee4);
              }));

              return function (_x26, _x27) {
                return _ref2.apply(this, arguments);
              };
            }());
            _context5.next = 9;
            return newProm1;

          case 9:
            result = _context5.sent;
            _context5.next = 16;
            break;

          case 12:
            _context5.prev = 12;
            _context5.t0 = _context5["catch"](1);

            _logger["default"].error(_context5.t0);

            _logger["default"].error("Range By Value, Column ".concat(column, " Connection error"));

          case 16:
            return _context5.abrupt("return", result);

          case 17:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, null, [[1, 12]]);
  }));
  return _getValuesByRangeProject.apply(this, arguments);
}

function getCountWorkYearProject(_x13, _x14, _x15) {
  return _getCountWorkYearProject.apply(this, arguments);
}

function _getCountWorkYearProject() {
  _getCountWorkYearProject = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6(data, bounds, body) {
    var result, coords, filters, _iterator7, _step7, value, _counter, _iterator8, _step8, table, query, d;

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
            _iterator7 = _createForOfIteratorHelper(data);
            _context6.prev = 7;

            _iterator7.s();

          case 9:
            if ((_step7 = _iterator7.n()).done) {
              _context6.next = 36;
              break;
            }

            value = _step7.value;
            _counter = 0;

            if (!(!body.workplanyear || value.year == "".concat(body.workplanyear))) {
              _context6.next = 33;
              break;
            }

            _iterator8 = _createForOfIteratorHelper(PROJECT_TABLES);
            _context6.prev = 14;

            _iterator8.s();

          case 16:
            if ((_step8 = _iterator8.n()).done) {
              _context6.next = 25;
              break;
            }

            table = _step8.value;
            query = {
              q: "select count(*) as count from ".concat(table, " where ").concat(filters, " and ").concat(value.column, " > 0 ")
            };
            _context6.next = 21;
            return (0, _needle["default"])('post', _config.CARTO_URL, query, {
              json: true
            });

          case 21:
            d = _context6.sent;

            if (d.statusCode === 200) {
              if (d.body.rows.length > 0) {
                _counter += d.body.rows[0].count;
              }
            } else {
              _logger["default"].error('getCountWorkYearProject');

              _logger["default"].error(query.statusCode);

              _logger["default"].error(table);

              _logger["default"].error(value.column);

              _logger["default"].error(data.body);

              _logger["default"].error('query.q');

              _logger["default"].error(query.q);
            }

          case 23:
            _context6.next = 16;
            break;

          case 25:
            _context6.next = 30;
            break;

          case 27:
            _context6.prev = 27;
            _context6.t0 = _context6["catch"](14);

            _iterator8.e(_context6.t0);

          case 30:
            _context6.prev = 30;

            _iterator8.f();

            return _context6.finish(30);

          case 33:
            result.push({
              value: value.year,
              counter: _counter
            });

          case 34:
            _context6.next = 9;
            break;

          case 36:
            _context6.next = 41;
            break;

          case 38:
            _context6.prev = 38;
            _context6.t1 = _context6["catch"](7);

            _iterator7.e(_context6.t1);

          case 41:
            _context6.prev = 41;

            _iterator7.f();

            return _context6.finish(41);

          case 44:
            _context6.next = 50;
            break;

          case 46:
            _context6.prev = 46;
            _context6.t2 = _context6["catch"](1);

            _logger["default"].error("get count", _context6.t2);

            _logger["default"].error("getCountWorkYearProject Connection error");

          case 50:
            return _context6.abrupt("return", result);

          case 51:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, null, [[1, 46], [7, 38, 41, 44], [14, 27, 30, 33]]);
  }));
  return _getCountWorkYearProject.apply(this, arguments);
}

function createQueryByProblemType(problemType, project) {
  var VALUES_COMPONENTS = ['grade_control_structure', 'pipe_appurtenances', 'special_item_point', 'special_item_linear', 'special_item_area', 'channel_improvements_linear', 'channel_improvements_area', 'removal_line', 'removal_area', 'storm_drain', 'detention_facilities', 'maintenance_trails', 'land_acquisition', 'landscaping_area'];
  var operator = '';
  var query = '';

  for (var _i = 0, _VALUES_COMPONENTS = VALUES_COMPONENTS; _i < _VALUES_COMPONENTS.length; _i++) {
    var component = _VALUES_COMPONENTS[_i];
    query += operator + " select projectid from ".concat(component, ", ").concat(_config.PROBLEM_TABLE, " where projectid = ").concat(project, ".projectid \n   and ").concat(component, ".problemid = ").concat(_config.PROBLEM_TABLE, ".problemid and problemtype='").concat(problemType, "' ");
    operator = ' union ';
  }

  query = " projectid in (".concat(query, ")");
  return query;
}

function getProjectByProblemTypeProject(_x16, _x17) {
  return _getProjectByProblemTypeProject.apply(this, arguments);
}

function _getProjectByProblemTypeProject() {
  _getProjectByProblemTypeProject = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7(bounds, body) {
    var result, coords, filters, problemTypes, _i2, _problemTypes, type, _counter2, _iterator9, _step9, table, newfilter, query, data;

    return _regeneratorRuntime().wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            result = [];
            _context7.prev = 1;
            coords = bounds.split(',');
            filters = "(ST_Contains(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), the_geom) or ");
            filters += "ST_Intersects(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), the_geom))");
            filters = getNewFilter(filters, body);
            problemTypes = ['Human Connection', 'Geomorphology', 'Vegetation', 'Hydrology', 'Hydraulics'];
            _i2 = 0, _problemTypes = problemTypes;

          case 8:
            if (!(_i2 < _problemTypes.length)) {
              _context7.next = 36;
              break;
            }

            type = _problemTypes[_i2];
            _counter2 = 0;
            _iterator9 = _createForOfIteratorHelper(PROJECT_TABLES);
            _context7.prev = 12;

            _iterator9.s();

          case 14:
            if ((_step9 = _iterator9.n()).done) {
              _context7.next = 24;
              break;
            }

            table = _step9.value;
            newfilter = createQueryByProblemType(type, table);
            query = {
              q: "select count(*) as count from ".concat(table, " where ").concat(filters, " and ").concat(newfilter, " ")
            };
            _context7.next = 20;
            return (0, _needle["default"])('post', _config.CARTO_URL, query, {
              json: true
            });

          case 20:
            data = _context7.sent;

            if (data.statusCode === 200) {
              _counter2 += data.body.rows[0].count;
            } else {
              _logger["default"].error('Error on getProjectByProblemTypeProject');

              _logger["default"].error(data.statusCode);

              _logger["default"].error(table);

              if (data.body.error && data.body.hint) {
                _logger["default"].error(data.body.error);

                _logger["default"].error(data.body.hint);
              } else {
                _logger["default"].error(JSON.stringify(data.body));
              }

              _logger["default"].error('query.q', query.q);
            }

          case 22:
            _context7.next = 14;
            break;

          case 24:
            _context7.next = 29;
            break;

          case 26:
            _context7.prev = 26;
            _context7.t0 = _context7["catch"](12);

            _iterator9.e(_context7.t0);

          case 29:
            _context7.prev = 29;

            _iterator9.f();

            return _context7.finish(29);

          case 32:
            result.push({
              value: type,
              counter: _counter2
            });

          case 33:
            _i2++;
            _context7.next = 8;
            break;

          case 36:
            _context7.next = 42;
            break;

          case 38:
            _context7.prev = 38;
            _context7.t1 = _context7["catch"](1);

            _logger["default"].error(_context7.t1);

            _logger["default"].error("Error in Project by Problem Type Connection error");

          case 42:
            return _context7.abrupt("return", result);

          case 43:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7, null, [[1, 38], [12, 26, 29, 32]]);
  }));
  return _getProjectByProblemTypeProject.apply(this, arguments);
}

function countTotalProjects(_x18, _x19) {
  return _countTotalProjects.apply(this, arguments);
}

function _countTotalProjects() {
  _countTotalProjects = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee8(bounds, body) {
    var coords, filters, COUNTSQL, query, lineData, total;
    return _regeneratorRuntime().wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            coords = bounds.split(',');
            filters = "(ST_Contains(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), the_geom) or ");
            filters += "ST_Intersects(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), the_geom))");
            filters = getNewFilter(filters, body);
            COUNTSQL = PROJECT_TABLES.map(function (t) {
              return "SELECT count(*) FROM ".concat(t, " where ").concat(filters);
            }).join(' union ');
            query = {
              q: " ".concat(COUNTSQL, " ")
            };
            _context8.prev = 6;
            _context8.next = 9;
            return (0, _needle["default"])('post', _config.CARTO_URL, query, {
              json: true
            });

          case 9:
            lineData = _context8.sent;
            total = lineData.body.rows.reduce(function (p, c) {
              return p + c.count;
            }, 0);
            return _context8.abrupt("return", total);

          case 14:
            _context8.prev = 14;
            _context8.t0 = _context8["catch"](6);

            _logger["default"].error("Count total projects error ->", _context8.t0);

          case 17:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8, null, [[6, 14]]);
  }));
  return _countTotalProjects.apply(this, arguments);
}

function projectCounterRoute(_x20, _x21) {
  return _projectCounterRoute.apply(this, arguments);
}

function _projectCounterRoute() {
  _projectCounterRoute = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee9(req, res) {
    var bounds, body, total;
    return _regeneratorRuntime().wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            _context9.prev = 0;
            bounds = req.query.bounds;
            body = req.body;
            _context9.next = 5;
            return countTotalProjects(bounds, body);

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

            _logger["default"].error("countTotalProjects Connection error");

          case 13:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9, null, [[0, 9]]);
  }));
  return _projectCounterRoute.apply(this, arguments);
}

function projectParamFilterRoute(_x22, _x23) {
  return _projectParamFilterRoute.apply(this, arguments);
}

function _projectParamFilterRoute() {
  _projectParamFilterRoute = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee10(req, res) {
    var bounds, body, requests, promises, _result;

    return _regeneratorRuntime().wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            _context10.prev = 0;
            bounds = req.query.bounds;
            body = req.body;
            requests = [];
            requests.push(getValuesByColumnWithOutCountProject('creator', bounds, body));
            requests.push(getValuesByColumnWithOutCountProject('mhfdmanager', bounds, body));
            requests.push(getCountByArrayColumnsProject('projecttype', ['Maintenance', 'Study', 'Capital'], bounds, body, true));
            requests.push(getCountByArrayColumnsProject('status', _galleryConstants.statusList, bounds, body));
            requests.push(getValuesByColumnWithOutCountProject('startyear', bounds, body));
            requests.push(getValuesByColumnWithOutCountProject(COMPLETE_YEAR_COLUMN, bounds, body));
            requests.push(getValuesByRangeProject('mhfddollarsallocated', bounds, body));
            requests.push(getCountWorkYearProject([{
              year: 2019,
              column: 'workplanyr1'
            }, {
              year: 2020,
              column: 'workplanyr2'
            }, {
              year: 2021,
              column: 'workplanyr3'
            }, {
              year: 2022,
              column: 'workplanyr4'
            }, {
              year: 2023,
              column: 'workplanyr5'
            }], bounds, body));
            requests.push(getProjectByProblemTypeProject(bounds, body));
            requests.push(getValuesByColumnWithOutCountProject('lgmanager', bounds, body));
            requests.push(getValuesByColumnWithOutCountProject('streamname', bounds, body));
            requests.push(getValuesByRangeProject('estimatedcost', bounds, body));
            requests.push(getValuesByColumnWithOutCountProject('consultant', bounds, body));
            requests.push(getValuesByColumnWithOutCountProject('contractor', bounds, body));
            requests.push(getValuesByColumnWithOutCountProject('jurisdiction', bounds, body));
            requests.push(getValuesByColumnWithOutCountProject('county', bounds, body, true));
            requests.push(getValuesByColumnWithOutCountProject('servicearea', bounds, body, true));
            _context10.next = 23;
            return Promise.all(requests);

          case 23:
            promises = _context10.sent;
            _result = {
              "creator": promises[0],
              "mhfdmanager": promises[1],
              "projecttype": promises[2],
              "status": promises[3],
              "startyear": promises[4],
              "completedyear": promises[5],
              "mhfddollarsallocated": promises[6],
              "workplanyear": promises[7],
              "problemtype": promises[8],
              "jurisdiction": promises[14],
              "county": promises[15],
              "lgmanager": promises[9],
              "streamname": promises[10],
              "estimatedCost": promises[11],
              "consultant": promises[12],
              "contractor": promises[13],
              "servicearea": promises[16]
            };
            res.status(200).send(_result);
            _context10.next = 32;
            break;

          case 28:
            _context10.prev = 28;
            _context10.t0 = _context10["catch"](0);

            _logger["default"].error(_context10.t0);

            _logger["default"].error("getSubtotalsByComponent Connection error");

          case 32:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10, null, [[0, 28]]);
  }));
  return _projectParamFilterRoute.apply(this, arguments);
}

var projectStatistics = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(request, response) {
    var column, bounds, body, columnsWithoutCount, columnsWithCount, columnsWithRanges, mapColumnsWithCount, yearArray;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            column = request.query.column;
            bounds = request.query.bounds;
            body = request.body;

            if (column) {
              _context.next = 5;
              break;
            }

            return _context.abrupt("return", response.status(404).send({
              error: 'Query param "column" is required'
            }));

          case 5:
            columnsWithoutCount = ['creator', 'mhfdmanager', 'startyear', COMPLETE_YEAR_COLUMN, 'lgmanager', 'streamname', 'consultant', 'contractor', 'jurisdiction', 'county', 'servicearea'];
            columnsWithCount = ['projecttype', 'status'];
            columnsWithRanges = ['mhfddollarsallocated', 'estimatedcost'];

            if (!columnsWithoutCount.includes(column)) {
              _context.next = 16;
              break;
            }

            _context.t0 = response.status(200);
            _context.next = 12;
            return getValuesByColumnWithOutCountProject(column, bounds, body);

          case 12:
            _context.t1 = _context.sent;
            return _context.abrupt("return", _context.t0.send.call(_context.t0, _context.t1));

          case 16:
            if (!columnsWithCount.includes(column)) {
              _context.next = 25;
              break;
            }

            mapColumnsWithCount = {
              'projecttype': ['Maintenance', 'Study', 'Capital'],
              'status': _galleryConstants.statusList
            };
            _context.t2 = response.status(200);
            _context.next = 21;
            return getCountByArrayColumnsProject(column, mapColumnsWithCount[column], bounds, body);

          case 21:
            _context.t3 = _context.sent;
            return _context.abrupt("return", _context.t2.send.call(_context.t2, _context.t3));

          case 25:
            if (!columnsWithRanges.includes(column)) {
              _context.next = 33;
              break;
            }

            _context.t4 = response.status(200);
            _context.next = 29;
            return getValuesByRangeProject(column, bounds, body);

          case 29:
            _context.t5 = _context.sent;
            return _context.abrupt("return", _context.t4.send.call(_context.t4, _context.t5));

          case 33:
            if (!(column === 'workplanyr')) {
              _context.next = 42;
              break;
            }

            yearArray = [{
              year: 2019,
              column: 'workplanyr1'
            }, {
              year: 2020,
              column: 'workplanyr2'
            }, {
              year: 2021,
              column: 'workplanyr3'
            }, {
              year: 2022,
              column: 'workplanyr4'
            }, {
              year: 2023,
              column: 'workplanyr5'
            }];
            _context.t6 = response.status(200);
            _context.next = 38;
            return getCountWorkYearProject(yearArray, bounds, body);

          case 38:
            _context.t7 = _context.sent;
            return _context.abrupt("return", _context.t6.send.call(_context.t6, _context.t7));

          case 42:
            if (!(column === 'problemtype')) {
              _context.next = 48;
              break;
            }

            _context.t8 = response.status(200);
            _context.next = 46;
            return getProjectByProblemTypeProject(bounds, body);

          case 46:
            _context.t9 = _context.sent;
            return _context.abrupt("return", _context.t8.send.call(_context.t8, _context.t9));

          case 48:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function projectStatistics(_x24, _x25) {
    return _ref.apply(this, arguments);
  };
}();

exports.projectStatistics = projectStatistics;