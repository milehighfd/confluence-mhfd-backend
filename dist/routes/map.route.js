"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _https = _interopRequireDefault(require("https"));

var _needle = _interopRequireDefault(require("needle"));

var _logger = _interopRequireDefault(require("bc/config/logger.js"));

var _config = require("bc/config/config.js");

var _db = _interopRequireDefault(require("bc/config/db.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return generator._invoke = function (innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; }(innerFn, self, context), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; this._invoke = function (method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (object) { var keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var router = _express["default"].Router();

var ComponentDependency = _db["default"].componentdependency;
router.post('/', /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(req, res) {
    var table, sql, mapConfig, URL;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            table = req.body.table;
            sql = "SELECT * FROM ".concat(table);

            if (table.includes('mep_outfalls') || table.includes('mep_channels')) {
              sql = "SELECT cartodb_id, the_geom, the_geom_webmercator, projectname, mep_eligibilitystatus, projectno, mhfd_servicearea, mep_date_designapproval::text,mep_date_constructionapproval::text,mep_date_finalacceptance::text,mep_date_ineligible::text FROM ".concat(table);
            } else if (table.includes('mep_projects_temp_locations')) {
              sql = "SELECT cartodb_id, the_geom, the_geom_webmercator FROM ".concat(table);
            } else if (table.includes('mep')) {
              sql = "SELECT cartodb_id, the_geom, the_geom_webmercator, projectname, mep_eligibilitystatus, projectno, mhfd_servicearea, mep_date_designapproval::text,mep_date_constructionapproval::text,mep_date_finalacceptance::text,mep_date_ineligible::text, pondname FROM ".concat(table);
            }

            if (table === 'bcz_prebles_meadow_jumping_mouse' || table === 'bcz_ute_ladies_tresses_orchid') {
              sql = "SELECT the_geom, the_geom_webmercator, expiration_date::text, website, letter, map FROM ".concat(table);
            }

            if (table.includes('active_lomcs')) {
              sql = "SELECT cartodb_id, the_geom, the_geom_webmercator, objectid, globalid, shape_area, shape_length, creationdate::text, creator , editdate::text, editor, lomc_case, lomc_type, lomc_identifier, status_date::text, status, notes, effective_date::text FROM ".concat(table);
            }

            _logger["default"].info(sql);

            mapConfig = {
              "version": '1.3.1',
              "buffersize": {
                mvt: 8
              },
              "layers": [{
                "id": "pluto15v1",
                "type": 'mapnik',
                "options": {
                  "sql": sql,
                  "vector_extent": 4096,
                  "bufferSize": 8,
                  "version": '1.3.1'
                }
              }]
            };
            mapConfig = encodeURIComponent(JSON.stringify(mapConfig));
            URL = "".concat(_config.CARTO_URL_MAP, "&config=").concat(mapConfig);

            _logger["default"].info(URL);

            _https["default"].get(URL, function (response) {
              if (response.statusCode == 200) {
                var str = '';
                response.on('data', function (chunk) {
                  str += chunk;
                });
                response.on('end', function () {
                  var tiles = JSON.parse(str).metadata.tilejson.vector.tiles;
                  return res.send(tiles);
                });
              } else {
                return res.status(response.statusCode).send({
                  error: 'error'
                });
              }
            }).on('error', function (err) {
              //console.log('failed call to ', URL, 'with error ', err);
              _logger["default"].error("failed call to ".concat(URL, "  with error  ").concat(err));

              res.status(500).send(err);
            });

          case 11:
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

function getGeojsonCentroids(_x3, _x4) {
  return _getGeojsonCentroids.apply(this, arguments);
}

function _getGeojsonCentroids() {
  _getGeojsonCentroids = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6(bounds, body) {
    var sql, query, lineData, geojson;
    return _regeneratorRuntime().wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            sql = "SELECT\n            ST_X(ST_Centroid(the_geom)) as lon,\n            ST_Y(ST_Centroid(the_geom)) as lat,\n            cartodb_id,\n            objectid,\n            problem_id,\n            problem_name,\n            problem_type,\n            problem_description,\n            problem_severity,\n            problem_score,\n            mhfd_scale,\n            estimated_cost,\n            component_cost,\n            component_status,\n            globalid,\n            created_user,\n            created_date,\n            last_edited_user,\n            last_edited_date,\n            mhfd_manager,\n            service_area,\n            county,\n            local_government,\n            special_district,\n            stream_name,\n            mhfd_code,\n            validationstatus,\n            study_id,\n            source_type,\n            source_name,\n            source_complete_year,\n            component_count,\n            shape_starea,\n            shape_stlength\n            from problem_boundary";
            query = {
              q: " ".concat(sql, " ")
            };
            _context6.prev = 2;
            _context6.next = 5;
            return (0, _needle["default"])('post', _config.CARTO_URL, query, {
              json: true
            });

          case 5:
            lineData = _context6.sent;
            geojson = {
              type: "FeatureCollection",
              features: lineData.body.rows.map(function (row) {
                return {
                  type: "Feature",
                  properties: {
                    "cartodb_id": row.cartodb_id,
                    "objectid": row.objectid,
                    "problem_id": row.problem_id,
                    "problem_name": row.problem_name,
                    "problem_type": row.problem_type,
                    "problem_description": row.problem_description,
                    "problem_severity": row.problem_severity,
                    "problem_score": row.problem_score,
                    "mhfd_scale": row.mhfd_scale,
                    "estimated_cost": row.estimated_cost,
                    "component_cost": row.component_cost,
                    "component_status": row.component_status,
                    "globalid": row.globalid,
                    "created_user": row.created_user,
                    "created_date": row.created_date,
                    "last_edited_user": row.last_edited_user,
                    "last_edited_date": row.last_edited_date,
                    "mhfd_manager": row.mhfd_manager,
                    "service_area": row.service_area,
                    "county": row.county,
                    "local_government": row.local_government,
                    "special_district": row.special_district,
                    "stream_name": row.stream_name,
                    "mhfd_code": row.mhfd_code,
                    "validationstatus": row.validationstatus,
                    "study_id": row.study_id,
                    "source_type": row.source_type,
                    "source_name": row.source_name,
                    "source_complete_year": row.source_complete_year,
                    "component_count": row.component_count,
                    "shape_starea": row.shape_starea,
                    "shape_stlength": row.shape_stlength
                  },
                  "geometry": {
                    "type": "Point",
                    "coordinates": [row.lon, row.lat, 0.0]
                  }
                };
              })
            };
            return _context6.abrupt("return", geojson);

          case 10:
            _context6.prev = 10;
            _context6.t0 = _context6["catch"](2);

            _logger["default"].error("Count total projects error ->", _context6.t0);

          case 13:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, null, [[2, 10]]);
  }));
  return _getGeojsonCentroids.apply(this, arguments);
}

function getProbCentroids(_x5, _x6) {
  return _getProbCentroids.apply(this, arguments);
}

function _getProbCentroids() {
  _getProbCentroids = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7(req, res) {
    var bounds, body, geom;
    return _regeneratorRuntime().wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _context7.prev = 0;
            bounds = req.query.bounds;
            body = req.body;
            _context7.next = 5;
            return getGeojsonCentroids(bounds, body);

          case 5:
            geom = _context7.sent;
            res.status(200).send({
              geom: geom
            });
            _context7.next = 13;
            break;

          case 9:
            _context7.prev = 9;
            _context7.t0 = _context7["catch"](0);

            _logger["default"].error(_context7.t0);

            _logger["default"].error("countTotalProjects Connection error");

          case 13:
          case "end":
            return _context7.stop();
        }
      }
    }, _callee7, null, [[0, 9]]);
  }));
  return _getProbCentroids.apply(this, arguments);
}

