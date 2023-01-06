"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _needle = _interopRequireDefault(require("needle"));

var _auth = _interopRequireDefault(require("bc/auth/auth.js"));

var _config = require("bc/config/config.js");

var _logger = _interopRequireDefault(require("bc/config/logger.js"));

var _db = _interopRequireDefault(require("bc/config/db.js"));

var _mapgalleryService = require("bc/services/mapgallery.service.js");

var _userService = require("bc/services/user.service.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return generator._invoke = function (innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; }(innerFn, self, context), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; this._invoke = function (method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (object) { var keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var router = _express["default"].Router();

var Board = _db["default"].board;
var User = _db["default"].user;
var BoardProject = _db["default"].boardProject;
var BoardLocality = _db["default"].boardLocality;
router.get('/coordinates/:pid', /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(req, res) {
    var pid, r;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            pid = req.params.pid;
            _context.next = 3;
            return (0, _mapgalleryService.getCoordsByProjectId)(pid, true);

          case 3:
            r = _context.sent;
            res.send(r);

          case 5:
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
router.get('/fix', /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(req, res) {
    var boards, updateBoards, c, _iterator, _step, board, r, updateBoardsPlan;

    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return Board.findAll({
              where: {
                year: ['2018', '2019', '2020', '2021'],
                type: 'WORK_REQUEST',
                status: 'Approved'
              }
            });

          case 2:
            boards = _context2.sent;
            _context2.next = 5;
            return Board.update({
              "status": "Approved",
              "substatus": "Capital,Study,Maintenance,Acquisition,Special"
            }, {
              where: {
                year: ['2018', '2019', '2020', '2021'],
                type: 'WORK_REQUEST'
              }
            });

          case 5:
            updateBoards = _context2.sent;
            console.log('UPDATED ' + updateBoards);
            c = 0;

            if (!boards) {
              _context2.next = 28;
              break;
            }

            _iterator = _createForOfIteratorHelper(boards);
            _context2.prev = 10;

            _iterator.s();

          case 12:
            if ((_step = _iterator.n()).done) {
              _context2.next = 20;
              break;
            }

            board = _step.value;
            _context2.next = 16;
            return moveCardsToNextLevel(board);

          case 16:
            r = _context2.sent;
            c++;

          case 18:
            _context2.next = 12;
            break;

          case 20:
            _context2.next = 25;
            break;

          case 22:
            _context2.prev = 22;
            _context2.t0 = _context2["catch"](10);

            _iterator.e(_context2.t0);

          case 25:
            _context2.prev = 25;

            _iterator.f();

            return _context2.finish(25);

          case 28:
            _context2.next = 30;
            return Board.update({
              "status": "Approved"
            }, {
              where: {
                year: ['2018', '2019', '2020', '2021'],
                type: 'WORK_PLAN'
              }
            });

          case 30:
            updateBoardsPlan = _context2.sent;
            console.log(updateBoardsPlan);
            console.log('boards', boards, boards.length);
            res.send({
              boards: boards,
              count: c
            });

          case 34:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[10, 22, 25, 28]]);
  }));

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}());
router.get('/', /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(req, res) {
    var boards;
    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return Board.findAll();

          case 2:
            boards = _context3.sent;
            console.log('boards', boards, boards.length);
            res.send(boards);

          case 5:
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
router.put('/update-budget/:id', /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(req, res) {
    var id, budget, board;
    return _regeneratorRuntime().wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            id = req.params.id;
            budget = req.body.budget;
            _context4.next = 4;
            return Board.findByPk(id);

          case 4:
            board = _context4.sent;

            if (!board) {
              _context4.next = 12;
              break;
            }

            board.total_county_budget = budget;
            _context4.next = 9;
            return board.save();

          case 9:
            res.send(board);
            _context4.next = 13;
            break;

          case 12:
            res.status(404).send({
              error: 'Not found'
            });

          case 13:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function (_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}());
router.get('/board-localities', /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(req, res) {
    var boardLocalities;
    return _regeneratorRuntime().wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return BoardLocality.findAll();

          case 2:
            boardLocalities = _context5.sent;
            res.send(boardLocalities);

          case 4:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));

  return function (_x9, _x10) {
    return _ref5.apply(this, arguments);
  };
}());
router.put('/board-localities/:id', /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6(req, res) {
    var id, email, boardLocalities;
    return _regeneratorRuntime().wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            id = req.params.id;
            email = req.body.email;
            _context6.next = 4;
            return BoardLocality.findOne({
              where: {
                id: id
              }
            });

          case 4:
            boardLocalities = _context6.sent;

            if (!boardLocalities) {
              _context6.next = 12;
              break;
            }

            boardLocalities.email = email;
            _context6.next = 9;
            return boardLocalities.save();

          case 9:
            res.send(boardLocalities);
            _context6.next = 13;
            break;

          case 12:
            res.status(404).send({
              error: 'Not found'
            });

          case 13:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));

  return function (_x11, _x12) {
    return _ref6.apply(this, arguments);
  };
}());
router.get('/projects/:bid', /*#__PURE__*/function () {
  var _ref7 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7(req, res) {
    var bid, boardProjects;
    return _regeneratorRuntime().wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            bid = req.params.bid;
            _context7.next = 3;
            return BoardProject.findAll({
              where: {
                board_id: bid
              }
            });

          case 3:
            boardProjects = _context7.sent;
            console.log('boardProjects', boardProjects, boardProjects.length);
            res.send(boardProjects);

          case 6:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7);
  }));

  return function (_x13, _x14) {
    return _ref7.apply(this, arguments);
  };
}());
router.put('/project/:id', /*#__PURE__*/function () {
  var _ref8 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee8(req, res) {
    var id, _req$body, originPosition0, originPosition1, originPosition2, originPosition3, originPosition4, originPosition5, boardProject;

    return _regeneratorRuntime().wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            id = req.params.id;
            _req$body = req.body, originPosition0 = _req$body.originPosition0, originPosition1 = _req$body.originPosition1, originPosition2 = _req$body.originPosition2, originPosition3 = _req$body.originPosition3, originPosition4 = _req$body.originPosition4, originPosition5 = _req$body.originPosition5;
            _context8.next = 4;
            return BoardProject.findOne({
              where: {
                id: id
              }
            });

          case 4:
            boardProject = _context8.sent;
            boardProject.originPosition0 = originPosition0;
            boardProject.originPosition1 = originPosition1;
            boardProject.originPosition2 = originPosition2;
            boardProject.originPosition3 = originPosition3;
            boardProject.originPosition4 = originPosition4;
            boardProject.originPosition5 = originPosition5;
            _context8.next = 13;
            return boardProject.save();

          case 13:
            res.send(boardProject);

          case 14:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8);
  }));

  return function (_x15, _x16) {
    return _ref8.apply(this, arguments);
  };
}());
router.post('/', /*#__PURE__*/function () {
  var _ref9 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee10(req, res) {
    var body, type, year, locality, projecttype, board, boardProjects, projectsPromises, resolvedProjects, projects, newBoard;
    return _regeneratorRuntime().wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            body = req.body;
            type = body.type, year = body.year, locality = body.locality, projecttype = body.projecttype;
            console.log(body);
            console.log(type, year, locality, projecttype);

            if (!(!type || !year || !locality || !projecttype)) {
              _context10.next = 6;
              break;
            }

            return _context10.abrupt("return", res.sendStatus(404));

          case 6:
            _logger["default"].info('SEARCHING IN BOARD');

            _context10.next = 9;
            return Board.findOne({
              where: {
                type: type,
                year: year,
                locality: locality,
                projecttype: projecttype
              }
            });

          case 9:
            board = _context10.sent;

            if (!board) {
              _context10.next = 27;
              break;
            }

            _logger["default"].info("BOARD INFO: ".concat(JSON.stringify(board)));

            _context10.next = 14;
            return BoardProject.findAll({
              where: {
                board_id: board._id
              }
            });

          case 14:
            boardProjects = _context10.sent;

            _logger["default"].info("BOARD-PROJECTS ".concat(JSON.stringify(boardProjects)));

            projectsPromises = boardProjects.filter(function (bp) {
              return !!bp.project_id;
            }).map( /*#__PURE__*/function () {
              var _ref10 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee9(bp) {
                var project, newObject, i;
                return _regeneratorRuntime().wrap(function _callee9$(_context9) {
                  while (1) {
                    switch (_context9.prev = _context9.next) {
                      case 0:
                        project = null;
                        _context9.prev = 1;
                        _context9.next = 4;
                        return (0, _mapgalleryService.getMidByProjectId)(bp.project_id, projecttype);

                      case 4:
                        project = _context9.sent;
                        _context9.next = 10;
                        break;

                      case 7:
                        _context9.prev = 7;
                        _context9.t0 = _context9["catch"](1);
                        console.log('Error in project Promises ', _context9.t0);

                      case 10:
                        newObject = {
                          id: bp.id,
                          project_id: bp.project_id,
                          origin: bp.origin,
                          projectData: project
                        };

                        for (i = 0; i <= 5; i++) {
                          newObject["position".concat(i)] = bp["position".concat(i)];
                          newObject["originPosition".concat(i)] = bp["originPosition".concat(i)];

                          if (i > 0) {
                            newObject["req".concat(i)] = bp["req".concat(i)];
                          }

                          if (1 <= i && i <= 2) {
                            newObject["year".concat(i)] = bp["year".concat(i)];
                          }
                        }

                        return _context9.abrupt("return", newObject);

                      case 13:
                      case "end":
                        return _context9.stop();
                    }
                  }
                }, _callee9, null, [[1, 7]]);
              }));

              return function (_x19) {
                return _ref10.apply(this, arguments);
              };
            }());
            _context10.next = 19;
            return Promise.all(projectsPromises);

          case 19:
            resolvedProjects = _context10.sent;

            _logger["default"].info("RESOLVERD PROJECTS: ".concat(resolvedProjects));

            resolvedProjects = resolvedProjects.filter(function (bp) {
              return bp.projectData != null;
            });
            projects = resolvedProjects;

            _logger["default"].info('FINISHING BOARD REQUEST');

            res.send({
              board: board,
              projects: projects
            });
            _context10.next = 31;
            break;

          case 27:
            newBoard = new Board({
              type: type,
              year: year,
              locality: locality,
              projecttype: projecttype,
              status: 'Under Review'
            });
            _context10.next = 30;
            return newBoard.save();

          case 30:
            res.send({
              board: newBoard,
              projects: []
            });

          case 31:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10);
  }));

  return function (_x17, _x18) {
    return _ref9.apply(this, arguments);
  };
}());

