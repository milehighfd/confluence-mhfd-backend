"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _url = require("url");

var _sequelize = _interopRequireDefault(require("sequelize"));

var _logger = _interopRequireDefault(require("bc/config/logger.js"));

var _config = require("bc/config/config.js");

var _db = _interopRequireDefault(require("bc/config/db.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return generator._invoke = function (innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; }(innerFn, self, context), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; this._invoke = function (method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (object) { var keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var _filename4 = (0, _url.fileURLToPath)(import.meta.url);

var _dirname = _path["default"].dirname(_filename4);

var Op = _sequelize["default"].Op;
var Attachment = _db["default"].attachment;

function getPublicUrl(filename) {
  return "".concat(_config.BASE_SERVER_URL, "/", 'images', "/").concat(filename);
}

function getDestFile(filename) {
  var root = _path["default"].join(_dirname, "../../public/images");

  if (filename.includes('/')) {
    var folders = filename.split('/');

    for (var i = 0; i < folders.length - 1; i++) {
      root = _path["default"].join(root, folders[i]);

      if (!_fs["default"].existsSync(root)) {
        console.log('creating', root);

        _fs["default"].mkdirSync(root);
      }
    }

    return _path["default"].join(root, "/".concat(folders[folders.length - 1]));
  } else {
    return _path["default"].join(root, "/".concat(filename));
  }
}

var listAttachments = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(page, limit, sortByField, sortType, projectid) {
    var json, attachments;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            json = {
              offset: limit * (page - 1),
              limit: limit,
              order: [[sortByField, sortType]]
            };

            if (projectid) {
              json['where'] = {
                project_id: projectid
              };
            }

            _context.next = 4;
            return Attachment.findAll(json);

          case 4:
            attachments = _context.sent;
            return _context.abrupt("return", attachments.map(function (resp) {
              return {
                '_id': resp._id,
                'filename': {
                  'filename': resp.filename,
                  'mimetype': resp.mimetype,
                  'value': resp.value
                },
                'mimetype': resp.mimetype,
                'user_id': resp.user_id,
                'value': resp.value,
                'register_date': resp.register_date,
                'filesize': resp.filesize,
                'createdAt': resp.createdAt
              };
            }));

          case 6:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function listAttachments(_x, _x2, _x3, _x4, _x5) {
    return _ref.apply(this, arguments);
  };
}();

var findCoverImage = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(name) {
    var urlImage, attach;
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            urlImage = null;
            _context2.prev = 1;
            _context2.next = 4;
            return Attachment.findOne({
              where: {
                filename: _defineProperty({}, Op.like, '%' + name + '%')
              }
            });

          case 4:
            attach = _context2.sent;

            if (!attach) {
              _context2.next = 11;
              break;
            }

            _context2.next = 8;
            return attach.value;

          case 8:
            urlImage = _context2.sent;
            _context2.next = 12;
            break;

          case 11:
            urlImage = null;

          case 12:
            _context2.next = 18;
            break;

          case 14:
            _context2.prev = 14;
            _context2.t0 = _context2["catch"](1);

            _logger["default"].error(_context2.t0);

            urlImage = null;

          case 18:
            _context2.next = 20;
            return urlImage;

          case 20:
            return _context2.abrupt("return", _context2.sent);

          case 21:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[1, 14]]);
  }));

  return function findCoverImage(_x6) {
    return _ref2.apply(this, arguments);
  };
}();

var findByName = /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(name) {
    var urlImage, attach, _iterator, _step, url;

    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            urlImage = [];
            _context3.prev = 1;
            _context3.next = 4;
            return Attachment.findAll({
              where: {
                filename: _defineProperty({}, Op.like, '%' + name + '%')
              }
            });

          case 4:
            attach = _context3.sent;

            if (attach.length > 0) {
              _iterator = _createForOfIteratorHelper(attach);

              try {
                for (_iterator.s(); !(_step = _iterator.n()).done;) {
                  url = _step.value;
                  urlImage.push(url.value);
                }
              } catch (err) {
                _iterator.e(err);
              } finally {
                _iterator.f();
              }
            }

            _context3.next = 12;
            break;

          case 8:
            _context3.prev = 8;
            _context3.t0 = _context3["catch"](1);

            _logger["default"].error(_context3.t0);

            urlImage = null;

          case 12:
            _context3.next = 14;
            return urlImage;

          case 14:
            return _context3.abrupt("return", _context3.sent);

          case 15:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[1, 8]]);
  }));

  return function findByName(_x7) {
    return _ref3.apply(this, arguments);
  };
}();

var findByFilename = /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(name) {
    var urlImage, attach, _iterator2, _step2, url;

    return _regeneratorRuntime().wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            urlImage = [];
            _context4.prev = 1;
            _context4.next = 4;
            return Attachment.findAll({
              where: {
                filename: _defineProperty({}, Op.like, '%' + name + '%')
              }
            });

          case 4:
            attach = _context4.sent;

            if (attach.length > 0) {
              _iterator2 = _createForOfIteratorHelper(attach);

              try {
                for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                  url = _step2.value;
                  urlImage.push(url.filename);
                }
              } catch (err) {
                _iterator2.e(err);
              } finally {
                _iterator2.f();
              }
            }

            _context4.next = 12;
            break;

          case 8:
            _context4.prev = 8;
            _context4.t0 = _context4["catch"](1);

            _logger["default"].error(_context4.t0);

            urlImage = null;

          case 12:
            _context4.next = 14;
            return urlImage;

          case 14:
            return _context4.abrupt("return", _context4.sent);

          case 15:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[1, 8]]);
  }));

  return function findByFilename(_x8) {
    return _ref4.apply(this, arguments);
  };
}();

