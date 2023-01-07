"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCoordinatesOfComponents = getCoordinatesOfComponents;
exports.getMinimumDateByProjectId = exports.getMidByProjectId = exports.getDataByProjectIds = exports.getCoordsByProjectId = void 0;
exports.getProblemByProjectId = getProblemByProjectId;

var _needle = _interopRequireDefault(require("needle"));

var _https = _interopRequireDefault(require("https"));

var _attachmentService = _interopRequireDefault(require("bc/services/attachment.service.js"));

var _projectStreamService = _interopRequireDefault(require("bc/services/projectStream.service.js"));

var _config = require("bc/config/config.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return generator._invoke = function (innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; }(innerFn, self, context), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; this._invoke = function (method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (object) { var keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var getCoordsByProjectId = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(projectid, isDev) {
    var table, fields, SQL, URL, data, obj, o;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            table = _config.MAIN_PROJECT_TABLE;

            if (isDev) {
              table = _config.CREATE_PROJECT_TABLE;
            }

            fields = ['ST_AsGeoJSON(the_geom) as the_geom3'];
            SQL = "SELECT ".concat(fields.join(', '), " FROM ").concat(table, " where projectid=").concat(projectid);
            URL = encodeURI("".concat(_config.CARTO_URL, "&q=").concat(SQL));
            _context.next = 7;
            return (0, _needle["default"])('get', URL, {
              json: true
            });

          case 7:
            data = _context.sent;

            if (!(data.statusCode === 200 && data.body.rows.length > 0)) {
              _context.next = 15;
              break;
            }

            obj = data.body.rows[0];
            o = {};
            o.createdCoordinates = obj.the_geom3;
            return _context.abrupt("return", o);

          case 15:
            console.log('getCoordsByProjectId error', data.statusCode, data.body);
            throw new Error('Project not found');

          case 17:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function getCoordsByProjectId(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

exports.getCoordsByProjectId = getCoordsByProjectId;

var getMidByProjectId = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(projectid, projecttype) {
    var table, fields, SQL, URL, data, obj, streams;
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            table = _config.CREATE_PROJECT_TABLE;
            fields = ["projectid", "cartodb_id", "county", "jurisdiction", "servicearea", "projectname", "status", "description", "acquisitionprogress", "acquisitionanticipateddate", "projecttype", "projectsubtype", "additionalcost", "additionalcostdescription", "".concat(_config.COSPONSOR1, " as ").concat(_config.COSPONSOR), "frequency", "maintenanceeligibility", "overheadcost", "overheadcostdescription", "ownership", "sponsor", 'estimatedcost', 'studyreason', 'studysubreason'];

            if (['Acquisition', 'Special', 'Maintenance', 'Capital'].includes(projecttype)) {
              fields.push('ST_AsGeoJSON(the_geom) as the_geom');
            }

            SQL = "SELECT ".concat(fields.join(', '), " FROM ").concat(table, " where projectid=").concat(projectid);
            console.log('SQL in get mid by project id ', SQL);
            URL = encodeURI("".concat(_config.CARTO_URL, "&q=").concat(SQL));
            _context2.next = 8;
            return (0, _needle["default"])('get', URL, {
              json: true
            });

          case 8:
            data = _context2.sent;

            if (!(data.statusCode === 200 && data.body.rows.length > 0)) {
              _context2.next = 19;
              break;
            }

            obj = data.body.rows[0];

            if (!(projecttype === 'Study')) {
              _context2.next = 16;
              break;
            }

            _context2.next = 14;
            return _projectStreamService["default"].getAll(projectid);

          case 14:
            streams = _context2.sent;
            obj.streams = streams.map(function (r) {
              return r.mhfd_code;
            });

          case 16:
            return _context2.abrupt("return", obj);

          case 19:
            console.log('getMidByProjectId error', data.statusCode, data.body);
            return _context2.abrupt("return", null);

          case 21:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function getMidByProjectId(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();

exports.getMidByProjectId = getMidByProjectId;

var getMinimumDateByProjectId = /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(projectid) {
    var table, SQL, URL, data;
    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            table = _config.CREATE_PROJECT_TABLE;
            SQL = "SELECT county, servicearea FROM ".concat(table, " where projectid=").concat(projectid);
            URL = encodeURI("".concat(_config.CARTO_URL, "&q=").concat(SQL));
            _context3.next = 5;
            return (0, _needle["default"])('get', URL, {
              json: true
            });

          case 5:
            data = _context3.sent;

            if (!(data.statusCode === 200 && data.body.rows.length > 0)) {
              _context3.next = 10;
              break;
            }

            return _context3.abrupt("return", data.body.rows[0]);

          case 10:
            console.log('getMinimumDateByProjectId error', data.statusCode, data.body);
            throw new Error('Project not found');

          case 12:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function getMinimumDateByProjectId(_x5) {
    return _ref3.apply(this, arguments);
  };
}(); // in the future change isDev for is board project , don't delete the variable please @pachon


exports.getMinimumDateByProjectId = getMinimumDateByProjectId;

var getDataByProjectIds = /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(projectid, isDev) {
    var table, SQL, URL, data, _ref5, result, problems, attachmentFinal, components, coordinates, convexhull, createdCoordinates;

    return _regeneratorRuntime().wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            table = _config.MAIN_PROJECT_TABLE;

            if (isDev) {
              table = _config.CREATE_PROJECT_TABLE;
            }

            SQL = "SELECT *, ST_AsGeoJSON(ST_Envelope(the_geom)) as the_geom2, ST_AsGeoJSON(the_geom) as the_geom3 FROM ".concat(table, " where  projectid=").concat(projectid, " ");
            URL = encodeURI("".concat(_config.CARTO_URL, "&q=").concat(SQL));
            _context4.next = 6;
            return (0, _needle["default"])('get', URL, {
              json: true
            });

          case 6:
            data = _context4.sent;
            console.log("\n\n\n\nSQL\n\n\n\n", SQL);

            if (!(data.statusCode === 200 && data.body.rows.length > 0)) {
              _context4.next = 37;
              break;
            }

            result = data.body.rows[0];
            problems = [];
            attachmentFinal = [];
            components = [];
            coordinates = [];
            convexhull = [];

            if (!(result.projectid !== null && result.projectid !== undefined && result.projectid)) {
              _context4.next = 26;
              break;
            }

            _context4.next = 18;
            return getProblemByProjectId(result.projectid, _config.PROPSPROBLEMTABLES.problems[6], 'asc');

          case 18:
            problems = _context4.sent;
            _context4.next = 21;
            return getCoordinatesOfComponents(result.projectid, 'projectid');

          case 21:
            components = _context4.sent;
            _context4.next = 24;
            return getEnvelopeProblemsComponentsAndProject(result.projectid, table, 'projectid');

          case 24:
            convexhull = _context4.sent;

            if (convexhull[0]) {
              convexhull = JSON.parse(convexhull[0].envelope).coordinates;
            }

          case 26:
            if (!result.attachments) {
              _context4.next = 30;
              break;
            }

            _context4.next = 29;
            return _attachmentService["default"].findByName(result.attachments);

          case 29:
            attachmentFinal = _context4.sent;

          case 30:
            createdCoordinates = {};

            if (isDev) {
              createdCoordinates = result.the_geom3;
            }

            result.the_geom = result.the_geom2;

            if (convexhull[0].length > 0) {
              coordinates = convexhull; // console.log("CONVEX HULL", coordinates);
            } else if (JSON.parse(result.the_geom).coordinates) {
              coordinates = JSON.parse(result.the_geom).coordinates;
            }

            return _context4.abrupt("return", (_ref5 = {
              cartodb_id: result.cartodb_id,
              objectid: result.objectid,
              createdCoordinates: createdCoordinates,
              projectid: result.projectid,
              onbaseid: result.onbaseid,
              projectname: result.projectname,
              status: result.status,
              requestedname: result.requestedname,
              projecttype: result.projecttype,
              projectsubtype: result.projectsubtype,
              description: result.description,
              sponsor: result.sponsor,
              cosponsor: result.cosponsor,
              recurrence: result.recurrence,
              frequency: result.frequency,
              mhfddollarsrequested: result.mhfddollarsrequested,
              estimatedcost: result.estimatedcost,
              componentcost: result.component_cost,
              mhfddollarsallocated: result.mhfddollarsallocated,
              finalcost: result.finalcost,
              startyear: result.startyear,
              completedyear: result.completedyear,
              consultant: result.consultant,
              contractor: result.contractor,
              lgmanager: result.lgmanager,
              mhfdmanager: result.mhfdmanager,
              servicearea: result.servicearea,
              county: result.county,
              jurisdiction: result.jurisdiction,
              streamname: result.streamname,
              tasksedimentremoval: result.tasksedimentremoval,
              tasktreethinning: result.tasktreethinning,
              taskbankstabilization: result.taskbankstabilization,
              taskdrainagestructure: result.taskdrainagestructure,
              taskregionaldetention: result.taskregionaldetention,
              goalfloodrisk: result.goalfloodrisk,
              goalwaterquality: result.goalwaterquality,
              goalstabilization: result.goalstabilization,
              goalcaprecreation: result.goalcaprecreation,
              goalcapvegetation: result.goalcapvegetation,
              goalstudyovertopping: result.goalstudyovertopping,
              goalstudyconveyance: result.goalstudyconveyance,
              goalstudypeakflow: result.goalstudypeakflow,
              goalstudydevelopment: result.goalstudydevelopment,
              creator: result.creator,
              datecreated: result.datecreated,
              lastmodifieduser: result.lastmodifieduser,
              lastmodifieddate: result.lastmodifieddate,
              workplanyr1: result.workplanyr1,
              workplanyr2: result.workplanyr2,
              workplanyr3: result.workplanyr3,
              workplanyr4: result.workplanyr4,
              workplanyr5: result.workplanyr5,
              coverimage: result.coverimage,
              globalid: result.globalid,
              shape_length: result.shape_length,
              attachments: attachmentFinal,
              problems: problems,
              components: components,
              coordinates: coordinates,
              acquisitionprogress: result.acquisitionprogress,
              acquisitionanticipateddate: result.acquisitionanticipateddate
            }, _defineProperty(_ref5, "acquisitionprogress", result.acquisitionprogress), _defineProperty(_ref5, "acquisitionanticipateddate", result.acquisitionanticipateddate), _defineProperty(_ref5, "sponsor", result.sponsor), _defineProperty(_ref5, "cosponsor", result.cosponsor), _defineProperty(_ref5, "frequency", result.frequency), _defineProperty(_ref5, "maintenanceeligibility", result.maintenanceeligibility), _defineProperty(_ref5, "ownership", result.ownership), _defineProperty(_ref5, "overheadcost", result.overheadcost), _defineProperty(_ref5, "overheadcostdescription", result.overheadcostdescription), _defineProperty(_ref5, "additionalcost", result.additionalcost), _defineProperty(_ref5, "additionalcostdescription", result.additionalcostdescription), _ref5));

          case 37:
            console.log('getDataByProjectIds error', data.statusCode, data.body);
            throw new Error('Project not found');

          case 39:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function getDataByProjectIds(_x6, _x7) {
    return _ref4.apply(this, arguments);
  };
}();

exports.getDataByProjectIds = getDataByProjectIds;

function getProblemByProjectId(_x8, _x9, _x10) {
  return _getProblemByProjectId.apply(this, arguments);
}

function _getProblemByProjectId() {
  _getProblemByProjectId = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6(projectid, sortby, sorttype) {
    var data, LINE_SQL, LINE_URL, newProm1;
    return _regeneratorRuntime().wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            data = [];
            LINE_SQL = "select ".concat(_config.PROPSPROBLEMTABLES.problem_boundary[5], " as ").concat(_config.PROPSPROBLEMTABLES.problems[5], ", ").concat(_config.PROPSPROBLEMTABLES.problem_boundary[6], " as ").concat(_config.PROPSPROBLEMTABLES.problems[6], ", ").concat(_config.PROPSPROBLEMTABLES.problem_boundary[7], "  as ").concat(_config.PROPSPROBLEMTABLES.problems[7], " from ").concat(_config.PROBLEM_TABLE, "  \n where ").concat(_config.PROPSPROBLEMTABLES.problem_boundary[5], " in (SELECT problemid FROM grade_control_structure \n   where projectid=").concat(projectid, " and projectid>0  union ") + "SELECT problemid FROM pipe_appurtenances \n   where projectid=".concat(projectid, " and projectid>0  union ") + "SELECT problemid FROM special_item_point \n   where projectid=".concat(projectid, " and projectid>0  union ") + "SELECT problemid FROM special_item_linear \n   where projectid=".concat(projectid, " and projectid>0  union ") + "SELECT problemid FROM special_item_area \n   where projectid=".concat(projectid, " and projectid>0  union ") + "SELECT problemid FROM channel_improvements_linear \n   where projectid=".concat(projectid, " and projectid>0  union ") + "SELECT problemid FROM channel_improvements_area \n   where projectid=".concat(projectid, " and projectid>0  union ") + "SELECT problemid FROM removal_line \n   where projectid=".concat(projectid, " and projectid>0  union ") + "SELECT problemid FROM removal_area \n   where projectid=".concat(projectid, " and projectid>0  union ") + "SELECT problemid FROM storm_drain \n   where projectid=".concat(projectid, " and projectid>0  union ") + "SELECT problemid FROM detention_facilities \n   where projectid=".concat(projectid, " and projectid>0  union ") + "SELECT problemid FROM maintenance_trails \n   where projectid=".concat(projectid, " and projectid>0  union ") + "SELECT problemid FROM land_acquisition \n   where projectid=".concat(projectid, " and projectid>0  union ") + "SELECT problemid FROM landscaping_area \n   where projectid=".concat(projectid, " and projectid>0) \n   order by ").concat(sortby, " ").concat(sorttype);
            LINE_URL = encodeURI("".concat(_config.CARTO_URL, "&q=").concat(LINE_SQL)); //console.log(LINE_URL);

            _context6.prev = 3;
            newProm1 = new Promise(function (resolve, reject) {
              _https["default"].get(LINE_URL, function (response) {
                if (response.statusCode === 200) {
                  var str = '';
                  response.on('data', function (chunk) {
                    str += chunk;
                  });
                  response.on('end', /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5() {
                    return _regeneratorRuntime().wrap(function _callee5$(_context5) {
                      while (1) {
                        switch (_context5.prev = _context5.next) {
                          case 0:
                            resolve(JSON.parse(str).rows);

                          case 1:
                          case "end":
                            return _context5.stop();
                        }
                      }
                    }, _callee5);
                  })));
                }
              });
            });
            _context6.next = 7;
            return newProm1;

          case 7:
            data = _context6.sent;
            return _context6.abrupt("return", data);

          case 11:
            _context6.prev = 11;
            _context6.t0 = _context6["catch"](3);
            console.error('Error with QUERY ', LINE_SQL);

          case 14:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, null, [[3, 11]]);
  }));
  return _getProblemByProjectId.apply(this, arguments);
}