var getBoard = /*#__PURE__*/function () {
  var _ref11 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee11(type, locality, year, projecttype) {
    var board, newBoard;
    return _regeneratorRuntime().wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            _logger["default"].info("Trying to insert create or insert(".concat(type, ", ").concat(locality, ", ").concat(year, ", ").concat(projecttype, ")"));

            _context11.next = 3;
            return Board.findOne({
              where: {
                type: type,
                year: year,
                locality: locality,
                projecttype: projecttype
              }
            });

          case 3:
            board = _context11.sent;

            if (!board) {
              _context11.next = 9;
              break;
            }

            _logger["default"].info('already exists');

            return _context11.abrupt("return", board);

          case 9:
            _logger["default"].info('new board');

            newBoard = new Board({
              type: type,
              year: year,
              locality: locality,
              projecttype: projecttype,
              status: 'Under Review'
            });
            _context11.next = 13;
            return newBoard.save();

          case 13:
            return _context11.abrupt("return", newBoard);

          case 14:
          case "end":
            return _context11.stop();
        }
      }
    }, _callee11);
  }));

  return function getBoard(_x20, _x21, _x22, _x23) {
    return _ref11.apply(this, arguments);
  };
}();

var sendBoardProjectsToProp = /*#__PURE__*/function () {
  var _ref12 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee12(boards, prop) {
    var _loop, i, j;

    return _regeneratorRuntime().wrap(function _callee12$(_context13) {
      while (1) {
        switch (_context13.prev = _context13.next) {
          case 0:
            _loop = /*#__PURE__*/_regeneratorRuntime().mark(function _loop() {
              var board, boardProjects, map, bp, p, propValues, k, propVal, destinyBoard, newBoardProject;
              return _regeneratorRuntime().wrap(function _loop$(_context12) {
                while (1) {
                  switch (_context12.prev = _context12.next) {
                    case 0:
                      board = boards[i];
                      _context12.next = 3;
                      return BoardProject.findAll({
                        where: {
                          board_id: board._id
                        }
                      });

                    case 3:
                      boardProjects = _context12.sent;
                      map = {};
                      [0, 1, 2, 3, 4, 5].forEach(function (index) {
                        var arr = [];

                        for (var j = 0; j < boardProjects.length; j++) {
                          var bp = boardProjects[j];

                          if (bp["position".concat(index)] != null) {
                            arr.push({
                              bp: bp,
                              value: bp["position".concat(index)]
                            });
                          }
                        }

                        ;
                        arr.sort(function (a, b) {
                          return a.value - b.value;
                        });
                        arr.forEach(function (r, i) {
                          if (!map[r.bp.project_id]) {
                            map[r.bp.project_id] = {};
                          }

                          map[r.bp.project_id][index] = i;
                        });
                      });
                      j = 0;

                    case 7:
                      if (!(j < boardProjects.length)) {
                        _context12.next = 42;
                        break;
                      }

                      bp = boardProjects[j];
                      p = void 0;
                      _context12.prev = 10;
                      _context12.next = 13;
                      return (0, _mapgalleryService.getMinimumDateByProjectId)(bp.project_id);

                    case 13:
                      p = _context12.sent;
                      _context12.next = 20;
                      break;

                    case 16:
                      _context12.prev = 16;
                      _context12.t0 = _context12["catch"](10);

                      _logger["default"].info("Project not found ".concat(bp.project_id));

                      return _context12.abrupt("continue", 39);

                    case 20:
                      if (p[prop]) {
                        _context12.next = 23;
                        break;
                      }

                      _logger["default"].info("Property not found ".concat(prop));

                      return _context12.abrupt("continue", 39);

                    case 23:
                      propValues = p[prop].split(',');
                      k = 0;

                    case 25:
                      if (!(k < propValues.length)) {
                        _context12.next = 39;
                        break;
                      }

                      propVal = propValues[k];

                      if (prop === 'county' && !propVal.includes('County')) {
                        propVal = propVal.trimEnd().concat(' County');
                      } else if (prop === 'servicearea' && !propVal.includes(' Service Area')) {
                        propVal = propVal.trimEnd().concat(' Service Area');
                      }

                      _context12.next = 30;
                      return getBoard('WORK_PLAN', propVal, board.year, board.projecttype);

                    case 30:
                      destinyBoard = _context12.sent;

                      _logger["default"].info("Destiny board by prop ".concat(prop, " id is ").concat(destinyBoard !== null ? destinyBoard._id : destinyBoard)); //TODO: improve to avoid multiple queries to same board


                      if (destinyBoard === null || destinyBoard._id === null) {
                        _logger["default"].info('Destiny board not found');
                      }

                      newBoardProject = new BoardProject({
                        board_id: destinyBoard._id,
                        project_id: bp.project_id,
                        position0: bp.position0,
                        position1: bp.position1,
                        position2: bp.position2,
                        position3: bp.position3,
                        position4: bp.position4,
                        position5: bp.position5,
                        originPosition0: map[bp.project_id][0],
                        originPosition1: map[bp.project_id][1],
                        originPosition2: map[bp.project_id][2],
                        originPosition3: map[bp.project_id][3],
                        originPosition4: map[bp.project_id][4],
                        originPosition5: map[bp.project_id][5],
                        req1: bp.req1 == null ? null : bp.req1 / propValues.length,
                        req2: bp.req2 == null ? null : bp.req2 / propValues.length,
                        req3: bp.req3 == null ? null : bp.req3 / propValues.length,
                        req4: bp.req4 == null ? null : bp.req4 / propValues.length,
                        req5: bp.req5 == null ? null : bp.req5 / propValues.length,
                        year1: bp.year1,
                        year2: bp.year2,
                        origin: board.locality
                      });
                      _context12.next = 36;
                      return newBoardProject.save();

                    case 36:
                      k++;
                      _context12.next = 25;
                      break;

                    case 39:
                      j++;
                      _context12.next = 7;
                      break;

                    case 42:
                    case "end":
                      return _context12.stop();
                  }
                }
              }, _loop, null, [[10, 16]]);
            });
            i = 0;

          case 2:
            if (!(i < boards.length)) {
              _context13.next = 7;
              break;
            }

            return _context13.delegateYield(_loop(), "t0", 4);

          case 4:
            i++;
            _context13.next = 2;
            break;

          case 7:
          case "end":
            return _context13.stop();
        }
      }
    }, _callee12);
  }));

  return function sendBoardProjectsToProp(_x24, _x25) {
    return _ref12.apply(this, arguments);
  };
}();

