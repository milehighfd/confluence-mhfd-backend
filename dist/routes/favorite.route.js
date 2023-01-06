"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _needle = _interopRequireDefault(require("needle"));

var _logger = _interopRequireDefault(require("bc/config/logger.js"));

var _favoritesService = _interopRequireDefault(require("bc/services/favorites.service.js"));

var _attachmentService = _interopRequireDefault(require("bc/services/attachment.service.js"));

var _config = require("bc/config/config.js");

var _auth = _interopRequireDefault(require("bc/auth/auth.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return generator._invoke = function (innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; }(innerFn, self, context), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; this._invoke = function (method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (object) { var keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var router = _express["default"].Router();

var PROJECT_TABLES = [_config.MAIN_PROJECT_TABLE];
var PROBLEMS_TABLE = 'problem_boundary';

function getFilters(params, ids) {
  var filters = '';
  var tipoid = '';
  var hasProjectType = false;

  if (params.isproblem) {
    tipoid = 'problem_id';

    if (params.name) {
      if (filters.length > 0) {
        filters = filters = " and problemname ilike '%".concat(params.name, "%'");
      } else {
        filters = " problemname ilike '%".concat(params.name, "%' ");
      }
    }

    if (params.problemtype) {
      var query = createQueryForIn(params.problemtype.split(','));

      if (filters.length > 0) {
        filters = filters + " and problemtype in (".concat(query, ") ");
      } else {
        filters = " problemtype in (".concat(query, ") ");
      }
    }
  } else {
    // console.log('PROJECTS');
    tipoid = 'projectid';

    if (params.name) {
      if (filters.length > 0) {
        filters = " and projectname ilike '%".concat(params.name, "%' ");
      } else {
        filters = " projectname ilike '%".concat(params.name, "%' ");
      } // console.log("ID", filters);

    }

    if (params.problemtype) {}
  } // components
  // ALL FILTERS
  // PROBLEMS 


  if (params.priority) {
    var _query = createQueryForIn(params.priority.split(','));

    if (filters.length > 0) {
      filters = filters + " and problempriority in (".concat(_query, ")");
    } else {
      filters = " problempriority in (".concat(_query, ")");
    }
  } // PROJECTS


  if (params.projecttype) {
    var _query2 = createQueryForIn(params.projecttype.split(','));

    if (filters.length > 0) {
      filters = filters + " and projecttype in (".concat(_query2, ")");
    } else {
      filters = "projecttype in (".concat(_query2, ")");
    }

    hasProjectType = true;
  }

  if (filters.length > 0) {
    filters += " and";
  }

  filters += " ".concat(tipoid, " in ('").concat(ids.join("','"), "')");

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

function getCounters(table, column) {
  return " (select count(*) from grade_control_structure where ".concat(column, " = cast(").concat(table, ".").concat(column, " as integer) ) as count_gcs, \n     (select count(*) from pipe_appurtenances where ").concat(column, " = cast(").concat(table, ".").concat(column, " as integer) ) as count_pa,\n     (select count(*) from special_item_point where ").concat(column, " = cast(").concat(table, ".").concat(column, " as integer) ) as count_sip, \n     (select count(*) from special_item_linear where ").concat(column, " = cast(").concat(table, ".").concat(column, " as integer) ) as count_sil, \n     (select count(*) from special_item_area where ").concat(column, " = cast(").concat(table, ".").concat(column, " as integer) ) as count_sia, \n     (select count(*) from channel_improvements_linear where ").concat(column, " = cast(").concat(table, ".").concat(column, " as integer) ) as count_cila, \n     (select count(*) from channel_improvements_area where ").concat(column, " = cast(").concat(table, ".").concat(column, " as integer) ) as count_cia, \n     (select count(*) from  removal_line where ").concat(column, " = cast(").concat(table, ".").concat(column, " as integer) ) as count_rl, \n     (select count(*) from removal_area where ").concat(column, " = cast(").concat(table, ".").concat(column, " as integer) ) as count_ra, \n     (select count(*) from storm_drain where ").concat(column, " = cast(").concat(table, ".").concat(column, " as integer) ) as count_sd, \n     (select count(*) from detention_facilities where ").concat(column, " = cast(").concat(table, ".").concat(column, " as integer) ) as count_df, \n     (select count(*) from maintenance_trails where ").concat(column, " = cast(").concat(table, ".").concat(column, " as integer) ) as count_mt, \n     (select count(*) from land_acquisition where ").concat(column, " = cast(").concat(table, ".").concat(column, " as integer) ) as count_la, \n     (select count(*) from landscaping_area where ").concat(column, " = cast(").concat(table, ".").concat(column, " as integer) ) as count_la1 ");
}

router.get('/list', /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(req, res) {
    var list;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return _favoritesService["default"].getAll();

          case 3:
            list = _context.sent;
            console.log('my list ', list);
            return _context.abrupt("return", res.send(list));

          case 8:
            _context.prev = 8;
            _context.t0 = _context["catch"](0);
            res.status(500).send({
              error: _context.t0
            });

          case 11:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[0, 8]]);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}());
router.get('/', _auth["default"], /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(req, res) {
    var user, favorite;
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            user = req.user;
            _context2.prev = 1;
            console.log(user);
            _context2.next = 5;
            return _favoritesService["default"].getFavorites(user._id);

          case 5:
            favorite = _context2.sent;
            return _context2.abrupt("return", res.send(favorite));

          case 9:
            _context2.prev = 9;
            _context2.t0 = _context2["catch"](1);
            res.send(500);

          case 12:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[1, 9]]);
  }));

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}());
router.get('/create', _auth["default"], /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(req, res) {
    var _req$query, table, id, user, favorite, savedFavorite;

    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _req$query = req.query, table = _req$query.table, id = _req$query.id;
            user = req.user;
            _context3.prev = 2;
            favorite = {
              user_id: user._id,
              table: table,
              id: id
            };

            _logger["default"].info('create favorite ', favorite);

            _context3.next = 7;
            return _favoritesService["default"].saveFavorite(favorite);

          case 7:
            savedFavorite = _context3.sent;
            res.send(savedFavorite);
            _context3.next = 14;
            break;

          case 11:
            _context3.prev = 11;
            _context3.t0 = _context3["catch"](2);
            res.status(500).send('error found ', _context3.t0);

          case 14:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[2, 11]]);
  }));

  return function (_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}());
