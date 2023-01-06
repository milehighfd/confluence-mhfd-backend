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

var _projectComponentService = _interopRequireDefault(require("bc/services/projectComponent.service.js"));

var _projectService = _interopRequireDefault(require("bc/services/project.service.js"));

var _projectStatusService = _interopRequireDefault(require("bc/services/projectStatus.service.js"));

var _cartoService = _interopRequireDefault(require("bc/services/carto.service.js"));

var _independentService = _interopRequireDefault(require("bc/services/independent.service.js"));

var _axios = _interopRequireDefault(require("axios"));

var _config = require("bc/config/config.js");

var _db = _interopRequireDefault(require("bc/config/db.js"));

var _auth = _interopRequireDefault(require("bc/auth/auth.js"));

var _formData = _interopRequireDefault(require("form-data"));

var _logger = _interopRequireDefault(require("bc/config/logger.js"));

var _helper = require("bc/routes/new-project/helper.js");

var _moment = _interopRequireDefault(require("moment"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return generator._invoke = function (innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; }(innerFn, self, context), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; this._invoke = function (method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (object) { var keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var router = _express["default"].Router();

var multer = (0, _multer["default"])({
  storage: _multer["default"].MemoryStorage,
  limits: {
    fileSize: 50 * 1024 * 1024
  }
});

var createRandomGeomOnARCGIS = function createRandomGeomOnARCGIS(coordinates, projectname, token, projectid) {
  var newGEOM = [{
    "geometry": {
      "paths": [],
      "spatialReference": {
        "wkid": 4326
      }
    },
    "attributes": {
      "update_flag": 0,
      "projectName": projectname,
      "projectId": projectid
    }
  }];
  newGEOM[0].geometry.paths = coordinates;
  var formData = {
    'f': 'pjson',
    'token': token,
    'adds': JSON.stringify(newGEOM)
  };
  return formData;
};

var getAuthenticationFormData = function getAuthenticationFormData() {
  var formData = {
    'username': 'ricardo_confluence',
    'password': 'M!l3H!gh$m$',
    'client': 'referer',
    'ip': '181.188.178.182',
    'expiration': '60',
    'f': 'pjson',
    'referer': 'localhost'
  };
  return formData;
};

router.get('/token-url', /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(req, res) {
    var URL_TOKEN, fd, token_data, TOKEN, bodyFD, createOnArcGis, response;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            URL_TOKEN = 'https://gis.mhfd.org/portal/sharing/rest/generateToken';
            fd = getAuthenticationFormData(); // const token_data = await axios.post(URL_TOKEN, fd, { headers: fd.getHeaders() })

            _context.next = 4;
            return (0, _needle["default"])('post', URL_TOKEN, fd, {
              multipart: true
            });

          case 4:
            token_data = _context.sent;
            TOKEN = JSON.parse(token_data.body).token;
            bodyFD = createRandomGeomOnARCGIS('non', 'cleanStringValue(projectname)', TOKEN);
            _context.next = 9;
            return (0, _needle["default"])('post', 'https://gis.mhfd.org/server/rest/services/Confluence/MHFDProjects/FeatureServer/0/applyEdits', bodyFD, {
              multipart: true
            });

          case 9:
            createOnArcGis = _context.sent;
            console.log('createona', createOnArcGis.statusCode, '\n\n\n\n ************* \n\n', createOnArcGis.body);
            response = {
              token: TOKEN,
              createStatus: createOnArcGis.statusCode,
              data: createOnArcGis.body,
              geom: '[{"geometry":{"paths":[[[-11806858.969765771,4881317.227901084],[-11572350.166986963,4872144.784506868],[-11767417.463170638,4742507.584535271],[-11576630.640570931,4746482.310006099]]],"spatialReference":{"wkid":102100,"latestWkid":3857}},"attributes":{"update_flag":0,"Component_Count":null,"projectId":null,"onbaseId":null,"projectName":"TEST NEEDLE BOOOOOO222O","projectType":null,"projectSubtype":null,"description":null,"status":null,"startYear":null,"completeYear":null,"sponsor":null,"coSponsor1":null,"coSponsor2":null,"coSponsor3":null,"frequency":null,"maintenanceEligibility":null,"ownership":null,"acquisitionAnticipatedDate":null,"acquisitionProgress":null,"additionalCostDescription":null,"overheadCostDescription":null,"consultant":null,"contractor":null,"LGManager":null,"mhfdManager":null,"serviceArea":null,"county":null,"jurisdiction":null,"streamName":null,"taskSedimentRemoval":null,"taskTreeThinning":null,"taskBankStabilization":null,"taskDrainageStructure":null,"taskRegionalDetention":null,"goalFloodRisk":null,"goalWaterQuality":null,"goalStabilization":null,"goalCapRecreation":null,"goalCapVegetation":null,"goalStudyOvertopping":null,"goalStudyConveyance":null,"goalStudyPeakFlow":null,"goalStudyDevelopment":null,"workPlanYr1":null,"workPlanYr2":null,"workPlanYr3":null,"workPlanYr4":null,"workPlanYr5":null,"attachments":null,"coverImage":null,"Component_Cost":null,"CreationDate":null,"Creator":null,"EditDate":null,"Editor":null,"MP_WR_ID":null,"dataSource":null,"currentWorkPlan":null,"mhfdDollarsRequested":null,"mhfdDollarsAllocated":null,"estimatedCost":null,"finalCost":null,"additionalCost":null,"overheadCost":null,"costDewatering":null,"costMobilization":null,"costTraffic":null,"costUtility":null,"costStormwater":null,"costEngineering":null,"costConstruction":null,"costLegal":null,"costContingency":null,"specialDistrict":null,"studyReason":null,"studySubreason":null}}]'
            };
            return _context.abrupt("return", res.status(205).send(response));

          case 13:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}());

var getTokenArcGis = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
    var URL_TOKEN, fd, token_data, TOKEN;
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            URL_TOKEN = 'https://gis.mhfd.org/portal/sharing/rest/generateToken';
            fd = getAuthenticationFormData();
            _context2.next = 4;
            return (0, _needle["default"])('post', URL_TOKEN, fd, {
              multipart: true
            });

          case 4:
            token_data = _context2.sent;
            TOKEN = JSON.parse(token_data.body).token;
            return _context2.abrupt("return", TOKEN);

          case 7:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function getTokenArcGis() {
    return _ref2.apply(this, arguments);
  };
}();

var getGeomsToUpdate = /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(TOKEN) {
    var LIST_ARCGIS, header, allGeoms;
    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            LIST_ARCGIS = "https://gis.mhfd.org/server/rest/services/Confluence/MHFDProjects/FeatureServer/0/query?where=update_flag%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryPolyline&inSR=&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Foot&relationParam=&outFields=projectname%2C+update_flag%2C+projectid%2C+OBJECTID&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&havingClause=&gdbVersion=&historicMoment=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=xyFootprint&resultOffset=&resultRecordCount=&returnTrueCurves=false&returnExceededLimitFeatures=false&quantizationParameters=&returnCentroid=false&sqlFormat=none&resultType=&featureEncoding=esriDefault&datumTransformation=&f=geojson";
            header = {
              headers: {
                'Authorization': "Bearer ".concat(TOKEN)
              },
              accept: 'application/json',
              content_type: 'application/json'
            };
            _context3.next = 5;
            return (0, _needle["default"])('get', LIST_ARCGIS, header);

          case 5:
            allGeoms = _context3.sent;

            if (!(allGeoms.statusCode === 200)) {
              _context3.next = 10;
              break;
            }

            return _context3.abrupt("return", {
              success: true,
              geoms: JSON.parse(allGeoms.body).features
            });

          case 10:
            return _context3.abrupt("return", {
              success: false
            });

          case 11:
            _context3.next = 17;
            break;

          case 13:
            _context3.prev = 13;
            _context3.t0 = _context3["catch"](0);
            console.log('error at geom update', _context3.t0);
            return _context3.abrupt("return", {
              success: false,
              error: _context3.t0
            });

          case 17:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[0, 13]]);
  }));

  return function getGeomsToUpdate(_x3) {
    return _ref3.apply(this, arguments);
  };
}();