var updateProjectStatus = /*#__PURE__*/function () {
  var _ref13 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee13(boards, status) {
    var i, board, boardProjects, j, bp, updateQuery, query, data;
    return _regeneratorRuntime().wrap(function _callee13$(_context14) {
      while (1) {
        switch (_context14.prev = _context14.next) {
          case 0:
            i = 0;

          case 1:
            if (!(i < boards.length)) {
              _context14.next = 27;
              break;
            }

            board = boards[i];
            _context14.next = 5;
            return BoardProject.findAll({
              where: {
                board_id: board._id
              }
            });

          case 5:
            boardProjects = _context14.sent;
            j = 0;

          case 7:
            if (!(j < boardProjects.length)) {
              _context14.next = 24;
              break;
            }

            bp = boardProjects[j];
            _context14.prev = 9;
            updateQuery = "UPDATE ".concat(_config.CREATE_PROJECT_TABLE, " SET status = '").concat(status, "' WHERE  projectid = ").concat(bp.project_id);
            query = {
              q: updateQuery
            };
            _context14.next = 14;
            return (0, _needle["default"])('post', _config.CARTO_URL, query, {
              json: true
            });

          case 14:
            data = _context14.sent;

            if (data.statusCode === 200) {
              result = data.body;

              _logger["default"].info(result);
            } else {
              _logger["default"].error('bad status ' + data.statusCode + ' ' + JSON.stringify(data.body, null, 2));
            }

            _context14.next = 21;
            break;

          case 18:
            _context14.prev = 18;
            _context14.t0 = _context14["catch"](9);
            return _context14.abrupt("continue", 21);

          case 21:
            j++;
            _context14.next = 7;
            break;

          case 24:
            i++;
            _context14.next = 1;
            break;

          case 27:
          case "end":
            return _context14.stop();
        }
      }
    }, _callee13, null, [[9, 18]]);
  }));

  return function updateProjectStatus(_x26, _x27) {
    return _ref13.apply(this, arguments);
  };
}();

