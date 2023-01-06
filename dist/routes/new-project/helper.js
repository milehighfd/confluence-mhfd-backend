"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateBoardProjectAtIndex = exports.setProjectID = exports.sendBoardsToProp = exports.getNewProjectId = exports.getBoard = exports.copyProject = exports.cleanStringValue = exports.addProjectToBoard = void 0;

var _needle = _interopRequireDefault(require("needle"));

var _db = _interopRequireDefault(require("bc/config/db.js"));

var _config = require("bc/config/config.js");

var _logger = _interopRequireDefault(require("bc/config/logger.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return generator._invoke = function (innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; }(innerFn, self, context), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; this._invoke = function (method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (object) { var keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var Configuration = _db["default"].configuration;
var Board = _db["default"].board;
var BoardProject = _db["default"].boardProject;
var Project = _db["default"].project;

var updateBoardProjectAtIndex = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(boardId, index) {
    var bps;
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return BoardProject.findAll({
              where: {
                board_id: boardId
              }
            });

          case 2:
            bps = _context2.sent;
            bps.forEach( /*#__PURE__*/function () {
              var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(bp) {
                return _regeneratorRuntime().wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        if (!(bp["position".concat(index)] != null)) {
                          _context.next = 3;
                          break;
                        }

                        _context.next = 3;
                        return bp.update(_defineProperty({}, "position".concat(index), bp["position".concat(index)] + 1));

                      case 3:
                      case "end":
                        return _context.stop();
                    }
                  }
                }, _callee);
              }));

              return function (_x3) {
                return _ref2.apply(this, arguments);
              };
            }());

          case 4:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function updateBoardProjectAtIndex(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

exports.updateBoardProjectAtIndex = updateBoardProjectAtIndex;

var getBoard = /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(type, locality, year, projecttype) {
    var board, newBoard;
    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return Board.findOne({
              where: {
                type: type,
                year: year,
                locality: locality,
                projecttype: projecttype
              }
            });

          case 2:
            board = _context3.sent;

            if (!board) {
              _context3.next = 7;
              break;
            }

            return _context3.abrupt("return", board);

          case 7:
            newBoard = new Board({
              type: type,
              year: year,
              locality: locality,
              projecttype: projecttype,
              status: 'Under Review'
            });
            newBoard.save();
            return _context3.abrupt("return", newBoard);

          case 10:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function getBoard(_x4, _x5, _x6, _x7) {
    return _ref3.apply(this, arguments);
  };
}();

exports.getBoard = getBoard;

var sendBoardsToProp = /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(bp, board, prop, propid) {
    var propValues, k, propVal, destinyBoard, newBoardProject;
    return _regeneratorRuntime().wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            console.log(bp, board, prop);
            propValues = prop.split(',');
            k = 0;

          case 3:
            if (!(k < propValues.length)) {
              _context4.next = 15;
              break;
            }

            propVal = propValues[k];

            if (propid === 'county' && !prop.includes('County')) {
              propVal = propVal.trimEnd().concat(' County');
            } else if (propid === 'servicearea' && !prop.includes(' Service Area')) {
              propVal = propVal.trimEnd().concat(' Service Area');
            }

            _context4.next = 8;
            return getBoard('WORK_PLAN', propVal, board.year, board.projecttype);

          case 8:
            destinyBoard = _context4.sent;
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
              req1: bp.req1 == null ? null : bp.req1 / propValues.length,
              req2: bp.req2 == null ? null : bp.req2 / propValues.length,
              req3: bp.req3 == null ? null : bp.req3 / propValues.length,
              req4: bp.req4 == null ? null : bp.req4 / propValues.length,
              req5: bp.req5 == null ? null : bp.req5 / propValues.length,
              year1: bp.year1,
              year2: bp.year2,
              origin: board.locality
            });
            _context4.next = 12;
            return newBoardProject.save();

          case 12:
            k++;
            _context4.next = 3;
            break;

          case 15:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function sendBoardsToProp(_x8, _x9, _x10, _x11) {
    return _ref4.apply(this, arguments);
  };
}();

exports.sendBoardsToProp = sendBoardsToProp;

