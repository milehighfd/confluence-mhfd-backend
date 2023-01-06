"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _winston = _interopRequireDefault(require("winston"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var logger = _winston["default"].createLogger({
  transports: [new _winston["default"].transports.Console({
    level: 'silly'
  }), new _winston["default"].transports.File({
    level: 'silly',
    filename: './logs/mhfd.log',
    maxFiles: 3,
    maxsize: 1048576
  })],
  format: _winston["default"].format.combine(_winston["default"].format.timestamp(), _winston["default"].format.printf(function (info) {
    return "".concat(info.timestamp, " [").concat(info.level, "]: ").concat(info.message);
  }))
});

logger.stream = {
  write: function write(message, encoding) {
    var newMessage = message.substring(0, message.length - 1);
    logger.info(newMessage);
  }
};
var _default = logger;
exports["default"] = _default;