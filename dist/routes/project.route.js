"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _https = _interopRequireDefault(require("https"));

var _db = _interopRequireDefault(require("bc/config/db.js"));

var _logger = _interopRequireDefault(require("bc/config/logger.js"));

var _config = require("bc/config/config.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return generator._invoke = function (innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; }(innerFn, self, context), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; this._invoke = function (method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (object) { var keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var Projects = _db["default"].project;
var ProjectPartner = _db["default"].projectPartner;
var ProjectCounty = _db["default"].projectCounty;
var CodeStateCounty = _db["default"].codeStateCounty;
var ProjectServiceArea = _db["default"].projectServiceArea;
var CodeServiceArea = _db["default"].codeServiceArea;
var ProjectLocalGovernment = _db["default"].projectLocalGovernment;
var CodeLocalGoverment = _db["default"].codeLocalGoverment;
var ProjectCost = _db["default"].projectCost;
var ProjectStaff = _db["default"].projectStaff;
var MHFDStaff = _db["default"].mhfdStaff;
var ProjectDetail = _db["default"].projectDetail;

var router = _express["default"].Router();

function getProblemByProjectId(_x, _x2, _x3) {
  return _getProblemByProjectId.apply(this, arguments);
}

function _getProblemByProjectId() {
  _getProblemByProjectId = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(projectid, sortby, sorttype) {
    var data, LINE_SQL, LINE_URL, newProm1;
    return _regeneratorRuntime().wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            data = [];
            LINE_SQL = "select ".concat(_config.PROPSPROBLEMTABLES.problem_boundary[5], " as ").concat(_config.PROPSPROBLEMTABLES.problems[5], ", ").concat(_config.PROPSPROBLEMTABLES.problem_boundary[6], " as ").concat(_config.PROPSPROBLEMTABLES.problems[6], ", ").concat(_config.PROPSPROBLEMTABLES.problem_boundary[7], "  as ").concat(_config.PROPSPROBLEMTABLES.problems[7], " from ").concat(_config.PROBLEM_TABLE, "  \n where ").concat(_config.PROPSPROBLEMTABLES.problem_boundary[5], " in (SELECT problemid FROM grade_control_structure \n   where projectid=").concat(projectid, " and projectid>0  union ") + "SELECT problemid FROM pipe_appurtenances \n   where projectid=".concat(projectid, " and projectid>0  union ") + "SELECT problemid FROM special_item_point \n   where projectid=".concat(projectid, " and projectid>0  union ") + "SELECT problemid FROM special_item_linear \n   where projectid=".concat(projectid, " and projectid>0  union ") + "SELECT problemid FROM special_item_area \n   where projectid=".concat(projectid, " and projectid>0  union ") + "SELECT problemid FROM channel_improvements_linear \n   where projectid=".concat(projectid, " and projectid>0  union ") + "SELECT problemid FROM channel_improvements_area \n   where projectid=".concat(projectid, " and projectid>0  union ") + "SELECT problemid FROM removal_line \n   where projectid=".concat(projectid, " and projectid>0  union ") + "SELECT problemid FROM removal_area \n   where projectid=".concat(projectid, " and projectid>0  union ") + "SELECT problemid FROM storm_drain \n   where projectid=".concat(projectid, " and projectid>0  union ") + "SELECT problemid FROM detention_facilities \n   where projectid=".concat(projectid, " and projectid>0  union ") + "SELECT problemid FROM maintenance_trails \n   where projectid=".concat(projectid, " and projectid>0  union ") + "SELECT problemid FROM land_acquisition \n   where projectid=".concat(projectid, " and projectid>0  union ") + "SELECT problemid FROM landscaping_area \n   where projectid=".concat(projectid, " and projectid>0) \n   order by ").concat(sortby, " ").concat(sorttype);
            LINE_URL = encodeURI("".concat(_config.CARTO_URL, "&q=").concat(LINE_SQL)); //console.log(LINE_URL);

            _context4.prev = 3;
            newProm1 = new Promise(function (resolve, reject) {
              _https["default"].get(LINE_URL, function (response) {
                if (response.statusCode === 200) {
                  var str = '';
                  response.on('data', function (chunk) {
                    str += chunk;
                  });
                  response.on('end', /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3() {
                    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
                      while (1) {
                        switch (_context3.prev = _context3.next) {
                          case 0:
                            resolve(JSON.parse(str).rows);

                          case 1:
                          case "end":
                            return _context3.stop();
                        }
                      }
                    }, _callee3);
                  })));
                }
              });
            });
            _context4.next = 7;
            return newProm1;

          case 7:
            data = _context4.sent;
            console.log('the data is ', data);
            return _context4.abrupt("return", data);

          case 12:
            _context4.prev = 12;
            _context4.t0 = _context4["catch"](3);
            console.error('Error with QUERY ', _context4.t0);
            return _context4.abrupt("return", []);

          case 16:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, null, [[3, 12]]);
  }));
  return _getProblemByProjectId.apply(this, arguments);
}

