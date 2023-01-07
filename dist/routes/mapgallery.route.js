"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireWildcard(require("express"));

var _https = _interopRequireDefault(require("https"));

var _needle = _interopRequireDefault(require("needle"));

var _logger = _interopRequireDefault(require("bc/config/logger.js"));

var _config = require("bc/config/config.js");

var _attachmentService = _interopRequireDefault(require("bc/services/attachment.service.js"));

var _mapgalleryComponentRoute = require("bc/routes/mapgallery.component.route.js");

var _mapgalleryProjectRoute = require("bc/routes/mapgallery.project.route.js");

var _mapgalleryProblemRoute = require("bc/routes/mapgallery.problem.route.js");

var _mapgalleryPrintService = require("bc/services/mapgallery.print.service.js");

var _mapgalleryService = require("bc/services/mapgallery.service.js");

var _galleryConstants = require("bc/lib/gallery.constants.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return generator._invoke = function (innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; }(innerFn, self, context), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; this._invoke = function (method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (object) { var keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var router = _express["default"].Router();

var PROJECT_TABLES = [_config.MAIN_PROJECT_TABLE];
var TABLES_COMPONENTS = ['grade_control_structure', 'pipe_appurtenances', 'special_item_point', 'special_item_linear', 'special_item_area', 'channel_improvements_linear', 'channel_improvements_area', 'removal_line', 'removal_area', 'storm_drain', 'detention_facilities', 'maintenance_trails', 'land_acquisition', 'landscaping_area', 'stream_improvement_measure'];
router.post('/', /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(req, res) {
    var filters, PROBLEM_SQL, query, answer, data, _filters, send, PROJECT_FIELDS, result, _iterator, _step, table, _query, _answer, _data, _result, _iterator2, _step2, _answer$push, element, valor, coordinates;

    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            console.log('enter here');

            if (!req.body.isproblem) {
              _context.next = 21;
              break;
            }

            filters = '';
            filters = getFilters(req.body); // 

            PROBLEM_SQL = "SELECT cartodb_id, ".concat(_config.PROPSPROBLEMTABLES.problem_boundary[5], " as ").concat(_config.PROPSPROBLEMTABLES.problems[5], ", ").concat(_config.PROPSPROBLEMTABLES.problem_boundary[6], " as ").concat(_config.PROPSPROBLEMTABLES.problems[6], " , ").concat(_config.PROPSPROBLEMTABLES.problem_boundary[0], " as ").concat(_config.PROPSPROBLEMTABLES.problems[0], ", ").concat(_config.PROPSPROBLEMTABLES.problem_boundary[16], " as ").concat(_config.PROPSPROBLEMTABLES.problems[16], ", ").concat(_config.PROPSPROBLEMTABLES.problem_boundary[17], ",  ").concat(_config.PROPSPROBLEMTABLES.problem_boundary[2], " as ").concat(_config.PROPSPROBLEMTABLES.problems[2], ", ").concat(_config.PROPSPROBLEMTABLES.problem_boundary[7], " as ").concat(_config.PROPSPROBLEMTABLES.problems[7], ", ").concat(_config.PROPSPROBLEMTABLES.problem_boundary[1], " as ").concat(_config.PROPSPROBLEMTABLES.problems[1], ", ").concat(_config.PROPSPROBLEMTABLES.problem_boundary[8], " as ").concat(_config.PROPSPROBLEMTABLES.problems[8], ", county, ").concat(getCountersProblems(_config.PROBLEM_TABLE, _config.PROPSPROBLEMTABLES.problems[5], _config.PROPSPROBLEMTABLES.problem_boundary[5]), ", ST_AsGeoJSON(ST_Envelope(the_geom)) as the_geom FROM ").concat(_config.PROBLEM_TABLE, " ");
            query = {
              q: "".concat(PROBLEM_SQL, " ").concat(filters)
            };
            answer = [];
            _context.prev = 8;
            _context.next = 11;
            return (0, _needle["default"])('post', _config.CARTO_URL, query, {
              json: true
            });

          case 11:
            data = _context.sent;

            //console.log('status', data.statusCode);
            if (data.statusCode === 200) {
              /* let coordinates = [];
              if (JSON.parse(element.the_geom).coordinates) {
                coordinates = JSON.parse(element.the_geom).coordinates;
              } */
              answer = data.body.rows.map(function (element) {
                return {
                  cartodb_id: element.cartodb_id,
                  type: 'problem_boundary',
                  problemid: element.problemid,
                  problemname: element.problemname,
                  solutioncost: element.solutioncost,
                  component_cost: element.component_cost,
                  jurisdiction: element.jurisdiction,
                  problempriority: element.problempriority,
                  solutionstatus: element.solutionstatus,
                  problemtype: element.problemtype,
                  county: element.county,
                  totalComponents: element.component_count,
                  coordinates: JSON.parse(element.the_geom).coordinates ? JSON.parse(element.the_geom).coordinates : []
                };
              });
            } else {
              console.log('bad status', _express.response.statusCode, _express.response.body);

              _logger["default"].error('bad status', _express.response.statusCode, _express.response.body);
            }

            _context.next = 18;
            break;

          case 15:
            _context.prev = 15;
            _context.t0 = _context["catch"](8);
            console.log('Error', _context.t0);

          case 18:
            res.send(answer);
            _context.next = 91;
            break;

          case 21:
            _filters = '';
            send = [];
            _filters = getFilters(req.body);
            PROJECT_FIELDS = 'cartodb_id, objectid, projectid, projecttype, projectsubtype, coverimage, sponsor, finalCost, ' + 'estimatedCost, status, attachments, projectname, jurisdiction, streamname, county, component_cost, component_count ';

            if (!req.body.problemtype) {
              _context.next = 32;
              break;
            }

            _context.next = 28;
            return queriesByProblemTypeInProject(PROJECT_FIELDS, _filters, req.body.problemtype);

          case 28:
            result = _context.sent;
            return _context.abrupt("return", res.status(200).send(result));

          case 32:
            _iterator = _createForOfIteratorHelper(PROJECT_TABLES);
            _context.prev = 33;

            _iterator.s();

          case 35:
            if ((_step = _iterator.n()).done) {
              _context.next = 82;
              break;
            }

            table = _step.value;
            _query = '';

            if (table === _config.MAIN_PROJECT_TABLE) {
              _query = {
                q: "SELECT '".concat(table, "' as type, ").concat(PROJECT_FIELDS, ", ").concat(getCounters(_config.MAIN_PROJECT_TABLE, 'projectid'), ", ST_AsGeoJSON(ST_Envelope(the_geom)) as the_geom FROM ").concat(table, " ").concat(_filters, " ")
              };
              console.log("THIS QUERY ROUTER", _query);
            }

            _answer = [];
            _context.prev = 40;
            _context.next = 43;
            return (0, _needle["default"])('post', _config.CARTO_URL, _query, {
              json: true
            });

          case 43:
            _data = _context.sent;
            console.log('STATUS', _data.statusCode);

            if (!(_data.statusCode === 200)) {
              _context.next = 73;
              break;
            }

            _result = _data.body.rows;
            _iterator2 = _createForOfIteratorHelper(_result);
            _context.prev = 48;

            _iterator2.s();

          case 50:
            if ((_step2 = _iterator2.n()).done) {
              _context.next = 62;
              break;
            }

            element = _step2.value;
            valor = '';

            if (!element.attachments) {
              _context.next = 57;
              break;
            }

            _context.next = 56;
            return _attachmentService["default"].findCoverImage(element.attachments);

          case 56:
            valor = _context.sent;

          case 57:
            coordinates = [];

            if (JSON.parse(element.the_geom).coordinates) {
              coordinates = JSON.parse(element.the_geom).coordinates;
            }

            _answer.push((_answer$push = {
              type: element.type,
              cartodb_id: element.cartodb_id,
              objectid: element.objectid,
              projectid: element.projectid,
              projecttype: element.projecttype,
              projectsubtype: element.projectsubtype,
              coverimage: element.coverimage,
              sponsor: element.sponsor,
              finalcost: element.finalcost,
              component_cost: element.component_cost,
              estimatedcost: element.estimatedcost,
              status: element.status,
              attachments: element.attachments,
              projectname: element.projectname,
              jurisdiction: element.jurisdiction,
              streamname: element.streamname,
              county: element.county
            }, _defineProperty(_answer$push, "attachments", valor), _defineProperty(_answer$push, "totalComponents", element.component_count), _defineProperty(_answer$push, "coordinates", coordinates), _answer$push));

          case 60:
            _context.next = 50;
            break;

          case 62:
            _context.next = 67;
            break;

          case 64:
            _context.prev = 64;
            _context.t1 = _context["catch"](48);

            _iterator2.e(_context.t1);

          case 67:
            _context.prev = 67;

            _iterator2.f();

            return _context.finish(67);

          case 70:
            send = send.concat(_answer);
            _context.next = 74;
            break;

          case 73:
            console.log('bad status ', _data.statusCode, _data.body);

          case 74:
            _context.next = 79;
            break;

          case 76:
            _context.prev = 76;
            _context.t2 = _context["catch"](40);
            console.log(_context.t2);

          case 79:
            ;

          case 80:
            _context.next = 35;
            break;

          case 82:
            _context.next = 87;
            break;

          case 84:
            _context.prev = 84;
            _context.t3 = _context["catch"](33);

            _iterator.e(_context.t3);

          case 87:
            _context.prev = 87;

            _iterator.f();

            return _context.finish(87);

          case 90:
            return _context.abrupt("return", res.send(send));

          case 91:
            _context.next = 97;
            break;

          case 93:
            _context.prev = 93;
            _context.t4 = _context["catch"](0);

            _logger["default"].error(_context.t4);

            res.status(500).send({
              error: _context.t4
            }).send({
              error: 'Error with C connection'
            });

          case 97:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[0, 93], [8, 15], [33, 84, 87, 90], [40, 76], [48, 64, 67, 70]]);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}());

function getCounters(table, column) {
  return " (select count(*) from grade_control_structure where ".concat(column, " = cast(").concat(table, ".").concat(column, " as integer) ) as count_gcs, \n      (select count(*) from pipe_appurtenances where ").concat(column, " = cast(").concat(table, ".").concat(column, " as integer) ) as count_pa,\n      (select count(*) from special_item_point where ").concat(column, " = cast(").concat(table, ".").concat(column, " as integer) ) as count_sip, \n      (select count(*) from special_item_linear where ").concat(column, " = cast(").concat(table, ".").concat(column, " as integer) ) as count_sil, \n      (select count(*) from special_item_area where ").concat(column, " = cast(").concat(table, ".").concat(column, " as integer) ) as count_sia, \n      (select count(*) from channel_improvements_linear where ").concat(column, " = cast(").concat(table, ".").concat(column, " as integer) ) as count_cila, \n      (select count(*) from channel_improvements_area where ").concat(column, " = cast(").concat(table, ".").concat(column, " as integer) ) as count_cia, \n      (select count(*) from  removal_line where ").concat(column, " = cast(").concat(table, ".").concat(column, " as integer) ) as count_rl, \n      (select count(*) from removal_area where ").concat(column, " = cast(").concat(table, ".").concat(column, " as integer) ) as count_ra, \n      (select count(*) from storm_drain where ").concat(column, " = cast(").concat(table, ".").concat(column, " as integer) ) as count_sd, \n      (select count(*) from detention_facilities where ").concat(column, " = cast(").concat(table, ".").concat(column, " as integer) ) as count_df, \n      (select count(*) from maintenance_trails where ").concat(column, " = cast(").concat(table, ".").concat(column, " as integer) ) as count_mt, \n      (select count(*) from land_acquisition where ").concat(column, " = cast(").concat(table, ".").concat(column, " as integer) ) as count_la, \n      (select count(*) from landscaping_area where ").concat(column, " = cast(").concat(table, ".").concat(column, " as integer) ) as count_la1 ");
}

function getCountersProblems(table, column, newcolumn) {
  return " (select count(*) from grade_control_structure where ".concat(column, " = cast(").concat(table, ".").concat(newcolumn, " as integer) ) as count_gcs, \n     (select count(*) from pipe_appurtenances where ").concat(column, " = cast(").concat(table, ".").concat(newcolumn, " as integer) ) as count_pa,\n     (select count(*) from special_item_point where ").concat(column, " = cast(").concat(table, ".").concat(newcolumn, " as integer) ) as count_sip, \n     (select count(*) from special_item_linear where ").concat(column, " = cast(").concat(table, ".").concat(newcolumn, " as integer) ) as count_sil, \n     (select count(*) from special_item_area where ").concat(column, " = cast(").concat(table, ".").concat(newcolumn, " as integer) ) as count_sia, \n     (select count(*) from channel_improvements_linear where ").concat(column, " = cast(").concat(table, ".").concat(newcolumn, " as integer) ) as count_cila, \n     (select count(*) from channel_improvements_area where ").concat(column, " = cast(").concat(table, ".").concat(newcolumn, " as integer) ) as count_cia, \n     (select count(*) from  removal_line where ").concat(column, " = cast(").concat(table, ".").concat(newcolumn, " as integer) ) as count_rl, \n     (select count(*) from removal_area where ").concat(column, " = cast(").concat(table, ".").concat(newcolumn, " as integer) ) as count_ra, \n     (select count(*) from storm_drain where ").concat(column, " = cast(").concat(table, ".").concat(newcolumn, " as integer) ) as count_sd, \n     (select count(*) from detention_facilities where ").concat(column, " = cast(").concat(table, ".").concat(newcolumn, " as integer) ) as count_df, \n     (select count(*) from maintenance_trails where ").concat(column, " = cast(").concat(table, ".").concat(newcolumn, " as integer) ) as count_mt, \n     (select count(*) from land_acquisition where ").concat(column, " = cast(").concat(table, ".").concat(newcolumn, " as integer) ) as count_la, \n     (select count(*) from landscaping_area where ").concat(column, " = cast(").concat(table, ".").concat(newcolumn, " as integer) ) as count_la1 ");
}

