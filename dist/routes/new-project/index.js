"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _needle = _interopRequireDefault(require("needle"));

var _config = require("bc/config/config.js");

var _auth = _interopRequireDefault(require("bc/auth/auth.js"));

var _logger = _interopRequireDefault(require("bc/config/logger.js"));

var _projectStreamService = _interopRequireDefault(require("bc/services/projectStream.service.js"));

var _projectComponentService = _interopRequireDefault(require("bc/services/projectComponent.service.js"));

var _independentService = _interopRequireDefault(require("bc/services/independent.service.js"));

var _capitalRoute = _interopRequireDefault(require("bc/routes/new-project/capital.route.js"));

var _maintenanceRoute = _interopRequireDefault(require("bc/routes/new-project/maintenance.route.js"));

var _studyRoute = _interopRequireDefault(require("bc/routes/new-project/study.route.js"));

var _acquisitionRoute = _interopRequireDefault(require("bc/routes/new-project/acquisition.route.js"));

var _specialRoute = _interopRequireDefault(require("bc/routes/new-project/special.route.js"));

var _copyRoute = _interopRequireDefault(require("bc/routes/new-project/copy.route.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return generator._invoke = function (innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; }(innerFn, self, context), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; this._invoke = function (method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (object) { var keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var router = _express["default"].Router();

var COMPONENTS_TABLES = ['grade_control_structure', 'pipe_appurtenances', 'special_item_point', 'special_item_linear', 'special_item_area', 'channel_improvements_linear', 'channel_improvements_area', 'removal_line', 'removal_area', 'storm_drain', 'detention_facilities', 'maintenance_trails', 'land_acquisition', 'landscaping_area', 'stream_improvement_measure'];
router.use('/capital', _capitalRoute["default"]);
router.use('/maintenance', _maintenanceRoute["default"]);
router.use('/study', _studyRoute["default"]);
router.use('/acquisition', _acquisitionRoute["default"]);
router.use('/special', _specialRoute["default"]);
router.use('/copy', _copyRoute["default"]);
router.post('/get-components-by-components-and-geom', _auth["default"], /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(req, res) {
    var geom, components, usableComponents, where, _iterator, _step, component, result, _iterator2, _step2, _loop, _ret, inn, _iterator3, _step3, element, groups, problems, sqlProblems, queryProblems, body, data, bodyProblems, _iterator4, _step4, problem, _iterator5, _step5, project, _groups$project$probl;

    return _regeneratorRuntime().wrap(function _callee$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            geom = req.body.geom;
            components = req.body.components;
            usableComponents = {};
            where = '';

            if (geom) {
              where = "ST_DWithin(ST_GeomFromGeoJSON('".concat(JSON.stringify(geom), "'), the_geom, 0)");
            }

            if (components) {
              _iterator = _createForOfIteratorHelper(components);

              try {
                for (_iterator.s(); !(_step = _iterator.n()).done;) {
                  component = _step.value;

                  if (!usableComponents[component.table]) {
                    usableComponents[component.table] = [];
                  }

                  usableComponents[component.table].push(component.objectid);
                }
              } catch (err) {
                _iterator.e(err);
              } finally {
                _iterator.f();
              }
            }

            _logger["default"].info('my usable components ' + JSON.stringify(usableComponents, null, 2));

            result = [];
            _iterator2 = _createForOfIteratorHelper(COMPONENTS_TABLES);
            _context2.prev = 9;
            _loop = /*#__PURE__*/_regeneratorRuntime().mark(function _loop() {
              var component, queryWhere, type, jurisdiction, cost, problemid, projectid, sql, query, body, _data;

              return _regeneratorRuntime().wrap(function _loop$(_context) {
                while (1) {
                  switch (_context.prev = _context.next) {
                    case 0:
                      component = _step2.value;

                      if (!(!geom && !usableComponents[component])) {
                        _context.next = 3;
                        break;
                      }

                      return _context.abrupt("return", "continue");

                    case 3:
                      queryWhere = '';

                      if (usableComponents[component]) {
                        queryWhere = "objectid IN(".concat(usableComponents[component].join(','), ")");
                      }

                      if (where) {
                        if (queryWhere) {
                          queryWhere = queryWhere + ' OR ' + where;
                        } else {
                          queryWhere = where;
                        }
                      }

                      type = component === 'stream_improvement_measure' ? 'component_part_category as type' : 'type';
                      jurisdiction = component === 'stream_improvement_measure' ? 'service_area as jurisdiction' : 'jurisdiction';
                      cost = component === 'stream_improvement_measure' ? 'estimated_cost_base as original_cost' : 'original_cost';
                      problemid = component === 'stream_improvement_measure' ? 'problem_id' : 'problemid';
                      projectid = component === 'stream_improvement_measure' ? 'project_id' : 'projectid';
                      sql = "SELECT objectid, cartodb_id, ".concat(type, ", ").concat(jurisdiction, ", status, ").concat(cost, ", ").concat(problemid, "  FROM ").concat(component, " \n    WHERE  ").concat(queryWhere, " AND ").concat(projectid, " is null ");
                      query = {
                        q: sql
                      };
                      console.log(sql);
                      body = {};
                      _context.prev = 15;
                      _context.next = 18;
                      return (0, _needle["default"])('post', _config.CARTO_URL, query, {
                        json: true
                      });

                    case 18:
                      _data = _context.sent;

                      //console.log('STATUS', data.statusCode);
                      if (_data.statusCode === 200) {
                        body = _data.body;
                        body.rows = body.rows.map(function (element) {
                          return _objectSpread({
                            table: component
                          }, element);
                        });

                        _logger["default"].info(JSON.stringify(body.rows));

                        result = result.concat(body.rows);

                        _logger["default"].info('length ' + result.length); //logger.info(JSON.stringify(body, null, 2));

                      } else {
                        _logger["default"].error('bad status ' + _data.statusCode + '  -- ' + sql + JSON.stringify(_data.body, null, 2));
                      }

                      _context.next = 25;
                      break;

                    case 22:
                      _context.prev = 22;
                      _context.t0 = _context["catch"](15);

                      _logger["default"].error(_context.t0, 'at', sql);

                    case 25:
                      ;

                    case 26:
                    case "end":
                      return _context.stop();
                  }
                }
              }, _loop, null, [[15, 22]]);
            });

            _iterator2.s();

          case 12:
            if ((_step2 = _iterator2.n()).done) {
              _context2.next = 19;
              break;
            }

            return _context2.delegateYield(_loop(), "t0", 14);

          case 14:
            _ret = _context2.t0;

            if (!(_ret === "continue")) {
              _context2.next = 17;
              break;
            }

            return _context2.abrupt("continue", 17);

          case 17:
            _context2.next = 12;
            break;

          case 19:
            _context2.next = 24;
            break;

          case 21:
            _context2.prev = 21;
            _context2.t1 = _context2["catch"](9);

            _iterator2.e(_context2.t1);

          case 24:
            _context2.prev = 24;

            _iterator2.f();

            return _context2.finish(24);

          case 27:
            inn = '';
            _iterator3 = _createForOfIteratorHelper(result);

            try {
              for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
                element = _step3.value;

                if (element.problemid || element.problem_id) {
                  if (inn) {
                    inn += ',';
                  }

                  inn += element.problemid ? element.problemid : element.problem_id;
                }
              }
            } catch (err) {
              _iterator3.e(err);
            } finally {
              _iterator3.f();
            }

            groups = {
              '-1': {
                problemname: 'No name',
                components: [],
                jurisdiction: '-',
                solutionstatus: 0
              }
            };
            problems = ['No problem'];

            if (!inn) {
              _context2.next = 47;
              break;
            }

            sqlProblems = "SELECT ".concat(_config.PROPSPROBLEMTABLES.problem_boundary[6], " as ").concat(_config.PROPSPROBLEMTABLES.problems[6], ", ").concat(_config.PROPSPROBLEMTABLES.problem_boundary[5], " as ").concat(_config.PROPSPROBLEMTABLES.problems[5], ", ").concat(_config.PROPSPROBLEMTABLES.problem_boundary[2], " as ").concat(_config.PROPSPROBLEMTABLES.problems[2], ", ").concat(_config.PROPSPROBLEMTABLES.problem_boundary[1], " as ").concat(_config.PROPSPROBLEMTABLES.problems[1], " FROM ").concat(_config.PROBLEM_TABLE, " WHERE ").concat(_config.PROPSPROBLEMTABLES.problem_boundary[5], " IN (").concat(inn, ")");
            queryProblems = {
              q: sqlProblems
            };
            body = {};
            _context2.prev = 36;
            _context2.next = 39;
            return (0, _needle["default"])('post', _config.CARTO_URL, queryProblems, {
              json: true
            });

          case 39:
            data = _context2.sent;

            //console.log('STATUS', data.statusCode);
            if (data.statusCode === 200) {
              body = data.body;

              _logger["default"].info(JSON.stringify(body.rows));

              bodyProblems = body.rows.map(function (row) {
                return row.problemname;
              });
              _iterator4 = _createForOfIteratorHelper(body.rows);

              try {
                for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
                  problem = _step4.value;
                  groups[problem.problemid] = {
                    problemname: problem.problemname,
                    jurisdiction: problem.jurisdiction,
                    solutionstatus: problem.solutionstatus,
                    components: []
                  };
                }
              } catch (err) {
                _iterator4.e(err);
              } finally {
                _iterator4.f();
              }

              problems = problems.concat(bodyProblems);

              _logger["default"].info('length of problems' + problems.length); //logger.info(JSON.stringify(body, null, 2));

            } else {
              _logger["default"].error('bad status ' + data.statusCode + '  -- ' + sqlProblems + JSON.stringify(data.body, null, 2));
            }

            _context2.next = 46;
            break;

          case 43:
            _context2.prev = 43;
            _context2.t2 = _context2["catch"](36);

            _logger["default"].error(_context2.t2, 'at', sqlProblems);

          case 46:
            ;

          case 47:
            _iterator5 = _createForOfIteratorHelper(result);

            try {
              for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
                project = _step5.value;

                if (project.problemid == null) {
                  groups['-1'].components.push(project);
                } else {
                  (_groups$project$probl = groups[project.problemid]) === null || _groups$project$probl === void 0 ? void 0 : _groups$project$probl.components.push(project);
                }
              }
            } catch (err) {
              _iterator5.e(err);
            } finally {
              _iterator5.f();
            }

            _logger["default"].info("RESULT IS => " + JSON.stringify(result, null, 2));

            res.send({
              result: result,
              problems: problems,
              groups: groups
            });

          case 51:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee, null, [[9, 21, 24, 27], [36, 43]]);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}());
