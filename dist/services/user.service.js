"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.uploadPhoto = exports.sendRecoverPasswordEmail = exports.sendConfirmAccount = exports.sendBoardNotification = exports.sendApprovedAccount = exports.requiredFields = exports.findById = exports.findAllUsers = exports.deleteUser = exports["default"] = exports.changePassword = void 0;

var _bcryptjs = _interopRequireDefault(require("bcryptjs"));

var _fs = _interopRequireDefault(require("fs"));

var _nodemailer = _interopRequireDefault(require("nodemailer"));

var _path = _interopRequireDefault(require("path"));

var _url = require("url");

var _db = _interopRequireDefault(require("bc/config/db.js"));

var _config = require("bc/config/config.js");

var _enumConstants = require("bc/lib/enumConstants.js");

var _logger = _interopRequireDefault(require("bc/config/logger.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return generator._invoke = function (innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; }(innerFn, self, context), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; this._invoke = function (method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (object) { var keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var _filename = (0, _url.fileURLToPath)(import.meta.url);

var _dirname = _path["default"].dirname(_filename);

var User = _db["default"].user;
var LogActivity = _db["default"].logActivity;

function getPublicUrl(filename) {
  return "".concat(_config.BASE_SERVER_URL, "/", 'images', "/").concat(filename);
}

var getTransporter = function getTransporter() {
  var transporter = _nodemailer["default"].createTransport({
    host: _config.SMTP_HOST,
    port: _config.SMTP_PORT //secure: true,
    //auth: {
    //  user: MHFD_EMAIL,
    //  pass: MHFD_PASSWORD,
    //}

  });

  return transporter;
};

var findAllUsers = function findAllUsers() {
  var users = User.findAll();
  return users;
};

exports.findAllUsers = findAllUsers;

var getAttachmentsCidList = function getAttachmentsCidList(cids) {
  return cids.map(function (cid) {
    return {
      filename: "".concat(cid, ".png"),
      path: "".concat(_dirname, "/images/").concat(cid, ".png"),
      cid: "".concat(cid)
    };
  });
};

var sendRecoverPasswordEmail = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(user) {
    var email, changePasswordId, redirectUrl, template, emailToSend, options;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            email = user.email;
            changePasswordId = user.changePasswordId;
            redirectUrl = _config.MHFD_FRONTEND + '/confirm-password/?id=' + changePasswordId;
            template = _fs["default"].readFileSync(_dirname + '/templates/email_reset-pass-MHFD.html', 'utf8');
            emailToSend = template.split('{{url}}').join(redirectUrl); // const transporter = getTransporter();

            options = {
              from: _config.MHFD_EMAIL,
              to: email,
              subject: "MHFD Confluence - Reset your password",
              html: emailToSend,
              attachments: getAttachmentsCidList(['logo', 'facebook', 'youtube', 'twitter', 'linkedin'])
            }; // const info = await transporter.sendMail(options);
            // logger.info('Email sent INFO: ' + JSON.stringify(info, null, 2));

          case 6:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function sendRecoverPasswordEmail(_x) {
    return _ref.apply(this, arguments);
  };
}();

exports.sendRecoverPasswordEmail = sendRecoverPasswordEmail;

var sendApprovedAccount = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(user) {
    var email, redirectUrl, template, emailToSend, options;
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            email = user.email;
            redirectUrl = _config.MHFD_FRONTEND;
            template = _fs["default"].readFileSync(_dirname + '/templates/email_approved.html', 'utf8');
            emailToSend = template.split('{{completeName}}').join(user.name).split('{{url}}').join(redirectUrl); // const transporter = getTransporter();

            options = {
              from: _config.MHFD_EMAIL,
              to: email,
              subject: "MHFD Confluence - Account approved",
              html: emailToSend,
              attachments: getAttachmentsCidList(['logo', 'facebook', 'youtube', 'twitter', 'linkedin'])
            }; // const info = await transporter.sendMail(options);
            // logger.info('Email sent INFO: ' + JSON.stringify(info, null, 2));

          case 5:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function sendApprovedAccount(_x2) {
    return _ref2.apply(this, arguments);
  };
}();

exports.sendApprovedAccount = sendApprovedAccount;

var sendConfirmAccount = /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(user) {
    var redirectUrl, completeName, adminTemplate, adminEmailToSend, adminOptions, email, template, emailToSend, options;
    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            redirectUrl = _config.MHFD_FRONTEND; // const transporter = getTransporter();

            completeName = user.firstName + ' ' + user.lastName; // here

            adminTemplate = _fs["default"].readFileSync(_dirname + '/templates/email_admin_new_user.html', 'utf8');
            adminEmailToSend = adminTemplate.split('{{completeName}}').join(completeName).split('{{url}}').join(redirectUrl);

            _logger["default"].info(adminEmailToSend);

            adminOptions = {
              from: _config.MHFD_EMAIL,
              to: 'confluence.support@mhfd.org',
              subject: 'MHFD Confluence - New User Registered!',
              html: adminEmailToSend,
              attachments: getAttachmentsCidList(['logo', 'facebook', 'youtube', 'twitter', 'linkedin', 'map'])
            }; //end here

            email = user.email;
            template = _fs["default"].readFileSync(_dirname + '/templates/email_registered-MHFD.html', 'utf8');
            console.log(redirectUrl, completeName);
            emailToSend = template.split('{{completeName}}').join(user.name).split('{{url}}').join(redirectUrl);
            options = {
              from: _config.MHFD_EMAIL,
              to: email,
              subject: "Welcome to MHFD Confluence!",
              html: emailToSend,
              attachments: getAttachmentsCidList(['logo', 'facebook', 'youtube', 'twitter', 'linkedin', 'map'])
            }; // const adminInfo = await transporter.sendMail(adminOptions);
            // logger.info(`Email sent to ADMIN: ${JSON.stringify(adminInfo, null, 2)}`);
            // const info = await transporter.sendMail(options); 
            // logger.info('Email sent INFO: ' + JSON.stringify(info, null, 2));

          case 11:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function sendConfirmAccount(_x3) {
    return _ref3.apply(this, arguments);
  };
}();

exports.sendConfirmAccount = sendConfirmAccount;

var sendBoardNotification = /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(email, type, locality, year, fullName) {
    var bodyOptions, url, template, content, transporter, options, info;
    return _regeneratorRuntime().wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            if (type === 'WORK_REQUEST') {
              url = "".concat(_config.MHFD_FRONTEND, "/work-request?year=").concat(year, "&locality=").concat(locality);
              bodyOptions = {
                title: "".concat(locality, "'s Work Request has been submitted!"),
                body: "".concat(fullName, " has submitted all requested projects from the jurisdiction of ").concat(locality, ". All projects are viewable in the applicable County and Service Area Work Plans in Confluence and are now ready for MHFD review."),
                url: url,
                buttonName: 'View Work Request'
              };
            } else {
              url = "".concat(_config.MHFD_FRONTEND, "/work-plan?year=").concat(year, "&locality=").concat(locality);
              bodyOptions = {
                title: "".concat(locality, "'s Work Plan has been approved!"),
                body: "\n      The ".concat(locality, " Manager has reviewed and approved the ").concat(locality, " Work Plan and is ready for final management review and approval by the Board. A final notification will be provided when the MHFD Board has approved the Work Plan.\n      "),
                url: url,
                buttonName: 'View Work Plan'
              };
            }

            template = _fs["default"].readFileSync(_dirname + '/templates/email_board-notification.html', 'utf8');
            content = template;
            Object.keys(bodyOptions).forEach(function (key) {
              content = content.split("{{".concat(key, "}}")).join(bodyOptions[key]);
            });
            transporter = getTransporter();
            options = {
              from: _config.MHFD_EMAIL,
              to: email,
              subject: "MHFD Confluence - ".concat(bodyOptions.title),
              html: content,
              attachments: getAttachmentsCidList(['logo', 'facebook', 'youtube', 'twitter', 'linkedin', 'map'])
            };
            _context4.next = 8;
            return transporter.sendMail(options);

          case 8:
            info = _context4.sent;

            _logger["default"].info('Email sent INFO: ' + JSON.stringify(info, null, 2));

          case 10:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function sendBoardNotification(_x4, _x5, _x6, _x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}();

exports.sendBoardNotification = sendBoardNotification;

function getDestFile(filename) {
  var root = _path["default"].join(_dirname, "../public/images");

  return _path["default"].join(root, "/".concat(filename));
}

var uploadPhoto = /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(user, files) {
    var newPromise;
    return _regeneratorRuntime().wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            newPromise = new Promise(function (resolve, reject) {
              files.forEach(function (file) {
                var name = Date.now() + file.originalname;
                user.photo = getPublicUrl(name);
                user.save();

                try {
                  _fs["default"].writeFileSync(getDestFile(name), file.buffer);

                  resolve(user.photo);
                } catch (e) {
                  console.log(e);
                  reject(e);
                }
              });
            });
            _context5.next = 3;
            return newPromise;

          case 3:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));

  return function uploadPhoto(_x9, _x10) {
    return _ref5.apply(this, arguments);
  };
}();

exports.uploadPhoto = uploadPhoto;

var findById = /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6(userId) {
    return _regeneratorRuntime().wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            _context6.next = 2;
            return User.find({
              _id: userId
            });

          case 2:
            return _context6.abrupt("return", _context6.sent);

          case 3:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));

  return function findById(_x11) {
    return _ref6.apply(this, arguments);
  };
}();