var sleep = function sleep(m) {
  return new Promise(function (r) {
    return setTimeout(r, m);
  });
};

var insertGeojsonToCarto = /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(geojson, projectId, projectname) {
    var deleteAttemp, tries, _insertQuery, query, data;

    return _regeneratorRuntime().wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            deleteAttemp = 0;
            tries = 3;

          case 2:
            if (!true) {
              _context4.next = 27;
              break;
            }

            _context4.prev = 3;
            _insertQuery = "INSERT INTO ".concat(_config.CREATE_PROJECT_TABLE, " (the_geom, projectid, projectname) VALUES(ST_GeomFromGeoJSON('").concat(geojson, "'), ").concat(projectId, ", '").concat(projectname, "')");
            query = {
              q: _insertQuery
            };
            _context4.next = 8;
            return (0, _needle["default"])('post', _config.CARTO_URL, query, {
              json: true
            });

          case 8:
            data = _context4.sent;

            if (!(data.statusCode === 200)) {
              _context4.next = 13;
              break;
            }

            return _context4.abrupt("return", {
              success: true
            });

          case 13:
            console.log('FAILED AT INSERT GEOJSON TO CARTO', data.statusCode, data.body);

            if (!(++deleteAttemp >= tries)) {
              _context4.next = 16;
              break;
            }

            return _context4.abrupt("return", {
              success: false,
              error: data.body
            });

          case 16:
            _context4.next = 23;
            break;

          case 18:
            _context4.prev = 18;
            _context4.t0 = _context4["catch"](3);
            console.error('Error at insert into carto geojson', _context4.t0);

            if (!(++deleteAttemp >= tries)) {
              _context4.next = 23;
              break;
            }

            return _context4.abrupt("return", {
              success: false,
              error: _context4.t0
            });

          case 23:
            _context4.next = 25;
            return sleep(1000);

          case 25:
            _context4.next = 2;
            break;

          case 27:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[3, 18]]);
  }));

  return function insertGeojsonToCarto(_x4, _x5, _x6) {
    return _ref4.apply(this, arguments);
  };
}();