function getFilters(params) {
  //console.log('PARAMS', params);
  var filters = '';
  var tipoid = '';
  var hasProjectType = false;
  var VALUES_COMPONENTS = ['grade_control_structure', 'pipe_appurtenances', 'special_item_point', 'special_item_linear', 'special_item_area', 'channel_improvements_linear', 'channel_improvements_area', 'removal_line', 'removal_area', 'storm_drain', 'detention_facilities', 'maintenance_trails', 'land_acquisition', 'landscaping_area'];

  if (params.isproblem) {
    // console.log('PROBLEMS');
    tipoid = 'problemid';

    if (params.name) {
      if (filters.length > 0) {
        filters = filters = " and (".concat(_config.PROPSPROBLEMTABLES.problem_boundary[6], " ilike '%").concat(params.name, "%' OR ").concat(_config.PROPSPROBLEMTABLES.problem_boundary[5], "::text ilike '%").concat(params.name, "%')");
      } else {
        filters = " (".concat(_config.PROPSPROBLEMTABLES.problem_boundary[6], " ilike '%").concat(params.name, "%' OR ").concat(_config.PROPSPROBLEMTABLES.problem_boundary[5], "::text ilike '%").concat(params.name, "%') ");
      }
    }

    if (params.problemtype) {
      var query = createQueryForIn(params.problemtype.split(','));

      if (filters.length > 0) {
        filters = filters + " and ".concat(_config.PROPSPROBLEMTABLES.problem_boundary[8], " in (").concat(query, ") ");
      } else {
        filters = " ".concat(_config.PROPSPROBLEMTABLES.problem_boundary[8], " in (").concat(query, ") ");
      }
    }
  } else {
    // console.log('PROJECTS ROU');
    tipoid = 'projectid';

    if (params.name) {
      if (filters.length > 0) {
        filters = " and (projectname ilike '%".concat(params.name, "%' OR onbaseid::text ilike '%").concat(params.name, "%') ");
      } else {
        filters = " (projectname ilike '%".concat(params.name, "%' OR onbaseid::text ilike '%").concat(params.name, "%') ");
      }
    } // console.log("ID AQUI", params );


    if (params.problemtype) {}
  } // components


  if (params.componenttype) {
    //console.log('COMPONENTS FILTER', params.componenttype);
    var values = params.componenttype.split(',');
    var _query2 = '';
    var operator = '';

    var _iterator3 = _createForOfIteratorHelper(values),
        _step3;

    try {
      for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
        var component = _step3.value;
        _query2 += operator + " ".concat(tipoid, " in (select ").concat(tipoid, " from ").concat(component, " where ").concat(component, ".").concat(tipoid, "=").concat(tipoid, ") ");
        operator = ' or ';
      }
    } catch (err) {
      _iterator3.e(err);
    } finally {
      _iterator3.f();
    }

    if (filters.length > 0) {
      filters += " AND (".concat(_query2, ")");
    } else {
      filters = " (".concat(_query2, ")");
    }
  }

  if (params.componentstatus) {
    var _values = createQueryForIn(params.componentstatus.split(','));

    var _query3 = '';
    var _operator = ''; // for (const value of values) {

    var _iterator4 = _createForOfIteratorHelper(VALUES_COMPONENTS),
        _step4;

    try {
      for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
        var _component = _step4.value;
        _query3 += _operator + " ".concat(tipoid, " in (select ").concat(tipoid, " from ").concat(_component, " where status in (").concat(_values, ")) ");
        _operator = ' or ';
      } //}

    } catch (err) {
      _iterator4.e(err);
    } finally {
      _iterator4.f();
    }

    if (filters.length > 0) {
      filters += " AND (".concat(_query3, ")");
    } else {
      filters = " (".concat(_query3, ")");
    }
  }

  if (params.watershed) {
    var _values2 = createQueryForIn(params.watershed.split(','));

    var _query4 = '';
    var _operator2 = ''; //for (const value of values) {

    var _iterator5 = _createForOfIteratorHelper(VALUES_COMPONENTS),
        _step5;

    try {
      for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
        var _component2 = _step5.value;
        _query4 += _operator2 + " ".concat(tipoid, " in (select ").concat(tipoid, " from ").concat(_component2, " where ").concat(_component2, ".").concat(tipoid, "=").concat(tipoid, " and mhfdmanager in (").concat(_values2, ")) ");
        _operator2 = ' or ';
      } //}

    } catch (err) {
      _iterator5.e(err);
    } finally {
      _iterator5.f();
    }

    if (filters.length > 0) {
      filters += " AND (".concat(_query4, ")");
    } else {
      filters = " (".concat(_query4, ")");
    }
  }

  if (params.yearofstudy) {
    var _values3 = params.yearofstudy.split(',');

    var _query5 = '';
    var _operator3 = '';

    var _iterator6 = _createForOfIteratorHelper(_values3),
        _step6;

    try {
      for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
        var value = _step6.value;

        //const initValue = value;
        var _iterator7 = _createForOfIteratorHelper(VALUES_COMPONENTS),
            _step7;

        try {
          for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
            var _component3 = _step7.value;
            _query5 += _operator3 + " ".concat(tipoid, " in (select ").concat(tipoid, " from ").concat(_component3, " where ").concat(_component3, ".").concat(tipoid, "=").concat(tipoid, " and year_of_study between ").concat(value, " and ").concat(value + 9, ") ");
            _operator3 = ' or ';
          }
        } catch (err) {
          _iterator7.e(err);
        } finally {
          _iterator7.f();
        }
      }
    } catch (err) {
      _iterator6.e(err);
    } finally {
      _iterator6.f();
    }

    if (filters.length > 0) {
      filters += " AND (".concat(_query5, ")");
    } else {
      filters = " (".concat(_query5, ")");
    }
  }

  if (params.estimatedcostComp && params.estimatedcostComp.length > 0) {
    var _query6 = '';
    var _operator4 = '';

    var _iterator8 = _createForOfIteratorHelper(params.estimatedcostComp),
        _step8;

    try {
      for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
        var _value = _step8.value;

        var _values4 = _value.split(',');

        var _iterator9 = _createForOfIteratorHelper(VALUES_COMPONENTS),
            _step9;

        try {
          for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) {
            var _component4 = _step9.value;
            _query6 += _operator4 + " (".concat(tipoid, " in (select ").concat(tipoid, " from ").concat(_component4, " where ").concat(_component4, ".").concat(tipoid, "=").concat(tipoid, " and estimated_cost > 0 and estimated_cost between ").concat(_values4[0], " and ").concat(_values4[1], " )) ");
            _operator4 = ' or ';
          }
        } catch (err) {
          _iterator9.e(err);
        } finally {
          _iterator9.f();
        }
      }
    } catch (err) {
      _iterator8.e(err);
    } finally {
      _iterator8.f();
    }

    if (filters.length > 0) {
      filters = "and (".concat(_query6, ")");
    } else {
      filters = " (".concat(_query6, ")");
    }
  }

  if (params.jurisdictionComp) {
    var _values5 = createQueryForIn(params.jurisdictionComp.split(','));

    var _query7 = '';
    var _operator5 = ''; //const initValue = value;

    var _iterator10 = _createForOfIteratorHelper(VALUES_COMPONENTS),
        _step10;

    try {
      for (_iterator10.s(); !(_step10 = _iterator10.n()).done;) {
        var _component5 = _step10.value;
        _query7 += _operator5 + " ".concat(tipoid, " in (select ").concat(tipoid, " from ").concat(_component5, " where ").concat(_component5, ".").concat(tipoid, "=").concat(tipoid, " and ").concat(params.isproblem ? _config.PROPSPROBLEMTABLES.problem_boundary[2] : _config.PROPSPROBLEMTABLES.problems[2], " in (").concat(_values5, ") ) ");
        _operator5 = ' or ';
      }
    } catch (err) {
      _iterator10.e(err);
    } finally {
      _iterator10.f();
    }

    if (filters.length > 0) {
      filters += " AND (".concat(_query7, ")");
    } else {
      filters = " (".concat(_query7, ")");
    }
  }

  if (params.countyComp) {
    var _values6 = createQueryForIn(params.countyComp.split(','));

    var _query8 = '';
    var _operator6 = ''; //const initValue = value;

    var _iterator11 = _createForOfIteratorHelper(VALUES_COMPONENTS),
        _step11;

    try {
      for (_iterator11.s(); !(_step11 = _iterator11.n()).done;) {
        var _component6 = _step11.value;
        _query8 += _operator6 + " ".concat(tipoid, " in (select ").concat(tipoid, " from ").concat(_component6, " where ").concat(_component6, ".").concat(tipoid, "=").concat(tipoid, " and county in (").concat(_values6, ") ) ");
        _operator6 = ' or ';
      }
    } catch (err) {
      _iterator11.e(err);
    } finally {
      _iterator11.f();
    }

    if (filters.length > 0) {
      filters += " AND (".concat(_query8, ")");
    } else {
      filters = " (".concat(_query8, ")");
    }
  } // ALL FILTERS
  // PROBLEMS 


  if (params.priority) {
    var _query9 = createQueryForIn(params.priority.split(','));

    if (filters.length > 0) {
      filters = filters + " and ".concat(params.isproblem ? _config.PROPSPROBLEMTABLES.problem_boundary[7] : _config.PROPSPROBLEMTABLES.problems[7], " in (").concat(_query9, ")");
    } else {
      filters = " ".concat(params.isproblem ? _config.PROPSPROBLEMTABLES.problem_boundary[7] : _config.PROPSPROBLEMTABLES.problems[7], " in (").concat(_query9, ")");
    }
  }

  if (params.solutionstatus) {
    var limite = 0;
    console.log('SOLUTIONS', params.solutionstatus);

    var _values7 = params.solutionstatus.split(',');

    var _query10 = '';
    var _operator7 = '';

    var _iterator12 = _createForOfIteratorHelper(_values7),
        _step12;

    try {
      for (_iterator12.s(); !(_step12 = _iterator12.n()).done;) {
        var val = _step12.value;
        limite = Number(val) + 25;
        _query10 += _operator7 + " (cast(".concat(params.isproblem ? _config.PROPSPROBLEMTABLES.problem_boundary[1] : _config.PROPSPROBLEMTABLES.problems[1], " as int) between ").concat(val, " and ").concat(limite, ") ");
        _operator7 = ' or ';
      }
    } catch (err) {
      _iterator12.e(err);
    } finally {
      _iterator12.f();
    }

    if (filters.length > 0) {
      filters = filters + " and ".concat(_query10, " ");
    } else {
      filters = " ".concat(_query10, " ");
    }
  }

  if (params.cost && params.cost.length > 0) {
    var _query11 = '';
    var _operator8 = '';

    var _iterator13 = _createForOfIteratorHelper(params.cost),
        _step13;

    try {
      for (_iterator13.s(); !(_step13 = _iterator13.n()).done;) {
        var _val = _step13.value;

        var _values8 = _val.split(',');

        _query11 += _operator8 + " (cast(".concat(params.isproblem ? _config.PROPSPROBLEMTABLES.problem_boundary[0] : _config.PROPSPROBLEMTABLES.problems[0], " as bigint) between ").concat(_values8[0], " and ").concat(_values8[1], ")");
        _operator8 = ' or ';
      }
    } catch (err) {
      _iterator13.e(err);
    } finally {
      _iterator13.f();
    }

    if (filters.length > 0) {
      filters += " and ".concat(_query11);
    } else {
      filters = " ".concat(_query11);
    }
  }

  if (params.servicearea) {
    var _query12 = createQueryForIn(params.servicearea.split(','));

    if (filters.length > 0) {
      filters += " and ".concat(params.isproblem ? _config.PROPSPROBLEMTABLES.problem_boundary[9] : _config.PROPSPROBLEMTABLES.problems[9], " in (").concat(_query12, ")");
    } else {
      filters = " ".concat(params.isproblem ? _config.PROPSPROBLEMTABLES.problem_boundary[9] : _config.PROPSPROBLEMTABLES.problems[9], " in (").concat(_query12, ")");
    }
  }

  if (params.mhfdmanager) {
    var _query13 = createQueryForIn(params.mhfdmanager.split(','));

    if (filters.length > 0) {
      filters = filters + " and ".concat(params.isproblem ? _config.PROPSPROBLEMTABLES.problem_boundary[3] : _config.PROPSPROBLEMTABLES.problems[3], " in (").concat(_query13, ")");
    } else {
      filters = "".concat(params.isproblem ? _config.PROPSPROBLEMTABLES.problem_boundary[3] : _config.PROPSPROBLEMTABLES.problems[3], " in (").concat(_query13, ")");
    }
  }

  if (params.source) {
    var _query14 = createQueryForIn(params.source.split(','));

    if (filters.length > 0) {
      filters = filters + " and ".concat(params.isproblem ? _config.PROPSPROBLEMTABLES.problem_boundary[14] : _config.PROPSPROBLEMTABLES.problems[14], " in (").concat(_query14, ") ");
    } else {
      filters = " ".concat(params.isproblem ? _config.PROPSPROBLEMTABLES.problem_boundary[14] : _config.PROPSPROBLEMTABLES.problems[14], " in (").concat(_query14, ") ");
    }
  }

  if (params.components) {
    //console.log('COMPONENTES', params.components);
    var _values9 = params.components.split(',');

    var _query15 = '';
    var _operator9 = '';

    var _iterator14 = _createForOfIteratorHelper(_values9),
        _step14;

    try {
      for (_iterator14.s(); !(_step14 = _iterator14.n()).done;) {
        var _val2 = _step14.value;
        _query15 += _operator9 + " ".concat(params.isproblem ? _config.PROPSPROBLEMTABLES.problem_boundary[5] : _config.PROPSPROBLEMTABLES.problems[5], " in (select ").concat(params.isproblem ? _config.PROPSPROBLEMTABLES.problem_boundary[5] : _config.PROPSPROBLEMTABLES.problems[5], " from ").concat(_val2, ")");
        _operator9 = ' or ';
      }
    } catch (err) {
      _iterator14.e(err);
    } finally {
      _iterator14.f();
    }

    if (filters.length > 0) {
      filters += " and ".concat(_query15, " ");
    } else {
      filters = " ".concat(_query15, " ");
    }
  } // PROJECTS


  if (params.projecttype) {
    var _query16 = createQueryForIn(params.projecttype.split(','));

    if (filters.length > 0) {
      filters = filters + " and projecttype in (".concat(_query16, ")");
    } else {
      filters = "projecttype in (".concat(_query16, ")");
    }

    hasProjectType = true;
  }

  if (params.consultant) {
    var _query17 = createQueryForIn(params.consultant.split(','));

    if (filters.length > 0) {
      filters += " and consultant in (".concat(_query17, ") ");
    } else {
      filters = " consultant in (".concat(_query17, ")");
    }
  }

  if (params.contractor) {
    var _query18 = createQueryForIn(params.contractor.split(','));

    if (filters.length > 0) {
      filters += " and contractor in (".concat(_query18, ") ");
    } else {
      filters = " contractor in (".concat(_query18, ")");
    }
  }

  if (params.status) {
    var _query19 = createQueryForIn(params.status.split(','));

    if (filters.length > 0) {
      filters = filters + " and status in (".concat(_query19, ")");
    } else {
      filters = "status in (".concat(_query19, ")");
    }
  }

  if (params.startyear) {
    if (filters.length > 0) {
      filters = filters + " and startyear = ".concat(params.startyear, " ");
    } else {
      filters = "startyear = ".concat(params.startyear, " ");
    }
  }

  if (params.completedyear) {
    if (filters.length > 0) {
      filters = filters + " and ".concat(_config.COMPLETE_YEAR_COLUMN, " = ").concat(params.completedyear, " ");
    } else {
      filters = " ".concat(_config.COMPLETE_YEAR_COLUMN, " = ").concat(params.completedyear, " ");
    }
  }

  if (params.mhfddollarsallocated && params.mhfddollarsallocated.length > 0) {
    var _query20 = '';
    var _operator10 = '';

    var _iterator15 = _createForOfIteratorHelper(params.mhfddollarsallocated),
        _step15;

    try {
      for (_iterator15.s(); !(_step15 = _iterator15.n()).done;) {
        var mhfddolar = _step15.value;

        var _values10 = mhfddolar.split(',');

        _query20 += _operator10 + " (cast(mhfddollarsallocated as bigint) between ".concat(_values10[0], " and ").concat(_values10[1], ")");
        _operator10 = ' or ';
      }
    } catch (err) {
      _iterator15.e(err);
    } finally {
      _iterator15.f();
    }

    if (filters.length > 0) {
      filters = filters + " and (".concat(_query20, ")");
    } else {
      filters = " (".concat(_query20, ") ");
    }
  }

  if (params.totalcost && params.totalcost.length > 0) {
    var _query21 = '';
    var _operator11 = '';

    var _iterator16 = _createForOfIteratorHelper(params.totalcost),
        _step16;

    try {
      for (_iterator16.s(); !(_step16 = _iterator16.n()).done;) {
        var cost = _step16.value;

        var _values11 = cost.split(',');

        _query21 += _operator11 + " (coalesce(cast(finalcost as real), cast(estimatedcost as real)) between ".concat(_values11[0], " and ").concat(_values11[1], ") ");
        _operator11 = ' or ';
      }
    } catch (err) {
      _iterator16.e(err);
    } finally {
      _iterator16.f();
    }

    if (filters.length > 0) {
      filters += " and (".concat(_query21, ") ");
    } else {
      filters = " (".concat(_query21, ") ");
    }
  }

  if (params.workplanyear) {
    var _values12 = params.workplanyear.split(',');

    var _query22 = '';
    var _operator12 = '';

    var _iterator17 = _createForOfIteratorHelper(_values12),
        _step17;

    try {
      for (_iterator17.s(); !(_step17 = _iterator17.n()).done;) {
        var year = _step17.value;

        //console.log(year);
        switch (year) {
          case "2019":
            {
              _query22 += _operator12 + " workplanyr1 > 0";
              break;
            }

          case "2020":
            {
              _query22 += _operator12 + " workplanyr2 > 0";
              break;
            }

          case "2021":
            {
              _query22 += _operator12 + " workplanyr3 > 0";
              break;
            }

          case "2022":
            {
              _query22 += _operator12 + " workplanyr4 > 0";
              break;
            }

          case "2023":
            {
              _query22 += _operator12 + " workplanyr5 > 0";
              break;
            }
        }

        _operator12 = ' or ';
      } //console.log(query);

    } catch (err) {
      _iterator17.e(err);
    } finally {
      _iterator17.f();
    }

    if (filters.length > 0) {
      filters += " and (".concat(_query22, ") ");
    } else {
      filters = " (".concat(_query22, ") ");
    }
  }

  if (params.lgmanager) {
    var _query23 = createQueryForIn(params.lgmanager.split(','));

    if (filters.length > 0) {
      filters = filters + " and lgmanager in (".concat(_query23, ") ");
    } else {
      filters = " lgmanager in (".concat(_query23, ") ");
    }
  }

  if (params.streamname) {
    var _query24 = createQueryForIn(params.streamname.split(','));

    if (filters.length > 0) {
      filters = filters + " and ".concat(params.isproblem ? _config.PROPSPROBLEMTABLES.problem_boundary[15] : _config.PROPSPROBLEMTABLES.problems[15], " in (").concat(_query24, ") ");
    } else {
      filters = " ".concat(params.isproblem ? _config.PROPSPROBLEMTABLES.problem_boundary[15] : _config.PROPSPROBLEMTABLES.problems[15], " in (").concat(_query24, ") ");
    }
  }

  if (params.creator) {
    var _query25 = createQueryForIn(params.creator.split(','));

    if (filters.length > 0) {
      filters = filters + " and creator in (".concat(_query25, ") ");
    } else {
      filters = " creator in (".concat(_query25, ") ");
    }
  } // 


  if (params.bounds) {
    var coords = params.bounds.split(',');
    filters = filters.trim();

    if (filters.length > 0) {
      filters += " and (ST_Contains(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), the_geom) or ");
      filters += "ST_Intersects(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), the_geom))"); // only for readbility 
    } else {
      filters = "(ST_Contains(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), the_geom) or ");
      filters += "ST_Intersects(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), the_geom))"); // only for readbility 
    }
  }

  if (params.county) {
    var _query26 = createQueryForIn(params.county.split(','));

    if (filters.length > 0) {
      filters = filters + " and county in (".concat(_query26, ")");
    } else {
      filters = "county in (".concat(_query26, ")");
    }
  }

  if (params.jurisdiction) {
    //const data = params.jurisdiction.split(',');
    var _query27 = createQueryForIn(params.jurisdiction.split(','));

    if (filters.length > 0) {
      filters = filters + " and ".concat(params.isproblem ? _config.PROPSPROBLEMTABLES.problem_boundary[2] : _config.PROPSPROBLEMTABLES.problems[2], " in (").concat(_query27, ")");
    } else {
      filters = " ".concat(params.isproblem ? _config.PROPSPROBLEMTABLES.problem_boundary[2] : _config.PROPSPROBLEMTABLES.problems[2], " in (").concat(_query27, ")");
    }
  }

  if (!hasProjectType && !params.isproblem) {
    if (filters.length > 0) {
      filters += " and projecttype in ('Capital', 'Study', 'Maintenance')";
    } else {
      filters = "projecttype in ('Capital', 'Study', 'Maintenance')";
    }
  }

  if (filters.length > 0) {
    filters = ' where ' + filters;
  }

  if (params.sortby) {
    var sorttype = '';
    var sortby = params.sortby;

    if (params.sortby === 'estimatedcost') {
      sortby = " (coalesce(".concat(params.sortby, "::real, 0)) ");
    }

    if (params.sortby === 'projectname') {
      sortby = " coalesce(projectname, '')";
    }

    if (!params.sorttype) {
      sorttype = 'desc';
    } else {
      sorttype = params.sorttype;
    }

    filters += " order by ".concat(sortby, " ").concat(sorttype);
  }

  if (params.limit && params.page) {
    filters = " limit= ".concat(limit, " offset=").concat(params.page * params.limit);
  }

  return filters;
}