exports.findById = findById;

var deleteUser = /*#__PURE__*/function () {
  var _ref7 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7(userId) {
    return _regeneratorRuntime().wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            LogActivity.destroy({
              where: {
                user_id: userId
              }
            });
            User.destroy({
              where: {
                _id: userId
              }
            });

          case 2:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7);
  }));

  return function deleteUser(_x12) {
    return _ref7.apply(this, arguments);
  };
}();

exports.deleteUser = deleteUser;

var changePassword = /*#__PURE__*/function () {
  var _ref8 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee8(changePasswordId, password) {
    var user, now, user1, newPwd;
    return _regeneratorRuntime().wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            _context8.next = 2;
            return User.findOne({
              changePasswordId: changePasswordId
            });

          case 2:
            user = _context8.sent;

            if (user) {
              _context8.next = 6;
              break;
            }

            _logger["default"].error('Invalid recovery password id: ' + changePasswordId);

            throw new Error({
              error: 'Invalid recovery password id'
            });

          case 6:
            now = new Date();
            _context8.next = 9;
            return User.findByPk(user._id, {
              raw: true
            });

          case 9:
            user1 = _context8.sent;
            _context8.next = 12;
            return _bcryptjs["default"].hash(password, 8);

          case 12:
            newPwd = _context8.sent;
            user1.password = newPwd;
            user1.changePasswordId = '';
            user1.changePasswordExpiration = null;
            _context8.next = 18;
            return User.update(user1, {
              where: {
                _id: user._id
              }
            }).then(function () {
              console.log('guardando');
            })["catch"](function (err1) {
              console.log(err1);
            });

          case 18:
            return _context8.abrupt("return", user1);

          case 19:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8);
  }));

  return function changePassword(_x13, _x14) {
    return _ref8.apply(this, arguments);
  };
}();

