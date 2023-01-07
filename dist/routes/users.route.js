"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _multer = _interopRequireDefault(require("multer"));

var _bcryptjs = _interopRequireDefault(require("bcryptjs"));

var _https = _interopRequireDefault(require("https"));

var _userService = _interopRequireDefault(require("bc/services/user.service.js"));

var _auth = _interopRequireDefault(require("bc/auth/auth.js"));

var _utils = require("bc/utils/utils.js");

var _enumConstants = require("bc/lib/enumConstants.js");

var _logger = _interopRequireDefault(require("bc/config/logger.js"));

var _db = _interopRequireDefault(require("bc/config/db.js"));

var _config = require("bc/config/config.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return generator._invoke = function (innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; }(innerFn, self, context), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; this._invoke = function (method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (object) { var keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var router = _express["default"].Router();

var User = _db["default"].user;
var ORGANIZATION_DEFAULT = 'Mile High Flood District';
var multer = (0, _multer["default"])({
  storage: _multer["default"].MemoryStorage,
  limits: {
    fileSize: 50 * 1024 * 1024
  }
});
router.get('/', /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(req, res, next) {
    var users;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return _userService["default"].findAllUsers();

          case 2:
            users = _context.sent;
            res.send(users);

          case 4:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}());
router.post('/signup', (0, _utils.validator)(_userService["default"].requiredFields('signup')), /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(req, res) {
    var user, foundUser, user1, token;
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            user = req.body;
            _context2.next = 4;
            return User.count({
              where: {
                email: user.email
              }
            });

          case 4:
            foundUser = _context2.sent;

            if (!foundUser) {
              _context2.next = 9;
              break;
            }

            res.status(422).send({
              error: 'The email has already been registered'
            });
            _context2.next = 27;
            break;

          case 9:
            if (!_enumConstants.EMAIL_VALIDATOR.test(user.email)) {
              _context2.next = 26;
              break;
            }

            user['activated'] = true;
            user['status'] = 'pending';
            _context2.next = 14;
            return _bcryptjs["default"].hash(user.password, 8);

          case 14:
            user.password = _context2.sent;
            user.name = user.firstName + ' ' + user.lastName;
            _context2.next = 18;
            return User.create(user);

          case 18:
            user1 = _context2.sent;
            _context2.next = 21;
            return user1.generateAuthToken();

          case 21:
            token = _context2.sent;

            _userService["default"].sendConfirmAccount(user);

            res.status(201).send({
              user: user,
              token: token
            });
            _context2.next = 27;
            break;

          case 26:
            return _context2.abrupt("return", res.status(400).send({
              error: 'You entered an invalid email direction'
            }));

          case 27:
            _context2.next = 33;
            break;

          case 29:
            _context2.prev = 29;
            _context2.t0 = _context2["catch"](0);

            _logger["default"].error(_context2.t0);

            res.status(500).send({
              error: _context2.t0
            });

          case 33:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[0, 29]]);
  }));

  return function (_x4, _x5) {
    return _ref2.apply(this, arguments);
  };
}());
router.put('/update', _auth["default"], /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(req, res) {
    var user, key;
    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            _context3.next = 3;
            return User.findByPk(req.user._id, {
              raw: true
            });

          case 3:
            user = _context3.sent;

            if (user) {
              _context3.next = 6;
              break;
            }

            return _context3.abrupt("return", res.status(404).send({
              error: 'User not found'
            }));

          case 6:
            if (!(user.email !== req.body.email)) {
              _context3.next = 11;
              break;
            }

            if (!User.count({
              where: {
                email: user.email,
                _id: {
                  $not: user._id
                }
              }
            })) {
              _context3.next = 9;
              break;
            }

            return _context3.abrupt("return", res.status(422).send({
              error: 'the email has already been registered'
            }));

          case 9:
            if (!_enumConstants.EMAIL_VALIDATOR.test(user.email)) {
              _context3.next = 11;
              break;
            }

            return _context3.abrupt("return", res.status(400).send({
              error: 'the email must be valid'
            }));

          case 11:
            _context3.t0 = _regeneratorRuntime().keys(req.body);

          case 12:
            if ((_context3.t1 = _context3.t0()).done) {
              _context3.next = 39;
              break;
            }

            key = _context3.t1.value;
            _context3.t2 = key;
            _context3.next = _context3.t2 === 'firstName' ? 17 : _context3.t2 === 'lastName' ? 19 : _context3.t2 === 'city' ? 21 : _context3.t2 === 'phone' ? 23 : _context3.t2 === 'county' ? 25 : _context3.t2 === 'organization' ? 27 : _context3.t2 === 'title' ? 29 : _context3.t2 === 'county' ? 31 : _context3.t2 === 'serviceArea' ? 33 : _context3.t2 === 'zoomarea' ? 35 : 37;
            break;

          case 17:
            user[key] = req.body[key];
            return _context3.abrupt("break", 37);

          case 19:
            user[key] = req.body[key];
            return _context3.abrupt("break", 37);

          case 21:
            user[key] = req.body[key];
            return _context3.abrupt("break", 37);

          case 23:
            user[key] = req.body[key];
            return _context3.abrupt("break", 37);

          case 25:
            user[key] = req.body[key];
            return _context3.abrupt("break", 37);

          case 27:
            user[key] = req.body[key];
            return _context3.abrupt("break", 37);

          case 29:
            user[key] = req.body[key];
            return _context3.abrupt("break", 37);

          case 31:
            user[key] = req.body[key];
            return _context3.abrupt("break", 37);

          case 33:
            user[key] = req.body[key];
            return _context3.abrupt("break", 37);

          case 35:
            user[key] = req.body[key];
            return _context3.abrupt("break", 37);

          case 37:
            _context3.next = 12;
            break;

          case 39:
            user.name = user.firstName + ' ' + user.lastName;
            user.password = req.user.password;
            _context3.next = 43;
            return User.update(user, {
              where: {
                _id: req.user._id
              }
            });

          case 43:
            return _context3.abrupt("return", res.status(200).send(user));

          case 46:
            _context3.prev = 46;
            _context3.t3 = _context3["catch"](0);

            _logger["default"].error(_context3.t3);

            res.status(500).send(_context3.t3);

          case 50:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, null, [[0, 46]]);
  }));

  return function (_x6, _x7) {
    return _ref3.apply(this, arguments);
  };
}());
router.get('/me', _auth["default"], /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(req, res) {
    var organization_query, user, result1, polygon, coordinates, newProm, respuesta, mapProjects, counters, _iterator, _step, element, _loop, _i, _arr;

    return _regeneratorRuntime().wrap(function _callee4$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            organization_query = '';
            user = req.user;
            result1 = {};
            polygon = [];
            coordinates = {
              longitude: -104.9063129121965,
              latitude: 39.768682416183
            }; //console.log('USER ME', user);

            result1['_id'] = user._id;
            result1['firstName'] = user.firstName;
            result1['lastName'] = user.lastName;
            result1['name'] = user.name;
            result1['email'] = user.email;
            result1['organization'] = user.organization;
            result1['city'] = user.city;
            result1['county'] = user.county;
            result1['serviceArea'] = user.serviceArea;
            result1['phone'] = user.phone;
            result1['zipCode'] = user.zipCode;
            result1['title'] = user.title;
            result1['activated'] = user.activated;
            result1['designation'] = user.designation;
            result1['photo'] = user.photo;
            result1['zoomarea'] = user.zoomarea ? user.zoomarea : '';
            result1['status'] = user.status;

            if (req.user.zoomarea) {
              organization_query = req.user.zoomarea;
            } else {
              organization_query = ORGANIZATION_DEFAULT;
            }

            _context5.prev = 23;
            newProm = new Promise(function (resolve, reject) {
              var sql = "SELECT ST_AsGeoJSON(ST_Envelope(the_geom)) FROM mhfd_zoom_to_areas WHERE aoi = '".concat(organization_query, "' ");
              var URL = "".concat(_config.CARTO_URL, "&q=").concat(sql);
              var result = []; //console.log('URL', URL);

              _https["default"].get(URL, function (response) {
                console.log('status ' + response.statusCode);

                if (response.statusCode === 200) {
                  var str = '';
                  response.on('data', function (chunk) {
                    str += chunk;
                  });
                  response.on('end', function () {
                    result = JSON.parse(str).rows;

                    if (result.length > 0) {
                      var all_coordinates = JSON.parse(result[0].st_asgeojson).coordinates;
                      var latitude_array = [];
                      var longitude_array = [];
                      console.log('COORDENADAS', all_coordinates);

                      for (var key in all_coordinates[0]) {
                        var row = JSON.stringify(all_coordinates[0][key]).replace("[", "").replace("]", "").split(',');
                        var coordinate_num = [];
                        coordinate_num.push(parseFloat(row[0]));
                        coordinate_num.push(parseFloat(row[1]));
                        longitude_array.push(parseFloat(row[0]));
                        latitude_array.push(parseFloat(row[1]));
                        polygon.push(coordinate_num);
                      }

                      var latitude_min = Math.min.apply(Math, latitude_array);
                      var latitude_max = Math.max.apply(Math, latitude_array);
                      var longitude_min = Math.min.apply(Math, longitude_array);
                      var longitude_max = Math.max.apply(Math, longitude_array);
                      coordinates = {
                        longitude: (longitude_max + longitude_min) / 2,
                        latitude: (latitude_max + latitude_min) / 2
                      };
                    } else {
                      coordinates = {
                        longitude: -104.9063129121965,
                        latitude: 39.768682416183
                      }; //console.log('NO HAY DATOS');

                      polygon = [[-105.32366831, 39.40578787], [-105.32366831, 40.13157697], [-104.48895751, 40.13157697], [-104.48895751, 39.40578787], [-105.32366831, 39.40578787]];
                    }

                    resolve({
                      polygon: polygon,
                      coordinates: coordinates
                    });
                  });
                }
              }).on('error', function (err) {
                _logger["default"].error("failed call to  with error  ".concat(err));
              });
            });
            _context5.next = 27;
            return newProm;

          case 27:
            respuesta = _context5.sent;
            _context5.next = 33;
            break;

          case 30:
            _context5.prev = 30;
            _context5.t0 = _context5["catch"](23);

            _logger["default"].error(_context5.t0);

          case 33:
            mapProjects = {};
            counters = {};
            console.log(_enumConstants.PROJECT_TYPES_AND_NAME);
            _iterator = _createForOfIteratorHelper(_enumConstants.PROJECT_TYPES_AND_NAME);

            try {
              for (_iterator.s(); !(_step = _iterator.n()).done;) {
                element = _step.value;
                mapProjects[element.name] = element.id;
                counters[element.id] = 0;
              }
            } catch (err) {
              _iterator.e(err);
            } finally {
              _iterator.f();
            }

            result1['coordinates'] = coordinates;
            result1['polygon'] = polygon;
            _loop = /*#__PURE__*/_regeneratorRuntime().mark(function _loop() {
              var table, condition, sql, URL, promise, key;
              return _regeneratorRuntime().wrap(function _loop$(_context4) {
                while (1) {
                  switch (_context4.prev = _context4.next) {
                    case 0:
                      table = _arr[_i];
                      condition = '';

                      if (user.zoomarea) {
                        condition = "WHERE jurisdiction='".concat(user.zoomarea, "'");
                      }

                      sql = "SELECT COUNT( projecttype), projecttype  FROM ".concat(table, "  ").concat(condition, " group by projecttype");
                      console.log('my zoom area sql is now update', sql);
                      URL = "".concat(_config.CARTO_URL, "&q=").concat(sql);
                      _context4.next = 8;
                      return new Promise(function (resolve) {
                        _https["default"].get(URL, function (response) {
                          console.log('status ' + response.statusCode);

                          if (response.statusCode === 200) {
                            var str = '';
                            response.on('data', function (chunk) {
                              str += chunk;
                            });
                            response.on('end', function () {
                              var result = JSON.parse(str).rows;
                              var counter = {};

                              var _iterator2 = _createForOfIteratorHelper(result),
                                  _step2;

                              try {
                                for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                                  var element = _step2.value;
                                  counter[mapProjects[element.projecttype]] = +element.count;
                                }
                              } catch (err) {
                                _iterator2.e(err);
                              } finally {
                                _iterator2.f();
                              }

                              resolve(counter);
                            });
                          }
                        }).on('error', function (err) {
                          //console.log('failed call to ', url, 'with error ', err);
                          _logger["default"].error("failed call to  with error  ".concat(err));

                          resolve({});
                        });
                      });

                    case 8:
                      promise = _context4.sent;

                      for (key in promise) {
                        counters[key] += promise[key];
                      }

                    case 10:
                    case "end":
                      return _context4.stop();
                  }
                }
              }, _loop);
            });
            _i = 0, _arr = [_config.MAIN_PROJECT_TABLE];

          case 42:
            if (!(_i < _arr.length)) {
              _context5.next = 47;
              break;
            }

            return _context5.delegateYield(_loop(), "t1", 44);

          case 44:
            _i++;
            _context5.next = 42;
            break;

          case 47:
            result1['counters'] = counters;
            res.status(200).send(result1);

          case 49:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee4, null, [[23, 30]]);
  }));

  return function (_x8, _x9) {
    return _ref4.apply(this, arguments);
  };
}());
router.post('/upload-photo', [_auth["default"], multer.array('file')], /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(req, res) {
    var user, result1, polygon, coordinates, organization_query, newProm, respuesta;
    return _regeneratorRuntime().wrap(function _callee5$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.prev = 0;

            if (req.files) {
              _context6.next = 4;
              break;
            }

            _logger["default"].error('You must send user photo');

            return _context6.abrupt("return", res.status(400).send({
              error: 'You must send user photo'
            }));

          case 4:
            user = req.user;
            _context6.next = 7;
            return _userService["default"].uploadPhoto(user, req.files);

          case 7:
            result1 = {};
            polygon = [];
            coordinates = {
              longitude: -104.9063129121965,
              latitude: 39.768682416183
            }; //console.log('USER ME', user);

            result1['_id'] = user._id;
            result1['firstName'] = user.firstName;
            result1['lastName'] = user.lastName;
            result1['name'] = user.name;
            result1['email'] = user.email;
            result1['organization'] = user.organization;
            result1['city'] = user.city;
            result1['county'] = user.county;
            result1['serviceArea'] = user.serviceArea;
            result1['phone'] = user.phone;
            result1['zipCode'] = user.zipCode;
            result1['title'] = user.title;
            result1['activated'] = user.activated;
            result1['designation'] = user.designation;
            result1['photo'] = user.photo;
            result1['zoomarea'] = user.zoomarea ? user.zoomarea : '';
            result1['status'] = user.status;
            organization_query = '';

            if (req.user.zoomarea) {
              organization_query = user.zoomarea;
            } else {
              organization_query = ORGANIZATION_DEFAULT;
            }

            newProm = new Promise(function (resolve, reject) {
              var sql = "SELECT ST_AsGeoJSON(ST_Envelope(the_geom)) FROM mhfd_zoom_to_areas WHERE aoi = '".concat(organization_query, "' ");
              var URL = "".concat(_config.CARTO_URL, "&q=").concat(sql);
              var result = []; //console.log('URL', URL);

              _https["default"].get(URL, function (response) {
                console.log('status ' + response.statusCode);

                if (response.statusCode === 200) {
                  var str = '';
                  response.on('data', function (chunk) {
                    str += chunk;
                  });
                  response.on('end', function () {
                    result = JSON.parse(str).rows;

                    if (result.length > 0) {
                      var all_coordinates = JSON.parse(result[0].st_asgeojson).coordinates;
                      var latitude_array = [];
                      var longitude_array = []; //console.log('COORDENADAS', all_coordinates);

                      for (var key in all_coordinates[0]) {
                        var row = JSON.stringify(all_coordinates[0][key]).replace("[", "").replace("]", "").split(',');
                        var coordinate_num = [];
                        coordinate_num.push(parseFloat(row[0]));
                        coordinate_num.push(parseFloat(row[1]));
                        longitude_array.push(parseFloat(row[0]));
                        latitude_array.push(parseFloat(row[1]));
                        polygon.push(coordinate_num);
                      }

                      var latitude_min = Math.min.apply(Math, latitude_array);
                      var latitude_max = Math.max.apply(Math, latitude_array);
                      var longitude_min = Math.min.apply(Math, longitude_array);
                      var longitude_max = Math.max.apply(Math, longitude_array);
                      coordinates = {
                        longitude: (longitude_max + longitude_min) / 2,
                        latitude: (latitude_max + latitude_min) / 2
                      };
                    } else {
                      coordinates = {
                        longitude: -104.9063129121965,
                        latitude: 39.768682416183
                      }; //console.log('NO HAY DATOS');

                      polygon = [[-105.32366831, 39.40578787], [-105.32366831, 40.13157697], [-104.48895751, 40.13157697], [-104.48895751, 39.40578787], [-105.32366831, 39.40578787]];
                    }

                    resolve({
                      polygon: polygon,
                      coordinates: coordinates
                    });
                  });
                }
              }).on('error', function (err) {
                _logger["default"].error("failed call to  with error  ".concat(err));
              });
            });
            _context6.next = 32;
            return newProm;

          case 32:
            respuesta = _context6.sent;
            //console.log('COORDIANTES', respuesta);
            result1['coordinates'] = respuesta.coordinates;
            result1['polygon'] = respuesta.polygon;
            res.status(200).send(result1);
            _context6.next = 42;
            break;

          case 38:
            _context6.prev = 38;
            _context6.t0 = _context6["catch"](0);

            _logger["default"].error(_context6.t0);

            res.status(500).send(_context6.t0);

          case 42:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee5, null, [[0, 38]]);
  }));

  return function (_x10, _x11) {
    return _ref5.apply(this, arguments);
  };
}());
router.post('/recovery-password', /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6(req, res) {
    var email, user;
    return _regeneratorRuntime().wrap(function _callee6$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            email = req.body.email;

            if (_enumConstants.EMAIL_VALIDATOR.test(email)) {
              _context7.next = 3;
              break;
            }

            return _context7.abrupt("return", res.status(400).send({
              error: 'You entered an invalid email direction'
            }));

          case 3:
            _context7.next = 5;
            return User.findOne({
              where: {
                email: email
              }
            });

          case 5:
            user = _context7.sent;

            if (user) {
              _context7.next = 8;
              break;
            }

            return _context7.abrupt("return", res.status(422).send({
              error: 'Email not found!'
            }));

          case 8:
            _context7.next = 10;
            return user.generateChangePassword();

          case 10:
            _context7.next = 12;
            return _userService["default"].sendRecoverPasswordEmail(user);

          case 12:
            res.send(user);

          case 13:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee6);
  }));

  return function (_x12, _x13) {
    return _ref6.apply(this, arguments);
  };
}());
router.post('/change-password', (0, _utils.validator)(['email', 'password', 'newpassword']), /*#__PURE__*/function () {
  var _ref7 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7(req, res) {
    var _req$body, email, password, newpassword, user, newPwd;

    return _regeneratorRuntime().wrap(function _callee7$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _context8.prev = 0;
            _req$body = req.body, email = _req$body.email, password = _req$body.password, newpassword = _req$body.newpassword;
            _context8.next = 4;
            return User.findByCredentials(email, password);

          case 4:
            user = _context8.sent;

            if (user) {
              _context8.next = 7;
              break;
            }

            return _context8.abrupt("return", res.status(401).send({
              error: 'Login failed! Check authentication credentials'
            }));

          case 7:
            _context8.next = 9;
            return _bcryptjs["default"].hash(newpassword, 8);

          case 9:
            newPwd = _context8.sent;
            user.password = newPwd;
            user.save();
            res.send(use);
            _context8.next = 19;
            break;

          case 15:
            _context8.prev = 15;
            _context8.t0 = _context8["catch"](0);
            console.log(_context8.t0);
            res.status(500).send(_context8.t0);

          case 19:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee7, null, [[0, 15]]);
  }));

  return function (_x14, _x15) {
    return _ref7.apply(this, arguments);
  };
}());
router.post('/reset-password', (0, _utils.validator)(['id', 'password']), /*#__PURE__*/function () {
  var _ref8 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee8(req, res) {
    var chgId, user, now, newPwd;
    return _regeneratorRuntime().wrap(function _callee8$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            _context9.prev = 0;
            chgId = req.body.id;
            _context9.next = 4;
            return User.findOne({
              where: {
                changePasswordId: chgId
              }
            });

          case 4:
            user = _context9.sent;

            if (user) {
              _context9.next = 8;
              break;
            }

            _logger["default"].error('Invalid recovery password id: ' + changePasswordId);

            throw new Error({
              error: 'Invalid recovery password id'
            });

          case 8:
            now = new Date();
            console.log(user.changePasswordExpiration);
            console.log(_typeof(user.changePasswordExpiration));

            if (!(now.getTime() > user.changePasswordExpiration.getTime())) {
              _context9.next = 14;
              break;
            }

            _logger["default"].error('Recovery password id expired: ' + changePasswordId + ', ' + user.changePasswordExpiration);

            throw new Error({
              error: 'Recovery password id expired'
            });

          case 14:
            _context9.next = 16;
            return _bcryptjs["default"].hash(req.body.password, 8);

          case 16:
            newPwd = _context9.sent;
            user.password = newPwd;
            user.changePasswordId = '';
            user.changePasswordExpiration = null;
            user.save();
            res.send(user);
            _context9.next = 28;
            break;

          case 24:
            _context9.prev = 24;
            _context9.t0 = _context9["catch"](0);

            _logger["default"].error(_context9.t0);

            res.status(500).send(_context9.t0);

          case 28:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee8, null, [[0, 24]]);
  }));

  return function (_x16, _x17) {
    return _ref8.apply(this, arguments);
  };
}());
var _default = router;
exports["default"] = _default;