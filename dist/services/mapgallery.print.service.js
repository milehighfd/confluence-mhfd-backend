"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.printProject = exports.printProblem = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _htmlPdf = _interopRequireDefault(require("html-pdf"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return generator._invoke = function (innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; }(innerFn, self, context), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; this._invoke = function (method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, define(Gp, "constructor", GeneratorFunctionPrototype), define(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (object) { var keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var limit = 0;

var priceFormatter = function priceFormatter(value) {
  return "$".concat(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

var printProblem = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(data, components, map, problempart) {
    var html, problemname, problemtype, jurisdiction, servicearea, county, solutionstatus, solutioncost, streamname, problempriority, sourcename, source, problemdescription, mainImage, mapHeight, solutionstatusVal, _components, sum, componentRows, problempartRows, q, spaceBetween, i, width, height, options;

    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            html = _fs["default"].readFileSync('./pdf-templates/Problems.html', 'utf8');
            problemname = data.problemname, problemtype = data.problemtype, jurisdiction = data.jurisdiction, servicearea = data.servicearea, county = data.county, solutionstatus = data.solutionstatus, solutioncost = data.solutioncost, streamname = data.streamname, problempriority = data.problempriority, sourcename = data.sourcename, source = data.source, problemdescription = data.problemdescription;
            mainImage = problemtype ? "https://confdev.mhfd.org/detailed/".concat(problemtype, ".png") : 'https://i.imgur.com/kLyZbrB.jpg';
            mapHeight = 500;
            html = html.split('${problemname}').join(problemname);
            html = html.split('${problemtype}').join(problemtype + ' Problem');
            html = html.split('${jurisdiction}').join(jurisdiction + ', CO');
            html = html.split('${county}').join(county);
            html = html.split('${servicearea}').join(servicearea);
            html = html.split('${solutionstatus}').join(solutionstatus ? solutionstatus : 0);
            html = html.split('${solutioncost}').join(solutioncost ? priceFormatter(solutioncost) : 'No Cost Data');
            html = html.split('${streamname}').join(streamname);
            html = html.split('${problempriority}').join(problempriority);
            html = html.split('${sourcename}').join(sourcename);
            html = html.split('${source}').join(source);
            html = html.split('${problemdescription}').join(problemdescription);
            html = html.split('${map}').join(map);
            html = html.split('${mainImage}').join(mainImage);
            html = html.split('${mapHeight}').join(mapHeight);
            solutionstatusVal = solutionstatus ? solutionstatus : 0;
            solutionstatusVal = Math.floor(solutionstatusVal / 100 * 150);
            html = html.split('${solutionstatusVal}').join(solutionstatusVal);
            _components = components.length > 0 ? components : [{
              type: '',
              estimated_cost: 0,
              original_cost: 0,
              percen: 0
            }];
            sum = _components.reduce(function (prev, curr) {
              return curr.estimated_cost + prev;
            }, 0);
            ;
            componentRows = _components.map(function (c) {
              return "\n        <tr style=\"background: rgba(37,24,99,.03); color: #11093c; font-weight:bold;\">\n          <td width=\"40%\" style=\"padding: 17px 20px;\">".concat(c.type, "</td>\n          <td width=\"20%\" style=\"padding: 17px 20px;\">").concat(priceFormatter(c.estimated_cost), "</td>\n          <td width=\"20%\" style=\"padding: 17px 20px;\">").concat(c.original_cost ? Math.round(c.original_cost * 10) / 10 : 0, "%</td>\n          <td width=\"20%\" style=\"padding: 17px 20px;\">").concat(c.percen, "%</td>\n        </tr>\n      ");
            }).join('');
            problempartRows = problempart.map(function (c) {
              return "\n      <tr style=\"background: rgba(37,24,99,.03); color: #11093c; font-weight:bold;\">\n        <td width=\"40%\" style=\"padding: 17px 20px;\">".concat(c.problem_type, "</td>\n        <td width=\"25%\" style=\"padding: 17px 20px;\">").concat(c.problem_part_category, "</td>\n        <td width=\"25%\" style=\"padding: 17px 20px;\">").concat(c.problem_part_subcategory, "%</td>\n      </tr>\n    ");
            }).join('');
            html = html.split('${problempartRows}').join(problempartRows);

            if (sum >= 0) {
              html = html.split('${componentRows}').join(componentRows);
              html = html.split('${totalEstimatedCost}').join("<tfoot>\n      <tr style=\"background: rgba(37,24,99,.03); color: #11093c; font-weight:bold;\">\n        <th width=\"40%\" style=\"padding: 17px 20px; text-align:left;\"><b>Total Estimated Cost</b></th>\n        <th width=\"60%\" colspan=\"3\" style=\"padding: 17px 20px; text-align:left;\"><b>".concat(priceFormatter(sum), "</b></th>\n      </tr>\n    </tfoot>"));
            } else {
              html = html.split('${componentRows}').join(componentRows);
              html = html.split('${totalEstimatedCost}').join('');
            }

            q = 0;
            spaceBetween = '';
            _context.t0 = components.length;
            _context.next = _context.t0 === 0 ? 34 : _context.t0 === 1 ? 34 : _context.t0 === 2 ? 34 : _context.t0 === 3 ? 36 : _context.t0 === 4 ? 38 : _context.t0 === 5 ? 40 : _context.t0 === 6 ? 42 : _context.t0 === 7 ? 44 : _context.t0 === 8 ? 46 : _context.t0 === 9 ? 48 : _context.t0 === 10 ? 50 : 52;
            break;

          case 34:
            q = 0;
            return _context.abrupt("break", 52);

          case 36:
            q = 35;
            return _context.abrupt("break", 52);

          case 38:
            q = 30;
            return _context.abrupt("break", 52);

          case 40:
            q = 28;
            return _context.abrupt("break", 52);

          case 42:
            q = 25;
            return _context.abrupt("break", 52);

          case 44:
            q = 23;
            return _context.abrupt("break", 52);

          case 46:
            q = 20;
            return _context.abrupt("break", 52);

          case 48:
            q = 15;
            return _context.abrupt("break", 52);

          case 50:
            q = 10;
            return _context.abrupt("break", 52);

          case 52:
            for (i = 0; i < q; i++) {
              spaceBetween += '<br/>';
            }

            html = html.split('${spaceBetween}').join(components.length > limit ? "<br><div style=\"page-break-after:always;\"></div>" : ''); // let width = 1200;

            width = 900;
            height = 1150;
            options = {
              width: "".concat(width, "px"),
              height: "".concat(height, "px"),
              border: '0px'
            };
            return _context.abrupt("return", _htmlPdf["default"].create(html, options));

          case 58:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function printProblem(_x, _x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
}();

exports.printProblem = printProblem;

var printProject = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(_data, components, map) {
    var data, html, projectname, county, projecttype, sponsor, servicearea, finalcost, estimatedcost, streamname, projectsubtype, attachments, status, startyear, completedyear, frequency, mhfdmanager, description, contractor, consultant, problems, cost, mapHeight, URL_BASE, urlImage, _problems, problemRows, _components, sum, componentRows, q, spaceBetween, i, width, height, options;

    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            data = {};
            Object.keys(_data).forEach(function (k) {
              if (k.includes('cost')) {
                data[k] = _data[k];
              } else if (k === 'description') {
                data[k] = _data[k] ? _data[k] : 'No Data';
              } else {
                data[k] = _data[k] ? _data[k] : 'N/A';
              }
            });
            html = _fs["default"].readFileSync('./pdf-templates/Projects.html', 'utf8');
            projectname = data.projectname, county = data.county, projecttype = data.projecttype, sponsor = data.sponsor, servicearea = data.servicearea, finalcost = data.finalcost, estimatedcost = data.estimatedcost, streamname = data.streamname, projectsubtype = data.projectsubtype, attachments = data.attachments, status = data.status, startyear = data.startyear, completedyear = data.completedyear, frequency = data.frequency, mhfdmanager = data.mhfdmanager, description = data.description, contractor = data.contractor, consultant = data.consultant, problems = data.problems;
            cost = 0;

            if (finalcost) {
              cost = finalcost;
            } else if (estimatedcost) {
              cost = estimatedcost;
            }

            mapHeight = 500;
            URL_BASE = 'https://confdev.mhfd.org/';
            urlImage = projecttype === 'Capital' ? "".concat(URL_BASE, "detailed/capital.png") : projecttype === 'Study' ? "".concat(URL_BASE, "projectImages/study.jpg") : projecttype === 'Maintenance' ? projectsubtype === 'Vegetation Management' ? "".concat(URL_BASE, "detailed/vegetation-management.png") : projectsubtype === 'Sediment Removal' ? "".concat(URL_BASE, "detailed/sediment-removal.png") : projectsubtype === 'Restoration' ? "".concat(URL_BASE, "detailed/restoration.png") : projectsubtype === 'Minor Repairs' ? "".concat(URL_BASE, "detailed/minor-repairs.png") : "".concat(URL_BASE, "detailed/debris-management.png") : 'https://i.imgur.com/kLyZbrB.jpg';
            html = html.split('${projectname}').join(projectname);
            html = html.split('${projecttype}').join(projecttype + ' Project');
            html = html.split('${sponsor}').join(sponsor);
            html = html.split('${county}').join(county);
            html = html.split('${servicearea}').join(servicearea);
            html = html.split('${cost}').join(cost ? priceFormatter(cost) : 'No Cost Data');
            html = html.split('${status}').join(status);
            html = html.split('${streamname}').join(streamname);
            html = html.split('${projectsubtype}').join(projectsubtype);
            html = html.split('${attachmentUrl}').join(attachments.length > 0 ? attachments[0] : urlImage);
            html = html.split('${startyear}').join(startyear);
            html = html.split('${completedyear}').join(completedyear);
            html = html.split('${frequency}').join(frequency);
            html = html.split('${mhfdmanager}').join(mhfdmanager);
            html = html.split('${description}').join(description);
            html = html.split('${contractor}').join(contractor);
            html = html.split('${consultant}').join(consultant);
            html = html.split('${mapHeight}').join(mapHeight);
            _problems = problems.length > 0 ? problems : [{
              problemname: '',
              problempriority: ''
            }];
            problemRows = _problems.map(function (p) {
              return "\n        <tr style=\"background: rgba(37,24,99,.03); color: #11093c; font-weight:bold;\">\n          <td width=\"50%\" style=\"padding: 17px 20px;\">".concat(p.problemname, "</td>\n          <td width=\"50%\" style=\"padding: 17px 20px;\">").concat(p.problempriority, "</td>\n        </tr>\n      ");
            }).join('');
            html = html.split('${problemRows}').join(problemRows);
            _components = components.length > 0 ? components : [{
              type: '',
              estimated_cost: 0,
              original_cost: 0,
              percen: 0
            }];
            sum = _components.reduce(function (prev, curr) {
              return curr.estimated_cost + prev;
            }, 0);
            componentRows = _components.map(function (c, i) {
              var str = "\n        <tr style=\"background: rgba(37,24,99,.03); color: #11093c; font-weight:bold;\">\n          <td width=\"40%\" style=\"padding: 17px 20px;\">".concat(c.type, "</td>\n          <td width=\"20%\" style=\"padding: 17px 20px;\">").concat(priceFormatter(c.estimated_cost), "</td>\n          <td width=\"20%\" style=\"padding: 17px 20px;\">").concat(c.original_cost ? Math.round(c.original_cost * 10) / 10 : 0, "%</td>\n          <td width=\"20%\" style=\"padding: 17px 20px;\">").concat(c.percen, "%</td>\n        </tr>\n      ");

              if (components.length === 9 && i === 6) {
                str += '<tr><tr/><tr><tr/><tr><tr/><tr><tr/><tr><tr/><tr><tr/><tr><tr/>';
              }

              return str;
            }).join('');

            if (sum) {
              html = html.split('${componentRows}').join(componentRows);
              html = html.split('${totalEstimatedCost}').join("<tfoot>\n      <tr style=\"background: rgba(37,24,99,.03); color: #11093c; font-weight:bold;\">\n        <th width=\"40%\" style=\"padding: 17px 20px; text-align:left;\"><b>Total Estimated Cost</b></th>\n        <th width=\"60%\" colspan=\"3\" style=\"padding: 17px 20px; text-align:left;\"><b>".concat(priceFormatter(sum), "</b></th>\n      </tr>\n    </tfoot>"));
            } else {
              html = html.split('${componentRows}').join("\n      <tr style=\"background: rgba(37,24,99,.03); color: #11093c; font-weight:bold;\">\n        <td width=\"40%\" style=\"padding: 17px 20px;\"></td>\n        <td width=\"20%\" style=\"padding: 17px 20px;\"></td>\n        <td width=\"20%\" style=\"padding: 17px 20px;\"></td>\n        <td width=\"20%\" style=\"padding: 17px 20px;\"></td>\n      </tr>\n    ");
              html = html.split('${totalEstimatedCost}').join('');
            }

            html = html.split('${map}').join(map);
            q = 0;
            spaceBetween = '';
            _context2.t0 = components.length;
            _context2.next = _context2.t0 === 0 ? 40 : _context2.t0 === 1 ? 42 : _context2.t0 === 2 ? 44 : _context2.t0 === 3 ? 46 : _context2.t0 === 4 ? 48 : _context2.t0 === 5 ? 50 : _context2.t0 === 6 ? 52 : _context2.t0 === 7 ? 54 : 56;
            break;

          case 40:
            q = 0;
            return _context2.abrupt("break", 56);

          case 42:
            q = 25;
            return _context2.abrupt("break", 56);

          case 44:
            q = 20;
            return _context2.abrupt("break", 56);

          case 46:
            q = 17;
            return _context2.abrupt("break", 56);

          case 48:
            q = 13;
            return _context2.abrupt("break", 56);

          case 50:
            q = 8;
            return _context2.abrupt("break", 56);

          case 52:
            q = 5;
            return _context2.abrupt("break", 56);

          case 54:
            q = 3;
            return _context2.abrupt("break", 56);

          case 56:
            for (i = 0; i < q; i++) {
              spaceBetween += '<br/>';
            }

            html = html.split('${spaceBetween}').join(components.length > limit ? "<br><div style=\"page-break-after:always;\"></div>" : '');
            width = 900;
            height = 1150;

            if (!(problems.length + components.length)) {
              height += 180;
            }

            options = {
              width: "".concat(width, "px"),
              height: "".concat(height, "px"),
              border: '0px'
            };
            return _context2.abrupt("return", _htmlPdf["default"].create(html, options));

          case 63:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function printProject(_x5, _x6, _x7) {
    return _ref2.apply(this, arguments);
  };
}();

exports.printProject = printProject;