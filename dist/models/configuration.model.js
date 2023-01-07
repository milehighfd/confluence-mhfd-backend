"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _default = function _default(sequelize, DataType) {
  var Configuration = sequelize.define('configuration', {
    key: {
      type: DataType.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataType.STRING,
      allowNull: false
    },
    value: {
      type: DataType.STRING,
      allowNull: false
    },
    type: {
      type: DataType.STRING,
      allowNull: false
    }
  });
  return Configuration;
};

exports["default"] = _default;