var deleteFromCarto = /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(projectid) {
    var deleteAttemp, tries, deletequery, query, data;
    return _regeneratorRuntime().wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            deleteAttemp = 0;
            tries = 3;

          case 2:
            if (!true) {
              _context5.next = 25;
              break;
            }

            _context5.prev = 3;
            deletequery = "DELETE FROM ".concat(_config.CREATE_PROJECT_TABLE, " WHERE projectid = ").concat(projectid);
            query = {
              q: deletequery
            };
            _context5.next = 8;
            return (0, _needle["default"])('post', _config.CARTO_URL, query, {
              json: true
            });

          case 8:
            data = _context5.sent;

            if (!(data.statusCode === 200)) {
              _context5.next = 13;
              break;
            }

            return _context5.abrupt("return", {
              success: true,
              body: data.body
            });

          case 13:
            if (!(++deleteAttemp >= tries)) {
              _context5.next = 15;
              break;
            }

            return _context5.abrupt("return", {
              success: false,
              error: 'Tried 3 attemps'
            });

          case 15:
            _context5.next = 21;
            break;

          case 17:
            _context5.prev = 17;
            _context5.t0 = _context5["catch"](3);

            if (!(++deleteAttemp >= tries)) {
              _context5.next = 21;
              break;
            }

            return _context5.abrupt("return", {
              success: false,
              error: _context5.t0
            });

          case 21:
            _context5.next = 23;
            return sleep(1000);

          case 23:
            _context5.next = 2;
            break;

          case 25:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, null, [[3, 17]]);
  }));

  return function deleteFromCarto(_x7) {
    return _ref5.apply(this, arguments);
  };
}();

