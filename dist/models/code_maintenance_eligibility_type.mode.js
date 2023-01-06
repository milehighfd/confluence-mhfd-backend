"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _default = function _default(sequelize, DataType) {
  var CodeMaintenanceEligibilityType = sequelize.define('code_maintenance_eligibility_type', {
    code_maintenance_eligibility_type_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    eligibility_type_name: {
      type: DataType.STRING,
      allowNull: false
    }
  });
  return CodeMaintenanceEligibilityType;
};

exports["default"] = _default;