var listProjects = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(req, res) {
    var _req$query, _req$query$offset, offset, _req$query$limit, limit, projects, SPONSOR_TYPE, ids, project_partners;

    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _req$query = req.query, _req$query$offset = _req$query.offset, offset = _req$query$offset === void 0 ? 0 : _req$query$offset, _req$query$limit = _req$query.limit, limit = _req$query$limit === void 0 ? 120000 : _req$query$limit;
            _context.next = 3;
            return Projects.findAll({
              limit: limit,
              offset: offset,
              include: {
                all: true,
                nested: true
              }
            }).map(function (result) {
              return result.dataValues;
            });

          case 3:
            projects = _context.sent;
            SPONSOR_TYPE = 11; // maybe this can change in the future

            ids = projects.map(function (p) {
              return p.project_id;
            });
            _context.next = 8;
            return ProjectPartner.findAll({
              where: {
                project_id: ids,
                code_partner_type_id: SPONSOR_TYPE
              },
              include: {
                all: true,
                nested: true
              }
            }).map(function (result) {
              return result.dataValues;
            }).map(function (res) {
              return _objectSpread(_objectSpread({}, res), {}, {
                business_associate: res.business_associate.dataValues
              });
            });

          case 8:
            project_partners = _context.sent;
            projects = projects.map(function (project) {
              var partners = project_partners.filter(function (partner) {
                return partner.project_id === project.project_id;
              });
              var sponsor = null;

              if (partners.length) {
                sponsor = partners[0].business_associate.business_associate_name;
              }

              console.log(_objectSpread(_objectSpread({}, project), {}, {
                sponsor: sponsor
              }));
              return _objectSpread(_objectSpread({}, project), {}, {
                sponsor: sponsor
              });
            }); // xconsole.log(project_partners);

            _logger["default"].info('projects being called');

            res.send(projects);

          case 12:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function listProjects(_x4, _x5) {
    return _ref.apply(this, arguments);
  };
}();

