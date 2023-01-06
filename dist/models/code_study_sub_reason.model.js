"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _default = function _default(sequelize, DataType) {
  var CodeStudySubReason = sequelize.define('code_study_sub_reason', {
    code_study_sub_reason_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    code_study_reason_id: {
      type: DataType.INTEGER,
      allowNull: false
    },
    sub_reason_name: {
      type: DataType.STRING,
      allowNull: false
    }
  });
  return CodeStudySubReason;
};

exports["default"] = _default;