var sendBoardProjectsToDistrict = /*#__PURE__*/function () {
  var _ref14 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee14(boards) {
    var i, board, boardProjects, j, bp, destinyBoard, newBoardProject;
    return _regeneratorRuntime().wrap(function _callee14$(_context15) {
      while (1) {
        switch (_context15.prev = _context15.next) {
          case 0:
            i = 0;

          case 1:
            if (!(i < boards.length)) {
              _context15.next = 21;
              break;
            }

            board = boards[i];
            _context15.next = 5;
            return BoardProject.findAll({
              where: {
                board_id: board._id
              }
            });

          case 5:
            boardProjects = _context15.sent;
            j = 0;

          case 7:
            if (!(j < boardProjects.length)) {
              _context15.next = 18;
              break;
            }

            bp = boardProjects[j];
            _context15.next = 11;
            return getBoard('WORK_PLAN', 'MHFD District Work Plan', board.year, board.projecttype);

          case 11:
            destinyBoard = _context15.sent;
            //TODO: improve to avoid multiple queries to same board
            newBoardProject = new BoardProject({
              board_id: destinyBoard._id,
              project_id: bp.project_id,
              position0: bp.position0,
              position1: bp.position1,
              position2: bp.position2,
              position3: bp.position3,
              position4: bp.position4,
              position5: bp.position5,
              req1: bp.req1,
              req2: bp.req2,
              req3: bp.req3,
              req4: bp.req4,
              req5: bp.req5,
              year1: bp.year1,
              year2: bp.year2,
              origin: board.locality
            });
            _context15.next = 15;
            return newBoardProject.save();

          case 15:
            j++;
            _context15.next = 7;
            break;

          case 18:
            i++;
            _context15.next = 1;
            break;

          case 21:
          case "end":
            return _context15.stop();
        }
      }
    }, _callee14);
  }));

  return function sendBoardProjectsToDistrict(_x28) {
    return _ref14.apply(this, arguments);
  };
}();