var countAttachments = /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5() {
    return _regeneratorRuntime().wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return Attachment.count();

          case 2:
            return _context5.abrupt("return", _context5.sent);

          case 3:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));

  return function countAttachments() {
    return _ref5.apply(this, arguments);
  };
}();

var removeAttachment = /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6(id) {
    var attach, name, fileName;
    return _regeneratorRuntime().wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.next = 2;
            return Attachment.findByPk(id, {
              raw: true
            });

          case 2:
            attach = _context6.sent;

            if (attach.project_id) {
              name = "".concat(attach.project_id, "/").concat(attach.filename);
            } else {
              name = attach.filename;
            }

            fileName = getDestFile(name);

            try {
              _fs["default"].unlinkSync(fileName);
            } catch (e) {
              console.log(e);
              console.log('Not able to delete file');
            }

            _context6.next = 8;
            return Attachment.destroy({
              where: {
                _id: attach._id
              }
            });

          case 8:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));

  return function removeAttachment(_x9) {
    return _ref6.apply(this, arguments);
  };
}();

var isImage = function isImage(type) {
  if (type === 'image/png' || type === 'image/jpg' || type === 'image/jpeg' || type === 'image/gif') {
    return true;
  } else {
    return false;
  }
};

var uploadFiles = /*#__PURE__*/function () {
  var _ref7 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7(user, files, projectid, cover) {
    var _iterator3, _step3, _loop;

    return _regeneratorRuntime().wrap(function _callee7$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _iterator3 = _createForOfIteratorHelper(files);
            _context8.prev = 1;
            _loop = /*#__PURE__*/_regeneratorRuntime().mark(function _loop() {
              var file, name, attach, complete, prom;
              return _regeneratorRuntime().wrap(function _loop$(_context7) {
                while (1) {
                  switch (_context7.prev = _context7.next) {
                    case 0:
                      file = _step3.value;
                      name = file.originalname;

                      if (projectid) {
                        name = "".concat(projectid, "/").concat(name);
                      }

                      attach = {};
                      attach.value = getPublicUrl(name);
                      attach.user_id = user._id;
                      attach.filename = file.originalname;
                      attach.mimetype = file.mimetype;
                      attach.register_date = new Date();
                      attach.filesize = file.size;
                      attach.isCover = cover ? file.originalname === cover : false;

                      if (projectid) {
                        attach.project_id = projectid;
                      }

                      Attachment.create(attach);
                      console.log(file.mimetype);
                      complete = getDestFile(name);

                      _logger["default"].info(complete);

                      prom = new Promise(function (resolve, reject) {
                        _fs["default"].writeFile(complete, file.buffer, function (error) {
                          if (error) {
                            _logger["default"].error('error ' + JSON.stringify(error));

                            reject({
                              error: error
                            });
                          }

                          resolve('OK');
                        });
                      });
                      _context7.prev = 17;
                      _context7.next = 20;
                      return prom;

                    case 20:
                      _context7.next = 25;
                      break;

                    case 22:
                      _context7.prev = 22;
                      _context7.t0 = _context7["catch"](17);
                      throw _context7.t0;

                    case 25:
                    case "end":
                      return _context7.stop();
                  }
                }
              }, _loop, null, [[17, 22]]);
            });

            _iterator3.s();

          case 4:
            if ((_step3 = _iterator3.n()).done) {
              _context8.next = 8;
              break;
            }

            return _context8.delegateYield(_loop(), "t0", 6);

          case 6:
            _context8.next = 4;
            break;

          case 8:
            _context8.next = 13;
            break;

          case 10:
            _context8.prev = 10;
            _context8.t1 = _context8["catch"](1);

            _iterator3.e(_context8.t1);

          case 13:
            _context8.prev = 13;

            _iterator3.f();

            return _context8.finish(13);

          case 16:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee7, null, [[1, 10, 13, 16]]);
  }));

  return function uploadFiles(_x10, _x11, _x12, _x13) {
    return _ref7.apply(this, arguments);
  };
}();

var toggle = /*#__PURE__*/function () {
  var _ref8 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee8(id) {
    var attach;
    return _regeneratorRuntime().wrap(function _callee8$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            _context9.next = 2;
            return Attachment.findByPk(id);

          case 2:
            attach = _context9.sent;
            attach.update({
              isCover: !attach.isCover
            });
            return _context9.abrupt("return", attach);

          case 5:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee8);
  }));

  return function toggle(_x14) {
    return _ref8.apply(this, arguments);
  };
}();

var toggleValue = /*#__PURE__*/function () {
  var _ref9 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee9(id, newIsCover) {
    var attach;
    return _regeneratorRuntime().wrap(function _callee9$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            _context10.next = 2;
            return Attachment.findByPk(id);

          case 2:
            attach = _context10.sent;
            attach.update({
              isCover: newIsCover
            });
            return _context10.abrupt("return", attach);

          case 5:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee9);
  }));

  return function toggleValue(_x15, _x16) {
    return _ref9.apply(this, arguments);
  };
}();

var _default = {
  listAttachments: listAttachments,
  uploadFiles: uploadFiles,
  countAttachments: countAttachments,
  removeAttachment: removeAttachment,
  findByName: findByName,
  findCoverImage: findCoverImage,
  findByFilename: findByFilename,
  toggle: toggle,
  toggleValue: toggleValue
};
exports["default"] = _default;