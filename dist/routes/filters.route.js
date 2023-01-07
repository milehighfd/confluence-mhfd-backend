"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _https = _interopRequireDefault(require("https"));

var _needle = _interopRequireDefault(require("needle"));

var _config = require("bc/config/config.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return generator._invoke = function (innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; }(innerFn, self, context), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; this._invoke = function (method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (object) { var keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var router = _express["default"].Router();

var components = [{
  key: 'grade_control_structure',
  value: 'Grade Control Structure'
}, {
  key: 'pipe_appurtenances',
  value: 'Pipe Appurtenances'
}, {
  key: 'special_item_point',
  value: 'Special Item Point'
}, {
  key: 'special_item_linear',
  value: 'Special Item Linear'
}, {
  key: 'special_item_area',
  value: 'Special Item Area'
}, {
  key: 'channel_improvements_linear',
  value: 'Channel Improvements Linear'
}, {
  key: 'channel_improvements_area',
  value: 'Channel Improvements Area'
}, {
  key: 'removal_line',
  value: 'Removal Line'
}, {
  key: 'removal_area',
  value: 'Removal Area'
}, {
  key: 'storm_drain',
  value: 'Storm Drain'
}, {
  key: 'detention_facilities',
  value: 'Detention Facilities'
}, {
  key: 'maintenance_trails',
  value: 'Maintenance Trails'
}, {
  key: 'land_acquisition',
  value: 'Land Acquisition'
}, {
  key: 'landscaping_area',
  value: 'Landscaping Area'
}];
var PROJECT_TABLES = [_config.MAIN_PROJECT_TABLE];
router.get('/', /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(req, res) {
    var tables, send, _iterator, _step, table, query, answer, data;

    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            tables = req.query.tables ? req.query.tables.split(',') : [];
            send = [];
            _iterator = _createForOfIteratorHelper(tables);
            _context.prev = 3;

            _iterator.s();

          case 5:
            if ((_step = _iterator.n()).done) {
              _context.next = 23;
              break;
            }

            table = _step.value;
            query = {
              q: "SELECT DISTINCT problemid FROM ".concat(table, "  WHERE problemid is not null")
            };
            answer = [];
            _context.prev = 9;
            _context.next = 12;
            return (0, _needle["default"])('post', _config.CARTO_URL, query, {
              json: true
            });

          case 12:
            data = _context.sent;

            if (data.statusCode === 200) {
              answer = data.body.rows.map(function (element) {
                return element.problemid;
              });
            } else {
              console.log('bad status ', data.statusCode, data.body);
            }

            _context.next = 19;
            break;

          case 16:
            _context.prev = 16;
            _context.t0 = _context["catch"](9);
            console.log(_context.t0);

          case 19:
            ;
            send = send.concat(answer);

          case 21:
            _context.next = 5;
            break;

          case 23:
            _context.next = 28;
            break;

          case 25:
            _context.prev = 25;
            _context.t1 = _context["catch"](3);

            _iterator.e(_context.t1);

          case 28:
            _context.prev = 28;

            _iterator.f();

            return _context.finish(28);

          case 31:
            res.send(_toConsumableArray(new Set(send)));

          case 32:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[3, 25, 28, 31], [9, 16]]);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}());