var addProjectToBoard = /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(user, servicearea, county, locality, projecttype, project_id, year, sendToWR, isWorkPlan) {
    var _yield$db$sequelize$q, _yield$db$sequelize$q2, dbLocs, _dbLoc, dbLoc, type, configuration, board, newBoard, boardProjectObject, boardProject, boardProjectSaved;

    return _regeneratorRuntime().wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return _db["default"].sequelize.query("SELECT name, type FROM Localities WHERE name = '".concat(locality, "'"));

          case 2:
            _yield$db$sequelize$q = _context5.sent;
            _yield$db$sequelize$q2 = _slicedToArray(_yield$db$sequelize$q, 1);
            dbLocs = _yield$db$sequelize$q2[0];
            _dbLoc = null;

            if (dbLocs.length > 0) {
              _dbLoc = dbLocs[0];
            }

            dbLoc = _dbLoc;
            type = 'WORK_REQUEST';

            if (dbLoc) {
              if (dbLoc.type === 'JURISDICTION') {
                type = 'WORK_REQUEST';
              } else if (dbLoc.type === 'COUNTY' || dbLoc.type === 'SERVICE_AREA') {
                type = 'WORK_PLAN';
              }
            }

            if (year) {
              _context5.next = 15;
              break;
            }

            _context5.next = 13;
            return Configuration.findOne({
              where: {
                key: 'BOARD_YEAR'
              }
            });

          case 13:
            configuration = _context5.sent;
            year = +configuration.value;

          case 15:
            _context5.next = 17;
            return Board.findOne({
              where: {
                type: type,
                year: year,
                locality: locality,
                projecttype: projecttype
              }
            });

          case 17:
            board = _context5.sent;

            if (board) {
              _context5.next = 23;
              break;
            }

            newBoard = new Board({
              type: type,
              year: year,
              locality: locality,
              projecttype: projecttype,
              status: 'Under Review'
            });
            _context5.next = 22;
            return newBoard.save();

          case 22:
            board = newBoard;

          case 23:
            boardProjectObject = {
              board_id: board._id,
              project_id: project_id,
              origin: locality
            };

            if (type === 'WORK_PLAN') {
              boardProjectObject.originPosition0 = -1;
              boardProjectObject.originPosition1 = -1;
              boardProjectObject.originPosition2 = -1;
              boardProjectObject.originPosition3 = -1;
              boardProjectObject.originPosition4 = -1;
              boardProjectObject.originPosition5 = -1;
            }

            boardProjectObject.position0 = 0;
            console.log('BOARD PROJECT OBJECT', boardProjectObject);
            boardProject = new BoardProject(boardProjectObject);
            boardProjectSaved = boardProject;
            updateBoardProjectAtIndex(board._id, 0);
            console.log('zxcSEND TO WORK REQUEST \n\n\n\n\n\n\n\n', sendToWR, _typeof(sendToWR));

            if (!(sendToWR === 'true' || isWorkPlan)) {
              _context5.next = 36;
              break;
            }

            console.log('\n\n\n\n\n\n zxcsent to Wokrrequest', sendToWR);
            _context5.next = 35;
            return boardProject.save();

          case 35:
            boardProjectSaved = _context5.sent;

          case 36:
            if (!(['admin', 'staff'].includes(user.designation) && !isWorkPlan)) {
              _context5.next = 41;
              break;
            }

            _context5.next = 39;
            return sendBoardsToProp(boardProjectSaved, board, servicearea, 'servicearea');

          case 39:
            _context5.next = 41;
            return sendBoardsToProp(boardProjectSaved, board, county, 'county');

          case 41:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));

  return function addProjectToBoard(_x12, _x13, _x14, _x15, _x16, _x17, _x18, _x19, _x20) {
    return _ref5.apply(this, arguments);
  };
}();

exports.addProjectToBoard = addProjectToBoard;

var getNewProjectId = /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6() {
    var query, data;
    return _regeneratorRuntime().wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            query = {
              q: "SELECT GREATEST(max(projectid + 1), 800000) FROM ".concat(_config.CREATE_PROJECT_TABLE)
            };
            _context6.next = 3;
            return (0, _needle["default"])('post', _config.CARTO_URL, query, {
              json: true
            });

          case 3:
            data = _context6.sent;
            return _context6.abrupt("return", data.body.rows[0].greatest);

          case 5:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));

  return function getNewProjectId() {
    return _ref6.apply(this, arguments);
  };
}();

exports.getNewProjectId = getNewProjectId;

