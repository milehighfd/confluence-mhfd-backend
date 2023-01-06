"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _default = function _default(sequelize, DataType) {
  var CodeAcquisitionProgressStatus = sequelize.define('code_acquisition_progress_status', {
    code_acquisition_progress_status_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    acquisition_progress_status_name: {
      type: DataType.STRING,
      allowNull: false
    }
  });
  return CodeAcquisitionProgressStatus;
};

exports["default"] = _default;