function getEnvelopeProblemsComponentsAndProject(_x11, _x12, _x13) {
  return _getEnvelopeProblemsComponentsAndProject.apply(this, arguments);
}

function _getEnvelopeProblemsComponentsAndProject() {
  _getEnvelopeProblemsComponentsAndProject = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee8(id, table, field) {
    var SQL, SQL_URL, newProm1, data;
    return _regeneratorRuntime().wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            SQL = "\n  select ST_ASGEOJSON(ST_EXTENT(the_geom)) as envelope\n    from (\n    SELECT the_geom FROM ".concat(table, " where  projectid=").concat(id, "\n  union \n    select the_geom from ").concat(_config.PROBLEM_TABLE, "  \n      where ").concat(_config.PROPSPROBLEMTABLES.problem_boundary[5], " in (SELECT problemid FROM grade_control_structure \n        where projectid=").concat(id, " and projectid>0  union SELECT problemid FROM pipe_appurtenances \n        where projectid=").concat(id, " and projectid>0  union SELECT problemid FROM special_item_point \n        where projectid=").concat(id, " and projectid>0  union SELECT problemid FROM special_item_linear \n        where projectid=").concat(id, " and projectid>0  union SELECT problemid FROM special_item_area \n        where projectid=").concat(id, " and projectid>0  union SELECT problemid FROM channel_improvements_linear \n        where projectid=").concat(id, " and projectid>0  union SELECT problemid FROM channel_improvements_area \n        where projectid=").concat(id, " and projectid>0  union SELECT problemid FROM removal_line \n        where projectid=").concat(id, " and projectid>0  union SELECT problemid FROM removal_area \n        where projectid=").concat(id, " and projectid>0  union SELECT problemid FROM storm_drain \n        where projectid=").concat(id, " and projectid>0  union SELECT problemid FROM detention_facilities \n        where projectid=").concat(id, " and projectid>0  union SELECT problemid FROM maintenance_trails \n        where projectid=").concat(id, " and projectid>0  union SELECT problemid FROM land_acquisition \n        where projectid=").concat(id, " and projectid>0  union SELECT problemid FROM landscaping_area \n        where projectid=").concat(id, " and projectid>0) \n  union  \n    SELECT the_geom FROM grade_control_structure where ").concat(field, "=").concat(id, "  \n      union SELECT the_geom FROM pipe_appurtenances where ").concat(field, "=").concat(id, "  \n      union SELECT the_geom FROM special_item_point where ").concat(field, "=").concat(id, "  \n      union SELECT the_geom FROM special_item_linear where ").concat(field, "=").concat(id, "  \n      union SELECT the_geom FROM special_item_area where ").concat(field, "=").concat(id, "  \n      union SELECT the_geom FROM channel_improvements_linear where ").concat(field, "=").concat(id, "  \n      union SELECT the_geom FROM channel_improvements_area where ").concat(field, "=").concat(id, "  \n      union SELECT the_geom FROM removal_line where ").concat(field, "=").concat(id, "  \n      union SELECT the_geom FROM removal_area where ").concat(field, "=").concat(id, "  \n      union SELECT the_geom FROM storm_drain where ").concat(field, "=").concat(id, "  \n      union SELECT the_geom FROM detention_facilities where ").concat(field, "=").concat(id, "  \n      union SELECT the_geom FROM maintenance_trails where ").concat(field, "=").concat(id, "  \n      union SELECT the_geom FROM land_acquisition where ").concat(field, "=").concat(id, "  \n      union SELECT the_geom FROM landscaping_area where ").concat(field, "=").concat(id, "  \n  ) joinall\n");
            SQL_URL = encodeURI("".concat(_config.CARTO_URL, "&q=").concat(SQL));
            newProm1 = new Promise(function (resolve, reject) {
              _https["default"].get(SQL_URL, function (response) {
                if (response.statusCode === 200) {
                  var str = '';
                  response.on('data', function (chunk) {
                    str += chunk;
                  });
                  response.on('end', /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7() {
                    return _regeneratorRuntime().wrap(function _callee7$(_context7) {
                      while (1) {
                        switch (_context7.prev = _context7.next) {
                          case 0:
                            resolve(JSON.parse(str).rows);

                          case 1:
                          case "end":
                            return _context7.stop();
                        }
                      }
                    }, _callee7);
                  })));
                }
              });
            });
            _context8.next = 5;
            return newProm1;

          case 5:
            data = _context8.sent;
            return _context8.abrupt("return", data);

          case 7:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8);
  }));
  return _getEnvelopeProblemsComponentsAndProject.apply(this, arguments);
}

