"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _default = function _default(sequelize, DataType) {
  var CodeProjectType = sequelize.define('code_project_type', {
    code_project_type_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    project_type_name: {
      type: DataType.STRING,
      allowNull: true
    },
    project_short_name: {
      type: DataType.STRING
    }
  }, {
    tableName: 'code_project_type',
    timestamps: false,
    createdAt: false,
    updatedAt: false
  });
  return CodeProjectType;
};

exports["default"] = _default;