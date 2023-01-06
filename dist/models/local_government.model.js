"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _default = function _default(sequelize, DataType) {
  var LocalGovernment = sequelize.define('local_government', {
    local_government_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    local_government_name: {
      type: DataType.STRING,
      allowNull: false
    }
  });
  return LocalGovernment;
};

exports["default"] = _default;