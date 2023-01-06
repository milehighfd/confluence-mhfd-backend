"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _sequelize = _interopRequireDefault(require("sequelize"));

var _db = _interopRequireDefault(require("bc/config/db.js"));

var _logger = _interopRequireDefault(require("bc/config/logger.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return generator._invoke = function (innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; }(innerFn, self, context), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; this._invoke = function (method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (object) { var keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var NewNotes = _db["default"].newnotes;
var GroupNotes = _db["default"].groupnotes;
var ColorNotes = _db["default"].color;
var DEFAULT_COLOR = '#FFE121';
var Op = _sequelize["default"].Op;
var SIZE_OF_BUCKET = 15000;

var getAllNotes = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(userId) {
    var notes;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            notes = NewNotes.findAll({
              where: {
                user_id: userId
              },
              include: {
                model: ColorNotes,
                as: 'color'
              }
            });
            return _context.abrupt("return", notes);

          case 5:
            _context.prev = 5;
            _context.t0 = _context["catch"](0);
            console.log('the error ', _context.t0);
            throw _context.t0;

          case 9:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[0, 5]]);
  }));

  return function getAllNotes(_x) {
    return _ref.apply(this, arguments);
  };
}();

var getNotesByColor = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(userId, colorIds, hasNull) {
    var where, notes;
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            where = {
              user_id: userId,
              color_id: colorIds
            };

            if (hasNull) {
              where = _defineProperty({
                user_id: userId
              }, Op.or, [{
                color_id: _defineProperty({}, Op.is, null)
              }, {
                color_id: colorIds
              }]);
            }

            notes = NewNotes.findAll({
              where: _objectSpread({}, where),
              include: {
                model: ColorNotes,
                as: 'color'
              }
            });
            return _context2.abrupt("return", notes);

          case 7:
            _context2.prev = 7;
            _context2.t0 = _context2["catch"](0);
            console.log('the error ', _context2.t0);
            throw _context2.t0;

          case 11:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[0, 7]]);
  }));

  return function getNotesByColor(_x2, _x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();

var getColorsByNote = /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(userId) {
    var colors;
    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            _context3.next = 3;
            return NewNotes.findAll({
              attributes: ['color_id'],
              where: {
                user_id: userId
              }
            });

          case 3:
            colors = _context3.sent;
            return _context3.abrupt("return", colors);

          case 7:
            _context3.prev = 7;
            _context3.t0 = _context3["catch"](0);
            console.log("the error ".concat(_context3.t0));
            throw _context3.t0;

          case 11:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[0, 7]]);
  }));

  return function getColorsByNote(_x5) {
    return _ref3.apply(this, arguments);
  };
}();

var getGroups = /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(id) {
    var groups;
    return _regeneratorRuntime().wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            console.log(id);
            _context4.next = 3;
            return GroupNotes.findAll({
              where: {
                user_id: id
              }
            });

          case 3:
            groups = _context4.sent;
            return _context4.abrupt("return", groups);

          case 5:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function getGroups(_x6) {
    return _ref4.apply(this, arguments);
  };
}();

var getColors = /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(userId) {
    var colors;
    return _regeneratorRuntime().wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return ColorNotes.findAll({
              where: {
                user_id: userId
              },
              order: [['createdAt', 'DESC']]
            });

          case 2:
            colors = _context5.sent;
            colors.sort(function (a, b) {
              if (a.label === 'Map Note' && a.label === b.label && a.color === DEFAULT_COLOR && b.color === DEFAULT_COLOR) {
                return a.createdAt - b.createdAt;
              }

              if (a.label === 'Map Note' && a.color === DEFAULT_COLOR) {
                return -1;
              }

              if (b.label === 'Map Note' && b.color === DEFAULT_COLOR) {
                return 1;
              }

              return a.label.localeCompare(b.label);
            });
            return _context5.abrupt("return", colors);

          case 5:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));

  return function getColors(_x7) {
    return _ref5.apply(this, arguments);
  };
}();

var deleteGroups = /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6(id) {
    var group;
    return _regeneratorRuntime().wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.next = 2;
            return GroupNotes.findOne({
              where: {
                _id: id
              }
            });

          case 2:
            group = _context6.sent;

            if (!group) {
              _context6.next = 9;
              break;
            }

            NewNotes.destroy({
              where: {
                group_id: id
              }
            });
            group.destroy();
            return _context6.abrupt("return", true);

          case 9:
            _logger["default"].info('group not found');

            return _context6.abrupt("return", false);

          case 11:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));

  return function deleteGroups(_x8) {
    return _ref6.apply(this, arguments);
  };
}();

