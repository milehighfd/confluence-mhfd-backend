"use strict";

var _dotenv = _interopRequireDefault(require("dotenv"));

var _debug = _interopRequireDefault(require("debug"));

var _app = _interopRequireDefault(require("../app.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

_dotenv["default"].config({
  path: '.env'
});

console.log('POSTGRESQL_PASSWORD');
console.log(process.env.POSTGRESQL_PASSWORD);
var debugBackend = (0, _debug["default"])('mhfd-backend-express:server');
var port = normalizePort(process.env.PORT || '3003');

_app["default"].listen(port);

_app["default"].on('error', onError);

_app["default"].on('listening', onListening);

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }

  if (port >= 0) {
    return port;
  }

  return false;
}

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;

    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;

    default:
      throw error;
  }
}

function onListening() {
  var addr = _app["default"].address();

  var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  debugBackend('Listening on ' + bind);
  console.log("Server is listening on " + bind);
}