var updateFlagArcGis = /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6(objectid, value, TOKEN) {
    var deleteAttemp, tries, URL_UPDATE_ATTRIB, formData, updateFlagAG;
    return _regeneratorRuntime().wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            deleteAttemp = 0;
            tries = 3;

          case 2:
            if (!true) {
              _context6.next = 27;
              break;
            }

            _context6.prev = 3;
            URL_UPDATE_ATTRIB = "https://gis.mhfd.org/server/rest/services/Confluence/MHFDProjects/FeatureServer/0/applyEdits";
            formData = {
              'f': 'json',
              'token': TOKEN,
              'updates': JSON.stringify([{
                "attributes": {
                  "OBJECTID": objectid,
                  "update_flag": value
                }
              }])
            };
            _context6.next = 8;
            return (0, _needle["default"])('post', URL_UPDATE_ATTRIB, formData, {
              multipart: true
            });

          case 8:
            updateFlagAG = _context6.sent;

            if (!(updateFlagAG.statusCode === 200 && updateFlagAG.body.updateResults)) {
              _context6.next = 13;
              break;
            }

            return _context6.abrupt("return", {
              success: true,
              updated: updateFlagAG.body.updateResults.success
            });

          case 13:
            console.log('Failed at update Flag ArcGis', deleteAttemp, updateFlagAG.body);

            if (!(++deleteAttemp >= tries)) {
              _context6.next = 16;
              break;
            }

            return _context6.abrupt("return", {
              success: false,
              error: updateFlagAG.body.error
            });

          case 16:
            _context6.next = 23;
            break;

          case 18:
            _context6.prev = 18;
            _context6.t0 = _context6["catch"](3);
            console.error('error at update flag arcgis', _context6.t0);

            if (!(++deleteAttemp >= tries)) {
              _context6.next = 23;
              break;
            }

            return _context6.abrupt("return", {
              success: false,
              error: _context6.t0
            });

          case 23:
            _context6.next = 25;
            return sleep(1000);

          case 25:
            _context6.next = 2;
            break;

          case 27:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, null, [[3, 18]]);
  }));

  return function updateFlagArcGis(_x8, _x9, _x10) {
    return _ref6.apply(this, arguments);
  };
}();