var updateBoards = /*#__PURE__*/function () {
  var _ref15 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee15(board, status, comment, substatus) {
    var pjts, i, pjt, body, b, newBoard, newFields;
    return _regeneratorRuntime().wrap(function _callee15$(_context16) {
      while (1) {
        switch (_context16.prev = _context16.next) {
          case 0:
            _logger["default"].info('Updating all boards different project type');

            pjts = ['Capital', 'Maintenance', 'Study', 'Acquisition', 'Special'];
            i = 0;

          case 3:
            if (!(i < pjts.length)) {
              _context16.next = 26;
              break;
            }

            pjt = pjts[i];
            body = {
              type: board.type,
              year: board.year,
              locality: board.locality,
              projecttype: pjt
            };
            _context16.next = 8;
            return Board.findOne({
              where: body
            });

          case 8:
            b = _context16.sent;

            if (status === 'Approved' && board.status !== status) {
              body['submissionDate'] = new Date();
            }

            _logger["default"].info("Project type ".concat(pjt));

            if (b) {
              _context16.next = 18;
              break;
            }

            _logger["default"].info("Creating new board for ".concat(pjt));

            newBoard = new Board(_objectSpread(_objectSpread({}, body), {}, {
              status: status,
              comment: comment,
              substatus: substatus
            }));
            _context16.next = 16;
            return newBoard.save();

          case 16:
            _context16.next = 23;
            break;

          case 18:
            _logger["default"].info('Updating board');

            newFields = {
              status: status,
              comment: comment,
              substatus: substatus
            };

            if (status === 'Approved' && board.status !== status) {
              newFields['submissionDate'] = new Date();
            }

            _context16.next = 23;
            return b.update(newFields);

          case 23:
            i++;
            _context16.next = 3;
            break;

          case 26:
          case "end":
            return _context16.stop();
        }
      }
    }, _callee15);
  }));

  return function updateBoards(_x29, _x30, _x31, _x32) {
    return _ref15.apply(this, arguments);
  };
}();