function createQueryForIn(data) {
  var query = '';
  var separator = '';

  var _iterator18 = _createForOfIteratorHelper(data),
      _step18;

  try {
    for (_iterator18.s(); !(_step18 = _iterator18.n()).done;) {
      var elem = _step18.value;
      query += separator + '\'' + elem.trim() + '\'';
      separator = ',';
    }
  } catch (err) {
    _iterator18.e(err);
  } finally {
    _iterator18.f();
  }

  return query;
}

function createQueryByProblemType(problemType, project) {
  var VALUES_COMPONENTS = ['grade_control_structure', 'pipe_appurtenances', 'special_item_point', 'special_item_linear', 'special_item_area', 'channel_improvements_linear', 'channel_improvements_area', 'removal_line', 'removal_area', 'storm_drain', 'detention_facilities', 'maintenance_trails', 'land_acquisition', 'landscaping_area'];
  var operator = '';
  var query = '';

  for (var _i = 0, _VALUES_COMPONENTS = VALUES_COMPONENTS; _i < _VALUES_COMPONENTS.length; _i++) {
    var component = _VALUES_COMPONENTS[_i];
    query += operator + " select projectid from ".concat(component, ", ").concat(_config.PROBLEM_TABLE, " where projectid = ").concat(project, ".projectid \n    and ").concat(component, ".problemid = ").concat(_config.PROBLEM_TABLE, ".problemid and problemtype='").concat(problemType, "' ");
    operator = ' union ';
  }

  query = " projectid in (".concat(query, ")");
  return query;
}

function queriesByProblemTypeInProject(_x3, _x4, _x5) {
  return _queriesByProblemTypeInProject.apply(this, arguments);
}

function _queriesByProblemTypeInProject() {
  _queriesByProblemTypeInProject = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee18(project_fields, filters, problemTypes) {
    var send, values, _iterator26, _step26, type, _iterator27, _step27, table, newfilter, query, data, answer, result, _iterator28, _step28, _answer$push2, element, valor;

    return _regeneratorRuntime().wrap(function _callee18$(_context18) {
      while (1) {
        switch (_context18.prev = _context18.next) {
          case 0:
            // , res
            send = [];
            values = problemTypes.split(','); //console.log('VALORES', values);

            _iterator26 = _createForOfIteratorHelper(values);
            _context18.prev = 3;

            _iterator26.s();

          case 5:
            if ((_step26 = _iterator26.n()).done) {
              _context18.next = 60;
              break;
            }

            type = _step26.value;
            _iterator27 = _createForOfIteratorHelper(PROJECT_TABLES);
            _context18.prev = 8;

            _iterator27.s();

          case 10:
            if ((_step27 = _iterator27.n()).done) {
              _context18.next = 50;
              break;
            }

            table = _step27.value;
            //console.log('TABLE', table);
            newfilter = createQueryByProblemType(type, table);
            query = ''; //console.log('filtros ANTES', filters);

            if (filters.length > 0) {
              newfilter = " where ".concat(newfilter, " and ") + filters.substr(6, filters.length);
            } else {
              newfilter = " where ".concat(newfilter);
            }

            if (table === _config.MAIN_PROJECT_TABLE) {
              query = {
                q: "SELECT '".concat(table, "' as type, ").concat(project_fields, ", ").concat(getCounters(_config.MAIN_PROJECT_TABLE, 'projectid'), " FROM ").concat(table, " ").concat(newfilter, " ")
              };
            }

            _context18.next = 18;
            return (0, _needle["default"])('post', _config.CARTO_URL, query, {
              json: true
            });

          case 18:
            data = _context18.sent;
            answer = [];
            console.log('STATUS', data.statusCode);

            if (!(data.statusCode === 200)) {
              _context18.next = 47;
              break;
            }

            result = data.body.rows; //console.log('RESULTADO', result);

            _iterator28 = _createForOfIteratorHelper(result);
            _context18.prev = 24;

            _iterator28.s();

          case 26:
            if ((_step28 = _iterator28.n()).done) {
              _context18.next = 36;
              break;
            }

            element = _step28.value;
            valor = '';

            if (!element.attachments) {
              _context18.next = 33;
              break;
            }

            _context18.next = 32;
            return _attachmentService["default"].findByName(element.attachments);

          case 32:
            valor = _context18.sent;

          case 33:
            answer.push((_answer$push2 = {
              type: element.type,
              cartodb_id: element.cartodb_id,
              objectid: element.objectid,
              projectid: element.projectid,
              projecttype: element.projecttype,
              projectsubtype: element.projectsubtype,
              coverimage: element.coverimage,
              sponsor: element.sponsor,
              finalcost: element.finalcost,
              estimatedcost: element.estimatedcost,
              status: element.status,
              attachments: element.attachments,
              projectname: element.projectname,
              jurisdiction: element.jurisdiction,
              streamname: element.streamname,
              county: element.county
            }, _defineProperty(_answer$push2, "attachments", valor), _defineProperty(_answer$push2, "totalComponents", element.count_gcs + element.count_pa + element.count_sip + element.count_sil + element.count_cia + element.count_sia + element.count_rl + element.count_ra + element.count_sd + element.count_df + element.count_mt + element.count_la + element.count_la + element.count_la1 + element.count_cila), _answer$push2));

          case 34:
            _context18.next = 26;
            break;

          case 36:
            _context18.next = 41;
            break;

          case 38:
            _context18.prev = 38;
            _context18.t0 = _context18["catch"](24);

            _iterator28.e(_context18.t0);

          case 41:
            _context18.prev = 41;

            _iterator28.f();

            return _context18.finish(41);

          case 44:
            //console.log('DATOS', type, answer);
            send = send.concat(answer);
            _context18.next = 48;
            break;

          case 47:
            console.log('bad status ', _express.response.statusCode, _express.response.body);

          case 48:
            _context18.next = 10;
            break;

          case 50:
            _context18.next = 55;
            break;

          case 52:
            _context18.prev = 52;
            _context18.t1 = _context18["catch"](8);

            _iterator27.e(_context18.t1);

          case 55:
            _context18.prev = 55;

            _iterator27.f();

            return _context18.finish(55);

          case 58:
            _context18.next = 5;
            break;

          case 60:
            _context18.next = 65;
            break;

          case 62:
            _context18.prev = 62;
            _context18.t2 = _context18["catch"](3);

            _iterator26.e(_context18.t2);

          case 65:
            _context18.prev = 65;

            _iterator26.f();

            return _context18.finish(65);

          case 68:
            return _context18.abrupt("return", send);

          case 69:
          case "end":
            return _context18.stop();
        }
      }
    }, _callee18, null, [[3, 62, 65, 68], [8, 52, 55, 58], [24, 38, 41, 44]]);
  }));
  return _queriesByProblemTypeInProject.apply(this, arguments);
}

router.post('/project-by-ids/pdf', /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(req, res) {
    var projectid, map, data, components, pdfObject;
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            projectid = req.query.projectid;
            map = req.body.map;
            _context2.next = 4;
            return (0, _mapgalleryService.getDataByProjectIds)(projectid, false);

          case 4:
            data = _context2.sent;
            components = [];

            if (!data.projectid) {
              _context2.next = 10;
              break;
            }

            _context2.next = 9;
            return componentsByEntityId(data.projectid, 'projectid', 'type', 'asc');

          case 9:
            components = _context2.sent;

          case 10:
            _context2.prev = 10;
            _context2.next = 13;
            return (0, _mapgalleryPrintService.printProject)(data, components, map);

          case 13:
            pdfObject = _context2.sent;
            pdfObject.toBuffer(function (err, buffer) {
              if (err) return res.send(err);
              res.type('pdf');
              res.end(buffer, 'binary');
            });
            _context2.next = 21;
            break;

          case 17:
            _context2.prev = 17;
            _context2.t0 = _context2["catch"](10);

            _logger["default"].error(_context2.t0);

            res.status(500).send({
              error: 'Not able to generated PDF.'
            });

          case 21:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[10, 17]]);
  }));

  return function (_x6, _x7) {
    return _ref2.apply(this, arguments);
  };
}());
router.get('/project-by-ids', /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(req, res) {
    var projectid, data;
    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            projectid = req.query.projectid;
            _context3.prev = 1;
            _context3.next = 4;
            return (0, _mapgalleryService.getDataByProjectIds)(projectid, false);

          case 4:
            data = _context3.sent;
            res.status(200).send(data);
            _context3.next = 12;
            break;

          case 8:
            _context3.prev = 8;
            _context3.t0 = _context3["catch"](1);

            _logger["default"].error(_context3.t0);

            res.status(500).send({
              error: 'No there data with ID'
            });

          case 12:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[1, 8]]);
  }));

  return function (_x8, _x9) {
    return _ref3.apply(this, arguments);
  };
}());

var getEnvelopeOfProblemAndProblemParts = function getEnvelopeOfProblemAndProblemParts(problem_id) {
  var querypart = ["select the_geom from ".concat(_config.PROBLEM_TABLE, " where ").concat(_config.PROPSPROBLEMTABLES.problem_boundary[5], "='").concat(problem_id, "'")];
  var tables = _config.PROBLEM_PART_TABLES;

  var _iterator19 = _createForOfIteratorHelper(tables),
      _step19;

  try {
    for (_iterator19.s(); !(_step19 = _iterator19.n()).done;) {
      var element = _step19.value;
      querypart.push("select the_geom from ".concat(element, " where ").concat(_config.PROPSPROBLEMTABLES.problem_boundary[5], "='").concat(problem_id, "'"));
    }
  } catch (err) {
    _iterator19.e(err);
  } finally {
    _iterator19.f();
  }

  return "ST_Envelope(ST_collect(array(".concat(querypart.join(' union '), ")))");
};

var getDataByProblemId = /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(id) {
    var PROBLEM_SQL, URL, data, result, resultComponents;
    return _regeneratorRuntime().wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            PROBLEM_SQL = "SELECT ST_AsGeoJSON(".concat(getEnvelopeOfProblemAndProblemParts(id), ") as the_geom, cartodb_id,\n    objectid, ").concat(_config.PROPSPROBLEMTABLES.problem_boundary[5], " as ").concat(_config.PROPSPROBLEMTABLES.problems[5], ", ").concat(_config.PROPSPROBLEMTABLES.problem_boundary[6], " as ").concat(_config.PROPSPROBLEMTABLES.problems[6], ", ").concat(_config.PROPSPROBLEMTABLES.problem_boundary[4], " as ").concat(_config.PROPSPROBLEMTABLES.problems[4], ", ").concat(_config.PROPSPROBLEMTABLES.problem_boundary[8], " as ").concat(_config.PROPSPROBLEMTABLES.problems[8], ",\n    ").concat(_config.PROPSPROBLEMTABLES.problem_boundary[7], " as ").concat(_config.PROPSPROBLEMTABLES.problems[7], ", ").concat(_config.PROPSPROBLEMTABLES.problem_boundary[14], " as ").concat(_config.PROPSPROBLEMTABLES.problems[14], ", ").concat(_config.PROPSPROBLEMTABLES.problem_boundary[13], " as ").concat(_config.PROPSPROBLEMTABLES.problems[13], ", ").concat(_config.PROPSPROBLEMTABLES.problem_boundary[0], " as ").concat(_config.PROPSPROBLEMTABLES.problems[0], ", ").concat(_config.PROPSPROBLEMTABLES.problem_boundary[16], " as ").concat(_config.PROPSPROBLEMTABLES.problems[16], ", ").concat(_config.PROPSPROBLEMTABLES.problem_boundary[1], " as ").concat(_config.PROPSPROBLEMTABLES.problems[1], ",\n    ").concat(_config.PROPSPROBLEMTABLES.problem_boundary[3], " as ").concat(_config.PROPSPROBLEMTABLES.problems[3], ", ").concat(_config.PROPSPROBLEMTABLES.problem_boundary[9], " as ").concat(_config.PROPSPROBLEMTABLES.problems[9], ", county,").concat(_config.PROPSPROBLEMTABLES.problem_boundary[2], " as ").concat(_config.PROPSPROBLEMTABLES.problems[2], ", ").concat(_config.PROPSPROBLEMTABLES.problem_boundary[15], " as ").concat(_config.PROPSPROBLEMTABLES.problems[15], ",\n    ").concat(_config.PROPSPROBLEMTABLES.problem_boundary[12], " as ").concat(_config.PROPSPROBLEMTABLES.problems[12], ", ").concat(_config.PROPSPROBLEMTABLES.problem_boundary[11], " as ").concat(_config.PROPSPROBLEMTABLES.problems[11], ", ").concat(_config.PROPSPROBLEMTABLES.problem_boundary[10], " as ").concat(_config.PROPSPROBLEMTABLES.problems[10], "\n    FROM ").concat(_config.PROBLEM_TABLE, " where ").concat(_config.PROPSPROBLEMTABLES.problem_boundary[5], "='").concat(id, "'");
            console.log('PROBLEM SQL', PROBLEM_SQL);
            URL = encodeURI("".concat(_config.CARTO_URL, "&q=").concat(PROBLEM_SQL));
            _context4.next = 5;
            return (0, _needle["default"])('get', URL, {
              json: true
            });

          case 5:
            data = _context4.sent;

            if (!(data.statusCode === 200)) {
              _context4.next = 14;
              break;
            }

            result = data.body.rows[0];
            _context4.next = 10;
            return (0, _mapgalleryService.getCoordinatesOfComponents)(id, 'problemid');

          case 10:
            resultComponents = _context4.sent;
            return _context4.abrupt("return", {
              cartodb_id: result.cartodb_id,
              objectid: result.objectid,
              problemid: result.problemid,
              problemname: result.problemname,
              problemdescription: result.problemdescription,
              problemtype: result.problemtype,
              problempriority: result.problempriority,
              source: result.source,
              solutioncost: result.solutioncost,
              solutionstatus: result.solutionstatus,
              component_cost: result.component_cost,
              sourcename: result.sourcename,
              mhfdmanager: result.mhfdmanager,
              servicearea: result.servicearea,
              county: result.county,
              streamname: result.streamname,
              sourcedate: result.sourcedate,
              jurisdiction: result.jurisdiction,
              shape_length: result.shape_length,
              shape_area: result.shape_area,
              components: resultComponents,
              coordinates: JSON.parse(result.the_geom).coordinates
            });

          case 14:
            throw new Error('');

          case 15:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function getDataByProblemId(_x10) {
    return _ref4.apply(this, arguments);
  };
}();