router.get('/project-filter', /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(req, res) {
    var problemtype, problemtypeFilter, send, _iterator2, _step2, element, component, _iterator4, _step4, _loop, promises, answer, _iterator3, _step3, _element;

    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            problemtype = req.query.problemtype ? req.query.problemtype : '';
            problemtypeFilter = problemtype.length ? "AND ".concat(_config.PROBLEM_TABLE, ".problemtype IN(") + problemtype.split(',').map(function (element) {
              return "'".concat(element, "'");
            }).join(',') + ')' : '';

            if (problemtype.length) {
              _context2.next = 4;
              break;
            }

            return _context2.abrupt("return", res.send(null));

          case 4:
            send = [];
            _iterator2 = _createForOfIteratorHelper(components);

            try {
              for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                element = _step2.value;
                component = element.key;
                _iterator4 = _createForOfIteratorHelper(PROJECT_TABLES);

                try {
                  _loop = function _loop() {
                    var table = _step4.value;
                    var query = {
                      q: "SELECT DISTINCT ".concat(table, ".projectid FROM ").concat(table, ", ").concat(_config.PROBLEM_TABLE, ", ").concat(component, "   WHERE ").concat(table, ".projectid = ").concat(component, ".projectid and ").concat(_config.PROBLEM_TABLE, ".problemid = ").concat(component, ".problemid ").concat(problemtypeFilter)
                    };
                    console.log(query.q);

                    try {
                      send.push(new Promise(function (resolve) {
                        (0, _needle["default"])('post', _config.CARTO_URL, query, {
                          json: true
                        }).then(function (response) {
                          if (response.statusCode === 200) {
                            resolve(response.body.rows.map(function (element) {
                              return element.projectid;
                            }));
                          } else {
                            console.log('bad status ', response.statusCode, response.body);
                            resolve([]);
                          }
                        })["catch"](function (error) {
                          console.log('some error ', error);
                          resolve([]);
                        });
                      }));
                    } catch (error) {
                      console.log(error);
                    }

                    ;
                  };

                  for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
                    _loop();
                  }
                } catch (err) {
                  _iterator4.e(err);
                } finally {
                  _iterator4.f();
                }
              }
            } catch (err) {
              _iterator2.e(err);
            } finally {
              _iterator2.f();
            }

            _context2.next = 9;
            return Promise.all(send);

          case 9:
            promises = _context2.sent;
            answer = [];
            _iterator3 = _createForOfIteratorHelper(promises);

            try {
              for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
                _element = _step3.value;
                answer.push.apply(answer, _toConsumableArray(_element));
              }
            } catch (err) {
              _iterator3.e(err);
            } finally {
              _iterator3.f();
            }

            if (!answer.length) {
              answer.push(-1);
            }

            res.send(_toConsumableArray(new Set(answer)));

          case 15:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}());
router.get('/search/:type', /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(req, res) {
    var type, field, data, query, answer, _data, _iterator5, _step5, project, _query, _answer, _data2;

    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            type = req.params.type;
            field = req.query.field ? req.query.field : '';
            data = {};

            if (!(type === 'problems')) {
              _context3.next = 20;
              break;
            }

            query = {
              q: "SELECT cartodb_id FROM ".concat(_config.PROBLEM_TABLE, " WHERE ").concat(_config.PROPSPROBLEMTABLES.problem_boundary[6], " ILIKE '%").concat(field, "%' OR ").concat(_config.PROPSPROBLEMTABLES.problem_boundary[5], "::text ilike '%").concat(field, "%'")
            };
            answer = [];
            _context3.prev = 6;
            _context3.next = 9;
            return (0, _needle["default"])('post', _config.CARTO_URL, query, {
              json: true
            });

          case 9:
            _data = _context3.sent;

            if (_data.statusCode === 200) {
              answer = _data.body.rows.map(function (element) {
                return element.cartodb_id;
              });
            } else {
              console.log('bad status ', _data.statusCode, _data.body);
            }

            _context3.next = 16;
            break;

          case 13:
            _context3.prev = 13;
            _context3.t0 = _context3["catch"](6);
            console.log(_context3.t0);

          case 16:
            ;
            data['problems'] = answer;
            _context3.next = 50;
            break;

          case 20:
            _iterator5 = _createForOfIteratorHelper(PROJECT_TABLES);
            _context3.prev = 21;

            _iterator5.s();

          case 23:
            if ((_step5 = _iterator5.n()).done) {
              _context3.next = 42;
              break;
            }

            project = _step5.value;
            _query = {
              q: "SELECT cartodb_id FROM ".concat(project, " WHERE projectname ILIKE '%").concat(field, "%' OR onbaseid::text ilike '%").concat(field, "%'")
            };
            _answer = [];
            _context3.prev = 27;
            _context3.next = 30;
            return (0, _needle["default"])('post', _config.CARTO_URL, _query, {
              json: true
            });

          case 30:
            _data2 = _context3.sent;

            if (_data2.statusCode === 200) {
              _answer = _data2.body.rows.map(function (element) {
                return element.cartodb_id;
              });
            } else {
              console.log('bad status ', _data2.statusCode, _data2.body);
            }

            _context3.next = 37;
            break;

          case 34:
            _context3.prev = 34;
            _context3.t1 = _context3["catch"](27);
            console.log(_context3.t1);

          case 37:
            ;
            console.log(project);
            data[project] = _answer;

          case 40:
            _context3.next = 23;
            break;

          case 42:
            _context3.next = 47;
            break;

          case 44:
            _context3.prev = 44;
            _context3.t2 = _context3["catch"](21);

            _iterator5.e(_context3.t2);

          case 47:
            _context3.prev = 47;

            _iterator5.f();

            return _context3.finish(47);

          case 50:
            return _context3.abrupt("return", res.send(data));

          case 51:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[6, 13], [21, 44, 47, 50], [27, 34]]);
  }));

  return function (_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}());