var moveCardsToNextLevel = /*#__PURE__*/function () {
  var _ref16 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee16(board) {
    var boards, boardsToCounty, boardsToServiceArea;
    return _regeneratorRuntime().wrap(function _callee16$(_context17) {
      while (1) {
        switch (_context17.prev = _context17.next) {
          case 0:
            _logger["default"].info('moveCardsToNextLevel');

            _context17.next = 3;
            return Board.findAll({
              where: {
                type: board.type,
                year: board.year,
                locality: board.locality
              }
            });

          case 3:
            boards = _context17.sent;

            if (!(board.type === 'WORK_REQUEST')) {
              _context17.next = 21;
              break;
            }

            if (+board.year < 2022) {
              boardsToCounty = boards.filter(function (board) {
                return ['Capital', 'Maintenance'].includes(board.projecttype);
              });
              boardsToServiceArea = boards.filter(function (board) {
                return ['Study', 'Acquisition', 'Special'].includes(board.projecttype);
              });
            } else {
              boardsToCounty = boards.filter(function (board) {
                return ['Capital', 'Maintenance', 'Acquisition', 'Special'].includes(board.projecttype);
              });
              boardsToServiceArea = boards.filter(function (board) {
                return ['Study'].includes(board.projecttype);
              });
            }

            _logger["default"].info("Sending ".concat(boardsToCounty.length, " to county"));

            _context17.next = 9;
            return sendBoardProjectsToProp(boardsToCounty, 'county');

          case 9:
            _logger["default"].info("Sending ".concat(boardsToServiceArea.length, " to service area"));

            _context17.next = 12;
            return sendBoardProjectsToProp(boardsToServiceArea, 'servicearea');

          case 12:
            _logger["default"].info("Sending ".concat(boards.length, " to district"));

            _context17.next = 15;
            return sendBoardProjectsToDistrict(boards);

          case 15:
            _logger["default"].info("Update ".concat(boards.length, " as Requested"));

            _context17.next = 18;
            return updateProjectStatus(boards, 'Requested');

          case 18:
            return _context17.abrupt("return", {});

          case 21:
            if (!(board.type === 'WORK_PLAN')) {
              _context17.next = 30;
              break;
            }

            if (!(board.locality !== 'MHFD District Work Plan')) {
              _context17.next = 27;
              break;
            }

            _context17.next = 25;
            return updateProjectStatus(boards, 'Submitted');

          case 25:
            _context17.next = 29;
            break;

          case 27:
            _context17.next = 29;
            return updateProjectStatus(boards, 'Approved');

          case 29:
            return _context17.abrupt("return", {});

          case 30:
          case "end":
            return _context17.stop();
        }
      }
    }, _callee16);
  }));

  return function moveCardsToNextLevel(_x33) {
    return _ref16.apply(this, arguments);
  };
}();

router.get('/:boardId/boards/:type', /*#__PURE__*/function () {
  var _ref17 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee17(req, res) {
    var _req$params, boardId, type, board, boardLocalities, bids, i, bl, locality, boardFrom;

    return _regeneratorRuntime().wrap(function _callee17$(_context18) {
      while (1) {
        switch (_context18.prev = _context18.next) {
          case 0:
            _req$params = req.params, boardId = _req$params.boardId, type = _req$params.type;
            _context18.next = 3;
            return Board.findOne({
              where: {
                _id: boardId
              }
            });

          case 3:
            board = _context18.sent;
            _context18.next = 6;
            return BoardLocality.findAll({
              where: {
                toLocality: board.locality
              }
            });

          case 6:
            boardLocalities = _context18.sent;
            bids = [];
            i = 0;

          case 9:
            if (!(i < boardLocalities.length)) {
              _context18.next = 19;
              break;
            }

            bl = boardLocalities[i];
            locality = bl.fromLocality;
            _context18.next = 14;
            return Board.findOne({
              where: {
                locality: locality,
                type: type,
                year: board.year,
                status: 'Approved'
              }
            });

          case 14:
            boardFrom = _context18.sent;
            bids.push({
              locality: locality,
              status: boardFrom ? boardFrom.status : 'Under Review',
              submissionDate: boardFrom ? boardFrom.submissionDate : null,
              substatus: boardFrom ? boardFrom.substatus : ''
            });

          case 16:
            i++;
            _context18.next = 9;
            break;

          case 19:
            res.status(200).send({
              boards: bids
            });

          case 20:
          case "end":
            return _context18.stop();
        }
      }
    }, _callee17);
  }));

  return function (_x34, _x35) {
    return _ref17.apply(this, arguments);
  };
}());

var getEmailsForWR = /*#__PURE__*/function () {
  var _ref18 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee18(board) {
    var emails, boardLocalities, users;
    return _regeneratorRuntime().wrap(function _callee18$(_context19) {
      while (1) {
        switch (_context19.prev = _context19.next) {
          case 0:
            emails = [];
            _context19.next = 3;
            return BoardLocality.findAll({
              where: {
                fromLocality: board.locality
              }
            });

          case 3:
            boardLocalities = _context19.sent;
            boardLocalities.forEach(function (bl) {
              emails.push(bl.email);
            });
            _context19.next = 7;
            return User.findAll({
              where: {
                organization: board.locality
              }
            });

          case 7:
            users = _context19.sent;
            users.forEach(function (u) {
              emails.push(u.email);
            });
            return _context19.abrupt("return", emails);

          case 10:
          case "end":
            return _context19.stop();
        }
      }
    }, _callee18);
  }));

  return function getEmailsForWR(_x36) {
    return _ref18.apply(this, arguments);
  };
}();