var getProjectDetail = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(req, res) {
    var project_id, project, projectCounty, codeStateCounty, projectServiceArea, codeServiceArea, projectLocalGovernment, codeLocalGoverment, projectCost, ESTIMATED_COST, COMPONENT_COST, estimatedCost, componentCost, sumCost, STAFF_LEAD, WATERSHED_MANAGER, CONSTRUCTION_MANAGER, projectStaff, managers, staffs, CONSULTANT, CIVIL_CONTRACTOR, LANDSCAPE_CONTRACTOR, consultants, contractors, SPONSOR_TYPE, project_partners, project_detail, problems;
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            console.log(req.params);
            project_id = req.params['project_id'];
            _context2.next = 4;
            return Projects.findByPk(project_id, {
              include: {
                all: true,
                nested: true
              }
            });

          case 4:
            project = _context2.sent;

            if (project) {
              _context2.next = 8;
              break;
            }

            res.status(404).send('Not found');
            return _context2.abrupt("return");

          case 8:
            project = project.dataValues; //  project = project.map(result => result.dataValues)
            // console.log(project);
            // Get County

            _context2.next = 11;
            return ProjectCounty.findOne({
              where: {
                project_id: project.project_id
              }
            });

          case 11:
            projectCounty = _context2.sent;

            if (!projectCounty) {
              _context2.next = 20;
              break;
            }

            projectCounty = projectCounty.dataValues;
            _context2.next = 16;
            return CodeStateCounty.findOne({
              where: {
                state_county_id: projectCounty.state_county_id
              }
            });

          case 16:
            codeStateCounty = _context2.sent;
            codeStateCounty = codeStateCounty.dataValues;

            _logger["default"].info("Adding Code State County: ".concat(JSON.stringify(codeStateCounty), " to project object"));

            project = _objectSpread(_objectSpread({}, project), {}, {
              codeStateCounty: codeStateCounty
            });

          case 20:
            _context2.next = 22;
            return ProjectServiceArea.findOne({
              where: {
                project_id: project.project_id
              }
            });

          case 22:
            projectServiceArea = _context2.sent;

            if (!projectServiceArea) {
              _context2.next = 31;
              break;
            }

            projectServiceArea = projectServiceArea.dataValues;
            _context2.next = 27;
            return CodeServiceArea.findOne({
              where: {
                code_service_area_id: projectServiceArea.code_service_area_id
              }
            });

          case 27:
            codeServiceArea = _context2.sent;
            codeServiceArea = codeServiceArea.dataValues;

            _logger["default"].info("Adding code service area: ".concat(JSON.stringify(codeServiceArea), " to project object"));

            project = _objectSpread(_objectSpread({}, project), {}, {
              codeServiceArea: codeServiceArea
            });

          case 31:
            _context2.next = 33;
            return ProjectLocalGovernment.findOne({
              where: {
                project_id: project.project_id
              }
            });

          case 33:
            projectLocalGovernment = _context2.sent;

            if (!projectLocalGovernment) {
              _context2.next = 42;
              break;
            }

            projectLocalGovernment = projectLocalGovernment.dataValues;
            _context2.next = 38;
            return CodeLocalGoverment.findOne({
              where: {
                code_local_government_id: projectLocalGovernment.code_local_government_id
              }
            });

          case 38:
            codeLocalGoverment = _context2.sent;
            codeLocalGoverment = codeLocalGoverment.dataValues;

            _logger["default"].info("Adding code local government: ".concat(JSON.stringify(codeLocalGoverment), " to project object"));

            project = _objectSpread(_objectSpread({}, project), {}, {
              codeLocalGoverment: codeLocalGoverment
            });

          case 42:
            _context2.next = 44;
            return ProjectCost.findAll({
              where: {
                project_id: project.project_id
              }
            });

          case 44:
            projectCost = _context2.sent;
            projectCost = projectCost.map(function (result) {
              return result.dataValues;
            });
            ESTIMATED_COST = 1, COMPONENT_COST = 14;
            estimatedCost = projectCost.filter(function (result) {
              return result.code_cost_type_id === ESTIMATED_COST;
            });
            componentCost = projectCost.filter(function (result) {
              return result.code_cost_type_id === COMPONENT_COST;
            });

            _logger["default"].info("projects costs: ".concat(JSON.stringify(projectCost, null, 2)));

            sumCost = projectCost.reduce(function (pc, current) {
              return pc + current.cost;
            }, 0);
            project = _objectSpread(_objectSpread({}, project), {}, {
              sumCost: sumCost,
              estimatedCost: estimatedCost,
              componentCost: componentCost
            }); // GET mananger
            // Maybe need to get the data from code_project_staff_role_type table in the future 

            STAFF_LEAD = 1, WATERSHED_MANAGER = 2, CONSTRUCTION_MANAGER = 3;
            _context2.next = 55;
            return ProjectStaff.findAll({
              where: {
                project_id: project.project_id,
                code_project_staff_role_type_id: [STAFF_LEAD, WATERSHED_MANAGER, CONSTRUCTION_MANAGER]
              }
            }).map(function (result) {
              return result.dataValues;
            });

          case 55:
            projectStaff = _context2.sent;
            managers = projectStaff.map(function (result) {
              return result.mhfd_staff_id;
            });

            _logger["default"].info("manager list ".concat(managers));

            _context2.next = 60;
            return MHFDStaff.findAll({
              where: {
                mhfd_staff_id: managers
              }
            }).map(function (result) {
              return result.dataValues;
            });

          case 60:
            staffs = _context2.sent;

            if (staffs) {
              _logger["default"].info("Adding managers to project: ".concat(JSON.stringify(staffs, null, 2)));

              project = _objectSpread(_objectSpread({}, project), {}, {
                managers: staffs
              });
            } // vendor calculation


            CONSULTANT = 3, CIVIL_CONTRACTOR = 8, LANDSCAPE_CONTRACTOR = 9;
            _context2.next = 65;
            return ProjectPartner.findAll({
              where: {
                project_id: project.project_id,
                code_partner_type_id: CONSULTANT
              },
              include: {
                all: true,
                nested: true
              }
            }).map(function (result) {
              return result.dataValues;
            }).map(function (res) {
              return _objectSpread(_objectSpread({}, res), {}, {
                business_associate: res.business_associate.dataValues
              });
            });

          case 65:
            consultants = _context2.sent;

            _logger["default"].info("Adding consultants to project: ".concat(consultants));

            project = _objectSpread(_objectSpread({}, project), {}, {
              consultants: consultants
            });
            _context2.next = 70;
            return ProjectPartner.findAll({
              where: {
                project_id: project.project_id,
                code_partner_type_id: [CIVIL_CONTRACTOR, LANDSCAPE_CONTRACTOR]
              },
              include: {
                all: true,
                nested: true
              }
            }).map(function (result) {
              return result.dataValues;
            }).map(function (res) {
              return _objectSpread(_objectSpread({}, res), {}, {
                business_associate: res.business_associate.dataValues
              });
            });

          case 70:
            contractors = _context2.sent;

            _logger["default"].info("Adding contractors to project: ".concat(contractors));

            project = _objectSpread(_objectSpread({}, project), {}, {
              contractors: contractors
            }); // ADDING SPONSOR:

            SPONSOR_TYPE = 11; // maybe this can change in the future

            _context2.next = 76;
            return ProjectPartner.findAll({
              where: {
                project_id: project.project_id,
                code_partner_type_id: SPONSOR_TYPE
              },
              include: {
                all: true,
                nested: true
              }
            }).map(function (result) {
              return result.dataValues;
            }).map(function (res) {
              return _objectSpread(_objectSpread({}, res), {}, {
                business_associate: res.business_associate.dataValues
              });
            });

          case 76:
            project_partners = _context2.sent;
            project = _objectSpread(_objectSpread({}, project), {}, {
              sponsor: project_partners
            }); // frequency, for maintenance projects

            _context2.next = 80;
            return ProjectDetail.findAll({
              where: {
                project_id: project.project_id
              }
            });

          case 80:
            project_detail = _context2.sent;
            project = _objectSpread(_objectSpread({}, project), {}, {
              projectDetail: project_detail
            }); // get problems 

            _context2.next = 84;
            return getProblemByProjectId(project.project_id, _config.PROPSPROBLEMTABLES.problems[6], 'asc');

          case 84:
            problems = _context2.sent;

            _logger["default"].info("Adding problems ".concat(JSON.stringify(problems)));

            project = _objectSpread(_objectSpread({}, project), {}, {
              problems: problems
            });
            res.send(project);

          case 88:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function getProjectDetail(_x6, _x7) {
    return _ref2.apply(this, arguments);
  };
}();
router.post('/', listProjects);
router.get('/:project_id', getProjectDetail);
var _default = router;
exports["default"] = _default;