var getProblemParts = /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(id) {
    var promises, tables, _iterator20, _step20, _loop, all, data;

    return _regeneratorRuntime().wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            promises = [];
            tables = _config.PROBLEM_PART_TABLES;
            _iterator20 = _createForOfIteratorHelper(tables);

            try {
              _loop = function _loop() {
                var element = _step20.value;
                var sql = "SELECT problem_type, problem_part_category, problem_part_subcategory, globalid FROM ".concat(element, "\n     WHERE problem_id = ").concat(id);
                console.log('my sql ', sql);
                sql = encodeURIComponent(sql);
                var URL = "".concat(_config.CARTO_URL, "&q=").concat(sql);
                promises.push(new Promise(function (resolve, reject) {
                  _https["default"].get(URL, function (response) {
                    if (response.statusCode == 200) {
                      var str = '';
                      response.on('data', function (chunk) {
                        str += chunk;
                      });
                      response.on('end', function () {
                        var rows = JSON.parse(str).rows;
                        console.log(rows);
                        resolve(rows);
                      });
                    } else {
                      console.log('status ', response.statusCode, URL);
                      resolve([]);
                    }
                  }).on('error', function (err) {
                    console.log('failed call to ', URL, 'with error ', err);
                    resolve([]);
                  });
                }));
              };

              for (_iterator20.s(); !(_step20 = _iterator20.n()).done;) {
                _loop();
              }
            } catch (err) {
              _iterator20.e(err);
            } finally {
              _iterator20.f();
            }

            _context5.next = 6;
            return Promise.all(promises);

          case 6:
            all = _context5.sent;
            data = [];
            all.forEach(function (row) {
              row.forEach(function (r) {
                return data.push(r);
              });
            });
            data.sort(function (a, b) {
              if (a.problem_type.localeCompare(b.problem_type) === 0) {
                if (a.problem_part_category.localeCompare(b.problem_part_category) === 0) {
                  return a.problem_part_subcategory.localeCompare(b.problem_part_subcategory);
                }

                return a.problem_part_category.localeCompare(b.problem_part_category);
              }

              return a.problem_type.localeCompare(b.problem_type);
            });
            return _context5.abrupt("return", data);

          case 11:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));

  return function getProblemParts(_x11) {
    return _ref5.apply(this, arguments);
  };
}();

router.post('/problem-by-id/:id/pdf', /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6(req, res) {
    var id, map, data, components, problempart, pdfObject;
    return _regeneratorRuntime().wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            id = req.params.id;
            map = req.body.map;
            _context6.prev = 2;
            _context6.next = 5;
            return getDataByProblemId(id);

          case 5:
            data = _context6.sent;
            _context6.next = 8;
            return componentsByEntityId(id, _config.PROPSPROBLEMTABLES.problems[5], 'type', 'asc');

          case 8:
            components = _context6.sent;
            _context6.next = 11;
            return getProblemParts(id);

          case 11:
            problempart = _context6.sent;
            _context6.prev = 12;
            _context6.next = 15;
            return (0, _mapgalleryPrintService.printProblem)(data, components, map, problempart);

          case 15:
            pdfObject = _context6.sent;
            pdfObject.toBuffer(function (err, buffer) {
              if (err) return res.send(err);
              res.type('pdf');
              res.end(buffer, 'binary');
            });
            _context6.next = 23;
            break;

          case 19:
            _context6.prev = 19;
            _context6.t0 = _context6["catch"](12);

            _logger["default"].error(_context6.t0);

            res.status(500).send({
              error: 'Not able to generated PDF.'
            });

          case 23:
            _context6.next = 29;
            break;

          case 25:
            _context6.prev = 25;
            _context6.t1 = _context6["catch"](2);

            _logger["default"].error(_context6.t1);

            res.status(500).send({
              error: 'No there data with ID'
            });

          case 29:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, null, [[2, 25], [12, 19]]);
  }));

  return function (_x12, _x13) {
    return _ref6.apply(this, arguments);
  };
}());
router.get('/problem-by-id/:id', /*#__PURE__*/function () {
  var _ref7 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7(req, res) {
    var id, data;
    return _regeneratorRuntime().wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            id = req.params.id;
            _context7.prev = 1;
            _context7.next = 4;
            return getDataByProblemId(id);

          case 4:
            data = _context7.sent;
            res.status(200).send(data);
            _context7.next = 12;
            break;

          case 8:
            _context7.prev = 8;
            _context7.t0 = _context7["catch"](1);

            _logger["default"].error(_context7.t0);

            res.status(500).send({
              error: 'No there data with ID'
            });

          case 12:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7, null, [[1, 8]]);
  }));

  return function (_x14, _x15) {
    return _ref7.apply(this, arguments);
  };
}());

var percentageFormatter = function percentageFormatter(value) {
  value = value * 100;
  return Math.round(value * 100) / 100;
};

router.post('/problems-by-projectid', /*#__PURE__*/function () {
  var _ref8 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee8(req, res) {
    var id, sortby, sorttype, problems;
    return _regeneratorRuntime().wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _context8.prev = 0;
            id = req.body.id;
            sortby = req.body.sortby;
            sorttype = req.body.sorttype;
            _context8.next = 6;
            return (0, _mapgalleryService.getProblemByProjectId)(id, sortby, sorttype);

          case 6:
            problems = _context8.sent;
            res.status(200).send(problems);
            _context8.next = 14;
            break;

          case 10:
            _context8.prev = 10;
            _context8.t0 = _context8["catch"](0);

            _logger["default"].error(_context8.t0);

            res.status(500).send({
              error: _context8.t0
            }).send({
              error: 'Connection error'
            });

          case 14:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8, null, [[0, 10]]);
  }));

  return function (_x16, _x17) {
    return _ref8.apply(this, arguments);
  };
}());

var componentsByEntityId = /*#__PURE__*/function () {
  var _ref9 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee9(id, typeid, sortby, sorttype) {
    var table, finalcost, extraColumnProb, COMPONENTS_SQL, union, _iterator21, _step21, component, typeidSp, cost_column, componentQuery, data, result, sum;

    return _regeneratorRuntime().wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            if (id === '') {
              id = null;
            }

            table = '';
            finalcost = '';
            extraColumnProb = typeid;

            if (typeid === 'projectid') {
              table = _config.MAIN_PROJECT_TABLE;
              finalcost = 'finalcost';
            } else if (typeid === _config.PROPSPROBLEMTABLES.problems[5]) {
              table = _config.PROBLEM_TABLE;
              finalcost = "".concat(_config.PROBLEM_TABLE, ".").concat(_config.PROPSPROBLEMTABLES.problem_boundary[0]);
              extraColumnProb = _config.PROPSPROBLEMTABLES.problem_boundary[5];
            } else {
              table = _config.PROBLEM_TABLE;
              finalcost = _config.PROPSPROBLEMTABLES.problem_boundary[0];
            }

            COMPONENTS_SQL = '';
            union = '';
            _iterator21 = _createForOfIteratorHelper(TABLES_COMPONENTS);

            try {
              for (_iterator21.s(); !(_step21 = _iterator21.n()).done;) {
                component = _step21.value;

                if (component === 'stream_improvement_measure') {
                  typeidSp = typeid === 'projectid' ? 'project_id' : 'problem_id';
                  cost_column = 'estimated_cost_base';
                  COMPONENTS_SQL += union + "SELECT component_part_category as type, count(*), \n         coalesce(sum(".concat(cost_column, "), 0) as estimated_cost, \n         case \n          when cast(").concat(finalcost, " as integer) > 0 \n          then \n          coalesce(\n              (select sum(").concat(cost_column, ") as aux from ").concat(component, " where ").concat(component, ".status = 'Complete')\n              , \n              0\n          )  /  cast(").concat(finalcost, " as integer)\n          else\n          0\n          END as original_cost,\n          coalesce(complete_t.sum, 0) as complete_cost\n          FROM ").concat(component, ", ").concat(table, ", ( select sum(estimated_cost_base) as sum from ").concat(component, " where ").concat(component, ".status = 'Complete' ) complete_t\n          where ").concat(component, ".").concat(typeidSp, "=").concat(id, " and ").concat(table, ".").concat(extraColumnProb, "=").concat(id, " group by type, ").concat(finalcost, ", complete_t.sum");
                } else {
                  COMPONENTS_SQL += union + "SELECT type, count(*)\n        , coalesce(sum(original_cost), 0) as estimated_cost, \n          case \n            when cast(".concat(finalcost, " as integer) > 0 \n            then \n            coalesce(\n               (select sum(original_cost) as aux from ").concat(component, " where ").concat(component, ".status = 'Complete')\n               , \n               0\n            )  /  cast(").concat(finalcost, " as integer)\n            else\n            0\n          END as original_cost, coalesce(complete_t.sum, 0) as complete_cost\n             FROM ").concat(component, ", ").concat(table, ", ( select sum(estimated_cost) as sum from ").concat(component, " where ").concat(component, ".status = 'Complete' ) complete_t\n             where ").concat(component, ".").concat(typeid, "=").concat(id, " and ").concat(table, ".").concat(extraColumnProb, "=").concat(id, " group by type, ").concat(finalcost, ", complete_t.sum");
                }

                union = ' union ';
              }
            } catch (err) {
              _iterator21.e(err);
            } finally {
              _iterator21.f();
            }

            if (sortby) {
              if (!sorttype) {
                sorttype = 'desc';
              }

              COMPONENTS_SQL += " order by ".concat(sortby, " ").concat(sorttype);
            } //  console.log('COMPONENTS SQL', COMPONENTS_SQL);


            componentQuery = {
              q: "".concat(COMPONENTS_SQL)
            };
            _context9.next = 13;
            return (0, _needle["default"])('post', _config.CARTO_URL, componentQuery, {
              json: true
            });

          case 13:
            data = _context9.sent;

            if (!(data.statusCode === 200)) {
              _context9.next = 21;
              break;
            }

            result = data.body.rows.map(function (element) {
              return {
                type: element.type + ' (' + element.count + ')',
                estimated_cost: element.estimated_cost,
                original_cost: element.original_cost,
                complete_cost: element.complete_cost
              };
            });

            if (sortby === 'percen') {
              result.sort(function (a, b) {
                if (sorttype === 'asc') {
                  return a.estimated_cost - b.estimated_cost;
                } else {
                  return b.estimated_cost - a.estimated_cost;
                }
              });
            }

            sum = result.reduce(function (prev, curr) {
              return curr.estimated_cost + prev;
            }, 0);
            return _context9.abrupt("return", result.map(function (element) {
              return {
                type: element.type,
                estimated_cost: element.estimated_cost,
                original_cost: element.original_cost,
                percen: percentageFormatter(sum == 0 ? 0 : element.estimated_cost / sum),
                complete_cost: element.complete_cost
              };
            }));

          case 21:
            console.log('bad status ', _express.response.statusCode, _express.response.body);
            throw new Error('');

          case 23:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9);
  }));

  return function componentsByEntityId(_x18, _x19, _x20, _x21) {
    return _ref9.apply(this, arguments);
  };
}();

router.post('/components-by-entityid', /*#__PURE__*/function () {
  var _ref10 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee10(req, res) {
    var id, typeid, sortby, sorttype, result;
    return _regeneratorRuntime().wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            _context10.prev = 0;
            id = req.body.id;
            typeid = req.body.typeid;
            sortby = req.body.sortby;
            sorttype = req.body.sorttype;
            _context10.next = 7;
            return componentsByEntityId(id, typeid, sortby, sorttype);

          case 7:
            result = _context10.sent;
            return _context10.abrupt("return", res.status(200).send(result));

          case 11:
            _context10.prev = 11;
            _context10.t0 = _context10["catch"](0);

            _logger["default"].error(_context10.t0);

            res.status(500).send({
              error: _context10.t0
            }).send({
              error: 'Connection error'
            });

          case 15:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10, null, [[0, 11]]);
  }));

  return function (_x22, _x23) {
    return _ref10.apply(this, arguments);
  };
}());
router.post('/get-coordinates', /*#__PURE__*/function () {
  var _ref11 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee11(req, res) {
    var table, value, query, data, result, all_coordinates;
    return _regeneratorRuntime().wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            _context11.prev = 0;
            table = req.body.table;
            value = req.body.value;
            query = {
              q: "select ST_AsGeoJSON(ST_Envelope(the_geom)) from ".concat(table, " \n      where cartodb_id = ").concat(value, " ")
            };
            _context11.next = 6;
            return (0, _needle["default"])('post', _config.CARTO_URL, query, {
              json: true
            });

          case 6:
            data = _context11.sent;

            if (!(data.statusCode === 200)) {
              _context11.next = 14;
              break;
            }

            result = data.body.rows;
            all_coordinates = [];

            if (result.length > 0) {
              all_coordinates = JSON.parse(result[0].st_asgeojson).coordinates;
            }

            return _context11.abrupt("return", res.status(200).send({
              'polygon': all_coordinates
            }));

          case 14:
            return _context11.abrupt("return", res.status(data.statusCode).send({
              'error': 'error'
            }));

          case 15:
            _context11.next = 21;
            break;

          case 17:
            _context11.prev = 17;
            _context11.t0 = _context11["catch"](0);

            _logger["default"].error(_context11.t0);

            res.status(500).send({
              error: _context11.t0
            }).send({
              error: 'Connection error'
            });

          case 21:
          case "end":
            return _context11.stop();
        }
      }
    }, _callee11, null, [[0, 17]]);
  }));

  return function (_x24, _x25) {
    return _ref11.apply(this, arguments);
  };
}());
router.post('/component-counter', /*#__PURE__*/function () {
  var _ref12 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee12(req, res) {
    var column, value, counter, answer, query, data, _answer2, result, _iterator22, _step22, table1, _query28, _data2, _result2;

    return _regeneratorRuntime().wrap(function _callee12$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            _context12.prev = 0;
            column = req.body.column;
            value = req.body.value;
            counter = 0;
            answer = [];

            if (!(column === _config.PROPSPROBLEMTABLES.problems[5] || column === _config.PROPSPROBLEMTABLES.problem_boundary[5])) {
              _context12.next = 24;
              break;
            }

            if (!(value === null || value === 0)) {
              _context12.next = 10;
              break;
            }

            return _context12.abrupt("return", res.status(200).send({
              'componentes': counter
            }));

          case 10:
            query = {
              q: "select ".concat(_config.PROPSPROBLEMTABLES.problem_boundary[5], " as ").concat(_config.PROPSPROBLEMTABLES.problems[5], ", ").concat(_config.PROPSPROBLEMTABLES.problem_boundary[6], " as ").concat(_config.PROPSPROBLEMTABLES.problems[6], " , ").concat(getCountersProblems(_config.PROBLEM_TABLE, column), " from ").concat(_config.PROBLEM_TABLE, " \n                where ").concat(_config.PROPSPROBLEMTABLES.problems[5], " = ").concat(value, " ")
            };
            _context12.next = 13;
            return (0, _needle["default"])('post', _config.CARTO_URL, query, {
              json: true
            });

          case 13:
            data = _context12.sent;
            _answer2 = [];

            if (!(data.statusCode === 200)) {
              _context12.next = 21;
              break;
            }

            result = data.body.rows;
            counter = result[0].count_gcs + result[0].count_pa + result[0].count_sip + result[0].count_sil + result[0].count_cia + result[0].count_sia + result[0].count_rl + result[0].count_ra + result[0].count_sd + result[0].count_df + result[0].count_mt + result[0].count_la + result[0].count_la + result[0].count_la1 + result[0].count_cila;
            return _context12.abrupt("return", res.status(200).send({
              'componentes': counter
            }));

          case 21:
            return _context12.abrupt("return", res.status(data.statusCode).send({
              'error': 'error'
            }));

          case 22:
            _context12.next = 52;
            break;

          case 24:
            counter = 0;

            if (!(value !== null && value !== 0)) {
              _context12.next = 51;
              break;
            }

            _iterator22 = _createForOfIteratorHelper(PROJECT_TABLES);
            _context12.prev = 27;

            _iterator22.s();

          case 29:
            if ((_step22 = _iterator22.n()).done) {
              _context12.next = 43;
              break;
            }

            table1 = _step22.value;
            _query28 = {
              q: "select projectid, projectname, ".concat(getCounters(table1, column), " from ").concat(table1, " where ").concat(column, " = ").concat(value, " ")
            };
            _context12.prev = 32;
            _context12.next = 35;
            return (0, _needle["default"])('post', _config.CARTO_URL, _query28, {
              json: true
            });

          case 35:
            _data2 = _context12.sent;

            if (_data2.statusCode === 200) {
              _result2 = _data2.body.rows;
              counter += _result2[0].count_gcs + _result2[0].count_pa + _result2[0].count_sip + _result2[0].count_sil + _result2[0].count_cia + _result2[0].count_sia + _result2[0].count_rl + _result2[0].count_ra + _result2[0].count_sd + _result2[0].count_df + _result2[0].count_mt + _result2[0].count_la + _result2[0].count_la + _result2[0].count_la1 + _result2[0].count_cila;
            }

            _context12.next = 41;
            break;

          case 39:
            _context12.prev = 39;
            _context12.t0 = _context12["catch"](32);

          case 41:
            _context12.next = 29;
            break;

          case 43:
            _context12.next = 48;
            break;

          case 45:
            _context12.prev = 45;
            _context12.t1 = _context12["catch"](27);

            _iterator22.e(_context12.t1);

          case 48:
            _context12.prev = 48;

            _iterator22.f();

            return _context12.finish(48);

          case 51:
            return _context12.abrupt("return", res.status(200).send({
              'componentes': counter
            }));

          case 52:
            _context12.next = 58;
            break;

          case 54:
            _context12.prev = 54;
            _context12.t2 = _context12["catch"](0);

            _logger["default"].error(_context12.t2);

            res.status(500).send({
              error: _context12.t2
            });

          case 58:
          case "end":
            return _context12.stop();
        }
      }
    }, _callee12, null, [[0, 54], [27, 45, 48, 51], [32, 39]]);
  }));

  return function (_x26, _x27) {
    return _ref12.apply(this, arguments);
  };
}());
router.post('/group-by', /*#__PURE__*/function () {
  var _ref13 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee14(req, res) {
    var table, column, LINE_SQL, LINE_URL;
    return _regeneratorRuntime().wrap(function _callee14$(_context14) {
      while (1) {
        switch (_context14.prev = _context14.next) {
          case 0:
            try {
              table = req.body.table;
              column = req.body.column;
              LINE_SQL = "SELECT ".concat(column, " FROM ").concat(table, " group by ").concat(column, " order by ").concat(column);
              LINE_URL = encodeURI("".concat(_config.CARTO_URL, "&q=").concat(LINE_SQL));

              _https["default"].get(LINE_URL, function (response) {
                if (response.statusCode === 200) {
                  var str = '';
                  response.on('data', function (chunk) {
                    str += chunk;
                  });
                  response.on('end', /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee13() {
                    var data, result, _iterator23, _step23, _res;

                    return _regeneratorRuntime().wrap(function _callee13$(_context13) {
                      while (1) {
                        switch (_context13.prev = _context13.next) {
                          case 0:
                            data = [];
                            result = JSON.parse(str).rows;
                            _iterator23 = _createForOfIteratorHelper(result);

                            try {
                              for (_iterator23.s(); !(_step23 = _iterator23.n()).done;) {
                                _res = _step23.value;
                                data.push(_res[column]);
                              }
                            } catch (err) {
                              _iterator23.e(err);
                            } finally {
                              _iterator23.f();
                            }

                            return _context13.abrupt("return", res.status(200).send({
                              'data': data
                            }));

                          case 5:
                          case "end":
                            return _context13.stop();
                        }
                      }
                    }, _callee13);
                  })));
                }
              });
            } catch (error) {
              _logger["default"].error(error);

              res.status(500).send({
                error: error
              }).send({
                error: 'Connection error'
              });
            }

          case 1:
          case "end":
            return _context14.stop();
        }
      }
    }, _callee14);
  }));

  return function (_x28, _x29) {
    return _ref13.apply(this, arguments);
  };
}());