router.post('/get-stream-by-components-and-geom', _auth["default"], /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(req, res) {
    var geom, components, usableComponents, current, where, _iterator6, _step6, component, promises, create, _iterator7, _step7, _loop2, _ret2;

    return _regeneratorRuntime().wrap(function _callee3$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            geom = req.body.geom;
            components = req.body.components;
            usableComponents = {};
            current = new Date().getTime();
            where = '';

            if (geom) {
              where = "ST_DWithin(ST_GeomFromGeoJSON('".concat(JSON.stringify(geom), "'), the_geom, 0)");
            }

            if (components) {
              _iterator6 = _createForOfIteratorHelper(components);

              try {
                for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
                  component = _step6.value;

                  if (!usableComponents[component.table]) {
                    usableComponents[component.table] = [];
                  }

                  usableComponents[component.table].push(component.cartodb_id);
                }
              } catch (err) {
                _iterator6.e(err);
              } finally {
                _iterator6.f();
              }
            }

            _logger["default"].info(JSON.stringify(usableComponents, null, 2));

            promises = [];
            create = false;
            _iterator7 = _createForOfIteratorHelper(COMPONENTS_TABLES);
            _context5.prev = 11;
            _loop2 = /*#__PURE__*/_regeneratorRuntime().mark(function _loop2() {
              var component, queryWhere, createSQL, createQuery, data, updateSQL, updateQuery, promise;
              return _regeneratorRuntime().wrap(function _loop2$(_context4) {
                while (1) {
                  switch (_context4.prev = _context4.next) {
                    case 0:
                      component = _step7.value;

                      if (!(!geom && !usableComponents[component])) {
                        _context4.next = 3;
                        break;
                      }

                      return _context4.abrupt("return", "continue");

                    case 3:
                      queryWhere = '';

                      if (usableComponents[component]) {
                        _logger["default"].info('this line ' + usableComponents[component].join(','));

                        queryWhere = "cartodb_id IN(".concat(usableComponents[component].join(','), ")");
                      }

                      if (where) {
                        if (queryWhere) {
                          queryWhere = queryWhere + ' OR ' + where;
                        } else {
                          queryWhere = where;
                        }
                      }

                      if (create) {
                        _context4.next = 24;
                        break;
                      }

                      createSQL = "CREATE TABLE aux_".concat(current, " AS (SELECT the_geom, the_geom_webmercator FROM ").concat(component, " \n        WHERE ").concat(queryWhere, " AND projectid is null)");
                      createQuery = {
                        q: createSQL
                      };

                      _logger["default"].info(createSQL);

                      _context4.prev = 10;
                      _context4.next = 13;
                      return (0, _needle["default"])('post', _config.CARTO_URL, createQuery, {
                        json: true
                      });

                    case 13:
                      data = _context4.sent;

                      //console.log('STATUS', data.statusCode);
                      if (data.statusCode === 200) {
                        _logger["default"].info('TABLE CREATED ' + component); //logger.info(JSON.stringify(body, null, 2));

                      } else {
                        _logger["default"].error('bad status ' + data.statusCode + '  -- ' + sql + JSON.stringify(data.body, null, 2));

                        res.status(data.statusCode).send(data);
                      }

                      _context4.next = 21;
                      break;

                    case 17:
                      _context4.prev = 17;
                      _context4.t0 = _context4["catch"](10);

                      _logger["default"].error(_context4.t0, 'at', sql);

                      res.status(500).send(_context4.t0);

                    case 21:
                      ;
                      _context4.next = 29;
                      break;

                    case 24:
                      updateSQL = "INSERT INTO aux_".concat(current, " (the_geom, the_geom_webmercator)\n        (SELECT the_geom, the_geom_webmercator FROM ").concat(component, "\n        WHERE ").concat(queryWhere, " AND projectid is null)");

                      _logger["default"].info(updateSQL);

                      updateQuery = {
                        q: updateSQL
                      };
                      promise = new Promise(function (resolve, reject) {
                        (0, _needle["default"])('post', _config.CARTO_URL, updateQuery, {
                          json: true
                        }).then(function (response) {
                          if (response.statusCode === 200) {
                            _logger["default"].info('INSERT ' + component);

                            resolve(true);
                          } else {
                            _logger["default"].error(response.statusCode + ' ' + JSON.stringify(response.body));

                            _logger["default"].info('FAIL TO INSERT ' + component);

                            resolve(false);
                          }
                        })["catch"](function (error) {
                          reject(false);
                        });
                      });
                      promises.push(promise);

                    case 29:
                      create = true;

                    case 30:
                    case "end":
                      return _context4.stop();
                  }
                }
              }, _loop2, null, [[10, 17]]);
            });

            _iterator7.s();

          case 14:
            if ((_step7 = _iterator7.n()).done) {
              _context5.next = 21;
              break;
            }

            return _context5.delegateYield(_loop2(), "t0", 16);

          case 16:
            _ret2 = _context5.t0;

            if (!(_ret2 === "continue")) {
              _context5.next = 19;
              break;
            }

            return _context5.abrupt("continue", 19);

          case 19:
            _context5.next = 14;
            break;

          case 21:
            _context5.next = 26;
            break;

          case 23:
            _context5.prev = 23;
            _context5.t1 = _context5["catch"](11);

            _iterator7.e(_context5.t1);

          case 26:
            _context5.prev = 26;

            _iterator7.f();

            return _context5.finish(26);

          case 29:
            Promise.all(promises).then( /*#__PURE__*/function () {
              var _ref3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(values) {
                var hullSQL, hullQuery, intersectionData, body, dropSQL, dropQuery, deleted;
                return _regeneratorRuntime().wrap(function _callee2$(_context3) {
                  while (1) {
                    switch (_context3.prev = _context3.next) {
                      case 0:
                        hullSQL = "\n    SELECT ST_AsGeoJSON(\n      ST_Intersection(ST_ConvexHull(ST_COLLECT(ARRAY(SELECT the_geom FROM aux_".concat(current, "))),\n                      ST_COLLECT(ARRAY(SELECT the_geom FROM mhfd_stream_reaches)))\n    ) as geom");
                        hullQuery = {
                          q: hullSQL
                        };

                        _logger["default"].info(hullSQL);

                        _context3.next = 5;
                        return (0, _needle["default"])('post', _config.CARTO_URL, hullQuery, {
                          json: true
                        });

                      case 5:
                        intersectionData = _context3.sent;

                        if (!(intersectionData.statusCode === 200)) {
                          _context3.next = 21;
                          break;
                        }

                        body = intersectionData.body;

                        _logger["default"].info(JSON.stringify(body.rows));

                        result = body.rows[0];
                        dropSQL = "DROP table if exists  aux_".concat(current, " ");
                        dropQuery = {
                          q: dropSQL
                        };
                        console.log(dropSQL);
                        _context3.next = 15;
                        return (0, _needle["default"])('post', _config.CARTO_URL, dropQuery, {
                          json: true
                        });

                      case 15:
                        deleted = _context3.sent;

                        if (deleted.statusCode === 200) {
                          _logger["default"].info('DELETE TABLE aux_' + current);
                        } else {
                          _logger["default"].error('IMPOSSIBLE DELETE TABLE aux_' + current + ' ' + deleted.statusCode + ' ' + JSON.stringify(deleted.body));
                        }

                        res.send(result);

                        _logger["default"].info('length ' + result.length); //logger.info(JSON.stringify(body, null, 2));


                        _context3.next = 22;
                        break;

                      case 21:
                        _logger["default"].error('bad status ' + intersectionData.statusCode + '  -- ' + sql + JSON.stringify(intersectionData.body, null, 2));

                      case 22:
                      case "end":
                        return _context3.stop();
                    }
                  }
                }, _callee2);
              }));

              return function (_x5) {
                return _ref3.apply(this, arguments);
              };
            }());

          case 30:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee3, null, [[11, 23, 26, 29]]);
  }));

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}());
router.get('/components-by-problemid', _auth["default"], /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(req, res) {
    var problemid, sql, query, groups, result, promises, data, body, _iterator8, _step8, _loop3;

    return _regeneratorRuntime().wrap(function _callee4$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            problemid = req.query.problemid;
            sql = "SELECT ".concat(_config.PROPSPROBLEMTABLES.problem_boundary[6], " as ").concat(_config.PROPSPROBLEMTABLES.problems[6], ", ").concat(_config.PROPSPROBLEMTABLES.problem_boundary[5], " as ").concat(_config.PROPSPROBLEMTABLES.problems[5], ", ").concat(_config.PROPSPROBLEMTABLES.problem_boundary[2], " as ").concat(_config.PROPSPROBLEMTABLES.problems[2], ", ").concat(_config.PROPSPROBLEMTABLES.problem_boundary[1], " as ").concat(_config.PROPSPROBLEMTABLES.problems[1], ", objectid FROM ").concat(_config.PROBLEM_TABLE, " WHERE ").concat(_config.PROPSPROBLEMTABLES.problem_boundary[5], " = ").concat(problemid);
            query = {
              q: sql
            };
            groups = {};
            result = [];
            promises = [];
            _context6.prev = 6;
            _context6.next = 9;
            return (0, _needle["default"])('post', _config.CARTO_URL, query, {
              json: true
            });

          case 9:
            data = _context6.sent;

            if (data.statusCode === 200) {
              body = data.body;
              body.rows.forEach(function (problem) {
                groups[problem.problemid] = {
                  problemname: problem.problemname,
                  jurisdiction: problem.jurisdiction,
                  solutionstatus: problem.solutionstatus,
                  components: []
                };
              });
              _iterator8 = _createForOfIteratorHelper(COMPONENTS_TABLES);

              try {
                _loop3 = function _loop3() {
                  var component = _step8.value;
                  var componentSQL = "SELECT cartodb_id, type, jurisdiction, status, original_cost, problemid, objectid\n         FROM ".concat(component, " WHERE problemid = ").concat(problemid, " AND projectid is null");

                  _logger["default"].info(componentSQL);

                  var componentQuery = {
                    q: componentSQL
                  };
                  var promise = new Promise(function (resolve, reject) {
                    (0, _needle["default"])('post', _config.CARTO_URL, componentQuery, {
                      json: true
                    }).then(function (response) {
                      if (response.statusCode === 200) {
                        var _body = response.body;

                        _body.rows.forEach(function (row) {
                          groups[problemid].components.push(_objectSpread({
                            table: component
                          }, row));
                          result.push(_objectSpread({
                            table: component
                          }, row));
                        });

                        _logger["default"].info('DO SELECT FOR ' + component);

                        resolve(true);
                      } else {
                        _logger["default"].info('FAIL TO SELECT ' + component + ' ' + response.statusCode + ' ' + JSON.stringify(response.body));

                        _logger["default"].error(response.statusCode + ' ' + response.body);

                        resolve(false);
                      }
                    })["catch"](function (error) {
                      reject(false);
                    });
                  });
                  promises.push(promise);
                };

                for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
                  _loop3();
                }
              } catch (err) {
                _iterator8.e(err);
              } finally {
                _iterator8.f();
              }

              Promise.all(promises).then(function (values) {
                res.send({
                  result: result,
                  problems: groups[problemid].problemname,
                  groups: groups
                });
              });
            } else {
              _logger["default"].error('bad status ' + data.statusCode + '  -- ' + sql + JSON.stringify(data.body, null, 2));

              res.status(data.statusCode).send(data);
            }

            _context6.next = 17;
            break;

          case 13:
            _context6.prev = 13;
            _context6.t0 = _context6["catch"](6);

            _logger["default"].error(_context6.t0, 'at', sql);

            res.status(500).send(_context6.t0);

          case 17:
            ;

          case 18:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee4, null, [[6, 13]]);
  }));

  return function (_x6, _x7) {
    return _ref4.apply(this, arguments);
  };
}());
router.post('/component-geom', /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(req, res) {
    var table, objectid, sql, query, streamsInfo, data, body;
    return _regeneratorRuntime().wrap(function _callee5$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            table = req.body.table;
            objectid = req.body.objectid;
            sql = "SELECT ST_ASGEOJSON(the_geom) as the_geom from ".concat(table, " where objectid=").concat(objectid);
            query = {
              q: sql
            };

            _logger["default"].info(sql);

            streamsInfo = [];
            _context7.prev = 6;
            _context7.next = 9;
            return (0, _needle["default"])('post', _config.CARTO_URL, query, {
              json: true
            });

          case 9:
            data = _context7.sent;

            if (data.statusCode === 200) {
              body = data.body;
              res.send({
                geom: body.rows[0].the_geom
              });
            } else {
              _logger["default"].error('bad status ' + data.statusCode + '  -- ' + sql + JSON.stringify(data.body, null, 2));

              res.status(data.statusCode).send(data);
            }

            _context7.next = 17;
            break;

          case 13:
            _context7.prev = 13;
            _context7.t0 = _context7["catch"](6);

            _logger["default"].error(_context7.t0, 'at', sql);

            res.status(500).send(_context7.t0);

          case 17:
            ;

          case 18:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee5, null, [[6, 13]]);
  }));

  return function (_x8, _x9) {
    return _ref5.apply(this, arguments);
  };
}());
router.post('/problem-geom', /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6(req, res) {
    var problemid, sql, query, streamsInfo, data, body;
    return _regeneratorRuntime().wrap(function _callee6$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            problemid = req.body.problemid;
            sql = "SELECT ST_ASGEOJSON(the_geom) as the_geom from ".concat(_config.PROBLEM_TABLE, " where ").concat(_config.PROPSPROBLEMTABLES.problem_boundary[5], "=").concat(problemid);
            query = {
              q: sql
            };

            _logger["default"].info(sql);

            streamsInfo = [];
            _context8.prev = 5;
            _context8.next = 8;
            return (0, _needle["default"])('post', _config.CARTO_URL, query, {
              json: true
            });

          case 8:
            data = _context8.sent;

            if (data.statusCode === 200) {
              body = data.body;
              res.send({
                geom: body.rows[0].the_geom
              });
            } else {
              _logger["default"].error('bad status ' + data.statusCode + '  -- ' + sql + JSON.stringify(data.body, null, 2));

              res.status(data.statusCode).send(data);
            }

            _context8.next = 16;
            break;

          case 12:
            _context8.prev = 12;
            _context8.t0 = _context8["catch"](5);

            _logger["default"].error(_context8.t0, 'at', sql);

            res.status(500).send(_context8.t0);

          case 16:
            ;

          case 17:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee6, null, [[5, 12]]);
  }));

  return function (_x10, _x11) {
    return _ref6.apply(this, arguments);
  };
}());
router.post('/streams-data', _auth["default"], /*#__PURE__*/function () {
  var _ref7 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee8(req, res) {
    var geom, sql, query, streamsInfo, data, body, answer, _promises, _iterator9, _step9, _loop4;

    return _regeneratorRuntime().wrap(function _callee8$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            geom = req.body.geom; // const sql = `SELECT  
            //       j.jurisdiction, 
            //       s.str_name, 
            //       s.cartodb_id, 
            //       ST_length(ST_intersection(s.the_geom, j.the_geom)::geography) as length  
            //         FROM mhfd_stream_reaches s, jurisidictions j 
            //         where ST_DWithin(ST_GeomFromGeoJSON('${JSON.stringify(geom)}'), s.the_geom, 0) 
            //         and ST_DWithin(s.the_geom, j.the_geom, 0) `;

            sql = "\n    SELECT \n      j.jurisdiction, \n      streamsIntersected.str_name, \n      streamsIntersected.cartodb_id,  \n      streamsIntersected.mhfd_code,\n      streamsIntersected.reach_code,\n      streamsIntersected.trib_code1,\n      streamsIntersected.trib_code2,\n      streamsIntersected.trib_code3,\n      streamsIntersected.trib_code4,\n      streamsIntersected.trib_code5,\n      streamsIntersected.trib_code6,\n      streamsIntersected.trib_code7,\n      ST_length(ST_intersection(streamsIntersected.the_geom, j.the_geom)::geography) as length\n      FROM \n      ( SELECT unique_mhfd_code as mhfd_code, reach_code, trib_code1, trib_code2, trib_code3, trib_code4, trib_code5, trib_code6, trib_code7, \n        cartodb_id, str_name, the_geom FROM mhfd_stream_reaches WHERE ST_DWithin(ST_GeomFromGeoJSON('".concat(JSON.stringify(geom), "'), the_geom, 0) ) streamsIntersected ,\n      jurisidictions j \n      WHERE\n      ST_DWithin(streamsIntersected.the_geom, j.the_geom, 0)\n  ");
            query = {
              q: sql
            };

            _logger["default"].info(sql);

            streamsInfo = [];
            _context10.prev = 5;
            _context10.next = 8;
            return (0, _needle["default"])('post', _config.CARTO_URL, query, {
              json: true
            });

          case 8:
            data = _context10.sent;

            if (data.statusCode === 200) {
              body = data.body;
              streamsInfo = body.rows;
              answer = {};
              body.rows.forEach(function (row) {
                var str_name = row.str_name ? row.str_name : 'Unnamed Streams';

                if (!answer[str_name]) {
                  answer[str_name] = [];
                }

                answer[str_name].push({
                  jurisdiction: row.jurisdiction,
                  length: row.length,
                  cartodb_id: row.cartodb_id,
                  mhfd_code: row.mhfd_code,
                  str_name: str_name,
                  drainage: 0
                });
              });
              _promises = [];
              _iterator9 = _createForOfIteratorHelper(streamsInfo);

              try {
                _loop4 = function _loop4() {
                  var stream = _step9.value;
                  var drainageSQL = "select st_area(ST_transform(st_intersection(j.the_geom, union_c.the_geom), 26986) ) as area , j.jurisdiction from jurisidictions j , (select st_union(the_geom) as the_geom from mhfd_catchments_simple_v1 c where \n         '".concat(stream.reach_code, "' is not distinct from c.reach_code \n          ").concat(stream.trib_code1 != null ? "and ".concat(stream.trib_code1, " is not distinct from c.trib_code1") : '', " \n          ").concat(stream.trib_code2 != null ? "and ".concat(stream.trib_code2, " is not distinct from c.trib_code1") : '', " \n          ").concat(stream.trib_code3 != null ? "and ".concat(stream.trib_code3, " is not distinct from c.trib_code1") : '', " \n          ").concat(stream.trib_code4 != null ? "and ".concat(stream.trib_code4, " is not distinct from c.trib_code1") : '', " \n          ").concat(stream.trib_code5 != null ? "and ".concat(stream.trib_code5, " is not distinct from c.trib_code1") : '', " \n          ").concat(stream.trib_code6 != null ? "and ".concat(stream.trib_code6, " is not distinct from c.trib_code1") : '', " \n          ").concat(stream.trib_code7 != null ? "and ".concat(stream.trib_code7, " is not distinct from c.trib_code1") : '', " \n          ) union_c \n          where ST_INTERSECTS(ST_SimplifyPreserveTopology(j.the_geom, 0.1), ST_SimplifyPreserveTopology(union_c.the_geom, 0.1)) ");
                  var drainageQuery = {
                    q: drainageSQL
                  };
                  var promise = new Promise(function (resolve, reject) {
                    (0, _needle["default"])('post', _config.CARTO_URL, drainageQuery, {
                      json: true
                    }).then(function (response) {
                      if (response.statusCode === 200) {
                        _logger["default"].info('I reached ', JSON.stringify(response.body.rows));

                        resolve({
                          str_name: stream.str_name,
                          drainage: response.body.rows
                        });
                      } else {
                        _logger["default"].info('for query ' + drainageSQL);

                        _logger["default"].error(response.statusCode + ' ' + JSON.stringify(response.body));

                        resolve({
                          str_name: stream.str_name,
                          drainage: []
                        });
                      }
                    })["catch"](function (error) {
                      _logger["default"].info('crashed');

                      reject({
                        str_name: stream.str_name,
                        drainage: []
                      });
                    });
                  });

                  _promises.push(promise);
                };

                for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) {
                  _loop4();
                }
              } catch (err) {
                _iterator9.e(err);
              } finally {
                _iterator9.f();
              }

              Promise.all(_promises).then( /*#__PURE__*/function () {
                var _ref8 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7(promiseData) {
                  return _regeneratorRuntime().wrap(function _callee7$(_context9) {
                    while (1) {
                      switch (_context9.prev = _context9.next) {
                        case 0:
                          _logger["default"].info('my values ' + JSON.stringify(promiseData));

                          promiseData.forEach(function (bucket) {
                            //Disclaimer: I don't create a more optimal solution because we don't have enough time
                            // will be work fine for most cases 
                            _logger["default"].info('bucket ' + JSON.stringify(bucket));

                            var str_name = bucket.str_name ? bucket.str_name : 'Unnamed Streams';

                            var _iterator10 = _createForOfIteratorHelper(answer[str_name]),
                                _step10;

                            try {
                              for (_iterator10.s(); !(_step10 = _iterator10.n()).done;) {
                                var array = _step10.value;

                                _logger["default"].info('array ' + JSON.stringify(array));

                                var _iterator11 = _createForOfIteratorHelper(bucket.drainage),
                                    _step11;

                                try {
                                  for (_iterator11.s(); !(_step11 = _iterator11.n()).done;) {
                                    var info = _step11.value;

                                    if (array.jurisdiction === info.jurisdiction) {
                                      array.drainage += info.area * 3.86102e-7;
                                    }
                                  }
                                } catch (err) {
                                  _iterator11.e(err);
                                } finally {
                                  _iterator11.f();
                                }
                              } //answer[value.str_name].push(value.drainage);

                            } catch (err) {
                              _iterator10.e(err);
                            } finally {
                              _iterator10.f();
                            }
                          });
                          res.send(answer);

                        case 3:
                        case "end":
                          return _context9.stop();
                      }
                    }
                  }, _callee7);
                }));

                return function (_x14) {
                  return _ref8.apply(this, arguments);
                };
              }());
            } else {
              _logger["default"].error('bad status ' + data.statusCode + '  -- ' + sql + JSON.stringify(data.body, null, 2));

              res.status(data.statusCode).send(data);
            }

            _context10.next = 16;
            break;

          case 12:
            _context10.prev = 12;
            _context10.t0 = _context10["catch"](5);

            _logger["default"].error(_context10.t0, 'at', sql);

            res.status(500).send(_context10.t0);

          case 16:
            ;

          case 17:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee8, null, [[5, 12]]);
  }));

  return function (_x12, _x13) {
    return _ref7.apply(this, arguments);
  };
}());
router.post('/get-jurisdiction-for-polygon', /*#__PURE__*/function () {
  var _ref9 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee9(req, res) {
    var geom, sql, query, data;
    return _regeneratorRuntime().wrap(function _callee9$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            geom = req.body.geom;
            sql = "SELECT jurisdiction FROM jurisidictions WHERE ST_Dwithin(the_geom, ST_Centroid(ST_GeomFromGeoJSON('".concat(JSON.stringify(geom), "')), 0)");

            _logger["default"].info(sql);

            query = {
              q: sql
            };
            _context11.prev = 4;
            _context11.next = 7;
            return (0, _needle["default"])('post', _config.CARTO_URL, query, {
              json: true
            });

          case 7:
            data = _context11.sent;
            console.log(JSON.stringify(data.body));

            if (!(data.statusCode === 200)) {
              _context11.next = 11;
              break;
            }

            return _context11.abrupt("return", res.send({
              jurisdiction: data.body.rows[0].jurisdiction
            }));

          case 11:
            _logger["default"].error('bad status ' + data.statusCode + '  -- ' + sql + JSON.stringify(data.body, null, 2));

            return _context11.abrupt("return", res.status(data.statusCode).send(data));

          case 15:
            _context11.prev = 15;
            _context11.t0 = _context11["catch"](4);
            res.status(500).send({
              error: _context11.t0
            });

          case 18:
          case "end":
            return _context11.stop();
        }
      }
    }, _callee9, null, [[4, 15]]);
  }));

  return function (_x15, _x16) {
    return _ref9.apply(this, arguments);
  };
}());
router.post('/get-countyservicearea-for-polygon', _auth["default"], /*#__PURE__*/function () {
  var _ref10 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee10(req, res) {
    var geom, sql, query, data, body, answer;
    return _regeneratorRuntime().wrap(function _callee10$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            geom = req.body.geom;
            sql = "WITH dumped AS (\n    SELECT  (\n            ST_Dump(\n                ST_Intersection( \n                    mhfd_stream_reaches.the_geom, \n        ST_GeomFromGeoJSON('".concat(JSON.stringify(geom), "')\n                )\n            )\n        ).geom AS the_geom\n    FROM mhfd_stream_reaches\n),\nunioned AS (\n    SELECT ST_Union(the_geom) AS the_geom FROM dumped\n)\nSELECT aoi, filter \nFROM mhfd_zoom_to_areas, unioned \nWHERE filter SIMILAR TO '%(Service Area|County)%' \nAND ST_DWithin( \n    unioned.the_geom, \n    mhfd_zoom_to_areas.the_geom, \n    0\n)\n    ");
            query = {
              q: sql
            };

            _logger["default"].info(sql);

            _context12.prev = 4;
            _context12.next = 7;
            return (0, _needle["default"])('post', _config.CARTO_URL, query, {
              json: true
            });

          case 7:
            data = _context12.sent;

            if (!(data.statusCode === 200)) {
              _context12.next = 18;
              break;
            }

            body = data.body;
            _context12.next = 12;
            return getAllJurisdictionByGeomStreams(JSON.stringify(geom));

          case 12:
            _context12.t0 = _context12.sent;
            answer = {
              jurisdiction: _context12.t0
            };
            body.rows.forEach(function (row) {
              if (row.filter) {
                if (!answer[row.filter]) {
                  answer[row.filter] = [];
                }

                answer[row.filter].push(row.aoi);
              }
            });
            res.send(answer);
            _context12.next = 20;
            break;

          case 18:
            _logger["default"].error('bad status ' + data.statusCode + '  -- ' + sql + JSON.stringify(data.body, null, 2));

            res.status(data.statusCode).send(data);

          case 20:
            _context12.next = 26;
            break;

          case 22:
            _context12.prev = 22;
            _context12.t1 = _context12["catch"](4);

            _logger["default"].error(_context12.t1, 'at', sql);

            res.status(500).send(_context12.t1);

          case 26:
            ;

          case 27:
          case "end":
            return _context12.stop();
        }
      }
    }, _callee10, null, [[4, 22]]);
  }));

  return function (_x17, _x18) {
    return _ref10.apply(this, arguments);
  };
}());
router.post('/get-countyservicearea-for-geom', _auth["default"], /*#__PURE__*/function () {
  var _ref11 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee11(req, res) {
    var geom, sql, query, data, body, answer;
    return _regeneratorRuntime().wrap(function _callee11$(_context13) {
      while (1) {
        switch (_context13.prev = _context13.next) {
          case 0:
            geom = req.body.geom;
            sql = "SELECT aoi, filter FROM mhfd_zoom_to_areas where filter SIMILAR TO '%(Service Area|County)%' \n  AND ST_DWithin(ST_GeomFromGeoJSON('".concat(JSON.stringify(geom), "'), the_geom, 0)");
            query = {
              q: sql
            };

            _logger["default"].info(sql);

            _context13.prev = 4;
            _context13.next = 7;
            return (0, _needle["default"])('post', _config.CARTO_URL, query, {
              json: true
            });

          case 7:
            data = _context13.sent;

            if (!(data.statusCode === 200)) {
              _context13.next = 18;
              break;
            }

            body = data.body;
            _context13.next = 12;
            return getAllJurisdictionByGeom(JSON.stringify(geom));

          case 12:
            _context13.t0 = _context13.sent;
            answer = {
              jurisdiction: _context13.t0
            };
            body.rows.forEach(function (row) {
              if (row.filter) {
                if (!answer[row.filter]) {
                  answer[row.filter] = [];
                }

                answer[row.filter].push(row.aoi);
              }
            });
            res.send(answer);
            _context13.next = 20;
            break;

          case 18:
            _logger["default"].error('bad status ' + data.statusCode + '  -- ' + sql + JSON.stringify(data.body, null, 2));

            res.status(data.statusCode).send(data);

          case 20:
            _context13.next = 26;
            break;

          case 22:
            _context13.prev = 22;
            _context13.t1 = _context13["catch"](4);

            _logger["default"].error(_context13.t1, 'at', sql);

            res.status(500).send(_context13.t1);

          case 26:
            ;

          case 27:
          case "end":
            return _context13.stop();
        }
      }
    }, _callee11, null, [[4, 22]]);
  }));

  return function (_x19, _x20) {
    return _ref11.apply(this, arguments);
  };
}());
router.post('/get-countyservicearea-for-point', _auth["default"], /*#__PURE__*/function () {
  var _ref12 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee12(req, res) {
    var geom, sql, query, data, body, answer;
    return _regeneratorRuntime().wrap(function _callee12$(_context14) {
      while (1) {
        switch (_context14.prev = _context14.next) {
          case 0:
            geom = req.body.geom;
            sql = "SELECT aoi, filter FROM mhfd_zoom_to_areas where filter SIMILAR TO '%(Service Area|County)%' \n  AND ST_DWithin(ST_GeomFromGeoJSON('".concat(JSON.stringify(geom), "'), the_geom, 0)");
            query = {
              q: sql
            };

            _logger["default"].info(sql);

            _context14.prev = 4;
            _context14.next = 7;
            return (0, _needle["default"])('post', _config.CARTO_URL, query, {
              json: true
            });

          case 7:
            data = _context14.sent;

            if (!(data.statusCode === 200)) {
              _context14.next = 19;
              break;
            }

            body = data.body;
            _context14.next = 12;
            return getJurisdictionByGeom(JSON.stringify(geom));

          case 12:
            _context14.t0 = _context14.sent;
            _context14.t1 = [_context14.t0];
            answer = {
              jurisdiction: _context14.t1
            };
            body.rows.forEach(function (row) {
              if (row.filter) {
                answer[row.filter] = [row.aoi];
              }
            });
            res.send(answer);
            _context14.next = 21;
            break;

          case 19:
            _logger["default"].error('bad status ' + data.statusCode + '  -- ' + sql + JSON.stringify(data.body, null, 2));

            res.status(data.statusCode).send(data);

          case 21:
            _context14.next = 27;
            break;

          case 23:
            _context14.prev = 23;
            _context14.t2 = _context14["catch"](4);

            _logger["default"].error(_context14.t2, 'at', sql);

            res.status(500).send(_context14.t2);

          case 27:
            ;

          case 28:
          case "end":
            return _context14.stop();
        }
      }
    }, _callee12, null, [[4, 23]]);
  }));

  return function (_x21, _x22) {
    return _ref12.apply(this, arguments);
  };
}());
router.post('/convexhull-by-components', _auth["default"], /*#__PURE__*/function () {
  var _ref13 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee14(req, res) {
    var components, createTable, current, promises, _loop5, component, _ret3;

    return _regeneratorRuntime().wrap(function _callee14$(_context17) {
      while (1) {
        switch (_context17.prev = _context17.next) {
          case 0:
            components = req.body.components;

            _logger["default"].info('COMPONENTS ' + JSON.stringify(components));

            createTable = false;
            current = new Date().getTime();
            promises = [];
            _loop5 = /*#__PURE__*/_regeneratorRuntime().mark(function _loop5(component) {
              var inList, inQuery, createSQL, createQuery, data, updateSQL, updateQuery, promise;
              return _regeneratorRuntime().wrap(function _loop5$(_context16) {
                while (1) {
                  switch (_context16.prev = _context16.next) {
                    case 0:
                      _logger["default"].info('component ' + component);

                      inList = components[component]['in'];
                      inQuery = '';

                      if (inList.length) {
                        _context16.next = 5;
                        break;
                      }

                      return _context16.abrupt("return", "continue");

                    case 5:
                      inQuery = 'IN(' + inList.join(',') + ')';

                      if (createTable) {
                        _context16.next = 24;
                        break;
                      }

                      createSQL = "CREATE TABLE aux_".concat(current, " AS (SELECT the_geom, the_geom_webmercator FROM ").concat(component, " \n        WHERE cartodb_id ").concat(inQuery, " AND projectid is null)");

                      _logger["default"].info(createSQL);

                      createQuery = {
                        q: createSQL
                      };
                      _context16.prev = 10;
                      _context16.next = 13;
                      return (0, _needle["default"])('post', _config.CARTO_URL, createQuery, {
                        json: true
                      });

                    case 13:
                      data = _context16.sent;

                      //console.log('STATUS', data.statusCode);
                      if (data.statusCode === 200) {
                        _logger["default"].info('TABLE CREATED '); //logger.info(JSON.stringify(body, null, 2));

                      } else {
                        _logger["default"].error('bad status ' + data.statusCode + '  -- ' + createSQL + JSON.stringify(data.body, null, 2));

                        res.status(data.statusCode).send(data);
                      }

                      _context16.next = 21;
                      break;

                    case 17:
                      _context16.prev = 17;
                      _context16.t0 = _context16["catch"](10);

                      _logger["default"].error(_context16.t0, 'at', sql);

                      res.status(500).send(_context16.t0);

                    case 21:
                      ;
                      _context16.next = 29;
                      break;

                    case 24:
                      updateSQL = "INSERT INTO aux_".concat(current, " (the_geom, the_geom_webmercator)\n        (SELECT the_geom, the_geom_webmercator FROM ").concat(component, "\n        WHERE cartodb_id ").concat(inQuery, " AND projectid is null)");

                      _logger["default"].info(updateSQL);

                      updateQuery = {
                        q: updateSQL
                      };
                      promise = new Promise(function (resolve, reject) {
                        (0, _needle["default"])('post', _config.CARTO_URL, updateQuery, {
                          json: true
                        }).then(function (response) {
                          if (response.statusCode === 200) {
                            _logger["default"].info('INSERT ', component);

                            resolve(true);
                          } else {
                            _logger["default"].info('FAIL TO INSERT ', component);

                            resolve(false);
                          }
                        })["catch"](function (error) {
                          reject(false);
                        });
                      });
                      promises.push(promise);

                    case 29:
                      createTable = true;

                    case 30:
                    case "end":
                      return _context16.stop();
                  }
                }
              }, _loop5, null, [[10, 17]]);
            });
            _context17.t0 = _regeneratorRuntime().keys(components);

          case 7:
            if ((_context17.t1 = _context17.t0()).done) {
              _context17.next = 15;
              break;
            }

            component = _context17.t1.value;
            return _context17.delegateYield(_loop5(component), "t2", 10);

          case 10:
            _ret3 = _context17.t2;

            if (!(_ret3 === "continue")) {
              _context17.next = 13;
              break;
            }

            return _context17.abrupt("continue", 7);

          case 13:
            _context17.next = 7;
            break;

          case 15:
            Promise.all(promises).then( /*#__PURE__*/function () {
              var _ref14 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee13(values) {
                var hullSQL, hullQuery, intersectionData, body, dropSQL, dropQuery, deleted;
                return _regeneratorRuntime().wrap(function _callee13$(_context15) {
                  while (1) {
                    switch (_context15.prev = _context15.next) {
                      case 0:
                        hullSQL = "\n    SELECT ST_AsGeoJSON(\n      ST_Intersection(ST_ConvexHull(ST_COLLECT(ARRAY(SELECT the_geom FROM aux_".concat(current, "))),\n                      ST_COLLECT(ARRAY(SELECT the_geom FROM mhfd_stream_reaches)))\n    ) as geom");
                        hullQuery = {
                          q: hullSQL
                        };

                        _logger["default"].info(hullSQL);

                        _context15.next = 5;
                        return (0, _needle["default"])('post', _config.CARTO_URL, hullQuery, {
                          json: true
                        });

                      case 5:
                        intersectionData = _context15.sent;

                        if (!(intersectionData.statusCode === 200)) {
                          _context15.next = 20;
                          break;
                        }

                        body = intersectionData.body;

                        _logger["default"].info(JSON.stringify(body.rows));

                        result = body.rows[0];
                        dropSQL = "DROP table if exists  aux_".concat(current, " ");
                        dropQuery = {
                          q: dropSQL
                        };
                        _context15.next = 14;
                        return (0, _needle["default"])('post', _config.CARTO_URL, dropQuery, {
                          json: true
                        });

                      case 14:
                        deleted = _context15.sent;

                        if (deleted.statusCode === 200) {
                          _logger["default"].info('DELETE TABLE aux_' + current);
                        } else {
                          _logger["default"].error('IMPOSSIBLE DELETE TABLE aux_' + current + ' ' + deleted.statusCode + ' ' + JSON.stringify(deleted.body));
                        }

                        res.send(result);

                        _logger["default"].info('length ' + result.length); //logger.info(JSON.stringify(body, null, 2));


                        _context15.next = 21;
                        break;

                      case 20:
                        _logger["default"].error('bad status ' + intersectionData.statusCode + '  -- ' + sql + JSON.stringify(intersectionData.body, null, 2));

                      case 21:
                      case "end":
                        return _context15.stop();
                    }
                  }
                }, _callee13);
              }));

              return function (_x25) {
                return _ref14.apply(this, arguments);
              };
            }());

          case 16:
          case "end":
            return _context17.stop();
        }
      }
    }, _callee14);
  }));

  return function (_x23, _x24) {
    return _ref13.apply(this, arguments);
  };
}());
router.post('/get-all-streams', _auth["default"], /*#__PURE__*/function () {
  var _ref15 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee15(req, res) {
    var geom, sql, query, body, data;
    return _regeneratorRuntime().wrap(function _callee15$(_context18) {
      while (1) {
        switch (_context18.prev = _context18.next) {
          case 0:
            geom = req.body.geom;
            sql = "SELECT cartodb_id, unique_mhfd_code as mhfd_code FROM mhfd_stream_reaches WHERE ST_INTERSECTS(ST_GeomFromGeoJSON('".concat(JSON.stringify(geom), "'), the_geom)");
            query = {
              q: sql
            };
            body = {};
            _context18.prev = 4;
            _context18.next = 7;
            return (0, _needle["default"])('post', _config.CARTO_URL, query, {
              json: true
            });

          case 7:
            data = _context18.sent;

            //console.log('STATUS', data.statusCode);
            if (data.statusCode === 200) {
              body = data.body;

              _logger["default"].info(JSON.stringify(body.rows));

              body.rows = body.rows.map(function (data) {
                return {
                  cartodb_id: data.cartodb_id,
                  mhfd_code: data.mhfd_code
                };
              });
              res.send(body.rows); //logger.info(JSON.stringify(body, null, 2));
            } else {
              _logger["default"].error('bad status ' + data.statusCode + '  -- ' + sql + JSON.stringify(data.body, null, 2));

              res.status(data.statusCode).send(data);
            }

            _context18.next = 15;
            break;

          case 11:
            _context18.prev = 11;
            _context18.t0 = _context18["catch"](4);

            _logger["default"].error(_context18.t0, 'at', sql);

            res.status(500).send(_context18.t0);

          case 15:
            ;

          case 16:
          case "end":
            return _context18.stop();
        }
      }
    }, _callee15, null, [[4, 11]]);
  }));

  return function (_x26, _x27) {
    return _ref15.apply(this, arguments);
  };
}());
router.post('/get-stream', _auth["default"], /*#__PURE__*/function () {
  var _ref16 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee16(req, res) {
    var geom, result, sql, query, body, data;
    return _regeneratorRuntime().wrap(function _callee16$(_context19) {
      while (1) {
        switch (_context19.prev = _context19.next) {
          case 0:
            geom = req.body.geom;
            result = {};
            sql = "SELECT ST_AsGeoJSON(\n    ST_Intersection(ST_GeomFromGeoJSON('".concat(JSON.stringify(geom), "'),\n                    ST_COLLECT(ARRAY(SELECT the_geom FROM mhfd_stream_reaches)))\n  ) as geom");
            query = {
              q: sql
            };
            console.log(sql);
            body = {};
            _context19.prev = 6;
            _context19.next = 9;
            return (0, _needle["default"])('post', _config.CARTO_URL, query, {
              json: true
            });

          case 9:
            data = _context19.sent;

            //console.log('STATUS', data.statusCode);
            if (data.statusCode === 200) {
              body = data.body;

              _logger["default"].info(JSON.stringify(body.rows[0]));

              res.send(body.rows[0]); //logger.info(JSON.stringify(body, null, 2));
            } else {
              _logger["default"].error('bad status ' + data.statusCode + '  -- ' + sql + JSON.stringify(data.body, null, 2));

              res.status(data.statusCode).send(data);
            }

            _context19.next = 17;
            break;

          case 13:
            _context19.prev = 13;
            _context19.t0 = _context19["catch"](6);

            _logger["default"].error(_context19.t0, 'at', sql);

            res.status(500).send(_context19.t0);

          case 17:
            ;

          case 18:
          case "end":
            return _context19.stop();
        }
      }
    }, _callee16, null, [[6, 13]]);
  }));

  return function (_x28, _x29) {
    return _ref16.apply(this, arguments);
  };
}());
router.post('/get-stream-convexhull', _auth["default"], /*#__PURE__*/function () {
  var _ref17 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee18(req, res) {
    var geom, result, current, createSQL, createQuery, data, _promises2, _loop6, i;

    return _regeneratorRuntime().wrap(function _callee18$(_context21) {
      while (1) {
        switch (_context21.prev = _context21.next) {
          case 0:
            geom = req.body.geom;
            result = {};
            current = new Date().getTime();
            createSQL = "CREATE TABLE aux_".concat(current, " AS (SELECT the_geom, the_geom_webmercator FROM ").concat(COMPONENTS_TABLES[0], " \n  WHERE ST_INTERSECTS(ST_GeomFromGeoJSON('").concat(JSON.stringify(geom), "'), the_geom) AND projectid is null)");

            _logger["default"].info(createSQL);

            createQuery = {
              q: createSQL
            };
            _context21.prev = 6;
            _context21.next = 9;
            return (0, _needle["default"])('post', _config.CARTO_URL, createQuery, {
              json: true
            });

          case 9:
            data = _context21.sent;

            if (data.statusCode === 200) {
              _logger["default"].info('CREATE');

              _promises2 = [];

              _loop6 = function _loop6(i) {
                var updateSQL = "INSERT INTO aux_".concat(current, " (the_geom, the_geom_webmercator)\n        (SELECT the_geom, the_geom_webmercator FROM ").concat(COMPONENTS_TABLES[i], "\n        WHERE ST_INTERSECTS(ST_GeomFromGeoJSON('").concat(JSON.stringify(geom), "'), the_geom) AND projectid is null)");

                _logger["default"].info(updateSQL);

                var updateQuery = {
                  q: updateSQL
                };
                var promise = new Promise(function (resolve, reject) {
                  (0, _needle["default"])('post', _config.CARTO_URL, updateQuery, {
                    json: true
                  }).then(function (response) {
                    if (response.statusCode === 200) {
                      _logger["default"].info('INSERT ', COMPONENTS_TABLES[i]);

                      resolve(true);
                    } else {
                      _logger["default"].info('FAIL TO INSERT ', COMPONENTS_TABLES[i]);

                      resolve(false);
                    }
                  })["catch"](function (error) {
                    reject(false);
                  });
                });

                _promises2.push(promise);
              };

              for (i = 1; i < COMPONENTS_TABLES.length; i++) {
                _loop6(i);
              }

              Promise.all(_promises2).then( /*#__PURE__*/function () {
                var _ref18 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee17(values) {
                  var hullSQL, hullQuery, intersectionData, body, dropSQL, dropQuery, deleted;
                  return _regeneratorRuntime().wrap(function _callee17$(_context20) {
                    while (1) {
                      switch (_context20.prev = _context20.next) {
                        case 0:
                          hullSQL = "\n        SELECT ST_AsGeoJSON(\n          ST_Intersection(ST_ConvexHull(ST_COLLECT(ARRAY(SELECT the_geom FROM aux_".concat(current, "))),\n                          ST_COLLECT(ARRAY(SELECT the_geom FROM mhfd_stream_reaches)))\n        ) as geom");
                          hullQuery = {
                            q: hullSQL
                          };

                          _logger["default"].info(hullSQL);

                          _context20.next = 5;
                          return (0, _needle["default"])('post', _config.CARTO_URL, hullQuery, {
                            json: true
                          });

                        case 5:
                          intersectionData = _context20.sent;

                          if (!(intersectionData.statusCode === 200)) {
                            _context20.next = 21;
                            break;
                          }

                          body = intersectionData.body;

                          _logger["default"].info(JSON.stringify(body.rows));

                          result = body.rows[0];
                          dropSQL = "DROP table if exists  aux_".concat(current, " ");
                          dropQuery = {
                            q: dropSQL
                          };
                          console.log(dropSQL);
                          _context20.next = 15;
                          return (0, _needle["default"])('post', _config.CARTO_URL, dropQuery, {
                            json: true
                          });

                        case 15:
                          deleted = _context20.sent;

                          if (deleted.statusCode === 200) {
                            _logger["default"].info('DELETE TABLE aux_' + current);
                          } else {
                            _logger["default"].error('IMPOSSIBLE DELETE TABLE aux_' + current + ' ' + deleted.statusCode + ' ' + JSON.stringify(deleted.body));
                          }

                          res.send(result);

                          _logger["default"].info('length ' + result.length); //logger.info(JSON.stringify(body, null, 2));


                          _context20.next = 22;
                          break;

                        case 21:
                          _logger["default"].error('bad status ' + intersectionData.statusCode + '  -- ' + sql + JSON.stringify(intersectionData.body, null, 2));

                        case 22:
                        case "end":
                          return _context20.stop();
                      }
                    }
                  }, _callee17);
                }));

                return function (_x32) {
                  return _ref18.apply(this, arguments);
                };
              }());
            } else {
              _logger["default"].info('NOT CREATED ' + data.statusCode + ' [ ' + JSON.stringify(data.body));
            }

            _context21.next = 17;
            break;

          case 13:
            _context21.prev = 13;
            _context21.t0 = _context21["catch"](6);
            console.log(_context21.t0);
            res.status(500).send({
              error: JSON.stringify(_context21.t0)
            });

          case 17:
          case "end":
            return _context21.stop();
        }
      }
    }, _callee18, null, [[6, 13]]);
  }));

  return function (_x30, _x31) {
    return _ref17.apply(this, arguments);
  };
}());
router.post('/showcomponents', _auth["default"], /*#__PURE__*/function () {
  var _ref19 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee19(req, res) {
    var geom, result, _iterator12, _step12, _loop7, inn, _iterator13, _step13, element, groups, problems, sqlProblems, queryProblems, body, data, bodyProblems, _iterator14, _step14, problem, _iterator15, _step15, project;

    return _regeneratorRuntime().wrap(function _callee19$(_context23) {
      while (1) {
        switch (_context23.prev = _context23.next) {
          case 0:
            geom = req.body.geom;
            result = [];
            _iterator12 = _createForOfIteratorHelper(COMPONENTS_TABLES);
            _context23.prev = 3;
            _loop7 = /*#__PURE__*/_regeneratorRuntime().mark(function _loop7() {
              var component, type, jurisdiction, cost, problemid, projectid, sql, query, body, _data2;

              return _regeneratorRuntime().wrap(function _loop7$(_context22) {
                while (1) {
                  switch (_context22.prev = _context22.next) {
                    case 0:
                      component = _step12.value;
                      type = component === 'stream_improvement_measure' ? 'component_part_category as type' : 'type';
                      jurisdiction = component === 'stream_improvement_measure' ? 'service_area as jurisdiction' : 'jurisdiction';
                      cost = component === 'stream_improvement_measure' ? 'estimated_cost_base as original_cost' : 'original_cost';
                      problemid = component === 'stream_improvement_measure' ? 'problem_id' : 'problemid';
                      projectid = component === 'stream_improvement_measure' ? 'project_id' : 'projectid';
                      sql = "SELECT cartodb_id, ".concat(type, ", ").concat(jurisdiction, ", status, ").concat(cost, ", ").concat(problemid, "  FROM ").concat(component, " WHERE ST_INTERSECTS(ST_GeomFromGeoJSON('").concat(JSON.stringify(geom), "'), the_geom) AND ").concat(projectid, " is null ");
                      query = {
                        q: sql
                      };
                      console.log(sql);
                      body = {};
                      _context22.prev = 10;
                      _context22.next = 13;
                      return (0, _needle["default"])('post', _config.CARTO_URL, query, {
                        json: true
                      });

                    case 13:
                      _data2 = _context22.sent;

                      //console.log('STATUS', data.statusCode);
                      if (_data2.statusCode === 200) {
                        body = _data2.body;
                        body.rows = body.rows.map(function (element) {
                          return _objectSpread({
                            table: component
                          }, element);
                        });

                        _logger["default"].info(JSON.stringify(body.rows));

                        result = result.concat(body.rows);

                        _logger["default"].info('length ' + result.length); //logger.info(JSON.stringify(body, null, 2));

                      } else {
                        _logger["default"].error('bad status ' + _data2.statusCode + '  -- ' + sql + JSON.stringify(_data2.body, null, 2));
                      }

                      _context22.next = 20;
                      break;

                    case 17:
                      _context22.prev = 17;
                      _context22.t0 = _context22["catch"](10);

                      _logger["default"].error(_context22.t0, 'at', sql);

                    case 20:
                      ;

                    case 21:
                    case "end":
                      return _context22.stop();
                  }
                }
              }, _loop7, null, [[10, 17]]);
            });

            _iterator12.s();

          case 6:
            if ((_step12 = _iterator12.n()).done) {
              _context23.next = 10;
              break;
            }

            return _context23.delegateYield(_loop7(), "t0", 8);

          case 8:
            _context23.next = 6;
            break;

          case 10:
            _context23.next = 15;
            break;

          case 12:
            _context23.prev = 12;
            _context23.t1 = _context23["catch"](3);

            _iterator12.e(_context23.t1);

          case 15:
            _context23.prev = 15;

            _iterator12.f();

            return _context23.finish(15);

          case 18:
            inn = '';
            _iterator13 = _createForOfIteratorHelper(result);

            try {
              for (_iterator13.s(); !(_step13 = _iterator13.n()).done;) {
                element = _step13.value;

                if (element.problemid) {
                  if (inn) {
                    inn += ',';
                  }

                  inn += element.problemid;
                }
              }
            } catch (err) {
              _iterator13.e(err);
            } finally {
              _iterator13.f();
            }

            groups = {
              '-1': {
                problemname: 'No name',
                components: [],
                jurisdiction: '-',
                solutionstatus: '-'
              }
            };
            problems = ['No problem'];

            if (!inn) {
              _context23.next = 38;
              break;
            }

            sqlProblems = "SELECT problemname, problemid, jurisdiction, solutionstatus FROM ".concat(_config.PROBLEM_TABLE, " WHERE problemid IN (").concat(inn, ")");
            queryProblems = {
              q: sqlProblems
            };
            body = {};
            _context23.prev = 27;
            _context23.next = 30;
            return (0, _needle["default"])('post', _config.CARTO_URL, queryProblems, {
              json: true
            });

          case 30:
            data = _context23.sent;

            //console.log('STATUS', data.statusCode);
            if (data.statusCode === 200) {
              body = data.body;

              _logger["default"].info(JSON.stringify(body.rows));

              bodyProblems = body.rows(function (row) {
                return row.problemname;
              });
              _iterator14 = _createForOfIteratorHelper(body);

              try {
                for (_iterator14.s(); !(_step14 = _iterator14.n()).done;) {
                  problem = _step14.value;
                  groups[problem.problemid] = {
                    problemname: problem.problemname,
                    jurisdiction: problem.jurisdiction,
                    solutionstatus: problem.solutionstatus,
                    components: []
                  };
                }
              } catch (err) {
                _iterator14.e(err);
              } finally {
                _iterator14.f();
              }

              problems = problems.concat(bodyProblems);

              _logger["default"].info('length of problems' + problems.length); //logger.info(JSON.stringify(body, null, 2));

            } else {
              _logger["default"].error('bad status ' + data.statusCode + '  -- ' + sql + JSON.stringify(data.body, null, 2));
            }

            _context23.next = 37;
            break;

          case 34:
            _context23.prev = 34;
            _context23.t2 = _context23["catch"](27);

            _logger["default"].error(_context23.t2, 'at', sql);

          case 37:
            ;

          case 38:
            _iterator15 = _createForOfIteratorHelper(result);

            try {
              for (_iterator15.s(); !(_step15 = _iterator15.n()).done;) {
                project = _step15.value;

                if (project.problemid == null) {
                  groups['-1'].components.push(project);
                } else {
                  groups[project.problemid].components.push(project);
                }
              }
            } catch (err) {
              _iterator15.e(err);
            } finally {
              _iterator15.f();
            }

            res.send({
              result: result,
              problems: problems,
              groups: groups
            });

          case 41:
          case "end":
            return _context23.stop();
        }
      }
    }, _callee19, null, [[3, 12, 15, 18], [27, 34]]);
  }));

  return function (_x33, _x34) {
    return _ref19.apply(this, arguments);
  };
}());
router.get('/get-streams-by-projectid/:projectid', [_auth["default"]], /*#__PURE__*/function () {
  var _ref20 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee20(req, res) {
    var projectid, streams, ids, obj, _iterator16, _step16, id, _iterator17, _step17, stream;

    return _regeneratorRuntime().wrap(function _callee20$(_context24) {
      while (1) {
        switch (_context24.prev = _context24.next) {
          case 0:
            projectid = req.params.projectid;
            _context24.prev = 1;
            console.log("THE PROJECT ID WITH STREAMS IS ", projectid);
            _context24.next = 5;
            return _projectStreamService["default"].getAll(projectid);

          case 5:
            streams = _context24.sent;
            ids = streams.map(function (stream) {
              return stream.str_name;
            });
            obj = {};
            _iterator16 = _createForOfIteratorHelper(ids);

            try {
              for (_iterator16.s(); !(_step16 = _iterator16.n()).done;) {
                id = _step16.value;
                obj[id] = [];
              }
            } catch (err) {
              _iterator16.e(err);
            } finally {
              _iterator16.f();
            }

            _iterator17 = _createForOfIteratorHelper(streams);

            try {
              for (_iterator17.s(); !(_step17 = _iterator17.n()).done;) {
                stream = _step17.value;
                obj[stream.str_name].push(stream);
              }
            } catch (err) {
              _iterator17.e(err);
            } finally {
              _iterator17.f();
            }

            return _context24.abrupt("return", res.send(obj));

          case 15:
            _context24.prev = 15;
            _context24.t0 = _context24["catch"](1);
            res.status(500).send(_context24.t0);

          case 18:
          case "end":
            return _context24.stop();
        }
      }
    }, _callee20, null, [[1, 15]]);
  }));

  return function (_x35, _x36) {
    return _ref20.apply(this, arguments);
  };
}());
router.get('/get-components-by-projectid/:projectid', [_auth["default"]], /*#__PURE__*/function () {
  var _ref21 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee21(req, res) {
    var projectid, components;
    return _regeneratorRuntime().wrap(function _callee21$(_context25) {
      while (1) {
        switch (_context25.prev = _context25.next) {
          case 0:
            projectid = req.params.projectid;
            _context25.prev = 1;
            console.log("THE PROJECT ID WITH COMPONENTS IS ", projectid);
            _context25.next = 5;
            return _projectComponentService["default"].getAll(projectid);

          case 5:
            components = _context25.sent;
            return _context25.abrupt("return", res.send(components));

          case 9:
            _context25.prev = 9;
            _context25.t0 = _context25["catch"](1);
            res.status(500).send(_context25.t0);
            console.log(_context25.t0);

          case 13:
          case "end":
            return _context25.stop();
        }
      }
    }, _callee21, null, [[1, 9]]);
  }));

  return function (_x37, _x38) {
    return _ref21.apply(this, arguments);
  };
}());
router.get('/get-independent-components-by-projectid/:projectid', [_auth["default"]], /*#__PURE__*/function () {
  var _ref22 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee22(req, res) {
    var projectid, components;
    return _regeneratorRuntime().wrap(function _callee22$(_context26) {
      while (1) {
        switch (_context26.prev = _context26.next) {
          case 0:
            projectid = req.params.projectid;
            _context26.prev = 1;
            console.log("THE PROJECT ID WITH INDEPENDENT COMPONENTS IS ", projectid);
            _context26.next = 5;
            return _independentService["default"].getAll(projectid);

          case 5:
            components = _context26.sent;
            return _context26.abrupt("return", res.send(components));

          case 9:
            _context26.prev = 9;
            _context26.t0 = _context26["catch"](1);
            res.status(500).send(_context26.t0);

          case 12:
          case "end":
            return _context26.stop();
        }
      }
    }, _callee22, null, [[1, 9]]);
  }));

  return function (_x39, _x40) {
    return _ref22.apply(this, arguments);
  };
}());