router.get('/probs', getProbCentroids);
router.get('/search/:query', /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(req, res) {
    var query, to_url, map, promises, sql, URL, all, answer, _iterator, _step, data, weight;

    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            query = req.params.query;
            to_url = encodeURIComponent(query);
            map = "https://api.mapbox.com/geocoding/v5/mapbox.places/".concat(to_url, ".json?bbox=-105.39820822776036,39.38595107828999,-104.46244596259402,40.16671105031628&access_token=pk.eyJ1IjoibWlsZWhpZ2hmZCIsImEiOiJjazRqZjg1YWQwZTN2M2RudmhuNXZtdWFyIn0.oU_jVFAr808WPbcVOFnzbg");
            promises = [];
            promises.push(new Promise(function (resolve, reject) {
              console.log(map);

              _https["default"].get(map, function (response) {
                if (response.statusCode == 200) {
                  var str = '';
                  response.on('data', function (chunk) {
                    str += chunk;
                  });
                  response.on('end', function () {
                    var places = JSON.parse(str).features;
                    var filteredPlaces = places.map(function (ele) {
                      return {
                        text: ele.text,
                        place_name: ele.place_name,
                        center: ele.center,
                        type: 'geocoder'
                      };
                    });
                    resolve(filteredPlaces);
                  });
                } else {
                  resolve([]);
                }
              }).on('error', function (err) {
                resolve([]);
              });
            }));
            sql = "SELECT ST_x(ST_LineInterpolatePoint(st_makeline(st_linemerge(the_geom)), 0.5)) as x, ST_y(ST_LineInterpolatePoint(st_makeline(st_linemerge(the_geom)), 0.5)) as y, str_name FROM streams WHERE  str_name ILIKE '".concat(query, "%' AND ST_IsEmpty(the_geom) = false group by str_name");
            console.log('el query ', sql);
            sql = encodeURIComponent(sql);
            URL = "".concat(_config.CARTO_URL, "&q=").concat(sql);
            promises.push(new Promise(function (resolve, reject) {
              _https["default"].get(URL, function (response) {
                if (response.statusCode == 200) {
                  var str = '';
                  response.on('data', function (chunk) {
                    str += chunk;
                  });
                  response.on('end', function () {
                    console.log(JSON.parse(str));
                    var places = JSON.parse(str).rows;
                    var filteredPlaces = places.map(function (ele) {
                      return {
                        text: ele.str_name,
                        place_name: 'Stream',
                        center: [ele.x, ele.y],
                        type: 'stream'
                      };
                    });
                    resolve(filteredPlaces);
                  });
                } else {
                  console.log('status ', response.statusCode, URL);
                  resolve([]);
                }
              }).on('error', function (err) {
                console.log('failed call to ', URL, 'with error ', err);
                resolve([]);
              });
            }));
            _context2.next = 12;
            return Promise.all(promises);

          case 12:
            all = _context2.sent;
            answer = [];
            _iterator = _createForOfIteratorHelper(all);

            try {
              for (_iterator.s(); !(_step = _iterator.n()).done;) {
                data = _step.value;
                answer.push.apply(answer, _toConsumableArray(data));
              }
            } catch (err) {
              _iterator.e(err);
            } finally {
              _iterator.f();
            }

            weight = {
              'stream': 0,
              'geocoder': 1
            };
            answer.sort(function (a, b) {
              if (a.type !== b.type) {
                return weight[a.type] - weight[b.type];
              }

              return a.text.toLowerCase().localeCompare(b.text.toLowerCase());
            });
            res.send(answer);

          case 19:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function (_x7, _x8) {
    return _ref2.apply(this, arguments);
  };
}());
var components = [{
  key: 'grade_control_structure',
  value: 'Grade Control Structure'
}, {
  key: 'pipe_appurtenances',
  value: 'Pipe Appurtenances'
}, {
  key: 'special_item_point',
  value: 'Special Item Point'
}, {
  key: 'special_item_linear',
  value: 'Special Item Linear'
}, {
  key: 'special_item_area',
  value: 'Special Item Area'
}, {
  key: 'channel_improvements_linear',
  value: 'Channel Improvements Linear'
}, {
  key: 'channel_improvements_area',
  value: 'Channel Improvements Area'
}, {
  key: 'removal_line',
  value: 'Removal Line'
}, {
  key: 'removal_area',
  value: 'Removal Area'
}, {
  key: 'storm_drain',
  value: 'Storm Drain'
}, {
  key: 'detention_facilities',
  value: 'Detention Facilities'
}, {
  key: 'maintenance_trails',
  value: 'Maintenance Trails'
}, {
  key: 'land_acquisition',
  value: 'Land Acquisition'
}, {
  key: 'landscaping_area',
  value: 'Landscaping Area'
}];
router.get('/get-aoi-from-center', /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(req, res) {
    var coord, sql, URL;
    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            coord = req.query.coord || '0,0';
            sql = "SELECT cartodb_id, aoi, filter, ST_AsGeoJSON(the_geom) FROM mhfd_zoom_to_areas where ST_CONTAINS(the_geom, ST_SetSRID(ST_MakePoint(".concat(coord, "), 4326))");
            URL = "".concat(_config.CARTO_URL, "&q=").concat(sql);

            try {
              _https["default"].get(URL, function (response) {
                if (response.statusCode == 200) {
                  var str = '';
                  response.on('data', function (chunk) {
                    str += chunk;
                  });
                  response.on('end', function () {
                    var rows = JSON.parse(str).rows;
                    console.log(rows);
                    res.send({
                      data: rows
                    });
                  });
                } else {
                  console.log('status ', response.statusCode, URL);
                  res.send({
                    data: []
                  });
                }
              }).on('error', function (err) {
                console.log('failed call to ', URL, 'with error ', err);
                res.send({
                  data: []
                });
              });
            } catch (error) {
              res.send({
                error: error
              });
            }

          case 4:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function (_x9, _x10) {
    return _ref3.apply(this, arguments);
  };
}());
router.get('/bbox-components', /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(req, res) {
    var id, table, field, promises, extraQueries, comps, _iterator2, _step2, _loop, _iterator3, _step3, _loop2, all, query, datap, centroids, bboxes, _iterator4, _step4, data, minLat, minLng, maxLat, maxLng, _i, _bboxes, bbox, coords, selfCentroid, queryProjectLine, dataProjectLine, r, geojson, projectCenter, len, mid, polygon;

    return _regeneratorRuntime().wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _logger["default"].info('BBOX components executing');

            id = req.query.id;
            table = req.query.table;
            field = 'projectid';
            promises = [];
            extraQueries = [];

            if (!(table === _config.PROBLEM_TABLE)) {
              _context4.next = 14;
              break;
            }

            field = 'problemid';
            _context4.next = 10;
            return ComponentDependency.findAll({
              where: {
                'problem_id': id
              },
              attributes: ['component_id']
            });

          case 10:
            comps = _context4.sent;

            _logger["default"].info("COMPONENTS FROM Component dependency table ".concat(JSON.stringify(comps)));

            _iterator2 = _createForOfIteratorHelper(comps);

            try {
              _loop = function _loop() {
                var component = _step2.value;
                var sql = "SELECT ST_extent(detention_facilities.the_geom) as bbox FROM detention_facilities\n        where detention_facilities.component_id = ".concat(component.component_id);

                _logger["default"].info("SQL FOR Component dependency : ".concat(sql));

                sql = encodeURIComponent(sql);
                var extra = "SELECT ST_AsGeoJSON(the_geom) as geojson, 'detention_facilities' as component, \n        original_cost as cost from detention_facilities where component_id = ".concat(component.component_id);
                extraQueries.push(extra);
                var URL = "".concat(_config.CARTO_URL, "&q=").concat(sql);
                promises.push(new Promise(function (resolve, reject) {
                  _https["default"].get(URL, function (response) {
                    if (response.statusCode == 200) {
                      var str = '';
                      response.on('data', function (chunk) {
                        str += chunk;
                      });
                      response.on('end', function () {
                        var rows = JSON.parse(str).rows;
                        console.log(rows);

                        if (rows[0].bbox != null) {
                          rows[0].bbox = rows[0].bbox.replace('BOX(', '').replace(')', '').replace(/ /g, ',').split(',');
                        }

                        resolve({
                          bbox: rows[0].bbox,
                          component: 'detention_facilities'
                        });
                      });
                    } else {
                      console.log('status ', response.statusCode, URL);
                      resolve([]);
                    }
                  }).on('error', function (err) {
                    console.log('failed call to ', URL, 'with error ', err);
                    resolve([]);
                  });
                }));
              };

              for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                _loop();
              }
            } catch (err) {
              _iterator2.e(err);
            } finally {
              _iterator2.f();
            }

          case 14:
            _iterator3 = _createForOfIteratorHelper(components);

            try {
              _loop2 = function _loop2() {
                var element = _step3.value;
                var component = element.key;
                var sql = "SELECT ST_extent(".concat(component, ".the_geom) as bbox FROM ").concat(component, " \n    where ").concat(component, ".").concat(field, " = ").concat(id);

                _logger["default"].info("SQL FOR BBOX: ".concat(sql));

                sql = encodeURIComponent(sql);
                var URL = "".concat(_config.CARTO_URL, "&q=").concat(sql);
                promises.push(new Promise(function (resolve, reject) {
                  _https["default"].get(URL, function (response) {
                    if (response.statusCode == 200) {
                      var str = '';
                      response.on('data', function (chunk) {
                        str += chunk;
                      });
                      response.on('end', function () {
                        var rows = JSON.parse(str).rows;
                        console.log(rows);

                        if (rows[0].bbox != null) {
                          rows[0].bbox = rows[0].bbox.replace('BOX(', '').replace(')', '').replace(/ /g, ',').split(',');
                        }

                        resolve({
                          bbox: rows[0].bbox,
                          component: component
                        });
                      });
                    } else {
                      console.log('status ', response.statusCode, URL);
                      resolve([]);
                    }
                  }).on('error', function (err) {
                    console.log('failed call to ', URL, 'with error ', err);
                    resolve([]);
                  });
                }));
              };

              for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
                _loop2();
              }
            } catch (err) {
              _iterator3.e(err);
            } finally {
              _iterator3.f();
            }

            _context4.next = 18;
            return Promise.all(promises);

          case 18:
            all = _context4.sent;
            query = {
              q: components.map(function (t) {
                return "SELECT ST_AsGeoJSON(the_geom) as geojson, '".concat(t.key, "' as component, original_cost as cost from ").concat(t.key, " where ").concat(field, " = ").concat(id);
              }).concat(extraQueries).join(' union ')
            };
            console.log('JSON.stringify(query)\n\n\n\n', JSON.stringify(query));
            _context4.next = 23;
            return (0, _needle["default"])('post', _config.CARTO_URL, query, {
              json: true
            });

          case 23:
            datap = _context4.sent;
            centroids = datap.body.rows.map(function (r) {
              var geojson = JSON.parse(r.geojson);
              var center = [0, 0];

              if (geojson.type === 'MultiLineString') {
                if (geojson.coordinates[0].length > 0) {
                  var len = geojson.coordinates[0].length;
                  var mid = Math.floor(len / 2);
                  center = geojson.coordinates[0][mid];
                }
              }

              if (geojson.type === 'MultiPolygon') {
                if (geojson.coordinates[0][0].length > 0) {
                  var _len = geojson.coordinates[0][0].length;

                  var _mid = Math.floor(_len / 2);

                  center = geojson.coordinates[0][0][_mid];
                }
              }

              if (geojson.type === 'Point') {
                center = geojson.coordinates;
              }

              var arcWidth;

              if (r.cost <= 500 * 1000) {
                arcWidth = 2;
              } else if (r.cost <= 1 * 1000 * 1000) {
                arcWidth = 4;
              } else if (r.cost <= 5 * 1000 * 1000) {
                arcWidth = 6;
              } else {
                arcWidth = 8;
              }

              return {
                component: r.component,
                centroid: center,
                arcWidth: arcWidth
              };
            });
            bboxes = [];
            _iterator4 = _createForOfIteratorHelper(all);

            try {
              for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
                data = _step4.value;

                if (data.bbox != null) {
                  bboxes.push(data);
                }
              }
            } catch (err) {
              _iterator4.e(err);
            } finally {
              _iterator4.f();
            }

            minLat = Infinity, minLng = Infinity, maxLat = -Infinity, maxLng = -Infinity;

            for (_i = 0, _bboxes = bboxes; _i < _bboxes.length; _i++) {
              bbox = _bboxes[_i];
              coords = bbox.bbox;

              if (+coords[0] < minLat) {
                minLat = +coords[0];
              }

              if (+coords[1] < minLng) {
                minLng = +coords[1];
              }

              if (+coords[2] > maxLat) {
                maxLat = +coords[2];
              }

              if (+coords[3] > maxLng) {
                maxLng = +coords[3];
              }
            }

            selfCentroid = {
              component: 'self',
              centroid: [(minLat + maxLat) / 2, (minLng + maxLng) / 2]
            };

            if (!(table === _config.MAIN_PROJECT_TABLE)) {
              _context4.next = 41;
              break;
            }

            queryProjectLine = {
              q: [table].map(function (t) {
                return "SELECT ST_AsGeoJSON(the_geom) as geojson from ".concat(t, " where projectid = ").concat(id);
              }).join(' union ')
            };
            _context4.next = 35;
            return (0, _needle["default"])('post', _config.CARTO_URL, queryProjectLine, {
              json: true
            });

          case 35:
            dataProjectLine = _context4.sent;
            r = dataProjectLine.body.rows[0];
            geojson = JSON.parse(r.geojson);
            projectCenter = [0, 0];

            if (geojson.type === 'MultiLineString') {
              if (geojson.coordinates[0].length > 0) {
                len = geojson.coordinates[0].length;
                mid = Math.floor(len / 2);
                projectCenter = geojson.coordinates[0][mid];
              }
            }

            selfCentroid = {
              component: 'self',
              centroid: projectCenter
            };

          case 41:
            centroids = [selfCentroid].concat(_toConsumableArray(centroids));
            polygon = [[[minLat, minLng], [minLat, maxLng], [maxLat, maxLng], [maxLat, minLng], [minLat, minLng]]];
            res.send({
              bbox: polygon,
              centroids: centroids
            });

          case 44:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  }));

  return function (_x11, _x12) {
    return _ref4.apply(this, arguments);
  };
}());
router.get('/problemname/:problemid', /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(req, res) {
    var problemid, sql, sqlURI, URL;
    return _regeneratorRuntime().wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            problemid = req.params.problemid;
            sql = "select ".concat(_config.PROPSPROBLEMTABLES.problem_boundary[6], " as ").concat(_config.PROPSPROBLEMTABLES.problems[6], " from ").concat(_config.PROBLEM_TABLE, " where ").concat(_config.PROPSPROBLEMTABLES.problem_boundary[5], " = ").concat(problemid);
            sqlURI = encodeURIComponent(sql);
            URL = "".concat(_config.CARTO_URL, "&q=").concat(sqlURI);
            console.log("SQL", sql);

            try {
              _https["default"].get(URL, function (response) {
                if (response.statusCode == 200) {
                  var str = '';
                  response.on('data', function (chunk) {
                    str += chunk;
                  });
                  response.on('end', function () {
                    var rows = JSON.parse(str).rows;
                    return res.status(200).send(rows);
                  });
                } else {
                  console.log('status ', response.statusCode, URL);
                  return res.status(320).send(response.statusCode);
                }
              }).on('error', function (err) {
                console.log('failed at problemname call to ', URL, 'with error ', err);
                res.send({
                  problemname: []
                });
              });
            } catch (error) {
              res.send({
                error: error
              });
            }

          case 6:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  }));

  return function (_x13, _x14) {
    return _ref5.apply(this, arguments);
  };
}());
var _default = router;
exports["default"] = _default;