var copyProject = /*#__PURE__*/function () {
  var _ref7 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7(newProjectId, projectid) {
    var result, updateQuery, query, data;
    return _regeneratorRuntime().wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            result = null;
            _context7.prev = 1;
            updateQuery = "\n      INSERT INTO ".concat(_config.CREATE_PROJECT_TABLE, "(the_geom, objectid, onbaseid, projectid, projectname, projecttype, projectsubtype, description, status, startyear, completeyear, sponsor, cosponsor1, cosponsor2, cosponsor3, frequency, maintenanceeligibility, ownership, acquisitionanticipateddate, acquisitionprogress, additionalcostdescription, overheadcostdescription, consultant, contractor, lgmanager, mhfdmanager, servicearea, county, jurisdiction, streamname, tasksedimentremoval, tasktreethinning, taskbankstabilization, taskdrainagestructure, taskregionaldetention, goalfloodrisk, goalwaterquality, goalstabilization, goalcaprecreation, goalcapvegetation, goalstudyovertopping, goalstudyconveyance, goalstudypeakflow, goalstudydevelopment, workplanyr1, workplanyr2, workplanyr3, workplanyr4, workplanyr5, attachments, coverimage, globalid, creationdate, creator, editdate, editor, shape_length, mhfddollarsrequested, mhfddollarsallocated, estimatedcost, finalcost, additionalcost, overheadcost, costdewatering, costmobilization, costtraffic, costutility, coststormwater, costengineering, costconstruction, costlegal, costcontingency, studyreason, studysubreason, component_cost, component_count)\n      SELECT the_geom, objectid, onbaseid, ").concat(newProjectId, ", projectname, projecttype, projectsubtype, description, status, startyear, completeyear, sponsor, cosponsor1, cosponsor2, cosponsor3, frequency, maintenanceeligibility, ownership, acquisitionanticipateddate, acquisitionprogress, additionalcostdescription, overheadcostdescription, consultant, contractor, lgmanager, mhfdmanager, servicearea, county, jurisdiction, streamname, tasksedimentremoval, tasktreethinning, taskbankstabilization, taskdrainagestructure, taskregionaldetention, goalfloodrisk, goalwaterquality, goalstabilization, goalcaprecreation, goalcapvegetation, goalstudyovertopping, goalstudyconveyance, goalstudypeakflow, goalstudydevelopment, workplanyr1, workplanyr2, workplanyr3, workplanyr4, workplanyr5, attachments, coverimage, globalid, creationdate, creator, editdate, editor, shape_length, mhfddollarsrequested, mhfddollarsallocated, estimatedcost, finalcost, additionalcost, overheadcost, costdewatering, costmobilization, costtraffic, costutility, coststormwater, costengineering, costconstruction, costlegal, costcontingency, studyreason, studysubreason, component_cost, component_count\n      FROM ").concat(_config.CREATE_PROJECT_TABLE, "\n      WHERE projectid = ").concat(projectid, "\n    ");
            query = {
              q: updateQuery
            };
            _context7.next = 6;
            return (0, _needle["default"])('post', _config.CARTO_URL, query, {
              json: true
            });

          case 6:
            data = _context7.sent;

            if (data.statusCode === 200) {
              result = data.body;
              console.log(result);
            } else {
              console.error('bad status ' + data.statusCode + ' ' + JSON.stringify(data.body, null, 2));
            }

            _context7.next = 12;
            break;

          case 10:
            _context7.prev = 10;
            _context7.t0 = _context7["catch"](1);

          case 12:
            return _context7.abrupt("return", result);

          case 13:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7, null, [[1, 10]]);
  }));

  return function copyProject(_x21, _x22) {
    return _ref7.apply(this, arguments);
  };
}();

exports.copyProject = copyProject;

var setProjectID = /*#__PURE__*/function () {
  var _ref8 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee8(res, projectId) {
    var update, updateQuery, data;
    return _regeneratorRuntime().wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            update = "UPDATE ".concat(_config.CREATE_PROJECT_TABLE, "\n  SET projectid = ").concat(projectId, "\n  WHERE projectid = -1");
            updateQuery = {
              q: update
            };

            _logger["default"].info('update projectid query ' + JSON.stringify(updateQuery));

            _context8.prev = 3;
            _context8.next = 6;
            return (0, _needle["default"])('post', _config.CARTO_URL, updateQuery, {
              json: true
            });

          case 6:
            data = _context8.sent;
            console.log('STATUS', data.statusCode);

            if (!(data.statusCode === 200)) {
              _context8.next = 12;
              break;
            }

            return _context8.abrupt("return", true);

          case 12:
            _logger["default"].error('bad status on UPDATE projectid ' + data.statusCode + '  -- ' + sql + JSON.stringify(data.body, null, 2));

            res.status(data.statusCode).send(data.body);
            return _context8.abrupt("return", false);

          case 15:
            _context8.next = 20;
            break;

          case 17:
            _context8.prev = 17;
            _context8.t0 = _context8["catch"](3);

            _logger["default"].error(_context8.t0, 'at', sql);

          case 20:
            ;
            return _context8.abrupt("return", true);

          case 22:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8, null, [[3, 17]]);
  }));

  return function setProjectID(_x23, _x24) {
    return _ref8.apply(this, arguments);
  };
}();

exports.setProjectID = setProjectID;

var cleanStringValue = function cleanStringValue(value) {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'string' && value.length > 0) {
    return value.replace("'", "''");
  }

  return value;
};

exports.cleanStringValue = cleanStringValue;