function getQuintilComponentValues(_x30, _x31) {
  return _getQuintilComponentValues.apply(this, arguments);
}

function _getQuintilComponentValues() {
  _getQuintilComponentValues = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee20(column, bounds) {
    var result, VALUES_COMPONENTS, connector, query, coords, filters, _i2, _VALUES_COMPONENTS2, component, LINE_URL, newProm1;

    return _regeneratorRuntime().wrap(function _callee20$(_context20) {
      while (1) {
        switch (_context20.prev = _context20.next) {
          case 0:
            result = [];
            _context20.prev = 1;
            VALUES_COMPONENTS = ['grade_control_structure', 'pipe_appurtenances', 'special_item_point', 'special_item_linear', 'special_item_area', 'channel_improvements_linear', 'channel_improvements_area', 'removal_line', 'removal_area', 'storm_drain', 'detention_facilities', 'maintenance_trails', 'land_acquisition', 'landscaping_area'];
            connector = '';
            query = '';
            coords = bounds.split(',');
            filters = "(ST_Contains(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), the_geom) or ");
            filters += "ST_Intersects(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), the_geom))");

            for (_i2 = 0, _VALUES_COMPONENTS2 = VALUES_COMPONENTS; _i2 < _VALUES_COMPONENTS2.length; _i2++) {
              component = _VALUES_COMPONENTS2[_i2];
              query += connector + "SELECT max(".concat(column, ") as max, min(").concat(column, ") as min FROM ").concat(component, " ");
              connector = ' union ';
            }

            LINE_URL = encodeURI("".concat(_config.CARTO_URL, "&q=").concat(query));
            newProm1 = new Promise(function (resolve, reject) {
              _https["default"].get(LINE_URL, function (response) {
                if (response.statusCode === 200) {
                  var str = '';
                  response.on('data', function (chunk) {
                    str += chunk;
                  });
                  response.on('end', /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee19() {
                    var result, max, min, difference, label, finalResult, i, min1, max1, limitCount, counter, query1, union, _iterator29, _step29, table1, _query29, data, _result3, _iterator30, _step30, row;

                    return _regeneratorRuntime().wrap(function _callee19$(_context19) {
                      while (1) {
                        switch (_context19.prev = _context19.next) {
                          case 0:
                            result = JSON.parse(str).rows;
                            max = Math.max.apply(Math, result.map(function (element) {
                              return element.max;
                            }));
                            min = Math.min.apply(Math, result.map(function (element) {
                              return element.min;
                            }));
                            difference = Math.round((max - min) / 5);
                            label = '';

                            if (max < 1000000) {
                              label = 'K';
                            } else {
                              label = 'M';
                            }

                            finalResult = [];
                            i = 0;

                          case 8:
                            if (!(i < 5)) {
                              _context19.next = 28;
                              break;
                            }

                            min1 = Math.round(min);
                            max1 = 0;
                            limitCount = 0;
                            counter = 0;

                            if (i === 4) {
                              max1 = max;
                              limitCount = max;
                            } else {
                              max1 = Math.round(difference * (i + 1));
                              limitCount = max1;
                            }

                            query1 = '';
                            union = '';
                            _iterator29 = _createForOfIteratorHelper(TABLES_COMPONENTS);

                            try {
                              for (_iterator29.s(); !(_step29 = _iterator29.n()).done;) {
                                table1 = _step29.value;
                                query1 += union + "select count(*) from ".concat(table1, " where (").concat(column, " between ").concat(min1, " and ").concat(limitCount, ") \n              and ").concat(filters, " ");
                                union = ' union ';
                              }
                            } catch (err) {
                              _iterator29.e(err);
                            } finally {
                              _iterator29.f();
                            }

                            _query29 = {
                              q: "".concat(query1, " ")
                            };
                            _context19.next = 21;
                            return (0, _needle["default"])('post', _config.CARTO_URL, _query29, {
                              json: true
                            });

                          case 21:
                            data = _context19.sent;

                            if (data.statusCode === 200) {
                              _result3 = data.body.rows;
                              _iterator30 = _createForOfIteratorHelper(_result3);

                              try {
                                for (_iterator30.s(); !(_step30 = _iterator30.n()).done;) {
                                  row = _step30.value;
                                  counter += row.count;
                                }
                              } catch (err) {
                                _iterator30.e(err);
                              } finally {
                                _iterator30.f();
                              }
                            } else {
                              console.log('error');
                            }

                            finalResult.push({
                              min: min1,
                              max: max1,
                              label: label,
                              counter: counter
                            });
                            min = difference * (i + 1);

                          case 25:
                            i += 1;
                            _context19.next = 8;
                            break;

                          case 28:
                            resolve(finalResult);

                          case 29:
                          case "end":
                            return _context19.stop();
                        }
                      }
                    }, _callee19);
                  })));
                }
              });
            });
            _context20.next = 13;
            return newProm1;

          case 13:
            result = _context20.sent;
            _context20.next = 20;
            break;

          case 16:
            _context20.prev = 16;
            _context20.t0 = _context20["catch"](1);

            _logger["default"].error(_context20.t0);

            _logger["default"].error("Quintil By Components, Column ".concat(column, " Connection error"));

          case 20:
            return _context20.abrupt("return", result);

          case 21:
          case "end":
            return _context20.stop();
        }
      }
    }, _callee20, null, [[1, 16]]);
  }));
  return _getQuintilComponentValues.apply(this, arguments);
}

function getValuesByRange(_x32, _x33, _x34, _x35) {
  return _getValuesByRange.apply(this, arguments);
}

function _getValuesByRange() {
  _getValuesByRange = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee22(table, column, range, bounds) {
    var result, coords, filters, newProm1;
    return _regeneratorRuntime().wrap(function _callee22$(_context22) {
      while (1) {
        switch (_context22.prev = _context22.next) {
          case 0:
            result = [];
            _context22.prev = 1;
            coords = bounds.split(',');
            filters = "(ST_Contains(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), the_geom) or ");
            filters += "ST_Intersects(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), the_geom))");
            newProm1 = new Promise( /*#__PURE__*/function () {
              var _ref19 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee21(resolve, reject) {
                var result2, counter, lenRange, index, _iterator31, _step31, values, query, data, answer, rows, _answer3, _iterator32, _step32, table1, _query30, _data3, _rows;

                return _regeneratorRuntime().wrap(function _callee21$(_context21) {
                  while (1) {
                    switch (_context21.prev = _context21.next) {
                      case 0:
                        result2 = [];
                        counter = 0;
                        lenRange = range.length;
                        index = 0;
                        _iterator31 = _createForOfIteratorHelper(range);
                        _context21.prev = 5;

                        _iterator31.s();

                      case 7:
                        if ((_step31 = _iterator31.n()).done) {
                          _context21.next = 45;
                          break;
                        }

                        values = _step31.value;

                        if (!(table === _config.PROBLEM_TABLE)) {
                          _context21.next = 19;
                          break;
                        }

                        query = {
                          q: "select count(*) from ".concat(table, " where (").concat(column, " between ").concat(values.min, " and ").concat(values.max, ") and ").concat(filters, " ")
                        };
                        _context21.next = 13;
                        return (0, _needle["default"])('post', _config.CARTO_URL, query, {
                          json: true
                        });

                      case 13:
                        data = _context21.sent;
                        answer = [];
                        console.log('STATUS', data.statusCode);

                        if (data.statusCode === 200) {
                          rows = data.body.rows;
                          counter = rows[0].count;
                        }

                        _context21.next = 41;
                        break;

                      case 19:
                        _answer3 = [];
                        counter = 0;
                        _iterator32 = _createForOfIteratorHelper(PROJECT_TABLES);
                        _context21.prev = 22;

                        _iterator32.s();

                      case 24:
                        if ((_step32 = _iterator32.n()).done) {
                          _context21.next = 33;
                          break;
                        }

                        table1 = _step32.value;
                        _query30 = {
                          q: "select count(*) from ".concat(table1, " where (cast(").concat(column, " as real) between ").concat(values.min, " and ").concat(values.max, ")\n                and ").concat(filters, " ")
                        };
                        _context21.next = 29;
                        return (0, _needle["default"])('post', _config.CARTO_URL, _query30, {
                          json: true
                        });

                      case 29:
                        _data3 = _context21.sent;

                        if (_data3.statusCode === 200) {
                          _rows = _data3.body.rows;
                          counter += _rows[0].count;
                        }

                      case 31:
                        _context21.next = 24;
                        break;

                      case 33:
                        _context21.next = 38;
                        break;

                      case 35:
                        _context21.prev = 35;
                        _context21.t0 = _context21["catch"](22);

                        _iterator32.e(_context21.t0);

                      case 38:
                        _context21.prev = 38;

                        _iterator32.f();

                        return _context21.finish(38);

                      case 41:
                        if (index === lenRange - 1) {
                          result2.push({
                            min: values.min,
                            max: values.max,
                            counter: counter,
                            last: true
                          });
                        } else {
                          result2.push({
                            min: values.min,
                            max: values.max,
                            counter: counter,
                            last: false
                          });
                        }

                        index++;

                      case 43:
                        _context21.next = 7;
                        break;

                      case 45:
                        _context21.next = 50;
                        break;

                      case 47:
                        _context21.prev = 47;
                        _context21.t1 = _context21["catch"](5);

                        _iterator31.e(_context21.t1);

                      case 50:
                        _context21.prev = 50;

                        _iterator31.f();

                        return _context21.finish(50);

                      case 53:
                        resolve(result2);

                      case 54:
                      case "end":
                        return _context21.stop();
                    }
                  }
                }, _callee21, null, [[5, 47, 50, 53], [22, 35, 38, 41]]);
              }));

              return function (_x67, _x68) {
                return _ref19.apply(this, arguments);
              };
            }());
            _context22.next = 8;
            return newProm1;

          case 8:
            result = _context22.sent;
            _context22.next = 15;
            break;

          case 11:
            _context22.prev = 11;
            _context22.t0 = _context22["catch"](1);

            _logger["default"].error(_context22.t0);

            _logger["default"].error("Range By Value, Column ".concat(column, " Connection error"));

          case 15:
            return _context22.abrupt("return", result);

          case 16:
          case "end":
            return _context22.stop();
        }
      }
    }, _callee22, null, [[1, 11]]);
  }));
  return _getValuesByRange.apply(this, arguments);
}

function getValuesByColumnWithOutCount(_x36, _x37, _x38) {
  return _getValuesByColumnWithOutCount.apply(this, arguments);
}

function _getValuesByColumnWithOutCount() {
  _getValuesByColumnWithOutCount = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee23(table, column, bounds) {
    var result, coords, filters, query, data, result1, _iterator33, _step33, row, answer, _coords, _filters2, _iterator34, _step34, table1, _query31, _data4, _iterator35, _step35, _loop3;

    return _regeneratorRuntime().wrap(function _callee23$(_context23) {
      while (1) {
        switch (_context23.prev = _context23.next) {
          case 0:
            result = [];
            _context23.prev = 1;

            if (!(table === _config.PROBLEM_TABLE)) {
              _context23.next = 13;
              break;
            }

            coords = bounds.split(',');
            filters = "(ST_Contains(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), the_geom) or ");
            filters += "ST_Intersects(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), the_geom))");
            query = {
              q: "select ".concat(column, " as column from ").concat(table, " where ").concat(filters, " group by ").concat(column, " order by ").concat(column, " ")
            };
            _context23.next = 9;
            return (0, _needle["default"])('post', _config.CARTO_URL, query, {
              json: true
            });

          case 9:
            data = _context23.sent;

            if (data.statusCode === 200) {
              result1 = data.body.rows;
              _iterator33 = _createForOfIteratorHelper(result1);

              try {
                for (_iterator33.s(); !(_step33 = _iterator33.n()).done;) {
                  row = _step33.value;
                  result.push(row.column);
                }
              } catch (err) {
                _iterator33.e(err);
              } finally {
                _iterator33.f();
              }
            }

            _context23.next = 40;
            break;

          case 13:
            answer = [];
            _coords = bounds.split(',');
            _filters2 = "(ST_Contains(ST_MakeEnvelope(".concat(_coords[0], ",").concat(_coords[1], ",").concat(_coords[2], ",").concat(_coords[3], ",4326), the_geom) or ");
            _filters2 += "ST_Intersects(ST_MakeEnvelope(".concat(_coords[0], ",").concat(_coords[1], ",").concat(_coords[2], ",").concat(_coords[3], ",4326), the_geom))");
            _iterator34 = _createForOfIteratorHelper(PROJECT_TABLES);
            _context23.prev = 18;

            _iterator34.s();

          case 20:
            if ((_step34 = _iterator34.n()).done) {
              _context23.next = 29;
              break;
            }

            table1 = _step34.value;
            _query31 = {
              q: "select ".concat(column, " as column from ").concat(table1, " where ").concat(_filters2, " group by ").concat(column, " order by ").concat(column, " ")
            };
            _context23.next = 25;
            return (0, _needle["default"])('post', _config.CARTO_URL, _query31, {
              json: true
            });

          case 25:
            _data4 = _context23.sent;

            if (_data4.statusCode === 200) {
              answer = answer.concat(_data4.body.rows);
            }

          case 27:
            _context23.next = 20;
            break;

          case 29:
            _context23.next = 34;
            break;

          case 31:
            _context23.prev = 31;
            _context23.t0 = _context23["catch"](18);

            _iterator34.e(_context23.t0);

          case 34:
            _context23.prev = 34;

            _iterator34.f();

            return _context23.finish(34);

          case 37:
            _iterator35 = _createForOfIteratorHelper(answer);

            try {
              _loop3 = function _loop3() {
                var row = _step35.value;
                var search = result.filter(function (item) {
                  return item == row.column;
                });

                if (search.length === 0) {
                  result.push(row.column);
                }
              };

              for (_iterator35.s(); !(_step35 = _iterator35.n()).done;) {
                _loop3();
              }
            } catch (err) {
              _iterator35.e(err);
            } finally {
              _iterator35.f();
            }

            result = result.sort(function (a, b) {
              return a > b ? 1 : -1;
            });

          case 40:
            _context23.next = 46;
            break;

          case 42:
            _context23.prev = 42;
            _context23.t1 = _context23["catch"](1);

            _logger["default"].error(_context23.t1);

            _logger["default"].error("Get Value by Column, Table: ".concat(table, " Column: ").concat(column, " Connection error"));

          case 46:
            return _context23.abrupt("return", result);

          case 47:
          case "end":
            return _context23.stop();
        }
      }
    }, _callee23, null, [[1, 42], [18, 31, 34, 37]]);
  }));
  return _getValuesByColumnWithOutCount.apply(this, arguments);
}

