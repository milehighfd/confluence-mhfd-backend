"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _multer = _interopRequireDefault(require("multer"));

var _needle = _interopRequireDefault(require("needle"));

var _attachmentService = _interopRequireDefault(require("bc/services/attachment.service.js"));

var _projectStreamService = _interopRequireDefault(require("bc/services/projectStream.service.js"));

var _config = require("bc/config/config.js");

var _auth = _interopRequireDefault(require("bc/auth/auth.js"));

var _logger = _interopRequireDefault(require("bc/config/logger.js"));

var _helper = require("bc/routes/new-project/helper.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return generator._invoke = function (innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; }(innerFn, self, context), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; this._invoke = function (method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (object) { var keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var router = _express["default"].Router();

var multer = (0, _multer["default"])({
  storage: _multer["default"].MemoryStorage,
  limits: {
    fileSize: 50 * 1024 * 1024
  }
});
router.post('/', [_auth["default"], multer.array('files')], /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(req, res) {
    var user, _req$body, isWorkPlan, projectname, description, servicearea, county, ids, streams, cosponsor, geom, locality, jurisdiction, sponsor, cover, year, studyreason, studysubreason, sendToWR, status, projecttype, projectsubtype, parsedIds, idsArray, _iterator, _step, id, notRequiredFields, notRequiredValues, result, splittedJurisdiction, _iterator2, _step2, j, insertQuery, query, data, projectId, updateId, _iterator3, _step3, stream;

    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            user = req.user;
            _req$body = req.body, isWorkPlan = _req$body.isWorkPlan, projectname = _req$body.projectname, description = _req$body.description, servicearea = _req$body.servicearea, county = _req$body.county, ids = _req$body.ids, streams = _req$body.streams, cosponsor = _req$body.cosponsor, geom = _req$body.geom, locality = _req$body.locality, jurisdiction = _req$body.jurisdiction, sponsor = _req$body.sponsor, cover = _req$body.cover, year = _req$body.year, studyreason = _req$body.studyreason, studysubreason = _req$body.studysubreason, sendToWR = _req$body.sendToWR;
            status = 'Draft';
            projecttype = 'Study';
            projectsubtype = 'Master Plan';
            parsedIds = '';
            idsArray = JSON.parse(ids);
            _iterator = _createForOfIteratorHelper(idsArray);

            try {
              for (_iterator.s(); !(_step = _iterator.n()).done;) {
                id = _step.value;

                if (parsedIds) {
                  parsedIds += ',';
                }

                parsedIds += "'" + id + "'";
              }
            } catch (err) {
              _iterator.e(err);
            } finally {
              _iterator.f();
            }

            notRequiredFields = "";
            notRequiredValues = "";

            if (cosponsor) {
              if (notRequiredFields) {
                notRequiredFields += ', ';
                notRequiredValues += ', ';
              }

              notRequiredFields += _config.COSPONSOR1;
              notRequiredValues += "'".concat(cosponsor, "' as cosponsor");
            }

            if (notRequiredFields) {
              notRequiredFields = ", ".concat(notRequiredFields);
              notRequiredValues = ", ".concat(notRequiredValues);
            }

            result = [];
            splittedJurisdiction = jurisdiction.split(',');

            if (isWorkPlan) {
              splittedJurisdiction = [locality];
            }

            _iterator2 = _createForOfIteratorHelper(splittedJurisdiction);
            _context.prev = 17;

            _iterator2.s();

          case 19:
            if ((_step2 = _iterator2.n()).done) {
              _context.next = 58;
              break;
            }

            j = _step2.value;
            insertQuery = "INSERT INTO ".concat(_config.CREATE_PROJECT_TABLE, " (the_geom, jurisdiction, projectname, description, servicearea, county, status, projecttype, projectsubtype, sponsor, studyreason, studysubreason ").concat(notRequiredFields, " ,projectid)\n    (SELECT ST_Collect(the_geom) as the_geom, '").concat(j, "' as jurisdiction, '").concat((0, _helper.cleanStringValue)(projectname), "' as projectname , '").concat((0, _helper.cleanStringValue)(description), "' as description, '").concat(servicearea, "' as servicearea,\n    '").concat(county, "' as county, '").concat(status, "' as status, '").concat(projecttype, "' as projecttype, '").concat(projectsubtype, "' as projectsubtype,\n    '").concat(sponsor, "' as sponsor, '").concat(studyreason, "' as studyreason, '").concat(studysubreason, "' as studysubreason ").concat(notRequiredValues, " ,").concat(-1, " as projectid FROM mhfd_stream_reaches WHERE unique_mhfd_code  IN(").concat(parsedIds, "))");
            query = {
              q: insertQuery
            };
            console.log('my query ', query);
            _context.prev = 24;
            _context.next = 27;
            return (0, _needle["default"])('post', _config.CARTO_URL, query, {
              json: true
            });

          case 27:
            data = _context.sent;

            if (!(data.statusCode === 200)) {
              _context.next = 47;
              break;
            }

            result = data.body;

            _logger["default"].info(JSON.stringify(result));

            _context.next = 33;
            return (0, _helper.getNewProjectId)();

          case 33:
            projectId = _context.sent;
            _context.next = 36;
            return (0, _helper.setProjectID)(res, projectId);

          case 36:
            updateId = _context.sent;

            if (updateId) {
              _context.next = 39;
              break;
            }

            return _context.abrupt("return");

          case 39:
            _context.next = 41;
            return (0, _helper.addProjectToBoard)(user, servicearea, county, j, projecttype, projectId, year, sendToWR, isWorkPlan);

          case 41:
            _context.next = 43;
            return _attachmentService["default"].uploadFiles(user, req.files, projectId, cover);

          case 43:
            _iterator3 = _createForOfIteratorHelper(JSON.parse(streams));

            try {
              for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
                stream = _step3.value;

                _projectStreamService["default"].saveProjectStream({
                  projectid: projectId,
                  mhfd_code: stream.mhfd_code,
                  length: stream.length,
                  drainage: stream.drainage,
                  jurisdiction: stream.jurisdiction,
                  str_name: stream.str_name
                });
              }
            } catch (err) {
              _iterator3.e(err);
            } finally {
              _iterator3.f();
            }

            _context.next = 49;
            break;

          case 47:
            _logger["default"].error('bad status ' + data.statusCode + '  -- ' + insertQuery + JSON.stringify(data.body, null, 2));

            return _context.abrupt("return", res.status(data.statusCode).send(data.body));

          case 49:
            _context.next = 55;
            break;

          case 51:
            _context.prev = 51;
            _context.t0 = _context["catch"](24);

            _logger["default"].error(_context.t0, 'at', insertQuery);

            return _context.abrupt("return", res.status(500).send(eroor));

          case 55:
            ;

          case 56:
            _context.next = 19;
            break;

          case 58:
            _context.next = 63;
            break;

          case 60:
            _context.prev = 60;
            _context.t1 = _context["catch"](17);

            _iterator2.e(_context.t1);

          case 63:
            _context.prev = 63;

            _iterator2.f();

            return _context.finish(63);

          case 66:
            res.send(result);

          case 67:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[17, 60, 63, 66], [24, 51]]);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}());