var getJurisdictionByGeom = /*#__PURE__*/function () {
  var _ref23 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee23(geom) {
    var sql, query, data;
    return _regeneratorRuntime().wrap(function _callee23$(_context27) {
      while (1) {
        switch (_context27.prev = _context27.next) {
          case 0:
            sql = "SELECT jurisdiction FROM jurisidictions WHERE ST_Dwithin(the_geom, ST_GeomFromGeoJSON('".concat(geom, "'), 0)");
            query = {
              q: sql
            };
            _context27.next = 4;
            return (0, _needle["default"])('post', _config.CARTO_URL, query, {
              json: true
            });

          case 4:
            data = _context27.sent;
            return _context27.abrupt("return", data.body.rows[0].jurisdiction);

          case 6:
          case "end":
            return _context27.stop();
        }
      }
    }, _callee23);
  }));

  return function getJurisdictionByGeom(_x41) {
    return _ref23.apply(this, arguments);
  };
}();

var getAllJurisdictionByGeom = /*#__PURE__*/function () {
  var _ref24 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee24(geom) {
    var sql, query, data;
    return _regeneratorRuntime().wrap(function _callee24$(_context28) {
      while (1) {
        switch (_context28.prev = _context28.next) {
          case 0:
            sql = "SELECT jurisdiction FROM jurisidictions WHERE ST_Dwithin(the_geom, ST_GeomFromGeoJSON('".concat(geom, "'), 0)");
            query = {
              q: sql
            };
            _context28.next = 4;
            return (0, _needle["default"])('post', _config.CARTO_URL, query, {
              json: true
            });

          case 4:
            data = _context28.sent;
            return _context28.abrupt("return", data.body.rows.map(function (element) {
              return element.jurisdiction;
            }));

          case 6:
          case "end":
            return _context28.stop();
        }
      }
    }, _callee24);
  }));

  return function getAllJurisdictionByGeom(_x42) {
    return _ref24.apply(this, arguments);
  };
}();