function getProjectByProblemType(_x39) {
  return _getProjectByProblemType.apply(this, arguments);
}

function _getProjectByProblemType() {
  _getProjectByProblemType = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee24(bounds) {
    var result, coords, filters, problemTypes, _i3, _problemTypes, type, counter, _iterator36, _step36, table, newfilter, query, data;

    return _regeneratorRuntime().wrap(function _callee24$(_context24) {
      while (1) {
        switch (_context24.prev = _context24.next) {
          case 0:
            result = [];
            _context24.prev = 1;
            coords = bounds.split(',');
            filters = "(ST_Contains(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), the_geom) or ");
            filters += "ST_Intersects(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), the_geom))");
            problemTypes = ['Human Connection', 'Geomorphology', 'Vegetation', 'Hydrology', 'Hydraulics'];
            _i3 = 0, _problemTypes = problemTypes;

          case 7:
            if (!(_i3 < _problemTypes.length)) {
              _context24.next = 35;
              break;
            }

            type = _problemTypes[_i3];
            counter = 0;
            _iterator36 = _createForOfIteratorHelper(PROJECT_TABLES);
            _context24.prev = 11;

            _iterator36.s();

          case 13:
            if ((_step36 = _iterator36.n()).done) {
              _context24.next = 23;
              break;
            }

            table = _step36.value;
            newfilter = createQueryByProblemType(type, table);
            query = {
              q: "select count(*) as count from ".concat(table, " where ").concat(filters, " and ").concat(newfilter, " ")
            };
            _context24.next = 19;
            return (0, _needle["default"])('post', _config.CARTO_URL, query, {
              json: true
            });

          case 19:
            data = _context24.sent;

            if (data.statusCode === 200) {
              counter += data.body.rows[0].count;
            }

          case 21:
            _context24.next = 13;
            break;

          case 23:
            _context24.next = 28;
            break;

          case 25:
            _context24.prev = 25;
            _context24.t0 = _context24["catch"](11);

            _iterator36.e(_context24.t0);

          case 28:
            _context24.prev = 28;

            _iterator36.f();

            return _context24.finish(28);

          case 31:
            result.push({
              value: type,
              counter: counter
            });

          case 32:
            _i3++;
            _context24.next = 7;
            break;

          case 35:
            _context24.next = 41;
            break;

          case 37:
            _context24.prev = 37;
            _context24.t1 = _context24["catch"](1);

            _logger["default"].error(_context24.t1);

            _logger["default"].error("Error in Project by Problem Type Connection error");

          case 41:
            return _context24.abrupt("return", result);

          case 42:
          case "end":
            return _context24.stop();
        }
      }
    }, _callee24, null, [[1, 37], [11, 25, 28, 31]]);
  }));
  return _getProjectByProblemType.apply(this, arguments);
}

function getValuesByColumn(_x40, _x41, _x42) {
  return _getValuesByColumn.apply(this, arguments);
}

function _getValuesByColumn() {
  _getValuesByColumn = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee25(table, column, bounds) {
    var result, coords, filters, query, data, result1, _iterator37, _step37, row, answer, _coords2, _filters3, _iterator38, _step38, table1, _query32, _data5, _result4, _iterator39, _step39, _loop4;

    return _regeneratorRuntime().wrap(function _callee25$(_context25) {
      while (1) {
        switch (_context25.prev = _context25.next) {
          case 0:
            result = [];
            _context25.prev = 1;

            if (!(table === _config.PROBLEM_TABLE)) {
              _context25.next = 13;
              break;
            }

            coords = bounds.split(',');
            filters = "(ST_Contains(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), the_geom) or ");
            filters += "ST_Intersects(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), the_geom))");
            query = {
              q: "select ".concat(column, " as column, count(*) as count from ").concat(table, " where ").concat(filters, " group by ").concat(column, " order by ").concat(column, " ")
            };
            _context25.next = 9;
            return (0, _needle["default"])('post', _config.CARTO_URL, query, {
              json: true
            });

          case 9:
            data = _context25.sent;

            if (data.statusCode === 200) {
              result1 = data.body.rows;
              _iterator37 = _createForOfIteratorHelper(result1);

              try {
                for (_iterator37.s(); !(_step37 = _iterator37.n()).done;) {
                  row = _step37.value;
                  result.push({
                    value: row.column,
                    counter: row.count
                  });
                }
              } catch (err) {
                _iterator37.e(err);
              } finally {
                _iterator37.f();
              }
            }

            _context25.next = 39;
            break;

          case 13:
            answer = [];
            _coords2 = bounds.split(',');
            _filters3 = "(ST_Contains(ST_MakeEnvelope(".concat(_coords2[0], ",").concat(_coords2[1], ",").concat(_coords2[2], ",").concat(_coords2[3], ",4326), the_geom) or ");
            _filters3 += "ST_Intersects(ST_MakeEnvelope(".concat(_coords2[0], ",").concat(_coords2[1], ",").concat(_coords2[2], ",").concat(_coords2[3], ",4326), the_geom))");
            _iterator38 = _createForOfIteratorHelper(PROJECT_TABLES);
            _context25.prev = 18;

            _iterator38.s();

          case 20:
            if ((_step38 = _iterator38.n()).done) {
              _context25.next = 29;
              break;
            }

            table1 = _step38.value;
            _query32 = {
              q: "select ".concat(column, " as column, count(*) as count from ").concat(table1, " where ").concat(_filters3, " group by ").concat(column, " order by ").concat(column, " ")
            };
            _context25.next = 25;
            return (0, _needle["default"])('post', _config.CARTO_URL, _query32, {
              json: true
            });

          case 25:
            _data5 = _context25.sent;

            if (_data5.statusCode === 200) {
              _result4 = _data5.body.rows;
              answer = answer.concat(_result4);
            }

          case 27:
            _context25.next = 20;
            break;

          case 29:
            _context25.next = 34;
            break;

          case 31:
            _context25.prev = 31;
            _context25.t0 = _context25["catch"](18);

            _iterator38.e(_context25.t0);

          case 34:
            _context25.prev = 34;

            _iterator38.f();

            return _context25.finish(34);

          case 37:
            _iterator39 = _createForOfIteratorHelper(answer);

            try {
              _loop4 = function _loop4() {
                var row = _step39.value;
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

              for (_iterator39.s(); !(_step39 = _iterator39.n()).done;) {
                _loop4();
              }
            } catch (err) {
              _iterator39.e(err);
            } finally {
              _iterator39.f();
            }

          case 39:
            _context25.next = 45;
            break;

          case 41:
            _context25.prev = 41;
            _context25.t1 = _context25["catch"](1);

            _logger["default"].error(_context25.t1);

            _logger["default"].error("Get Value by Column, Table: ".concat(table, " Column: ").concat(column, " Connection error"));

          case 45:
            return _context25.abrupt("return", result);

          case 46:
          case "end":
            return _context25.stop();
        }
      }
    }, _callee25, null, [[1, 41], [18, 31, 34, 37]]);
  }));
  return _getValuesByColumn.apply(this, arguments);
}

function getCountByYearStudy(_x43, _x44) {
  return _getCountByYearStudy.apply(this, arguments);
}

function _getCountByYearStudy() {
  _getCountByYearStudy = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee26(values, bounds) {
    var result, coords, filters, _iterator40, _step40, value, initValue, endValue, SQL, query, data, counter, result1, _iterator41, _step41, val;

    return _regeneratorRuntime().wrap(function _callee26$(_context26) {
      while (1) {
        switch (_context26.prev = _context26.next) {
          case 0:
            result = [];
            _context26.prev = 1;
            coords = bounds.split(',');
            filters = "(ST_Contains(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), the_geom) or ");
            filters += "ST_Intersects(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), the_geom))");
            _iterator40 = _createForOfIteratorHelper(values);
            _context26.prev = 6;

            _iterator40.s();

          case 8:
            if ((_step40 = _iterator40.n()).done) {
              _context26.next = 23;
              break;
            }

            value = _step40.value;
            initValue = Number(value);
            endValue = 0;

            if (value === '2020') {
              endValue = initValue + 10;
            } else {
              endValue = initValue + 9;
            }

            SQL = "SELECT count(*) as count FROM grade_control_structure where ".concat(filters, " and year_of_study between ").concat(initValue, " and ").concat(endValue, " union\n      SELECT count(*) as count FROM pipe_appurtenances where ").concat(filters, " and year_of_study between ").concat(initValue, " and ").concat(endValue, " union\n      SELECT count(*) as count FROM special_item_point where ").concat(filters, " and year_of_study between ").concat(initValue, " and ").concat(endValue, " union\n      SELECT count(*) as count FROM special_item_linear where ").concat(filters, " and year_of_study between ").concat(initValue, " and ").concat(endValue, " union\n      SELECT count(*) as count FROM special_item_area where ").concat(filters, " and year_of_study between ").concat(initValue, " and ").concat(endValue, " union\n      SELECT count(*) as count FROM channel_improvements_linear where ").concat(filters, " and year_of_study between ").concat(initValue, " and ").concat(endValue, " union\n      SELECT count(*) as count FROM channel_improvements_area where ").concat(filters, " and year_of_study between ").concat(initValue, " and ").concat(endValue, " union\n      SELECT count(*) as count FROM removal_line where ").concat(filters, " and year_of_study between ").concat(initValue, " and ").concat(endValue, " union\n      SELECT count(*) as count FROM removal_area where ").concat(filters, " and year_of_study between ").concat(initValue, " and ").concat(endValue, " union\n      SELECT count(*) as count FROM storm_drain where ").concat(filters, " and year_of_study between ").concat(initValue, " and ").concat(endValue, " union\n      SELECT count(*) as count FROM detention_facilities where ").concat(filters, " and year_of_study between ").concat(initValue, " and ").concat(endValue, " union\n      SELECT count(*) as count FROM maintenance_trails where ").concat(filters, " and year_of_study between ").concat(initValue, " and ").concat(endValue, " union\n      SELECT count(*) as count FROM land_acquisition where ").concat(filters, " and year_of_study between ").concat(initValue, " and ").concat(endValue, " union\n      SELECT count(*) as count FROM landscaping_area where ").concat(filters, " and year_of_study between ").concat(initValue, " and ").concat(endValue, " ");
            query = {
              q: " ".concat(SQL, " ")
            };
            _context26.next = 17;
            return (0, _needle["default"])('post', _config.CARTO_URL, query, {
              json: true
            });

          case 17:
            data = _context26.sent;
            counter = 0;
            console.log('STATUS', data.statusCode);

            if (data.statusCode === 200) {
              result1 = data.body.rows;
              _iterator41 = _createForOfIteratorHelper(result1);

              try {
                for (_iterator41.s(); !(_step41 = _iterator41.n()).done;) {
                  val = _step41.value;
                  counter += val.count;
                }
              } catch (err) {
                _iterator41.e(err);
              } finally {
                _iterator41.f();
              }

              result.push({
                value: value,
                count: counter
              });
            }

          case 21:
            _context26.next = 8;
            break;

          case 23:
            _context26.next = 28;
            break;

          case 25:
            _context26.prev = 25;
            _context26.t0 = _context26["catch"](6);

            _iterator40.e(_context26.t0);

          case 28:
            _context26.prev = 28;

            _iterator40.f();

            return _context26.finish(28);

          case 31:
            _context26.next = 37;
            break;

          case 33:
            _context26.prev = 33;
            _context26.t1 = _context26["catch"](1);

            _logger["default"].error(_context26.t1);

            _logger["default"].error("CountByYearStudy, Values: ".concat(values, " Connection error"));

          case 37:
            return _context26.abrupt("return", result);

          case 38:
          case "end":
            return _context26.stop();
        }
      }
    }, _callee26, null, [[1, 33], [6, 25, 28, 31]]);
  }));
  return _getCountByYearStudy.apply(this, arguments);
}

function CapitalLetter(chain) {
  var array = chain.split('_');
  var result = '';

  var _iterator24 = _createForOfIteratorHelper(array),
      _step24;

  try {
    for (_iterator24.s(); !(_step24 = _iterator24.n()).done;) {
      var word = _step24.value;
      result = result + " " + word.charAt(0).toUpperCase() + word.substring(1);
    }
  } catch (err) {
    _iterator24.e(err);
  } finally {
    _iterator24.f();
  }

  return result;
}

function getCounterComponents(_x45) {
  return _getCounterComponents.apply(this, arguments);
}

function _getCounterComponents() {
  _getCounterComponents = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee27(bounds) {
    var result, coords, filters, _iterator42, _step42, component, _answer4, counter, SQL, query, data;

    return _regeneratorRuntime().wrap(function _callee27$(_context27) {
      while (1) {
        switch (_context27.prev = _context27.next) {
          case 0:
            result = [];
            _context27.prev = 1;
            coords = bounds.split(',');
            filters = "(ST_Contains(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), the_geom) or ");
            filters += "ST_Intersects(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), the_geom))");
            _iterator42 = _createForOfIteratorHelper(TABLES_COMPONENTS);
            _context27.prev = 6;

            _iterator42.s();

          case 8:
            if ((_step42 = _iterator42.n()).done) {
              _context27.next = 21;
              break;
            }

            component = _step42.value;
            _answer4 = [];
            counter = 0;
            SQL = "SELECT type, count(*) as count FROM ".concat(component, " where ").concat(filters, " group by type ");
            query = {
              q: " ".concat(SQL, " ")
            };
            _context27.next = 16;
            return (0, _needle["default"])('post', _config.CARTO_URL, query, {
              json: true
            });

          case 16:
            data = _context27.sent;

            if (data.statusCode === 200) {
              _answer4 = data.body.rows;

              if (data.body.rows.length > 0) {
                counter = _answer4[0].count;
              }
            }

            result.push({
              key: component,
              value: CapitalLetter(component),
              counter: counter
            });

          case 19:
            _context27.next = 8;
            break;

          case 21:
            _context27.next = 26;
            break;

          case 23:
            _context27.prev = 23;
            _context27.t0 = _context27["catch"](6);

            _iterator42.e(_context27.t0);

          case 26:
            _context27.prev = 26;

            _iterator42.f();

            return _context27.finish(26);

          case 29:
            _context27.next = 35;
            break;

          case 31:
            _context27.prev = 31;
            _context27.t1 = _context27["catch"](1);

            _logger["default"].error(_context27.t1);

            _logger["default"].error("getCounterComponents Connection error");

          case 35:
            return _context27.abrupt("return", result);

          case 36:
          case "end":
            return _context27.stop();
        }
      }
    }, _callee27, null, [[1, 31], [6, 23, 26, 29]]);
  }));
  return _getCounterComponents.apply(this, arguments);
}

function getComponentsValuesByColumnWithCount(_x46, _x47) {
  return _getComponentsValuesByColumnWithCount.apply(this, arguments);
}

