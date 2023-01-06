"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _default = function _default(sequelize, DataType) {
  var LogActivity = sequelize.define('log_activity', {
    _id: {
      type: DataType.UUID,
      defaultValue: DataType.UUIDV4,
      primaryKey: true
    },
    registerDate: {
      type: DataType.DATE
    },
    user_id: {
      type: DataType.UUID,
      allowNull: false
    },
    activityType: {
      type: DataType.ENUM,
      values: ['user_login']
    }
  });
  return LogActivity;
};

exports["default"] = _default;