function getCoordinatesOfComponents(_x14, _x15) {
  return _getCoordinatesOfComponents.apply(this, arguments);
}

function _getCoordinatesOfComponents() {
  _getCoordinatesOfComponents = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee10(id, field) {
    var fixedField, COMPONENTS_SQL, newProm1, finalResult;
    return _regeneratorRuntime().wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            fixedField = 'problemid' ? 'problem_id' : 'project_id';
            COMPONENTS_SQL = "SELECT type, 'grade_control_structure' as table, projectid, problemid, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM grade_control_structure \n     where ".concat(field, "=").concat(id, "  union ") + "SELECT type, 'pipe_appurtenances' as table, projectid, problemid, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM pipe_appurtenances \n     where ".concat(field, "=").concat(id, "  union ") + "SELECT type, 'special_item_point' as table, projectid, problemid, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM special_item_point \n     where ".concat(field, "=").concat(id, "  union ") + "SELECT type, 'special_item_linear' as table, projectid, problemid, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM special_item_linear \n     where ".concat(field, "=").concat(id, "  union ") + "SELECT type, 'special_item_area' as table, projectid, problemid, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM special_item_area \n     where ".concat(field, "=").concat(id, "  union ") + "SELECT type, 'channel_improvements_linear' as table, projectid, problemid, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM channel_improvements_linear \n     where ".concat(field, "=").concat(id, "  union ") + "SELECT type, 'channel_improvements_area' as table, projectid, problemid, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM channel_improvements_area \n     where ".concat(field, "=").concat(id, "  union ") + "SELECT type, 'removal_line' as table, projectid, problemid, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM removal_line \n     where ".concat(field, "=").concat(id, "  union ") + "SELECT type, 'removal_area' as table, projectid, problemid, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM removal_area \n     where ".concat(field, "=").concat(id, "  union ") + "SELECT type, 'storm_drain' as table, projectid, problemid, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM storm_drain \n     where ".concat(field, "=").concat(id, "  union ") + "SELECT type, 'detention_facilities' as table, projectid, problemid, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM detention_facilities \n     where ".concat(field, "=").concat(id, "  union ") + "SELECT type, 'maintenance_trails' as table, projectid, problemid, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM maintenance_trails \n     where ".concat(field, "=").concat(id, "  union ") + "SELECT type, 'land_acquisition' as table, projectid, problemid, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM land_acquisition \n     where ".concat(field, "=").concat(id, "  union ") + "SELECT component_part_category as type, 'stream_improvement_measure' as table, project_id as projectid, problem_id as problemid, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM stream_improvement_measure \n      where ".concat(fixedField, "=").concat(id, "  union ") + "SELECT type, 'landscaping_area' as table, projectid, problemid, ST_AsGeoJSON(ST_Envelope(the_geom)) FROM landscaping_area \n     where ".concat(field, "=").concat(id, "  ");
            newProm1 = new Promise(function (resolve, reject) {
              var COMPONENT_URL = encodeURI("".concat(_config.CARTO_URL, "&q=").concat(COMPONENTS_SQL));

              _https["default"].get(COMPONENT_URL, function (response) {
                if (response.statusCode === 200) {
                  var str = '';
                  response.on('data', function (chunk) {
                    str += chunk;
                  });
                  response.on('end', /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee9() {
                    var result, resultFinal, _iterator, _step, res;

                    return _regeneratorRuntime().wrap(function _callee9$(_context9) {
                      while (1) {
                        switch (_context9.prev = _context9.next) {
                          case 0:
                            result = JSON.parse(str).rows;
                            resultFinal = [];
                            _iterator = _createForOfIteratorHelper(result);

                            try {
                              for (_iterator.s(); !(_step = _iterator.n()).done;) {
                                res = _step.value;
                                resultFinal.push({
                                  type: res.type,
                                  table: res.table,
                                  problemid: res.problemid,
                                  projectid: res.projectid,
                                  coordinates: JSON.parse(res.st_asgeojson).coordinates
                                });
                              }
                            } catch (err) {
                              _iterator.e(err);
                            } finally {
                              _iterator.f();
                            }

                            resolve(resultFinal);

                          case 5:
                          case "end":
                            return _context9.stop();
                        }
                      }
                    }, _callee9);
                  })));
                }
              });
            });
            _context10.next = 5;
            return newProm1;

          case 5:
            finalResult = _context10.sent;
            return _context10.abrupt("return", finalResult);

          case 7:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10);
  }));
  return _getCoordinatesOfComponents.apply(this, arguments);
}