router.post('/:projectid', [_auth["default"], multer.array('files')], /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(req, res) {
    var user, projectid, _req$body2, projectname, description, servicearea, county, ids, cosponsor, geom, locality, streams, jurisdiction, sponsor, cover, sendToWR, studyreason, studysubreason, projecttype, projectsubtype, idsArray, parsedIds, _iterator4, _step4, id, notRequiredFields, updateQuery, query, result, data, _iterator5, _step5, stream;

    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            user = req.user;
            projectid = req.params.projectid;
            _req$body2 = req.body, projectname = _req$body2.projectname, description = _req$body2.description, servicearea = _req$body2.servicearea, county = _req$body2.county, ids = _req$body2.ids, cosponsor = _req$body2.cosponsor, geom = _req$body2.geom, locality = _req$body2.locality, streams = _req$body2.streams, jurisdiction = _req$body2.jurisdiction, sponsor = _req$body2.sponsor, cover = _req$body2.cover, sendToWR = _req$body2.sendToWR, studyreason = _req$body2.studyreason, studysubreason = _req$body2.studysubreason;
            projecttype = 'Study';
            projectsubtype = 'Master Plan';
            idsArray = JSON.parse(ids);
            parsedIds = '';
            _iterator4 = _createForOfIteratorHelper(idsArray);

            try {
              for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
                id = _step4.value;

                if (parsedIds) {
                  parsedIds += ',';
                }

                parsedIds += "'" + id + "'";
              }
            } catch (err) {
              _iterator4.e(err);
            } finally {
              _iterator4.f();
            }

            notRequiredFields = "";

            if (cosponsor) {
              if (notRequiredFields) {
                notRequiredFields += ', ';
              }

              notRequiredFields += "".concat(_config.COSPONSOR1, " = '").concat(cosponsor, "'");
            }

            if (notRequiredFields) {
              notRequiredFields = ", ".concat(notRequiredFields);
            }

            updateQuery = "UPDATE ".concat(_config.CREATE_PROJECT_TABLE, " SET\n  the_geom = (SELECT ST_Collect(the_geom) FROM mhfd_stream_reaches WHERE unique_mhfd_code IN(").concat(parsedIds, ")), jurisdiction = '").concat(jurisdiction, "',\n   projectname = '").concat((0, _helper.cleanStringValue)(projectname), "', description = '").concat((0, _helper.cleanStringValue)(description), "',\n    servicearea = '").concat(servicearea, "', county = '").concat(county, "',\n     projecttype = '").concat(projecttype, "', \n     projectsubtype = '").concat(projectsubtype, "',\n      sponsor = '").concat(sponsor, "',\n      studyreason= '").concat(studyreason, "', studysubreason= '").concat(studysubreason, "' ").concat(notRequiredFields, " WHERE projectid = ").concat(projectid, "\n  ");
            query = {
              q: updateQuery
            };
            console.log('my query ', query);
            result = {};
            _context2.prev = 16;
            _context2.next = 19;
            return (0, _needle["default"])('post', _config.CARTO_URL, query, {
              json: true
            });

          case 19:
            data = _context2.sent;

            if (!(data.statusCode === 200)) {
              _context2.next = 31;
              break;
            }

            result = data.body;

            _logger["default"].info(JSON.stringify(result));

            _context2.next = 25;
            return _attachmentService["default"].uploadFiles(user, req.files, projectid, cover);

          case 25:
            _context2.next = 27;
            return _projectStreamService["default"].deleteByProjectId(projectid);

          case 27:
            _iterator5 = _createForOfIteratorHelper(JSON.parse(streams));

            try {
              for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
                stream = _step5.value;

                _projectStreamService["default"].saveProjectStream({
                  projectid: projectid,
                  mhfd_code: stream.mhfd_code,
                  length: stream.length,
                  drainage: stream.drainage,
                  jurisdiction: stream.jurisdiction,
                  str_name: stream.str_name
                });
              }
            } catch (err) {
              _iterator5.e(err);
            } finally {
              _iterator5.f();
            }

            _context2.next = 33;
            break;

          case 31:
            _logger["default"].error('bad status ' + data.statusCode + '  -- ' + updateQuery + JSON.stringify(data.body, null, 2));

            return _context2.abrupt("return", res.status(data.statusCode).send(data.body));

          case 33:
            _context2.next = 39;
            break;

          case 35:
            _context2.prev = 35;
            _context2.t0 = _context2["catch"](16);

            _logger["default"].error(_context2.t0, 'at', updateQuery);

            return _context2.abrupt("return", res.status(500).send(_context2.t0));

          case 39:
            ;
            res.send(result);

          case 41:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[16, 35]]);
  }));

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}());
var _default = router;
exports["default"] = _default;