var deleteColor = /*#__PURE__*/function () {
  var _ref7 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7(id) {
    var color;
    return _regeneratorRuntime().wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _context7.next = 2;
            return ColorNotes.findOne({
              where: {
                _id: id
              }
            });

          case 2:
            color = _context7.sent;
            _context7.next = 5;
            return NewNotes.update({
              color_id: null
            }, {
              where: {
                color_id: id
              }
            });

          case 5:
            if (!color) {
              _context7.next = 11;
              break;
            }

            _logger["default"].info('color destroyed ');

            color.destroy();
            return _context7.abrupt("return", true);

          case 11:
            _logger["default"].info('color not found');

            return _context7.abrupt("return", false);

          case 13:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7);
  }));

  return function deleteColor(_x9) {
    return _ref7.apply(this, arguments);
  };
}();

var updateGroup = /*#__PURE__*/function () {
  var _ref8 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee8(id, name, position) {
    var toUpdate;
    return _regeneratorRuntime().wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _logger["default"].info('update group ' + JSON.stringify(name));

            _context8.prev = 1;
            _context8.next = 4;
            return GroupNotes.findOne({
              where: {
                _id: id
              }
            });

          case 4:
            toUpdate = _context8.sent;

            if (!toUpdate) {
              _context8.next = 10;
              break;
            }

            console.log('update group ', toUpdate, name);
            _context8.next = 9;
            return toUpdate.update({
              name: name,
              position: position
            });

          case 9:
            toUpdate = _context8.sent;

          case 10:
            return _context8.abrupt("return", toUpdate);

          case 13:
            _context8.prev = 13;
            _context8.t0 = _context8["catch"](1);
            console.log('the error ', _context8.t0);
            throw _context8.t0;

          case 17:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8, null, [[1, 13]]);
  }));

  return function updateGroup(_x10, _x11, _x12) {
    return _ref8.apply(this, arguments);
  };
}();

var updateColor = /*#__PURE__*/function () {
  var _ref9 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee9(id, label, color, opacity) {
    var toUpdate;
    return _regeneratorRuntime().wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            _logger["default"].info('update color ', +color);

            _context9.prev = 1;
            _context9.next = 4;
            return ColorNotes.findOne({
              where: {
                _id: id
              }
            });

          case 4:
            toUpdate = _context9.sent;

            if (!toUpdate) {
              _context9.next = 9;
              break;
            }

            _context9.next = 8;
            return toUpdate.update({
              label: label,
              color: color,
              opacity: opacity
            });

          case 8:
            toUpdate = _context9.sent;

          case 9:
            return _context9.abrupt("return", toUpdate);

          case 12:
            _context9.prev = 12;
            _context9.t0 = _context9["catch"](1);
            console.log('the error ', _context9.t0);
            throw _context9.t0;

          case 16:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9, null, [[1, 12]]);
  }));

  return function updateColor(_x13, _x14, _x15, _x16) {
    return _ref9.apply(this, arguments);
  };
}();

var getAllNotesByUser = /*#__PURE__*/function () {
  var _ref10 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee10(userId) {
    var notes;
    return _regeneratorRuntime().wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            _context10.next = 2;
            return NewNotes.findAll({
              where: {
                user_id: userId
              }
            });

          case 2:
            notes = _context10.sent;
            return _context10.abrupt("return", notes);

          case 4:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10);
  }));

  return function getAllNotesByUser(_x17) {
    return _ref10.apply(this, arguments);
  };
}();

var deleteNote = /*#__PURE__*/function () {
  var _ref11 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee11(id) {
    var note;
    return _regeneratorRuntime().wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            _context11.next = 2;
            return NewNotes.findOne({
              where: {
                _id: id
              }
            });

          case 2:
            note = _context11.sent;
            console.log(id, note);

            if (!note) {
              _context11.next = 10;
              break;
            }

            _logger["default"].info('note destroyed ');

            note.destroy();
            return _context11.abrupt("return", true);

          case 10:
            _logger["default"].info('note not found');

            return _context11.abrupt("return", false);

          case 12:
          case "end":
            return _context11.stop();
        }
      }
    }, _callee11);
  }));

  return function deleteNote(_x18) {
    return _ref11.apply(this, arguments);
  };
}();

var getNextBucket = /*#__PURE__*/function () {
  var _ref12 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee12(userId) {
    var noteWithMaxPosition, groupWithMaxPosition, newBucket;
    return _regeneratorRuntime().wrap(function _callee12$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            _context12.next = 2;
            return NewNotes.findAll({
              where: {
                user_id: userId
              },
              order: [['position', 'ASC']],
              limit: 1
            });

          case 2:
            noteWithMaxPosition = _context12.sent;
            _context12.next = 5;
            return GroupNotes.findAll({
              where: {
                user_id: userId
              },
              order: [['position', 'ASC']],
              limit: 1
            });

          case 5:
            groupWithMaxPosition = _context12.sent;

            if (!noteWithMaxPosition.length) {
              noteWithMaxPosition.push({
                position: SIZE_OF_BUCKET
              });
            }

            if (!groupWithMaxPosition.length) {
              groupWithMaxPosition.push({
                position: noteWithMaxPosition[0].position
              });
            }

            newBucket = Math.min(noteWithMaxPosition[0].position, groupWithMaxPosition[0].position) - SIZE_OF_BUCKET;
            return _context12.abrupt("return", newBucket);

          case 10:
          case "end":
            return _context12.stop();
        }
      }
    }, _callee12);
  }));

  return function getNextBucket(_x19) {
    return _ref12.apply(this, arguments);
  };
}();