router.get('/sync', /*#__PURE__*/function () {
  var _ref7 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7(req, res) {
    var TOKEN, geoms, isCorrectSync, syncGeoms, TOTAL_GEOMS, i, currentGeojsonToUpdate, currentProjectId, currentObjectId, currentProjectName, deleteFC, inserted, upflag;
    return _regeneratorRuntime().wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _context7.next = 2;
            return getTokenArcGis();

          case 2:
            TOKEN = _context7.sent;
            _context7.next = 5;
            return getGeomsToUpdate(TOKEN);

          case 5:
            geoms = _context7.sent;
            // here I have the geoms in geojson
            isCorrectSync = false;
            syncGeoms = []; // TODO: save the geom to carto

            console.log('SYNC ******* \n\n Get Geometries from ArcGis', geoms.success, geoms.geoms.length);
            _context7.prev = 9;

            if (!geoms.success) {
              _context7.next = 45;
              break;
            }

            TOTAL_GEOMS = geoms.geoms.length;
            i = 0;

          case 13:
            if (!(i < geoms.geoms.length)) {
              _context7.next = 44;
              break;
            }

            // if (i > 2) break;
            currentGeojsonToUpdate = geoms.geoms[i];
            currentProjectId = currentGeojsonToUpdate.properties.projectId;
            currentObjectId = currentGeojsonToUpdate.properties.OBJECTID;
            currentProjectName = currentGeojsonToUpdate.properties.projectName;
            _context7.next = 20;
            return deleteFromCarto(currentProjectId);

          case 20:
            deleteFC = _context7.sent;
            // its working, is deleting indeed
            console.log('Delete from Carto ', deleteFC);

            if (!deleteFC.success) {
              _context7.next = 39;
              break;
            }

            _context7.next = 25;
            return insertGeojsonToCarto(JSON.stringify(currentGeojsonToUpdate.geometry), currentProjectId, currentProjectName);

          case 25:
            inserted = _context7.sent;
            console.log('SYNC ******* \n\n Inserted into Carto', inserted);

            if (!inserted.success) {
              _context7.next = 35;
              break;
            }

            _context7.next = 30;
            return updateFlagArcGis(currentObjectId, 0, TOKEN);

          case 30:
            upflag = _context7.sent;
            console.log('SYNC ******* \n\n Updated in ArcGIS');

            if (upflag.success) {
              console.log('Complete ', i, '/', TOTAL_GEOMS);
              isCorrectSync = true;
              syncGeoms.push({
                projectid: currentProjectId,
                projectname: currentProjectName,
                sync: isCorrectSync
              });
            } else {
              syncGeoms.push({
                projectid: currentProjectId,
                projectname: currentProjectName,
                sync: false,
                error: upflag.error ? upflag.error : 'failed at update flag'
              });
            }

            _context7.next = 37;
            break;

          case 35:
            console.error('failed at insert into Carto');
            syncGeoms.push({
              projectid: currentProjectId,
              projectname: currentProjectName,
              sync: false
            });

          case 37:
            _context7.next = 41;
            break;

          case 39:
            console.error('failed in delete Geom from Carto');
            syncGeoms.push({
              projectid: currentProjectId,
              projectname: currentProjectName,
              sync: false
            });

          case 41:
            ++i;
            _context7.next = 13;
            break;

          case 44:
            ;

          case 45:
            return _context7.abrupt("return", res.send(syncGeoms));

          case 48:
            _context7.prev = 48;
            _context7.t0 = _context7["catch"](9);
            return _context7.abrupt("return", res.send('Failed At Syncronization'));

          case 51:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7, null, [[9, 48]]);
  }));

  return function (_x11, _x12) {
    return _ref7.apply(this, arguments);
  };
}());

var insertIntoArcGis = /*#__PURE__*/function () {
  var _ref8 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee8(geom, projectid, projectname) {
    var URL_TOKEN, fd, token_data, TOKEN, bodyFD, createOnArcGis;
    return _regeneratorRuntime().wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _context8.prev = 0;
            URL_TOKEN = 'https://gis.mhfd.org/portal/sharing/rest/generateToken';
            fd = getAuthenticationFormData();
            _context8.next = 5;
            return (0, _needle["default"])('post', URL_TOKEN, fd, {
              multipart: true
            });

          case 5:
            token_data = _context8.sent;
            TOKEN = JSON.parse(token_data.body).token;
            bodyFD = createRandomGeomOnARCGIS(JSON.parse(geom).coordinates, (0, _helper.cleanStringValue)(projectname), TOKEN, projectid);
            _context8.next = 10;
            return (0, _needle["default"])('post', 'https://gis.mhfd.org/server/rest/services/Confluence/MHFDProjects/FeatureServer/0/applyEdits', bodyFD, {
              multipart: true
            });

          case 10:
            createOnArcGis = _context8.sent;
            console.log('create on arc gis', createOnArcGis.statusCode, createOnArcGis.body);

            if (!(createOnArcGis.statusCode == 200)) {
              _context8.next = 18;
              break;
            }

            if (!createOnArcGis.body.error) {
              _context8.next = 15;
              break;
            }

            return _context8.abrupt("return", {
              successArcGis: false,
              error: createOnArcGis.body.error
            });

          case 15:
            return _context8.abrupt("return", {
              successArcGis: createOnArcGis.body.addResults[0].success
            });

          case 18:
            return _context8.abrupt("return", {
              successArcGis: false
            });

          case 19:
            _context8.next = 25;
            break;

          case 21:
            _context8.prev = 21;
            _context8.t0 = _context8["catch"](0);
            console.log('error at insert into arcgis', _context8.t0);
            return _context8.abrupt("return", {
              successArcGis: false,
              error: _context8.t0
            });

          case 25:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8, null, [[0, 21]]);
  }));

  return function insertIntoArcGis(_x13, _x14, _x15) {
    return _ref8.apply(this, arguments);
  };
}();

