"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = _interopRequireDefault(require("express"));

var _cookieParser = _interopRequireDefault(require("cookie-parser"));

var _morgan = _interopRequireDefault(require("morgan"));

var _http = _interopRequireDefault(require("http"));

var _cors = _interopRequireDefault(require("cors"));

var _logger = _interopRequireDefault(require("bc/config/logger.js"));

var _index = _interopRequireDefault(require("bc/routes/index.js"));

var _usersRoute = _interopRequireDefault(require("bc/routes/users.route.js"));

var _authRoute = _interopRequireDefault(require("bc/routes/auth.route.js"));

var _adminRoute = _interopRequireDefault(require("bc/routes/admin.route.js"));

var _logActivityRoute = _interopRequireDefault(require("bc/routes/logActivity.route.js"));

var _mapRoute = _interopRequireDefault(require("bc/routes/map.route.js"));

var _problemRoute = _interopRequireDefault(require("bc/routes/problem.route.js"));

var _driveRoute = _interopRequireDefault(require("bc/routes/drive.route.js"));

var _attachmentRoute = _interopRequireDefault(require("bc/routes/attachment.route.js"));

var _mapgalleryRoute = _interopRequireDefault(require("bc/routes/mapgallery.route.js"));

var _filtersRoute = _interopRequireDefault(require("bc/routes/filters.route.js"));

var _zoomareaRoute = _interopRequireDefault(require("bc/routes/zoomarea.route.js"));

var _favoriteRoute = _interopRequireDefault(require("bc/routes/favorite.route.js"));

var _index2 = _interopRequireDefault(require("bc/routes/new-project/index.js"));

var _boardRoute = _interopRequireDefault(require("bc/routes/board.route.js"));

var _localityRoute = _interopRequireDefault(require("bc/routes/locality.route.js"));

var _noteRoute = _interopRequireDefault(require("bc/routes/note.route.js"));

var _newnotesRoute = _interopRequireDefault(require("bc/routes/newnotes.route.js"));

var _consultantsRoute = _interopRequireDefault(require("bc/routes/consultants.route.js"));

var _organizationRoute = _interopRequireDefault(require("bc/routes/organization.route.js"));

var _configurationRoute = _interopRequireDefault(require("bc/routes/configuration.route.js"));

var _projectRoute = _interopRequireDefault(require("bc/routes/project.route.js"));

var _v2localityRoute = _interopRequireDefault(require("bc/routes/v2locality.route.js"));

var _db = _interopRequireDefault(require("bc/config/db.js"));

var _seed = _interopRequireDefault(require("bc/config/seed.js"));

var _projectserviceareaRoute = _interopRequireDefault(require("bc/routes/projectservicearea.route.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// import serviceAreaLocalGovernment from 'bc/routes/servicearealocalgovernment.route.js';
_db["default"].sequelize.sync();

(0, _seed["default"])();
console.log("ENVIRONMENT ".concat(process.env.NODE_ENV));
var app = (0, _express["default"])();

var server = _http["default"].createServer(app);

app.use((0, _morgan["default"])('dev', {
  stream: _logger["default"].stream
}));
app.use(_express["default"].json({
  limit: '20mb'
}));
app.use(_express["default"].urlencoded({
  extended: false
}));
app.use((0, _cookieParser["default"])());
app.use((0, _cors["default"])()); // add CORS headers

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE, PUT");
  res.header("Access-Control-Max-Age", "86400");
  next();
});
app.use(_express["default"]["static"]('public'));
app.use('/', _index["default"]);
app.use('/users', _usersRoute["default"]);
app.use('/auth', _authRoute["default"]);
app.use('/admin', _adminRoute["default"]);
app.use('/admin/user-activity', _logActivityRoute["default"]);
app.use('/map', _mapRoute["default"]);
app.use('/problems', _problemRoute["default"]);
app.use('/drive', _driveRoute["default"]);
app.use('/attachments', _attachmentRoute["default"]);
app.use('/gallery', _mapgalleryRoute["default"]);
app.use('/filters', _filtersRoute["default"]);
app.use('/zoomarea', _zoomareaRoute["default"]);
app.use('/favorites', _favoriteRoute["default"]);
app.use('/create', _index2["default"]);
app.use('/board', _boardRoute["default"]);
app.use('/locality', _localityRoute["default"]);
app.use('/notes', _noteRoute["default"]);
app.use('/newnotes', _newnotesRoute["default"]);
app.use('/consultants', _consultantsRoute["default"]);
app.use('/organizations', _organizationRoute["default"]);
app.use('/configuration', _configurationRoute["default"]);
app.use('/projects', _projectRoute["default"]);
app.use('/v2/locality', _v2localityRoute["default"]);
app.use('/projectservicearea', _projectserviceareaRoute["default"]); // app.use('/servicearealocalgovernment', serviceAreaLocalGovernment);

var _default = server;
exports["default"] = _default;