function _getComponentsValuesByColumnWithCount() {
  _getComponentsValuesByColumnWithCount = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee28(column, bounds) {
    var result, coords, filters, LINE_SQL, query, data, _answer5, _iterator43, _step43, _loop5;

    return _regeneratorRuntime().wrap(function _callee28$(_context28) {
      while (1) {
        switch (_context28.prev = _context28.next) {
          case 0:
            result = [];
            _context28.prev = 1;
            coords = bounds.split(',');
            filters = "(ST_Contains(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), the_geom) or ");
            filters += "ST_Intersects(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), the_geom))");
            LINE_SQL = "SELECT ".concat(column, " as column FROM grade_control_structure where ").concat(filters, " group by ").concat(column, " union\n      SELECT ").concat(column, " as column FROM pipe_appurtenances where ").concat(filters, " group by ").concat(column, " union\n      SELECT ").concat(column, " as column FROM special_item_point where ").concat(filters, " group by ").concat(column, " union\n      SELECT ").concat(column, " as column FROM special_item_linear where ").concat(filters, " group by ").concat(column, " union\n      SELECT ").concat(column, " as column FROM special_item_area where ").concat(filters, " group by ").concat(column, " union\n      SELECT ").concat(column, " as column FROM channel_improvements_linear where ").concat(filters, " group by ").concat(column, " union\n      SELECT ").concat(column, " as column FROM channel_improvements_area where ").concat(filters, " group by ").concat(column, " union\n      SELECT ").concat(column, " as column FROM removal_line where ").concat(filters, " group by ").concat(column, " union\n      SELECT ").concat(column, " as column FROM removal_area where ").concat(filters, " group by ").concat(column, " union\n      SELECT ").concat(column, " as column FROM storm_drain where ").concat(filters, " group by ").concat(column, " union\n      SELECT ").concat(column, " as column FROM detention_facilities where ").concat(filters, " group by ").concat(column, " union\n      SELECT ").concat(column, " as column FROM maintenance_trails where ").concat(filters, " group by ").concat(column, " union\n      SELECT ").concat(column, " as column FROM land_acquisition where ").concat(filters, " group by ").concat(column, " union\n      SELECT ").concat(column, " as column FROM landscaping_area where ").concat(filters, " group by ").concat(column, " ");
            query = {
              q: " ".concat(LINE_SQL, " ")
            };
            _context28.next = 9;
            return (0, _needle["default"])('post', _config.CARTO_URL, query, {
              json: true
            });

          case 9:
            data = _context28.sent;
            _answer5 = [];

            if (data.statusCode === 200) {
              _answer5 = data.body.rows;
            }

            _iterator43 = _createForOfIteratorHelper(_answer5);

            try {
              _loop5 = function _loop5() {
                var row = _step43.value;
                var search = result.filter(function (item) {
                  return item == row.column;
                });

                if (search.length === 0) {
                  result.push(row.column);
                }
              };

              for (_iterator43.s(); !(_step43 = _iterator43.n()).done;) {
                _loop5();
              }
            } catch (err) {
              _iterator43.e(err);
            } finally {
              _iterator43.f();
            }

            result = result.sort(function (a, b) {
              return a > b ? 1 : -1;
            });
            _context28.next = 21;
            break;

          case 17:
            _context28.prev = 17;
            _context28.t0 = _context28["catch"](1);

            _logger["default"].error(_context28.t0);

            _logger["default"].error("getComponentsValuesByColumn, Column ".concat(column, " Connection error"));

          case 21:
            return _context28.abrupt("return", result);

          case 22:
          case "end":
            return _context28.stop();
        }
      }
    }, _callee28, null, [[1, 17]]);
  }));
  return _getComponentsValuesByColumnWithCount.apply(this, arguments);
}

function getComponentsValuesByColumn(_x48, _x49) {
  return _getComponentsValuesByColumn.apply(this, arguments);
}

function _getComponentsValuesByColumn() {
  _getComponentsValuesByColumn = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee29(column, bounds) {
    var result, coords, filters, LINE_SQL, query, data, _answer6, _iterator44, _step44, _loop6;

    return _regeneratorRuntime().wrap(function _callee29$(_context29) {
      while (1) {
        switch (_context29.prev = _context29.next) {
          case 0:
            result = [];
            _context29.prev = 1;
            coords = bounds.split(',');
            filters = "(ST_Contains(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), the_geom) or ");
            filters += "ST_Intersects(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), the_geom))");
            LINE_SQL = "SELECT ".concat(column, " as column, count(*) as count FROM grade_control_structure where ").concat(filters, " group by ").concat(column, " union\n      SELECT ").concat(column, " as column, count(*) as count FROM pipe_appurtenances where ").concat(filters, " group by ").concat(column, " union\n      SELECT ").concat(column, " as column, count(*) as count FROM special_item_point where ").concat(filters, " group by ").concat(column, " union\n      SELECT ").concat(column, " as column, count(*) as count FROM special_item_linear where ").concat(filters, " group by ").concat(column, " union\n      SELECT ").concat(column, " as column, count(*) as count FROM special_item_area where ").concat(filters, " group by ").concat(column, " union\n      SELECT ").concat(column, " as column, count(*) as count FROM channel_improvements_linear where ").concat(filters, " group by ").concat(column, " union\n      SELECT ").concat(column, " as column, count(*) as count FROM channel_improvements_area where ").concat(filters, " group by ").concat(column, " union\n      SELECT ").concat(column, " as column, count(*) as count FROM removal_line where ").concat(filters, " group by ").concat(column, " union\n      SELECT ").concat(column, " as column, count(*) as count FROM removal_area where ").concat(filters, " group by ").concat(column, " union\n      SELECT ").concat(column, " as column, count(*) as count FROM storm_drain where ").concat(filters, " group by ").concat(column, " union\n      SELECT ").concat(column, " as column, count(*) as count FROM detention_facilities where ").concat(filters, " group by ").concat(column, " union\n      SELECT ").concat(column, " as column, count(*) as count FROM maintenance_trails where ").concat(filters, " group by ").concat(column, " union\n      SELECT ").concat(column, " as column, count(*) as count FROM land_acquisition where ").concat(filters, " group by ").concat(column, " union\n      SELECT ").concat(column, " as column, count(*) as count FROM landscaping_area where ").concat(filters, " group by ").concat(column, " ");
            console.log('count(*) as countcount(*) as countcount(*) as countcount(*) as countcount(*) as count', LINE_SQL);
            query = {
              q: " ".concat(LINE_SQL, " ")
            };
            _context29.next = 10;
            return (0, _needle["default"])('post', _config.CARTO_URL, query, {
              json: true
            });

          case 10:
            data = _context29.sent;
            _answer6 = [];
            console.log('STATUS', data.statusCode);

            if (data.statusCode === 200) {
              _answer6 = data.body.rows;
            }

            _iterator44 = _createForOfIteratorHelper(_answer6);

            try {
              _loop6 = function _loop6() {
                var row = _step44.value;
                var search = result.filter(function (item) {
                  return item.value === row.column;
                });

                if (search.length === 0) {
                  var sum = _answer6.filter(function (item) {
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

              for (_iterator44.s(); !(_step44 = _iterator44.n()).done;) {
                _loop6();
              }
            } catch (err) {
              _iterator44.e(err);
            } finally {
              _iterator44.f();
            }

            _context29.next = 22;
            break;

          case 18:
            _context29.prev = 18;
            _context29.t0 = _context29["catch"](1);

            _logger["default"].error(_context29.t0);

            _logger["default"].error("getComponentsValuesByColumn, Column ".concat(column, " Connection error"));

          case 22:
            return _context29.abrupt("return", result);

          case 23:
          case "end":
            return _context29.stop();
        }
      }
    }, _callee29, null, [[1, 18]]);
  }));
  return _getComponentsValuesByColumn.apply(this, arguments);
}

function getCountWorkYear(_x50, _x51) {
  return _getCountWorkYear.apply(this, arguments);
}

function _getCountWorkYear() {
  _getCountWorkYear = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee30(data, bounds) {
    var result, coords, filters, _iterator45, _step45, value, counter, _iterator46, _step46, table, query, _data6;

    return _regeneratorRuntime().wrap(function _callee30$(_context30) {
      while (1) {
        switch (_context30.prev = _context30.next) {
          case 0:
            result = [];
            _context30.prev = 1;
            coords = bounds.split(',');
            filters = "(ST_Contains(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), the_geom) or ");
            filters += "ST_Intersects(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), the_geom))");
            _iterator45 = _createForOfIteratorHelper(data);
            _context30.prev = 6;

            _iterator45.s();

          case 8:
            if ((_step45 = _iterator45.n()).done) {
              _context30.next = 34;
              break;
            }

            value = _step45.value;
            counter = 0;
            _iterator46 = _createForOfIteratorHelper(PROJECT_TABLES);
            _context30.prev = 12;

            _iterator46.s();

          case 14:
            if ((_step46 = _iterator46.n()).done) {
              _context30.next = 23;
              break;
            }

            table = _step46.value;
            query = {
              q: "select count(*) as count from ".concat(table, " where ").concat(filters, " and ").concat(value.column, " > 0 ")
            };
            _context30.next = 19;
            return (0, _needle["default"])('post', _config.CARTO_URL, query, {
              json: true
            });

          case 19:
            _data6 = _context30.sent;

            //console.log('STATUS', data.statusCode, query);
            if (_data6.statusCode === 200) {
              if (_data6.body.rows.length > 0) {
                counter += _data6.body.rows[0].count;
              }
            }

          case 21:
            _context30.next = 14;
            break;

          case 23:
            _context30.next = 28;
            break;

          case 25:
            _context30.prev = 25;
            _context30.t0 = _context30["catch"](12);

            _iterator46.e(_context30.t0);

          case 28:
            _context30.prev = 28;

            _iterator46.f();

            return _context30.finish(28);

          case 31:
            result.push({
              value: value.year,
              counter: counter
            });

          case 32:
            _context30.next = 8;
            break;

          case 34:
            _context30.next = 39;
            break;

          case 36:
            _context30.prev = 36;
            _context30.t1 = _context30["catch"](6);

            _iterator45.e(_context30.t1);

          case 39:
            _context30.prev = 39;

            _iterator45.f();

            return _context30.finish(39);

          case 42:
            _context30.next = 48;
            break;

          case 44:
            _context30.prev = 44;
            _context30.t2 = _context30["catch"](1);

            _logger["default"].error(_context30.t2);

            _logger["default"].error("getCountWorkYear Connection error");

          case 48:
            return _context30.abrupt("return", result);

          case 49:
          case "end":
            return _context30.stop();
        }
      }
    }, _callee30, null, [[1, 44], [6, 36, 39, 42], [12, 25, 28, 31]]);
  }));
  return _getCountWorkYear.apply(this, arguments);
}

function getCountSolutionStatus(_x52, _x53) {
  return _getCountSolutionStatus.apply(this, arguments);
}

function _getCountSolutionStatus() {
  _getCountSolutionStatus = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee31(range, bounds) {
    var result, coords, filters, _iterator47, _step47, value, endValue, query, data, counter;

    return _regeneratorRuntime().wrap(function _callee31$(_context31) {
      while (1) {
        switch (_context31.prev = _context31.next) {
          case 0:
            result = [];
            _context31.prev = 1;
            coords = bounds.split(',');
            filters = "(ST_Contains(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), the_geom) or ");
            filters += "ST_Intersects(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), the_geom))");
            _iterator47 = _createForOfIteratorHelper(range);
            _context31.prev = 6;

            _iterator47.s();

          case 8:
            if ((_step47 = _iterator47.n()).done) {
              _context31.next = 21;
              break;
            }

            value = _step47.value;
            endValue = 0;

            if (value === 75) {
              endValue = value + 25;
            } else {
              endValue = value + 24;
            }

            query = {
              q: "select count(*) as count from ".concat(_config.PROBLEM_TABLE, " where ").concat(filters, " and solutionstatus between ").concat(value, " and ").concat(endValue, " ")
            };
            _context31.next = 15;
            return (0, _needle["default"])('post', _config.CARTO_URL, query, {
              json: true
            });

          case 15:
            data = _context31.sent;
            counter = 0;

            if (data.statusCode === 200) {
              if (data.body.rows.length > 0) {
                counter = data.body.rows[0].count;
              }
            }

            result.push({
              value: value,
              count: counter
            });

          case 19:
            _context31.next = 8;
            break;

          case 21:
            _context31.next = 26;
            break;

          case 23:
            _context31.prev = 23;
            _context31.t0 = _context31["catch"](6);

            _iterator47.e(_context31.t0);

          case 26:
            _context31.prev = 26;

            _iterator47.f();

            return _context31.finish(26);

          case 29:
            _context31.next = 35;
            break;

          case 31:
            _context31.prev = 31;
            _context31.t1 = _context31["catch"](1);

            _logger["default"].error(_context31.t1);

            _logger["default"].error("getCountSolutionStatus Connection error");

          case 35:
            return _context31.abrupt("return", result);

          case 36:
          case "end":
            return _context31.stop();
        }
      }
    }, _callee31, null, [[1, 31], [6, 23, 26, 29]]);
  }));
  return _getCountSolutionStatus.apply(this, arguments);
}

function getCountByArrayColumns(_x54, _x55, _x56, _x57) {
  return _getCountByArrayColumns.apply(this, arguments);
}

function _getCountByArrayColumns() {
  _getCountByArrayColumns = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee32(table, column, columns, bounds) {
    var result, coords, filters, _iterator48, _step48, value, query, counter, data, _iterator49, _step49, _value2, _answer7, _counter, _iterator50, _step50, _table, _query33, _data7, _iterator51, _step51, _loop7;

    return _regeneratorRuntime().wrap(function _callee32$(_context32) {
      while (1) {
        switch (_context32.prev = _context32.next) {
          case 0:
            result = [];
            _context32.prev = 1;
            coords = bounds.split(',');
            filters = "(ST_Contains(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), the_geom) or ");
            filters += "ST_Intersects(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), the_geom))");

            if (!(table === _config.PROBLEM_TABLE)) {
              _context32.next = 30;
              break;
            }

            _iterator48 = _createForOfIteratorHelper(columns);
            _context32.prev = 7;

            _iterator48.s();

          case 9:
            if ((_step48 = _iterator48.n()).done) {
              _context32.next = 20;
              break;
            }

            value = _step48.value;
            query = {
              q: "select ".concat(column, " as column, count(*) as count from ").concat(table, " \n              where ").concat(column, "='").concat(value, "' and ").concat(filters, " group by ").concat(column, " order by ").concat(column, " ")
            };
            counter = 0;
            _context32.next = 15;
            return (0, _needle["default"])('post', _config.CARTO_URL, query, {
              json: true
            });

          case 15:
            data = _context32.sent;

            //console.log('STATUS', data.statusCode);
            if (data.statusCode === 200) {
              //const result1 = data.body.rows;
              if (data.body.rows.length > 0) {
                counter = data.body.rows[0].count;
              }
            }

            result.push({
              value: value,
              count: counter
            });

          case 18:
            _context32.next = 9;
            break;

          case 20:
            _context32.next = 25;
            break;

          case 22:
            _context32.prev = 22;
            _context32.t0 = _context32["catch"](7);

            _iterator48.e(_context32.t0);

          case 25:
            _context32.prev = 25;

            _iterator48.f();

            return _context32.finish(25);

          case 28:
            _context32.next = 70;
            break;

          case 30:
            _iterator49 = _createForOfIteratorHelper(columns);
            _context32.prev = 31;

            _iterator49.s();

          case 33:
            if ((_step49 = _iterator49.n()).done) {
              _context32.next = 62;
              break;
            }

            _value2 = _step49.value;
            _answer7 = [];
            _counter = 0;
            _iterator50 = _createForOfIteratorHelper(PROJECT_TABLES);
            _context32.prev = 38;

            _iterator50.s();

          case 40:
            if ((_step50 = _iterator50.n()).done) {
              _context32.next = 49;
              break;
            }

            _table = _step50.value;
            _query33 = {
              q: "select ".concat(column, " as column, count(*) as count from ").concat(_table, " \n        where ").concat(column, "='").concat(_value2, "' and ").concat(filters, " group by ").concat(column, " order by ").concat(column, " ")
            };
            _context32.next = 45;
            return (0, _needle["default"])('post', _config.CARTO_URL, _query33, {
              json: true
            });

          case 45:
            _data7 = _context32.sent;

            //console.log('STATUS', data.statusCode);
            if (_data7.statusCode === 200) {
              if (_data7.body.rows.length > 0) {
                _answer7 = _answer7.concat(_data7.body.rows);
              }
            }

          case 47:
            _context32.next = 40;
            break;

          case 49:
            _context32.next = 54;
            break;

          case 51:
            _context32.prev = 51;
            _context32.t1 = _context32["catch"](38);

            _iterator50.e(_context32.t1);

          case 54:
            _context32.prev = 54;

            _iterator50.f();

            return _context32.finish(54);

          case 57:
            _iterator51 = _createForOfIteratorHelper(_answer7);

            try {
              _loop7 = function _loop7() {
                var row = _step51.value;
                var search = result.filter(function (item) {
                  return item.value === row.column;
                });

                if (search.length === 0) {
                  _counter = _answer7.filter(function (item) {
                    return item.column === row.column;
                  }).map(function (item) {
                    return item.count;
                  }).reduce(function (prev, next) {
                    return prev + next;
                  });
                }
              };

              for (_iterator51.s(); !(_step51 = _iterator51.n()).done;) {
                _loop7();
              }
            } catch (err) {
              _iterator51.e(err);
            } finally {
              _iterator51.f();
            }

            result.push({
              value: _value2,
              counter: _counter
            });

          case 60:
            _context32.next = 33;
            break;

          case 62:
            _context32.next = 67;
            break;

          case 64:
            _context32.prev = 64;
            _context32.t2 = _context32["catch"](31);

            _iterator49.e(_context32.t2);

          case 67:
            _context32.prev = 67;

            _iterator49.f();

            return _context32.finish(67);

          case 70:
            _context32.next = 76;
            break;

          case 72:
            _context32.prev = 72;
            _context32.t3 = _context32["catch"](1);

            _logger["default"].error(_context32.t3);

            _logger["default"].error("getCountByArrayColumns Table: ".concat(table, ", Column: ").concat(column, " Connection error"));

          case 76:
            return _context32.abrupt("return", result);

          case 77:
          case "end":
            return _context32.stop();
        }
      }
    }, _callee32, null, [[1, 72], [7, 22, 25, 28], [31, 64, 67, 70], [38, 51, 54, 57]]);
  }));
  return _getCountByArrayColumns.apply(this, arguments);
}