var getAllJurisdictionByGeomStreams = /*#__PURE__*/function () {
  var _ref25 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee25(geom) {
    var sql, query, data;
    return _regeneratorRuntime().wrap(function _callee25$(_context29) {
      while (1) {
        switch (_context29.prev = _context29.next) {
          case 0:
            sql = "\n  WITH dumped AS (\n    SELECT  (\n            ST_Dump(\n                ST_Intersection( \n                    mhfd_stream_reaches.the_geom, \n        ST_GeomFromGeoJSON('".concat(geom, "')\n                )\n            )\n        ).geom AS the_geom\n    FROM mhfd_stream_reaches\n),\nunioned AS (\n    SELECT ST_Union(the_geom) AS the_geom FROM dumped\n)\nSELECT jurisdiction \nFROM jurisidictions, unioned \nWHERE ST_DWithin( \n    unioned.the_geom, \n    jurisidictions.the_geom, \n    0\n)");
            query = {
              q: sql
            };
            _context29.next = 4;
            return (0, _needle["default"])('post', _config.CARTO_URL, query, {
              json: true
            });

          case 4:
            data = _context29.sent;
            return _context29.abrupt("return", data.body.rows.map(function (element) {
              return element.jurisdiction;
            }));

          case 6:
          case "end":
            return _context29.stop();
        }
      }
    }, _callee25);
  }));

  return function getAllJurisdictionByGeomStreams(_x43) {
    return _ref25.apply(this, arguments);
  };
}();

var _default = router;
exports["default"] = _default;