var saveNote = /*#__PURE__*/function () {
  var _ref13 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee13(note) {
    var newNote;
    return _regeneratorRuntime().wrap(function _callee13$(_context13) {
      while (1) {
        switch (_context13.prev = _context13.next) {
          case 0:
            _logger["default"].info('create note ' + JSON.stringify(note));

            _context13.prev = 1;
            _context13.next = 4;
            return getNextBucket(note.user_id);

          case 4:
            note.position = _context13.sent;
            _context13.next = 7;
            return NewNotes.create(note);

          case 7:
            newNote = _context13.sent;
            return _context13.abrupt("return", newNote);

          case 11:
            _context13.prev = 11;
            _context13.t0 = _context13["catch"](1);
            console.log('the error ', _context13.t0);
            throw _context13.t0;

          case 15:
          case "end":
            return _context13.stop();
        }
      }
    }, _callee13, null, [[1, 11]]);
  }));

  return function saveNote(_x20) {
    return _ref13.apply(this, arguments);
  };
}();

var saveGroup = /*#__PURE__*/function () {
  var _ref14 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee14(name, user_id) {
    var myGroup, group;
    return _regeneratorRuntime().wrap(function _callee14$(_context14) {
      while (1) {
        switch (_context14.prev = _context14.next) {
          case 0:
            console.log(name, user_id);
            myGroup = {
              name: name,
              user_id: user_id
            };
            _context14.next = 4;
            return getNextBucket(user_id);

          case 4:
            myGroup.position = _context14.sent;
            _context14.next = 7;
            return GroupNotes.create(myGroup);

          case 7:
            group = _context14.sent;
            return _context14.abrupt("return", group);

          case 9:
          case "end":
            return _context14.stop();
        }
      }
    }, _callee14);
  }));

  return function saveGroup(_x21, _x22) {
    return _ref14.apply(this, arguments);
  };
}();

var saveColor = /*#__PURE__*/function () {
  var _ref15 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee15(label, color, opacity, userId) {
    var newColor;
    return _regeneratorRuntime().wrap(function _callee15$(_context15) {
      while (1) {
        switch (_context15.prev = _context15.next) {
          case 0:
            _context15.prev = 0;
            _context15.next = 3;
            return ColorNotes.create({
              label: label,
              color: color,
              opacity: opacity,
              user_id: userId
            });

          case 3:
            newColor = _context15.sent;
            return _context15.abrupt("return", newColor);

          case 7:
            _context15.prev = 7;
            _context15.t0 = _context15["catch"](0);
            console.log('the error ', _context15.t0);
            throw _context15.t0;

          case 11:
          case "end":
            return _context15.stop();
        }
      }
    }, _callee15, null, [[0, 7]]);
  }));

  return function saveColor(_x23, _x24, _x25, _x26) {
    return _ref15.apply(this, arguments);
  };
}();

var updateNote = /*#__PURE__*/function () {
  var _ref16 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee16(id, note) {
    var toUpdate;
    return _regeneratorRuntime().wrap(function _callee16$(_context16) {
      while (1) {
        switch (_context16.prev = _context16.next) {
          case 0:
            _logger["default"].info('update note ' + JSON.stringify(note));

            _context16.prev = 1;
            _context16.next = 4;
            return NewNotes.findOne({
              where: {
                _id: id
              }
            });

          case 4:
            toUpdate = _context16.sent;

            if (!toUpdate) {
              _context16.next = 9;
              break;
            }

            _context16.next = 8;
            return toUpdate.update(_objectSpread({}, note));

          case 8:
            toUpdate = _context16.sent;

          case 9:
            return _context16.abrupt("return", toUpdate);

          case 12:
            _context16.prev = 12;
            _context16.t0 = _context16["catch"](1);
            console.log('the error ', _context16.t0);
            throw _context16.t0;

          case 16:
          case "end":
            return _context16.stop();
        }
      }
    }, _callee16, null, [[1, 12]]);
  }));

  return function updateNote(_x27, _x28) {
    return _ref16.apply(this, arguments);
  };
}();

var _default = {
  getAllNotesByUser: getAllNotesByUser,
  getAllNotes: getAllNotes,
  getGroups: getGroups,
  getColors: getColors,
  getNotesByColor: getNotesByColor,
  getColorsByNote: getColorsByNote,
  saveNote: saveNote,
  saveGroup: saveGroup,
  saveColor: saveColor,
  updateNote: updateNote,
  updateGroup: updateGroup,
  updateColor: updateColor,
  deleteGroups: deleteGroups,
  deleteNote: deleteNote,
  deleteColor: deleteColor
};
exports["default"] = _default;