router.post('/', [_auth["default"], multer.array('files')], /*#__PURE__*/function () {
  var _ref9 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee9(req, res) {
    var user, _req$body, isWorkPlan, projectname, description, servicearea, county, geom, overheadcost, overheadcostdescription, additionalcost, additionalcostdescription, independetComponent, locality, components, jurisdiction, sponsor, cosponsor, cover, estimatedcost, year, sendToWR, componentcost, componentcount, creator, defaultProjectId, notRequiredFields, notRequiredValues, splittedJurisdiction, result, _iterator, _step, j, data, project_id, _iterator2, _step2, independent, _iterator3, _step3, component, dataArcGis;

    return _regeneratorRuntime().wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            user = req.user;
            _req$body = req.body, isWorkPlan = _req$body.isWorkPlan, projectname = _req$body.projectname, description = _req$body.description, servicearea = _req$body.servicearea, county = _req$body.county, geom = _req$body.geom, overheadcost = _req$body.overheadcost, overheadcostdescription = _req$body.overheadcostdescription, additionalcost = _req$body.additionalcost, additionalcostdescription = _req$body.additionalcostdescription, independetComponent = _req$body.independetComponent, locality = _req$body.locality, components = _req$body.components, jurisdiction = _req$body.jurisdiction, sponsor = _req$body.sponsor, cosponsor = _req$body.cosponsor, cover = _req$body.cover, estimatedcost = _req$body.estimatedcost, year = _req$body.year, sendToWR = _req$body.sendToWR, componentcost = _req$body.componentcost, componentcount = _req$body.componentcount;
            creator = 'sys';
            defaultProjectId = '5';
            notRequiredFields = "";
            notRequiredValues = "";

            if (notRequiredFields) {
              notRequiredFields = ", ".concat(notRequiredFields);
              notRequiredValues = ", ".concat(notRequiredValues);
            }

            splittedJurisdiction = jurisdiction.split(',');
            /*   if (isWorkPlan) {
                splittedJurisdiction = [locality];
              } */

            result = [];
            _iterator = _createForOfIteratorHelper(splittedJurisdiction);
            _context9.prev = 10;

            _iterator.s();

          case 12:
            if ((_step = _iterator.n()).done) {
              _context9.next = 83;
              break;
            }

            j = _step.value;
            _context9.prev = 14;
            _context9.next = 17;
            return _projectService["default"].saveProject(_config.CREATE_PROJECT_TABLE_V2, j, (0, _helper.cleanStringValue)(projectname), (0, _helper.cleanStringValue)(description), defaultProjectId, (0, _moment["default"])().format('YYYY-MM-DD HH:mm:ss'), (0, _moment["default"])().format('YYYY-MM-DD HH:mm:ss'), (0, _moment["default"])().format('YYYY-MM-DD HH:mm:ss'), creator, notRequiredFields, notRequiredValues, creator);

          case 17:
            data = _context9.sent;
            result.push(data);
            project_id = data.project_id;
            _context9.next = 22;
            return _cartoService["default"].insertToCarto(_config.CREATE_PROJECT_TABLE, geom, project_id);

          case 22:
            _context9.next = 24;
            return _projectStatusService["default"].saveProjectStatusFromCero(5, project_id, (0, _moment["default"])().format('YYYY-MM-DD HH:mm:ss'), (0, _moment["default"])().format('YYYY-MM-DD HH:mm:ss'), (0, _moment["default"])().format('YYYY-MM-DD HH:mm:ss'), (0, _moment["default"])().format('YYYY-MM-DD HH:mm:ss'), (0, _moment["default"])().format('YYYY-MM-DD HH:mm:ss'), 2, (0, _moment["default"])().format('YYYY-MM-DD HH:mm:ss'), (0, _moment["default"])().format('YYYY-MM-DD HH:mm:ss'), creator, creator);

          case 24:
            //await addProjectToBoard(user, servicearea, county, j, projecttype, project_id, year, sendToWR, isWorkPlan);
            // TODO: habilitar luego attachment await attachmentService.uploadFiles(user, req.files, projectId, cover);
            _iterator2 = _createForOfIteratorHelper(JSON.parse(independetComponent));
            _context9.prev = 25;

            _iterator2.s();

          case 27:
            if ((_step2 = _iterator2.n()).done) {
              _context9.next = 40;
              break;
            }

            independent = _step2.value;
            _context9.prev = 29;
            _context9.next = 32;
            return _projectComponentService["default"].saveProjectComponent(0, '', independent.name, independent.status, project_id);

          case 32:
            _logger["default"].info('create independent component');

            _context9.next = 38;
            break;

          case 35:
            _context9.prev = 35;
            _context9.t0 = _context9["catch"](29);

            _logger["default"].error('cannot create independent component ' + _context9.t0);

          case 38:
            _context9.next = 27;
            break;

          case 40:
            _context9.next = 45;
            break;

          case 42:
            _context9.prev = 42;
            _context9.t1 = _context9["catch"](25);

            _iterator2.e(_context9.t1);

          case 45:
            _context9.prev = 45;

            _iterator2.f();

            return _context9.finish(45);

          case 48:
            _iterator3 = _createForOfIteratorHelper(JSON.parse(components));
            _context9.prev = 49;

            _iterator3.s();

          case 51:
            if ((_step3 = _iterator3.n()).done) {
              _context9.next = 64;
              break;
            }

            component = _step3.value;
            _context9.prev = 53;
            _context9.next = 56;
            return _projectComponentService["default"].saveProjectComponent(component.objectid, component.table, '', '', project_id);

          case 56:
            _logger["default"].info('create component');

            _context9.next = 62;
            break;

          case 59:
            _context9.prev = 59;
            _context9.t2 = _context9["catch"](53);

            _logger["default"].error('cannot create component ' + _context9.t2);

          case 62:
            _context9.next = 51;
            break;

          case 64:
            _context9.next = 69;
            break;

          case 66:
            _context9.prev = 66;
            _context9.t3 = _context9["catch"](49);

            _iterator3.e(_context9.t3);

          case 69:
            _context9.prev = 69;

            _iterator3.f();

            return _context9.finish(69);

          case 72:
            _context9.next = 74;
            return insertIntoArcGis(geom, project_id, (0, _helper.cleanStringValue)(projectname));

          case 74:
            dataArcGis = _context9.sent;
            result.push(dataArcGis);
            _context9.next = 81;
            break;

          case 78:
            _context9.prev = 78;
            _context9.t4 = _context9["catch"](14);

            _logger["default"].error(_context9.t4, 'at', insertQuery);

          case 81:
            _context9.next = 12;
            break;

          case 83:
            _context9.next = 88;
            break;

          case 85:
            _context9.prev = 85;
            _context9.t5 = _context9["catch"](10);

            _iterator.e(_context9.t5);

          case 88:
            _context9.prev = 88;

            _iterator.f();

            return _context9.finish(88);

          case 91:
            res.send(result);

          case 92:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9, null, [[10, 85, 88, 91], [14, 78], [25, 42, 45, 48], [29, 35], [49, 66, 69, 72], [53, 59]]);
  }));

  return function (_x16, _x17) {
    return _ref9.apply(this, arguments);
  };
}());
/* router.post('/:projectid', [auth, multer.array('files')], async (req, res) => {
  const user = req.user;
  const { projectname, description, servicearea, county, geom,
    overheadcost, overheadcostdescription, additionalcost, additionalcostdescription,
    independetComponent, locality, components, jurisdiction, sponsor, cosponsor, cover, estimatedcost, sendToWR,
    componentcost, componentcount } = req.body;
  const projectid = req.params.projectid;
  const projecttype = 'Capital';
  let notRequiredFields = ``;
  if (overheadcostdescription) {
    if (notRequiredFields) {
      notRequiredFields += ', ';
    }
    notRequiredFields += `overheadcostdescription = '${cleanStringValue(overheadcostdescription)}'`;
  }
  if (additionalcost) {
    if (notRequiredFields) {
      notRequiredFields += ', ';
    }
    notRequiredFields += `additionalcost = '${additionalcost}'`;
  }
  if (additionalcostdescription) {
    if (notRequiredFields) {
      notRequiredFields += ', ';
    }
    notRequiredFields += `additionalcostdescription = '${cleanStringValue(additionalcostdescription)}'`;
  }
  if (cosponsor) {
    if (notRequiredFields) {
      notRequiredFields += ', ';
    }
    notRequiredFields += `${COSPONSOR1} = '${cosponsor}'`;
  }
  if (notRequiredFields) {
    notRequiredFields = `, ${notRequiredFields}`;
  }
  const overHeadNumbers = overheadcost.split(',');
  const updateQuery = `UPDATE ${CREATE_PROJECT_TABLE} SET the_geom = ST_GeomFromGeoJSON('${geom}'),
   jurisdiction = '${jurisdiction}', projectname = '${cleanStringValue(projectname)}', 
   description = '${cleanStringValue(description)}', servicearea = '${servicearea}', county = '${county}',
    projecttype = '${projecttype}', sponsor = '${sponsor}', 
    overheadcost = '${overheadcost}', estimatedcost = ${estimatedcost} ,  component_cost = ${componentcost}, component_count = ${componentcount}, costdewatering = ${(overHeadNumbers[0] / 100) * componentcost}, costmobilization = ${(overHeadNumbers[1] / 100) * componentcost}, costtraffic = ${(overHeadNumbers[2] / 100) * componentcost}, costutility = ${(overHeadNumbers[3] / 100) * componentcost}, coststormwater = ${(overHeadNumbers[4] / 100) * componentcost}, costengineering = ${(overHeadNumbers[5] / 100) * componentcost} ,costlegal = ${(overHeadNumbers[6] / 100) * componentcost}, costconstruction = ${(overHeadNumbers[7] / 100) * componentcost}, costcontingency = ${(overHeadNumbers[8] / 100) * componentcost}
     ${notRequiredFields}
    WHERE  projectid = ${projectid}`;
  const query = {
    q: updateQuery
  };
  let result = {};
  try {
    const data = await needle('post', CARTO_URL, query, { json: true });
    if (data.statusCode === 200) {
      result = data.body;
      logger.info(JSON.stringify(result));
      await attachmentService.uploadFiles(user, req.files, projectid, cover);
      await projectComponentService.deleteByProjectId(projectid);
      await indepdendentService.deleteByProjectId(projectid);
      for (const independent of JSON.parse(independetComponent)) {
        const element = { name: independent.name, cost: independent.cost, status: independent.status, projectid: projectid };
        try {
          IndependentComponent.create(element);
          logger.info('create independent component' + JSON.stringify(element));
        } catch (error) {
          logger.error('cannot create independent component ' + error);
        }
      }
      for (const component of JSON.parse(components)) {
        const data = {
          table: component.table,
          projectid: projectid,
          objectid: component.objectid
        };
        projectComponentService.saveProjectComponent(data);
      }
    } else {
      logger.error('bad status ' + data.statusCode + '  -- ' + updateQuery + JSON.stringify(data.body, null, 2));
      return res.status(data.statusCode).send(data.body);
    }
  } catch (error) {
    logger.error(error, 'at edit capital');
  };
  res.send(result);
}); */

var _default = router;
exports["default"] = _default;