var getEmailsForWP = /*#__PURE__*/function () {
  var _ref19 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee19(board) {
    var emails, allStaffEmails, boardLocalities, i, bl, jurisdiction, users;
    return _regeneratorRuntime().wrap(function _callee19$(_context20) {
      while (1) {
        switch (_context20.prev = _context20.next) {
          case 0:
            //TODO: maybe replace it with a distinct on board localities
            emails = [];
            allStaffEmails = ['dskuodas@mhfd.org', 'kbauer@mhfd.org', 'jwatt@mhfd.org', 'bseymour@mhfd.org', 'mlynch@mhfd.org', 'jvillines@mhfd.org', 'bkohlenberg@mhfd.org', 'tpatterson@mhfd.org', 'bchongtoua@mhfd.org'];
            allStaffEmails.forEach(function (ase) {
              emails.push(ase);
            });
            _context20.next = 5;
            return BoardLocality.findAll({
              where: {
                toLocality: board.locality
              }
            });

          case 5:
            boardLocalities = _context20.sent;
            i = 0;

          case 7:
            if (!(i < boardLocalities.length)) {
              _context20.next = 17;
              break;
            }

            bl = boardLocalities[i];
            jurisdiction = bl.fromLocality;
            _context20.next = 12;
            return User.findAll({
              where: {
                organization: jurisdiction
              }
            });

          case 12:
            users = _context20.sent;
            users.forEach(function (u) {
              emails.push(u.email);
            });

          case 14:
            i++;
            _context20.next = 7;
            break;

          case 17:
            return _context20.abrupt("return", emails);

          case 18:
          case "end":
            return _context20.stop();
        }
      }
    }, _callee19);
  }));

  return function getEmailsForWP(_x37) {
    return _ref19.apply(this, arguments);
  };
}();

var sendMails = /*#__PURE__*/function () {
  var _ref20 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee20(board, fullName) {
    var emails;
    return _regeneratorRuntime().wrap(function _callee20$(_context21) {
      while (1) {
        switch (_context21.prev = _context21.next) {
          case 0:
            emails = [];

            if (!(board.type === 'WORK_REQUEST')) {
              _context21.next = 7;
              break;
            }

            _context21.next = 4;
            return getEmailsForWR(board);

          case 4:
            emails = _context21.sent;
            _context21.next = 10;
            break;

          case 7:
            _context21.next = 9;
            return getEmailsForWP(board);

          case 9:
            emails = _context21.sent;

          case 10:
            emails = emails.filter(function (value, index, array) {
              return array.indexOf(value) == index;
            });
            emails.forEach(function (email) {
              (0, _userService.sendBoardNotification)(email, board.type, board.locality, board.year, fullName);
            });

          case 12:
          case "end":
            return _context21.stop();
        }
      }
    }, _callee20);
  }));

  return function sendMails(_x38, _x39) {
    return _ref20.apply(this, arguments);
  };
}();

