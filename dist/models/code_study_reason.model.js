"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _default = function _default(sequelize, DataType) {
  var CodeStudyReason = sequelize.define('code_study_reason', {
    code_study_reason_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    reason_name: {
      type: DataType.STRING,
      allowNull: false
    }
  });
  return CodeStudyReason;
};

exports["default"] = _default;