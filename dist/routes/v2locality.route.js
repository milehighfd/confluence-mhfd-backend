"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _wkt = require("wkt");

var _db = _interopRequireDefault(require("bc/config/db.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return generator._invoke = function (innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; }(innerFn, self, context), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; this._invoke = function (method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (object) { var keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

// mimport auth2 from 'bc/auth0/auth2.js';
var router = _express["default"].Router();

var ServiceArea = _db["default"].codeServiceArea;
var LocalGovernment = _db["default"].codeLocalGoverment;
var StateCounty = _db["default"].codeStateCounty;

var polygonParser = function polygonParser(coordinates) {
  return (0, _wkt.parse)(coordinates);
};

router.get('/all-localities', /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(req, res) {
    var _yield$db$sequelize$q, _yield$db$sequelize$q2, saData, sa, _yield$db$sequelize$q3, _yield$db$sequelize$q4, lgData, lg, _yield$db$sequelize$q5, _yield$db$sequelize$q6, scData, sc, _yield$db$sequelize$q7, _yield$db$sequelize$q8, mhfdData, mhfd, answer;

    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return _db["default"].sequelize.query("SELECT Shape.STEnvelope( ).STAsText() as bbox,\n  Shape.STAsText() as coordinates,\n  code_service_area_id,\n  service_area_name FROM CODE_SERVICE_AREA_4326");

          case 2:
            _yield$db$sequelize$q = _context.sent;
            _yield$db$sequelize$q2 = _slicedToArray(_yield$db$sequelize$q, 1);
            saData = _yield$db$sequelize$q2[0];
            sa = saData.map(function (result) {
              return {
                name: result.service_area_name + 'Service Area',
                id: result.code_service_area_id,
                table: 'CODE_SERVICE_AREA',
                bbox: polygonParser(result.bbox),
                coordinates: polygonParser(result.coordinates)
              };
            });
            /*const lg = await LocalGovernment.findAll({
              include: { all: true, nested: true },
              attributes: ['code_local_government_id', 'local_government_name']
            })*/

            _context.next = 8;
            return _db["default"].sequelize.query("SELECT Shape.STEnvelope( ).STAsText() as bbox,\n  Shape.STAsText() as coordinates,\n  code_local_government_id,\n  local_government_name FROM CODE_LOCAL_GOVERNMENT_4326");

          case 8:
            _yield$db$sequelize$q3 = _context.sent;
            _yield$db$sequelize$q4 = _slicedToArray(_yield$db$sequelize$q3, 1);
            lgData = _yield$db$sequelize$q4[0];
            lg = lgData.map(function (result) {
              return {
                name: result.local_government_name,
                id: result.code_local_government_id,
                table: 'CODE_LOCAL_GOVERNMENT',
                bbox: polygonParser(result.bbox),
                coordinates: polygonParser(result.coordinates)
              };
            });
            /*const sc = await StateCounty.findAll({
              include: { all: true, nested: true },
              attributes: ['state_county_id', 'county_name']
            })*/

            _context.next = 14;
            return _db["default"].sequelize.query("SELECT Shape.STEnvelope( ).STAsText() as bbox,\n  Shape.STAsText() as coordinates,\n  state_county_id,\n  county_name FROM CODE_STATE_COUNTY_4326");

          case 14:
            _yield$db$sequelize$q5 = _context.sent;
            _yield$db$sequelize$q6 = _slicedToArray(_yield$db$sequelize$q5, 1);
            scData = _yield$db$sequelize$q6[0];
            sc = scData.map(function (result) {
              return {
                name: result.county_name + ' County',
                id: result.state_county_id,
                table: 'CODE_STATE_COUNTY',
                bbox: polygonParser(result.bbox),
                coordinates: polygonParser(result.coordinates)
              };
            });
            _context.next = 20;
            return _db["default"].sequelize.query("SELECT Shape.STEnvelope( ).STAsText() as bbox,\n  Shape.STAsText() as coordinates,\n  OBJECTID,\n  'Mile High Flood District' as name FROM MHFD_BOUNDARY");

          case 20:
            _yield$db$sequelize$q7 = _context.sent;
            _yield$db$sequelize$q8 = _slicedToArray(_yield$db$sequelize$q7, 1);
            mhfdData = _yield$db$sequelize$q8[0];
            mhfd = mhfdData.map(function (result) {
              return {
                name: result.name,
                id: result.OBJECTID,
                table: 'MHFD_BOUNDARY',
                bbox: polygonParser(result.bbox),
                coordinates: polygonParser(result.coordinates)
              };
            });
            answer = [].concat(_toConsumableArray(sa), _toConsumableArray(lg), _toConsumableArray(sc)).sort(function (a, b) {
              return a.name.localeCompare(b.name);
            });
            res.send([].concat(_toConsumableArray(mhfd), _toConsumableArray(answer)));

          case 26:
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
router.get('/get-list', /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(req, res) {
    var answer, _yield$db$sequelize$q9, _yield$db$sequelize$q10, lgData, lg, _yield$db$sequelize$q11, _yield$db$sequelize$q12, saData, sa, _yield$db$sequelize$q13, _yield$db$sequelize$q14, scData, sc;

    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            answer = {};

            if (!req.query.jurisdiction) {
              _context2.next = 9;
              break;
            }

            _context2.next = 4;
            return _db["default"].sequelize.query("SELECT\n    code_local_government_id,\n    local_government_name FROM CODE_LOCAL_GOVERNMENT_4326");

          case 4:
            _yield$db$sequelize$q9 = _context2.sent;
            _yield$db$sequelize$q10 = _slicedToArray(_yield$db$sequelize$q9, 1);
            lgData = _yield$db$sequelize$q10[0];
            lg = lgData.map(function (result) {
              return {
                local_government_name: result.local_government_name,
                code_local_government_id: result.code_local_government_id,
                table: 'CODE_LOCAL_GOVERNMENT'
              };
            });
            answer.jurisdiction = lg;

          case 9:
            if (!req.query.servicearea) {
              _context2.next = 17;
              break;
            }

            _context2.next = 12;
            return _db["default"].sequelize.query("SELECT\n    code_service_area_id,\n    service_area_name FROM CODE_SERVICE_AREA_4326");

          case 12:
            _yield$db$sequelize$q11 = _context2.sent;
            _yield$db$sequelize$q12 = _slicedToArray(_yield$db$sequelize$q11, 1);
            saData = _yield$db$sequelize$q12[0];
            sa = saData.map(function (result) {
              return {
                service_area_name: result.service_area_name + 'Service Area',
                code_service_area_id: result.code_service_area_id,
                table: 'CODE_SERVICE_AREA'
              };
            });
            answer.servicearea = sa;

          case 17:
            if (!req.query.county) {
              _context2.next = 25;
              break;
            }

            _context2.next = 20;
            return _db["default"].sequelize.query("SELECT\n      state_county_id,\n      county_name FROM CODE_STATE_COUNTY_4326");

          case 20:
            _yield$db$sequelize$q13 = _context2.sent;
            _yield$db$sequelize$q14 = _slicedToArray(_yield$db$sequelize$q13, 1);
            scData = _yield$db$sequelize$q14[0];
            sc = scData.map(function (result) {
              return {
                county_name: result.county_name + ' County',
                state_county_id: result.state_county_id,
                table: 'CODE_STATE_COUNTY'
              };
            });
            answer.county = sc;

          case 25:
            res.send(answer);

          case 26:
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
router.get('/', /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(req, res) {
    var _yield$db$sequelize$q15, _yield$db$sequelize$q16, sa;

    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return _db["default"].sequelize.query("SELECT Shape.STEnvelope( ).STAsText()   as bbox FROM CODE_SERVICE_AREA");

          case 2:
            _yield$db$sequelize$q15 = _context3.sent;
            _yield$db$sequelize$q16 = _slicedToArray(_yield$db$sequelize$q15, 1);
            sa = _yield$db$sequelize$q16[0];
            console.log(sa);
            res.send(sa);

          case 7:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function (_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}());
var _default = router;
exports["default"] = _default;