var addCondition = function addCondition(conditions, newCondition, connector) {
  if (conditions) {
    if (newCondition) {
      return conditions + ' ' + connector + ' ' + newCondition;
    }

    return conditions;
  }

  return newCondition;
};

router.post('/by-components', /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(req, res) {
    var body, componentArray, response, tables, _loop2, _i, _arr;

    return _regeneratorRuntime().wrap(function _callee4$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            body = req.body;
            componentArray = [];
            response = {};
            tables = '';

            if (body.component_type) {
              tables = body.component_type;
              componentArray = tables.split(',');
            }

            _loop2 = /*#__PURE__*/_regeneratorRuntime().mark(function _loop2() {
              var type, conditions, _iterator6, _step6, _component, statusConditions, _iterator8, _step8, status, condition, yearConditions, _iterator9, _step9, year, _condition, estimated_costConditions, _iterator10, _step10, costRange, _costRange$split, _costRange$split2, lower, upper, _condition2, jurisdictionCondition, countyCondition, mhfdmanagerCondition, extraConditions, _iterator7, _step7, _component2, _condition3, _condition4, query, URL, answer;

              return _regeneratorRuntime().wrap(function _loop2$(_context4) {
                while (1) {
                  switch (_context4.prev = _context4.next) {
                    case 0:
                      type = _arr[_i];
                      console.log('my body is b', body);
                      conditions = '';
                      _iterator6 = _createForOfIteratorHelper(componentArray);

                      try {
                        for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
                          _component = _step6.value;
                          console.log('my components ', _component);

                          if (body.status) {
                            statusConditions = '';
                            _iterator8 = _createForOfIteratorHelper(body.status.split(','));

                            try {
                              for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
                                status = _step8.value;
                                condition = "".concat(_component, ".status='").concat(status, "'");
                                statusConditions = addCondition(statusConditions, condition, 'OR');
                              }
                            } catch (err) {
                              _iterator8.e(err);
                            } finally {
                              _iterator8.f();
                            }

                            conditions = addCondition(conditions, '(' + statusConditions + ')', 'AND');
                          }

                          if (body.year_of_study) {
                            yearConditions = '';
                            _iterator9 = _createForOfIteratorHelper(body.year_of_study.split(','));

                            try {
                              for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) {
                                year = _step9.value;
                                _condition = "".concat(_component, ".year_of_study>=").concat(year, " AND ").concat(_component, ".year_of_study<=").concat(+year + 9);
                                yearConditions = addCondition(yearConditions, _condition, 'OR');
                              }
                            } catch (err) {
                              _iterator9.e(err);
                            } finally {
                              _iterator9.f();
                            }

                            conditions = addCondition(conditions, '(' + yearConditions + ')', 'AND');
                          }

                          if (body.estimated_cost) {
                            estimated_costConditions = '';
                            _iterator10 = _createForOfIteratorHelper(body.estimated_cost);

                            try {
                              for (_iterator10.s(); !(_step10 = _iterator10.n()).done;) {
                                costRange = _step10.value;
                                _costRange$split = costRange.split(','), _costRange$split2 = _slicedToArray(_costRange$split, 2), lower = _costRange$split2[0], upper = _costRange$split2[1];
                                _condition2 = "".concat(_component, ".estimated_cost>=").concat(+lower, " AND ").concat(_component, ".estimated_cost<=").concat(+upper);
                                estimated_costConditions = addCondition(estimated_costConditions, _condition2, 'OR');
                              }
                            } catch (err) {
                              _iterator10.e(err);
                            } finally {
                              _iterator10.f();
                            }

                            conditions = addCondition(conditions, '(' + estimated_costConditions + ')', 'AND');
                          }

                          if (body.jurisdiction) {
                            jurisdictionCondition = "".concat(_component, ".jurisdiction='").concat(body.jurisdiction, "'");
                            conditions = addCondition(conditions, jurisdictionCondition, 'AND');
                          }

                          if (body.county) {
                            countyCondition = "".concat(_component, ".county='").concat(body.county, "'");
                            conditions = addCondition(conditions, countyCondition, 'AND');
                          }

                          if (body.mhfdmanager) {
                            mhfdmanagerCondition = "".concat(_component, ".mhfdmanager='").concat(body.mhfdmanager, "'");
                            conditions = addCondition(conditions, mhfdmanagerCondition, 'AND');
                          }

                          console.log('add the end conditions', conditions);
                        }
                      } catch (err) {
                        _iterator6.e(err);
                      } finally {
                        _iterator6.f();
                      }

                      extraConditions = '';
                      _iterator7 = _createForOfIteratorHelper(componentArray);

                      try {
                        for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
                          _component2 = _step7.value;

                          if (type === 'problems') {
                            _condition3 = "".concat(_config.PROBLEM_TABLE, ".problemid=").concat(_component2, ".problemid");
                            extraConditions = addCondition(extraConditions, _condition3, 'OR');
                          } else {
                            _condition4 = "".concat(type, ".projectid=").concat(_component2, ".projectid");
                            extraConditions = addCondition(extraConditions, _condition4, 'OR');
                          }
                        }
                      } catch (err) {
                        _iterator7.e(err);
                      } finally {
                        _iterator7.f();
                      }

                      conditions = addCondition(conditions, extraConditions, 'AND');

                      if (tables && tables[0] !== ',') {
                        tables = ',' + tables;
                      }

                      if (conditions) {
                        conditions = 'WHERE ' + conditions;
                      }

                      query = "SELECT ".concat(type, ".cartodb_id FROM ").concat(type).concat(tables, " ").concat(conditions);
                      console.log('my query is query ', query);
                      URL = encodeURI("".concat(_config.CARTO_URL, "?q=").concat(query));
                      _context4.next = 16;
                      return new Promise(function (resolve) {
                        _https["default"].get(URL, function (response) {
                          var str = '';

                          if (response.statusCode == 200) {
                            response.on('data', function (chunk) {
                              str += chunk;
                            });
                            response.on('end', function () {
                              var data = JSON.parse(str);
                              resolve(data.rows.map(function (element) {
                                return element.cartodb_id;
                              }));
                            });
                          } else {
                            console.log('Error ', response.statusCode);
                            resolve([]);
                          }
                        });
                      });

                    case 16:
                      answer = _context4.sent;
                      response[type] = _toConsumableArray(new Set(answer));

                    case 18:
                    case "end":
                      return _context4.stop();
                  }
                }
              }, _loop2);
            });
            _i = 0, _arr = [_config.PROBLEM_TABLE].concat(PROJECT_TABLES);

          case 7:
            if (!(_i < _arr.length)) {
              _context5.next = 12;
              break;
            }

            return _context5.delegateYield(_loop2(), "t0", 9);

          case 9:
            _i++;
            _context5.next = 7;
            break;

          case 12:
            return _context5.abrupt("return", res.send(response));

          case 13:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee4);
  }));

  return function (_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}());