router["delete"]('/', _auth["default"], /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(req, res) {
    var _req$body, table, id, user, favorite, selectedFavorite;

    return _regeneratorRuntime().wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _req$body = req.body, table = _req$body.table, id = _req$body.id;
            user = req.user;
            _context4.prev = 2;
            favorite = {
              user_id: user._id,
              table: table,
              id: id
            };
            _context4.next = 6;
            return _favoritesService["default"].getOne(favorite);

          case 6:
            selectedFavorite = _context4.sent;
            selectedFavorite.destroy();

            _logger["default"].info('DELETED  ', user.email, table, id);

            res.send('deleted');
            _context4.next = 16;
            break;

          case 12:
            _context4.prev = 12;
            _context4.t0 = _context4["catch"](2);

            _logger["default"].error('error found on delete ', _context4.t0);

            res.status(500).send('error found ' + _context4.t0);

          case 16:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[2, 12]]);
  }));

  return function (_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}());
router.post('/favorite-list', _auth["default"], /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(req, res) {
    var user, favorite, ids, filters, PROBLEM_SQL, query, answer, data, _filters, send, PROJECT_FIELDS, result, _iterator, _step, table, _query3, _answer, _data, _result, _iterator2, _step2, _answer$push, element, valor, coordinates;

    return _regeneratorRuntime().wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            user = req.user;
            _context5.next = 3;
            return _favoritesService["default"].getFavorites(user._id);

          case 3:
            favorite = _context5.sent;
            console.log(favorite);
            ids = favorite.filter(function (fav) {
              if (req.body.isproblem) {
                return fav.table === PROBLEMS_TABLE;
              } else {
                return fav.table === PROJECT_TABLES[0];
              }
            }).map(function (fav) {
              return "".concat(fav.id);
            });

            if (!(ids.length === 0)) {
              _context5.next = 8;
              break;
            }

            return _context5.abrupt("return", res.send([]));

          case 8:
            _context5.prev = 8;

            if (!req.body.isproblem) {
              _context5.next = 28;
              break;
            }

            filters = '';
            filters = getFilters(req.body, ids);
            PROBLEM_SQL = "SELECT cartodb_id, ".concat(_config.PROPSPROBLEMTABLES.problem_boundary[5], " as ").concat(_config.PROPSPROBLEMTABLES.problems[5], ", ").concat(_config.PROPSPROBLEMTABLES.problem_boundary[6], " as ").concat(_config.PROPSPROBLEMTABLES.problems[6], ", ").concat(_config.PROPSPROBLEMTABLES.problem_boundary[0], " as ").concat(_config.PROPSPROBLEMTABLES.problems[0], ", ").concat(_config.PROPSPROBLEMTABLES.problem_boundary[2], " as ").concat(_config.PROPSPROBLEMTABLES.problems[2], ", ").concat(_config.PROPSPROBLEMTABLES.problem_boundary[7], " as ").concat(_config.PROPSPROBLEMTABLES.problems[7], ", ").concat(_config.PROPSPROBLEMTABLES.problem_boundary[1], " as ").concat(_config.PROPSPROBLEMTABLES.problems[1], ", ").concat(_config.PROPSPROBLEMTABLES.problem_boundary[8], " as ").concat(_config.PROPSPROBLEMTABLES.problems[8], ", county, ").concat(getCounters(PROBLEMS_TABLE, _config.PROPSPROBLEMTABLES.problem_boundary[5]), ", ST_AsGeoJSON(ST_Envelope(the_geom)) as the_geom FROM ").concat(PROBLEMS_TABLE, " ");
            query = {
              q: "".concat(PROBLEM_SQL, "  ").concat(filters, " ")
            };
            answer = [];
            _context5.prev = 15;
            _context5.next = 18;
            return (0, _needle["default"])('post', _config.CARTO_URL, query, {
              json: true
            });

          case 18:
            data = _context5.sent;

            //console.log('status', data.statusCode);
            if (data.statusCode === 200) {
              /* let coordinates = [];
              if (JSON.parse(element.the_geom).coordinates) {
                coordinates = JSON.parse(element.the_geom).coordinates;
              } */
              answer = data.body.rows.map(function (element) {
                return {
                  cartodb_id: element.cartodb_id,
                  type: 'problems',
                  problemid: element.problem_id,
                  problemname: element.problemname,
                  solutioncost: element.solutioncost,
                  jurisdiction: element.jurisdiction,
                  problempriority: element.problempriority,
                  solutionstatus: element.solutionstatus,
                  problemtype: element.problemtype,
                  county: element.county,
                  totalComponents: element.count_gcs + element.count_pa + element.count_sip + element.count_sil + element.count_cia + element.count_sia + element.count_rl + element.count_ra + element.count_sd + element.count_df + element.count_mt + element.count_la + element.count_la + element.count_la1 + element.count_cila,
                  coordinates: JSON.parse(element.the_geom).coordinates ? JSON.parse(element.the_geom).coordinates : []
                };
              });
              console.log('answer', answer);
            } else {
              console.log('bad status', data.statusCode, data.body);

              _logger["default"].error('bad status', data.statusCode, data.body);
            }

            _context5.next = 25;
            break;

          case 22:
            _context5.prev = 22;
            _context5.t0 = _context5["catch"](15);
            console.log('Error', _context5.t0);

          case 25:
            return _context5.abrupt("return", res.send(answer));

          case 28:
            _filters = '';
            send = [];
            _filters = getFilters(req.body, ids);
            PROJECT_FIELDS = 'cartodb_id, objectid, projectid, projecttype, projectsubtype, coverimage, sponsor, finalCost, ' + 'estimatedCost, status, attachments, projectname, jurisdiction, streamname, county ';

            if (!req.body.problemtype) {
              _context5.next = 39;
              break;
            }

            _context5.next = 35;
            return queriesByProblemTypeInProject(PROJECT_FIELDS, _filters, req.body.problemtype);

          case 35:
            result = _context5.sent;
            return _context5.abrupt("return", res.status(200).send(result));

          case 39:
            _iterator = _createForOfIteratorHelper(PROJECT_TABLES);
            _context5.prev = 40;

            _iterator.s();

          case 42:
            if ((_step = _iterator.n()).done) {
              _context5.next = 90;
              break;
            }

            table = _step.value;
            _query3 = '';

            if (table === _config.MAIN_PROJECT_TABLE) {
              _query3 = {
                q: "SELECT '".concat(table, "' as type, ").concat(PROJECT_FIELDS, ", ").concat(getCounters(_config.MAIN_PROJECT_TABLE, 'projectid'), ", ST_AsGeoJSON(ST_Envelope(the_geom)) as the_geom FROM ").concat(table, " ").concat(_filters, " ")
              };
            }

            _answer = [];
            _context5.prev = 47;
            console.log(_config.CARTO_URL, _query3);
            _context5.next = 51;
            return (0, _needle["default"])('post', _config.CARTO_URL, _query3, {
              json: true
            });

          case 51:
            _data = _context5.sent;

            if (!(_data.statusCode === 200)) {
              _context5.next = 80;
              break;
            }

            _result = _data.body.rows;
            _iterator2 = _createForOfIteratorHelper(_result);
            _context5.prev = 55;

            _iterator2.s();

          case 57:
            if ((_step2 = _iterator2.n()).done) {
              _context5.next = 69;
              break;
            }

            element = _step2.value;
            valor = '';

            if (!element.attachments) {
              _context5.next = 64;
              break;
            }

            _context5.next = 63;
            return _attachmentService["default"].findCoverImage(element.attachments);

          case 63:
            valor = _context5.sent;

          case 64:
            coordinates = [];

            if (element.the_geom && JSON.parse(element.the_geom).coordinates) {
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
              estimatedcost: element.estimatedcost,
              status: element.status,
              attachments: element.attachments,
              projectname: element.projectname,
              jurisdiction: element.jurisdiction,
              streamname: element.streamname,
              county: element.county
            }, _defineProperty(_answer$push, "attachments", valor), _defineProperty(_answer$push, "totalComponents", element.count_gcs + element.count_pa + element.count_sip + element.count_sil + element.count_cia + element.count_sia + element.count_rl + element.count_ra + element.count_sd + element.count_df + element.count_mt + element.count_la + element.count_la + element.count_la1 + element.count_cila), _defineProperty(_answer$push, "coordinates", coordinates), _answer$push));

          case 67:
            _context5.next = 57;
            break;

          case 69:
            _context5.next = 74;
            break;

          case 71:
            _context5.prev = 71;
            _context5.t1 = _context5["catch"](55);

            _iterator2.e(_context5.t1);

          case 74:
            _context5.prev = 74;

            _iterator2.f();

            return _context5.finish(74);

          case 77:
            send = send.concat(_answer);
            _context5.next = 82;
            break;

          case 80:
            console.log('bad status ', _data.statusCode, _data.body);

            _logger["default"].error('bad status ', _data.statusCode, _data.body);

          case 82:
            _context5.next = 87;
            break;

          case 84:
            _context5.prev = 84;
            _context5.t2 = _context5["catch"](47);

            _logger["default"].error(_context5.t2);

          case 87:
            ;

          case 88:
            _context5.next = 42;
            break;

          case 90:
            _context5.next = 95;
            break;

          case 92:
            _context5.prev = 92;
            _context5.t3 = _context5["catch"](40);

            _iterator.e(_context5.t3);

          case 95:
            _context5.prev = 95;

            _iterator.f();

            return _context5.finish(95);

          case 98:
            return _context5.abrupt("return", res.send(send));

          case 99:
            _context5.next = 105;
            break;

          case 101:
            _context5.prev = 101;
            _context5.t4 = _context5["catch"](8);

            _logger["default"].error(_context5.t4);

            res.status(500).send({
              error: _context5.t4
            }).send({
              error: 'Error with C connection'
            });

          case 105:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, null, [[8, 101], [15, 22], [40, 92, 95, 98], [47, 84], [55, 71, 74, 77]]);
  }));

  return function (_x9, _x10) {
    return _ref5.apply(this, arguments);
  };
}());
var _default = router;
exports["default"] = _default;