exports.changePassword = changePassword;

var requiredFields = function requiredFields(type) {
  var FIRST_NAME = _enumConstants.FIELDS.FIRST_NAME,
      LAST_NAME = _enumConstants.FIELDS.LAST_NAME,
      DESIGNATION = _enumConstants.FIELDS.DESIGNATION,
      EMAIL = _enumConstants.FIELDS.EMAIL,
      ORGANIZATION = _enumConstants.FIELDS.ORGANIZATION,
      PASSWORD = _enumConstants.FIELDS.PASSWORD,
      CITY = _enumConstants.FIELDS.CITY,
      COUNTY = _enumConstants.FIELDS.COUNTY,
      SERVICE_AREA = _enumConstants.FIELDS.SERVICE_AREA,
      PHONE = _enumConstants.FIELDS.PHONE,
      TITLE = _enumConstants.FIELDS.TITLE,
      ZOOM_AREA = _enumConstants.FIELDS.ZOOM_AREA;

  if (type === 'signup') {
    return [FIRST_NAME, LAST_NAME, DESIGNATION, EMAIL, ORGANIZATION, PASSWORD];
  }

  if (type === 'edit') {
    return [FIRST_NAME, LAST_NAME, EMAIL, CITY, COUNTY, SERVICE_AREA, PHONE, TITLE, ORGANIZATION, DESIGNATION, ZOOM_AREA];
  }
};

exports.requiredFields = requiredFields;
var _default = {
  sendBoardNotification: sendBoardNotification,
  sendRecoverPasswordEmail: sendRecoverPasswordEmail,
  changePassword: changePassword,
  requiredFields: requiredFields,
  uploadPhoto: uploadPhoto,
  findById: findById,
  sendConfirmAccount: sendConfirmAccount,
  findAllUsers: findAllUsers,
  sendApprovedAccount: sendApprovedAccount,
  deleteUser: deleteUser
};
exports["default"] = _default;