function getSubtotalsByComponent(_x58, _x59, _x60) {
  return _getSubtotalsByComponent.apply(this, arguments);
}

function _getSubtotalsByComponent() {
  _getSubtotalsByComponent = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee33(table, column, bounds) {
    var result, coords, COMPONENTS, _iterator52, _step52, tablename, _table2, filters, query, data, counter, _iterator53, _step53, _tablename, _counter2, _table3, _filters4, _iterator54, _step54, project, _query34, _data8;

    return _regeneratorRuntime().wrap(function _callee33$(_context33) {
      while (1) {
        switch (_context33.prev = _context33.next) {
          case 0:
            result = [];
            _context33.prev = 1;
            coords = bounds.split(',');
            COMPONENTS = ['Grade Control Structure', 'Pipe Appurtenances', 'Special Item Point', 'Special Item Linear', 'Special Item Area', 'Channel Improvements Linear', 'Channel Improvements Area', 'Removal Line', 'Removal Area', 'Storm Drain', 'Detention Facilities', 'Maintenance Trails', 'Land Acquisition', 'Landscaping Area'];

            if (!(table === _config.PROBLEM_TABLE)) {
              _context33.next = 32;
              break;
            }

            _iterator52 = _createForOfIteratorHelper(COMPONENTS);
            _context33.prev = 6;

            _iterator52.s();

          case 8:
            if ((_step52 = _iterator52.n()).done) {
              _context33.next = 22;
              break;
            }

            tablename = _step52.value;
            _table2 = tablename.toLowerCase().split(' ').join('_');
            filters = "(ST_Contains(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), ").concat(_table2, ".the_geom) or ");
            filters += "ST_Intersects(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), ").concat(_table2, ".the_geom))");
            query = {
              q: "select count(*) from ".concat(_table2, ", ").concat(_config.PROBLEM_TABLE, " where ").concat(_config.PROBLEM_TABLE, ".").concat(column, "= ").concat(_table2, ".").concat(column, " and ").concat(filters, " ")
            };
            _context33.next = 16;
            return (0, _needle["default"])('post', _config.CARTO_URL, query, {
              json: true
            });

          case 16:
            data = _context33.sent;
            counter = 0;

            if (data.statusCode === 200) {
              if (data.body.rows.length > 0) {
                counter = data.body.rows[0].count;
              }
            }

            result.push({
              key: _table2,
              value: tablename,
              count: counter
            });

          case 20:
            _context33.next = 8;
            break;

          case 22:
            _context33.next = 27;
            break;

          case 24:
            _context33.prev = 24;
            _context33.t0 = _context33["catch"](6);

            _iterator52.e(_context33.t0);

          case 27:
            _context33.prev = 27;

            _iterator52.f();

            return _context33.finish(27);

          case 30:
            _context33.next = 72;
            break;

          case 32:
            _iterator53 = _createForOfIteratorHelper(COMPONENTS);
            _context33.prev = 33;

            _iterator53.s();

          case 35:
            if ((_step53 = _iterator53.n()).done) {
              _context33.next = 64;
              break;
            }

            _tablename = _step53.value;
            _counter2 = 0;
            _table3 = _tablename.toLowerCase().split(' ').join('_');
            _filters4 = "(ST_Contains(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), ").concat(_table3, ".the_geom) or ");
            _filters4 += "ST_Intersects(ST_MakeEnvelope(".concat(coords[0], ",").concat(coords[1], ",").concat(coords[2], ",").concat(coords[3], ",4326), ").concat(_table3, ".the_geom))");
            _iterator54 = _createForOfIteratorHelper(PROJECT_TABLES);
            _context33.prev = 42;

            _iterator54.s();

          case 44:
            if ((_step54 = _iterator54.n()).done) {
              _context33.next = 53;
              break;
            }

            project = _step54.value;
            _query34 = {
              q: "select count(*) from ".concat(_table3, ", ").concat(project, " where ").concat(project, ".").concat(column, "= ").concat(_table3, ".").concat(column, " and ").concat(_filters4, " ")
            };
            _context33.next = 49;
            return (0, _needle["default"])('post', _config.CARTO_URL, _query34, {
              json: true
            });

          case 49:
            _data8 = _context33.sent;

            if (_data8.statusCode === 200) {
              if (_data8.body.rows.length > 0) {
                _counter2 = _data8.body.rows[0].count;
              }
            }

          case 51:
            _context33.next = 44;
            break;

          case 53:
            _context33.next = 58;
            break;

          case 55:
            _context33.prev = 55;
            _context33.t1 = _context33["catch"](42);

            _iterator54.e(_context33.t1);

          case 58:
            _context33.prev = 58;

            _iterator54.f();

            return _context33.finish(58);

          case 61:
            result.push({
              key: _table3,
              value: _tablename,
              count: _counter2
            });

          case 62:
            _context33.next = 35;
            break;

          case 64:
            _context33.next = 69;
            break;

          case 66:
            _context33.prev = 66;
            _context33.t2 = _context33["catch"](33);

            _iterator53.e(_context33.t2);

          case 69:
            _context33.prev = 69;

            _iterator53.f();

            return _context33.finish(69);

          case 72:
            _context33.next = 78;
            break;

          case 74:
            _context33.prev = 74;
            _context33.t3 = _context33["catch"](1);

            _logger["default"].error(_context33.t3);

            _logger["default"].error("getSubtotalsByComponent Connection error");

          case 78:
            return _context33.abrupt("return", result);

          case 79:
          case "end":
            return _context33.stop();
        }
      }
    }, _callee33, null, [[1, 74], [6, 24, 27, 30], [33, 66, 69, 72], [42, 55, 58, 61]]);
  }));
  return _getSubtotalsByComponent.apply(this, arguments);
}

router.get('/range', /*#__PURE__*/function () {
  var _ref15 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee15(req, res) {
    var rangeMhfdDollarsAllocated, result;
    return _regeneratorRuntime().wrap(function _callee15$(_context15) {
      while (1) {
        switch (_context15.prev = _context15.next) {
          case 0:
            _context15.prev = 0;
            bounds = req.query.bounds;
            rangeMhfdDollarsAllocated = [{
              min: 0,
              max: 250000
            }, {
              min: 250001,
              max: 500000
            }, {
              min: 500001,
              max: 750000
            }, {
              min: 750001,
              max: 1000000
            }, {
              min: 1000001,
              max: 50000000
            }];
            _context15.next = 5;
            return getValuesByRange(_config.MAIN_PROJECT_TABLE, 'mhfddollarsallocated', rangeMhfdDollarsAllocated, bounds);

          case 5:
            result = _context15.sent;
            res.status(200).send(result);
            _context15.next = 13;
            break;

          case 9:
            _context15.prev = 9;
            _context15.t0 = _context15["catch"](0);

            _logger["default"].error(_context15.t0);

            _logger["default"].error("getSubtotalsByComponent Connection error");

          case 13:
          case "end":
            return _context15.stop();
        }
      }
    }, _callee15, null, [[0, 9]]);
  }));

  return function (_x61, _x62) {
    return _ref15.apply(this, arguments);
  };
}());
router.get('/params-filters', /*#__PURE__*/function () {
  var _ref16 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee16(req, res) {
    var requests, rangeMhfdDollarsAllocated, rangeTotalCost, problemTypesConst, rangeSolution, _promises, result;

    return _regeneratorRuntime().wrap(function _callee16$(_context16) {
      while (1) {
        switch (_context16.prev = _context16.next) {
          case 0:
            _context16.prev = 0;
            bounds = req.query.bounds; //console.log(bounds);

            requests = []; // PROJECTS

            requests.push(getValuesByColumnWithOutCount(_config.MAIN_PROJECT_TABLE, 'creator', bounds));
            requests.push(getValuesByColumnWithOutCount(_config.MAIN_PROJECT_TABLE, 'mhfdmanager', bounds));
            requests.push(getCountByArrayColumns(_config.MAIN_PROJECT_TABLE, 'projecttype', ['Maintenance', 'Study', 'Capital'], bounds));
            requests.push(getCountByArrayColumns(_config.MAIN_PROJECT_TABLE, 'status', _galleryConstants.statusList, bounds));
            requests.push(getValuesByColumn(_config.MAIN_PROJECT_TABLE, 'startyear', bounds));
            requests.push(getValuesByColumn(_config.MAIN_PROJECT_TABLE, _config.COMPLETE_YEAR_COLUMN, bounds));
            rangeMhfdDollarsAllocated = [{
              min: 0,
              max: 250000
            }, {
              min: 250001,
              max: 500000
            }, {
              min: 500001,
              max: 750000
            }, {
              min: 750001,
              max: 1000000
            }, {
              min: 1000001,
              max: 50000000
            }];
            requests.push(getValuesByRange(_config.MAIN_PROJECT_TABLE, 'mhfddollarsallocated', rangeMhfdDollarsAllocated, bounds)); //requests.push(getQuintilValues(MAIN_PROJECT_TABLE, 'mhfddollarsallocated', bounds));

            requests.push(getCountWorkYear([{
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
            }], bounds));
            requests.push(getProjectByProblemType(bounds));
            requests.push(getValuesByColumnWithOutCount(_config.MAIN_PROJECT_TABLE, 'jurisdiction', bounds));
            requests.push(getValuesByColumnWithOutCount(_config.MAIN_PROJECT_TABLE, 'county', bounds));
            requests.push(getValuesByColumnWithOutCount(_config.MAIN_PROJECT_TABLE, 'lgmanager', bounds));
            requests.push(getValuesByColumnWithOutCount(_config.MAIN_PROJECT_TABLE, 'streamname', bounds)); //requests.push(getQuintilValues(MAIN_PROJECT_TABLE, 'estimatedcost', bounds));

            rangeTotalCost = [{
              min: 0,
              max: 250000
            }, {
              min: 250001,
              max: 500000
            }, {
              min: 500001,
              max: 750000
            }, {
              min: 750001,
              max: 1000000
            }, {
              min: 1000001,
              max: 50000000
            }];
            requests.push(getValuesByRange(_config.MAIN_PROJECT_TABLE, 'estimatedcost', rangeTotalCost, bounds));
            requests.push(getValuesByColumnWithOutCount(_config.MAIN_PROJECT_TABLE, 'consultant', bounds));
            requests.push(getValuesByColumnWithOutCount(_config.MAIN_PROJECT_TABLE, 'contractor', bounds));
            requests.push(getValuesByColumnWithOutCount(_config.MAIN_PROJECT_TABLE, 'servicearea', bounds)); // PROBLEMS

            problemTypesConst = ['Human Connection', 'Geomorphology', 'Vegetation', 'Hydrology', 'Hydraulics'];
            requests.push(getCountByArrayColumns(_config.PROBLEM_TABLE, 'problempriority', ['High', 'Medium', 'Low'], bounds));
            requests.push(getCountSolutionStatus([0, 25, 50, 75], bounds));
            requests.push(getValuesByColumn(_config.PROBLEM_TABLE, 'county', bounds));
            requests.push(getValuesByColumnWithOutCount(_config.PROBLEM_TABLE, 'jurisdiction', bounds));
            requests.push(getValuesByColumnWithOutCount(_config.PROBLEM_TABLE, 'mhfdmanager', bounds));
            requests.push(getValuesByColumnWithOutCount(_config.PROBLEM_TABLE, 'source', bounds));
            requests.push(getSubtotalsByComponent(_config.PROBLEM_TABLE, 'problemid', bounds)); //requests.push(getQuintilValues('problems', 'solutioncost', bounds));

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
            requests.push(getValuesByRange(_config.PROBLEM_TABLE, 'solutioncost', rangeSolution, bounds));
            requests.push(getValuesByColumnWithOutCount(_config.PROBLEM_TABLE, 'servicearea', bounds)); // Components

            requests.push(getCounterComponents(bounds));
            requests.push(getComponentsValuesByColumn('status', bounds));
            requests.push(getCountByYearStudy([1970, 1980, 1990, 2000, 2010, 2020], bounds));
            requests.push(getComponentsValuesByColumnWithCount('jurisdiction', bounds));
            requests.push(getComponentsValuesByColumnWithCount('county', bounds));
            requests.push(getComponentsValuesByColumnWithCount('mhfdmanager', bounds));
            requests.push(getQuintilComponentValues('estimated_cost', bounds));
            requests.push(getComponentsValuesByColumnWithCount('servicearea', bounds));
            _context16.next = 43;
            return Promise.all(requests);

          case 43:
            _promises = _context16.sent;
            result = {
              "projects": {
                "creator": _promises[0],
                "mhfdmanager": _promises[1],
                "projecttype": _promises[2],
                "status": _promises[3],
                "startyear": _promises[4],
                "completedyear": _promises[5],
                "mhfddollarsallocated": _promises[6],
                "workplanyear": _promises[7],
                //workplanyear,
                "problemtype": _promises[8],
                //problemtype,
                "jurisdiction": _promises[9],
                "county": _promises[10],
                "lgmanager": _promises[11],
                "streamname": _promises[12],
                "estimatedCost": _promises[13],
                "consultant": _promises[14],
                "contractor": _promises[15],
                "servicearea": _promises[16]
              },
              "problems": {
                "problemtype": problemTypesConst,
                "priority": _promises[17],
                "solutionstatus": _promises[18],
                "county": _promises[19],
                "jurisdiction": _promises[20],
                "mhfdmanager": _promises[21],
                "source": _promises[22],
                "components": _promises[23],
                "cost": _promises[24],
                "servicearea": _promises[25]
              },
              "components": {
                "component_type": _promises[26],
                "status": _promises[27],
                "yearofstudy": _promises[28],
                "jurisdiction": _promises[29],
                "county": _promises[30],
                "watershed": _promises[31],
                "estimatedcost": _promises[32],
                "servicearea": _promises[33]
              }
            };
            res.status(200).send(result);
            _context16.next = 52;
            break;

          case 48:
            _context16.prev = 48;
            _context16.t0 = _context16["catch"](0);

            _logger["default"].error(_context16.t0);

            res.status(500).send({
              error: _context16.t0
            }).send({
              error: 'Connection error'
            });

          case 52:
          case "end":
            return _context16.stop();
        }
      }
    }, _callee16, null, [[0, 48]]);
  }));

  return function (_x63, _x64) {
    return _ref16.apply(this, arguments);
  };
}());
router.get('/problem_part/:id', /*#__PURE__*/function () {
  var _ref17 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee17(req, res) {
    var id, promises, tables, _iterator25, _step25, _loop2, all;

    return _regeneratorRuntime().wrap(function _callee17$(_context17) {
      while (1) {
        switch (_context17.prev = _context17.next) {
          case 0:
            id = req.params.id;
            promises = [];
            tables = _config.PROBLEM_PART_TABLES;
            _iterator25 = _createForOfIteratorHelper(tables);

            try {
              _loop2 = function _loop2() {
                var element = _step25.value;
                var sql = "SELECT problem_type, problem_part_category, problem_part_subcategory, globalid FROM ".concat(element, "\n     WHERE problem_id = ").concat(id);
                console.log('my sql ', sql);
                sql = encodeURIComponent(sql);
                var URL = "".concat(_config.CARTO_URL, "&q=").concat(sql);
                promises.push(new Promise(function (resolve, reject) {
                  _https["default"].get(URL, function (response) {
                    if (response.statusCode == 200) {
                      var str = '';
                      response.on('data', function (chunk) {
                        str += chunk;
                      });
                      response.on('end', function () {
                        var rows = JSON.parse(str).rows;
                        console.log(rows);
                        resolve(rows);
                      });
                    } else {
                      console.log('status ', response.statusCode, URL);
                      resolve([]);
                    }
                  }).on('error', function (err) {
                    console.log('failed call to ', URL, 'with error ', err);
                    resolve([]);
                  });
                }));
              };

              for (_iterator25.s(); !(_step25 = _iterator25.n()).done;) {
                _loop2();
              }
            } catch (err) {
              _iterator25.e(err);
            } finally {
              _iterator25.f();
            }

            _context17.next = 7;
            return Promise.all(promises);

          case 7:
            all = _context17.sent;
            res.send({
              data: all
            });

          case 9:
          case "end":
            return _context17.stop();
        }
      }
    }, _callee17);
  }));

  return function (_x65, _x66) {
    return _ref17.apply(this, arguments);
  };
}());
router.post('/params-filter-components', _mapgalleryComponentRoute.componentParamFilterRoute);
router.post('/params-filter-projects', _mapgalleryProjectRoute.projectParamFilterRoute);
router.post('/params-filter-problems', _mapgalleryProblemRoute.problemParamFilterRoute);
router.post('/project-statistics', _mapgalleryProjectRoute.projectStatistics);
/* Tab counter routes */

router.post('/problems-counter', _mapgalleryProblemRoute.problemCounterRoute);
router.post('/projects-counter', _mapgalleryProjectRoute.projectCounterRoute);
router.post('/components-counter', _mapgalleryComponentRoute.componentCounterRoute);
var _default = router;
exports["default"] = _default;