router.post('/v2/by-components', /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(req, res) {
    var body, componentArray, response, tables, promises, _i2, _arr2, type, conditions, _iterator11, _step11, _loop3, answer, array, _iterator12, _step12, ans;

    return _regeneratorRuntime().wrap(function _callee5$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            body = req.body;
            componentArray = [];
            response = {};
            tables = '';

            if (!body.component_type) {
              _context6.next = 9;
              break;
            }

            tables = body.component_type;
            componentArray = tables.split(',');
            _context6.next = 10;
            break;

          case 9:
            return _context6.abrupt("return", res.send(null));

          case 10:
            promises = [];
            _i2 = 0, _arr2 = [_config.PROBLEM_TABLE].concat(PROJECT_TABLES);

          case 12:
            if (!(_i2 < _arr2.length)) {
              _context6.next = 29;
              break;
            }

            type = _arr2[_i2];
            console.log('my body is b', body);
            conditions = '';
            _iterator11 = _createForOfIteratorHelper(componentArray);

            try {
              _loop3 = function _loop3() {
                var component = _step11.value;
                console.log('my components ', component);

                if (body.status && body.status.length) {
                  var statusConditions = '';

                  var _iterator13 = _createForOfIteratorHelper(body.status.split(',')),
                      _step13;

                  try {
                    for (_iterator13.s(); !(_step13 = _iterator13.n()).done;) {
                      var status = _step13.value;
                      var condition = "".concat(component, ".status='").concat(status, "'");
                      statusConditions = addCondition(statusConditions, condition, 'OR');
                    }
                  } catch (err) {
                    _iterator13.e(err);
                  } finally {
                    _iterator13.f();
                  }

                  conditions = addCondition(conditions, '(' + statusConditions + ')', 'AND');
                }

                if (body.year_of_study && body.year_of_study.length) {
                  var yearConditions = '';

                  var _iterator14 = _createForOfIteratorHelper(body.year_of_study.split(',')),
                      _step14;

                  try {
                    for (_iterator14.s(); !(_step14 = _iterator14.n()).done;) {
                      var year = _step14.value;

                      var _condition5 = "".concat(component, ".year_of_study>=").concat(year, " AND ").concat(component, ".year_of_study<=").concat(+year + 9);

                      yearConditions = addCondition(yearConditions, _condition5, 'OR');
                    }
                  } catch (err) {
                    _iterator14.e(err);
                  } finally {
                    _iterator14.f();
                  }

                  conditions = addCondition(conditions, '(' + yearConditions + ')', 'AND');
                }

                if (body.estimated_cost && body.estimated_cost.length) {
                  var estimated_costConditions = '';

                  var _iterator15 = _createForOfIteratorHelper(body.estimated_cost),
                      _step15;

                  try {
                    for (_iterator15.s(); !(_step15 = _iterator15.n()).done;) {
                      var costRange = _step15.value;

                      var _costRange$split3 = costRange.split(','),
                          _costRange$split4 = _slicedToArray(_costRange$split3, 2),
                          lower = _costRange$split4[0],
                          upper = _costRange$split4[1];

                      var _condition6 = "".concat(component, ".estimated_cost>=").concat(+lower, " AND ").concat(component, ".estimated_cost<=").concat(+upper);

                      estimated_costConditions = addCondition(estimated_costConditions, _condition6, 'OR');
                    }
                  } catch (err) {
                    _iterator15.e(err);
                  } finally {
                    _iterator15.f();
                  }

                  conditions = addCondition(conditions, '(' + estimated_costConditions + ')', 'AND');
                }

                if (body.jurisdiction && body.jurisdiction.length) {
                  var jurisdictionCondition = "".concat(component, ".jurisdiction='").concat(body.jurisdiction, "'");
                  conditions = addCondition(conditions, jurisdictionCondition, 'AND');
                }

                if (body.county && body.county.length) {
                  var countyCondition = "".concat(component, ".county='").concat(body.county, "'");
                  conditions = addCondition(conditions, countyCondition, 'AND');
                }

                if (body.mhfdmanager && body.mhfdmanager.length) {
                  var mhfdmanagerCondition = "".concat(component, ".mhfdmanager='").concat(body.mhfdmanager, "'");
                  conditions = addCondition(conditions, mhfdmanagerCondition, 'AND');
                }

                var extraConditions = '';

                if (type === 'problems') {
                  var _condition7 = "".concat(_config.PROBLEM_TABLE, ".problemid=").concat(component, ".problemid");

                  extraConditions = addCondition(extraConditions, _condition7, 'OR');
                } else {
                  var _condition8 = "".concat(type, ".projectid=").concat(component, ".projectid");

                  extraConditions = addCondition(extraConditions, _condition8, 'OR');
                }

                conditions = addCondition(conditions, extraConditions, 'AND');

                if (conditions) {
                  conditions = 'WHERE ' + conditions;
                }

                var query = {
                  q: "SELECT ".concat(type, ".cartodb_id FROM ").concat(type, ",").concat(component, " ").concat(conditions)
                };
                console.log('my query is ', query);
                promises.push(new Promise(function (resolve) {
                  (0, _needle["default"])('post', _config.CARTO_URL, query, {
                    json: true
                  }).then(function (response) {
                    if (response.statusCode === 200) {
                      resolve(response.body.rows.map(function (element) {
                        return element.cartodb_id;
                      }));
                    } else {
                      console.log('bad status ', response.statusCode, response.body);
                      resolve([]);
                    }
                  })["catch"](function (error) {
                    console.log(error);
                    resolve([]);
                  });
                }));
                console.log('add the end conditions', conditions);
                conditions = '';
              };

              for (_iterator11.s(); !(_step11 = _iterator11.n()).done;) {
                _loop3();
              }
            } catch (err) {
              _iterator11.e(err);
            } finally {
              _iterator11.f();
            }

            _context6.next = 20;
            return Promise.all(promises);

          case 20:
            answer = _context6.sent;
            array = [];
            _iterator12 = _createForOfIteratorHelper(answer);

            try {
              for (_iterator12.s(); !(_step12 = _iterator12.n()).done;) {
                ans = _step12.value;
                array.push.apply(array, _toConsumableArray(ans));
              }
            } catch (err) {
              _iterator12.e(err);
            } finally {
              _iterator12.f();
            }

            if (!array.length) {
              array.push(-1);
            }

            response[type] = _toConsumableArray(new Set(array));

          case 26:
            _i2++;
            _context6.next = 12;
            break;

          case 29:
            return _context6.abrupt("return", res.send(response));

          case 30:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee5);
  }));

  return function (_x9, _x10) {
    return _ref5.apply(this, arguments);
  };
}());
var _default = router;
exports["default"] = _default;