"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _default = function _default(sequelize, DataType) {
  var ProjectLocalGovernment = sequelize.define('project_local_government', {
    project_local_government_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    code_local_government_id: {
      type: DataType.INTEGER,
      allowNull: false
    },
    project_id: {
      type: DataType.INTEGER,
      allowNull: false
    }
  }, {
    freezeTableName: true,
    tableName: 'project_local_government',
    createdAt: false,
    updatedAt: false
  });
  return ProjectLocalGovernment;
};

exports["default"] = _default;