router.put('/:boardId', [_auth["default"]], /*#__PURE__*/function () {
  var _ref21 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee21(req, res) {
    var boardId, _req$body2, status, comment, substatus, board, bodyResponse, r;

    return _regeneratorRuntime().wrap(function _callee21$(_context22) {
      while (1) {
        switch (_context22.prev = _context22.next) {
          case 0:
            boardId = req.params.boardId;

            _logger["default"].info("Attempting to update board ".concat(boardId));

            _req$body2 = req.body, status = _req$body2.status, comment = _req$body2.comment, substatus = _req$body2.substatus;
            _context22.next = 5;
            return Board.findOne({
              where: {
                _id: boardId
              }
            });

          case 5:
            board = _context22.sent;

            if (!board) {
              _context22.next = 20;
              break;
            }

            _context22.next = 9;
            return updateBoards(board, status, comment, substatus);

          case 9:
            bodyResponse = {
              status: 'updated'
            };

            if (!(status === 'Approved' && board.status !== status)) {
              _context22.next = 17;
              break;
            }

            _logger["default"].info("Approving board ".concat(boardId));

            sendMails(board, req.user.name);
            _context22.next = 15;
            return moveCardsToNextLevel(board);

          case 15:
            r = _context22.sent;
            bodyResponse = _objectSpread(_objectSpread({}, bodyResponse), r);

          case 17:
            res.status(200).send(bodyResponse);
            _context22.next = 21;
            break;

          case 20:
            res.status(404).send({
              error: 'not found'
            });

          case 21:
          case "end":
            return _context22.stop();
        }
      }
    }, _callee21);
  }));

  return function (_x40, _x41) {
    return _ref21.apply(this, arguments);
  };
}());
router["delete"]('/project/:projectid/:namespaceId', [_auth["default"]], /*#__PURE__*/function () {
  var _ref22 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee22(req, res) {
    var _req$params2, projectid, namespaceId, boardProjects;

    return _regeneratorRuntime().wrap(function _callee22$(_context23) {
      while (1) {
        switch (_context23.prev = _context23.next) {
          case 0:
            _req$params2 = req.params, projectid = _req$params2.projectid, namespaceId = _req$params2.namespaceId;
            _context23.next = 3;
            return BoardProject.findAll({
              where: {
                board_id: namespaceId,
                project_id: projectid
              }
            });

          case 3:
            boardProjects = _context23.sent;
            boardProjects.forEach(function (bp) {
              bp.destroy();
            });

            if (boardProjects.length === 0) {
              res.status(404).send({
                status: 'notfound'
              });
            } else {
              res.send({
                status: 'ok'
              });
            }

          case 6:
          case "end":
            return _context23.stop();
        }
      }
    }, _callee22);
  }));

  return function (_x42, _x43) {
    return _ref22.apply(this, arguments);
  };
}());
router.get('/bbox/:projectid', /*#__PURE__*/function () {
  var _ref23 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee23(req, res) {
    var projectid, sql, query, data;
    return _regeneratorRuntime().wrap(function _callee23$(_context24) {
      while (1) {
        switch (_context24.prev = _context24.next) {
          case 0:
            projectid = req.params.projectid;
            sql = "SELECT ST_AsGeoJSON(ST_Envelope(the_geom)) as bbox FROM ".concat(_config.CREATE_PROJECT_TABLE, " WHERE projectid = ").concat(projectid);
            query = {
              q: sql
            };

            _logger["default"].info(sql);

            _context24.prev = 4;
            _context24.next = 7;
            return (0, _needle["default"])('post', _config.CARTO_URL, query, {
              json: true
            });

          case 7:
            data = _context24.sent;

            if (!(data.statusCode === 200)) {
              _context24.next = 13;
              break;
            }

            result = data.body;
            res.send(result.rows[0]);
            _context24.next = 15;
            break;

          case 13:
            _logger["default"].error('bad status ' + data.statusCode + ' ' + JSON.stringify(data.body, null, 2));

            return _context24.abrupt("return", res.status(data.statusCode).send(data.body));

          case 15:
            _context24.next = 21;
            break;

          case 17:
            _context24.prev = 17;
            _context24.t0 = _context24["catch"](4);

            _logger["default"].error(_context24.t0);

            res.status(500).send(_context24.t0);

          case 21:
            ;

          case 22:
          case "end":
            return _context24.stop();
        }
      }
    }, _callee23, null, [[4, 17]]);
  }));

  return function (_x44, _x45) {
    return _ref23.apply(this, arguments);
  };
}());
router.get('/:type/:year/', /*#__PURE__*/function () {
  var _ref24 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee24(req, res) {
    var _req$params3, type, year, boards;

    return _regeneratorRuntime().wrap(function _callee24$(_context25) {
      while (1) {
        switch (_context25.prev = _context25.next) {
          case 0:
            _req$params3 = req.params, type = _req$params3.type, year = _req$params3.year;
            _context25.next = 3;
            return Board.findAll({
              where: {
                type: type,
                year: year
              }
            });

          case 3:
            boards = _context25.sent;
            res.send(boards);

          case 5:
          case "end":
            return _context25.stop();
        }
      }
    }, _callee24);
  }));

  return function (_x46, _x47) {
    return _ref24.apply(this, arguments);
  };
}());
router.post('/projects-bbox', /*#__PURE__*/function () {
  var _ref25 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee25(req, res) {
    var projects, projectsParsed, _iterator2, _step2, project, sql, query, data;

    return _regeneratorRuntime().wrap(function _callee25$(_context26) {
      while (1) {
        switch (_context26.prev = _context26.next) {
          case 0:
            projects = req.body.projects;
            console.log(projects);
            projectsParsed = '';
            _iterator2 = _createForOfIteratorHelper(projects);

            try {
              for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                project = _step2.value;

                if (projectsParsed) {
                  projectsParsed += ',';
                }

                projectsParsed += project;
              }
            } catch (err) {
              _iterator2.e(err);
            } finally {
              _iterator2.f();
            }

            sql = "SELECT ST_AsGeoJSON(ST_Envelope(ST_Collect(the_geom))) as bbox FROM ".concat(_config.CREATE_PROJECT_TABLE, " WHERE projectid IN (").concat(projectsParsed, ")");
            query = {
              q: sql
            };

            _logger["default"].info(sql);

            _context26.prev = 8;
            _context26.next = 11;
            return (0, _needle["default"])('post', _config.CARTO_URL, query, {
              json: true
            });

          case 11:
            data = _context26.sent;

            if (!(data.statusCode === 200)) {
              _context26.next = 17;
              break;
            }

            result = data.body;
            res.send(result.rows[0]);
            _context26.next = 19;
            break;

          case 17:
            _logger["default"].error('bad status ' + data.statusCode + ' ' + JSON.stringify(data.body, null, 2));

            return _context26.abrupt("return", res.status(data.statusCode).send(data.body));

          case 19:
            _context26.next = 25;
            break;

          case 21:
            _context26.prev = 21;
            _context26.t0 = _context26["catch"](8);

            _logger["default"].error(_context26.t0);

            res.status(500).send(_context26.t0);

          case 25:
            ;

          case 26:
          case "end":
            return _context26.stop();
        }
      }
    }, _callee25, null, [[8, 21]]);
  }));

  return function (_x48, _x49) {
    return _ref25.apply(this, arguments);
  };
}());
var _default = router;
exports["default"] = _default;