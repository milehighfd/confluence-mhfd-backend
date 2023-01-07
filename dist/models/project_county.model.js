"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _default = function _default(sequelize, DataType) {
  var ProjectCounty = sequelize.define('project_county', {
    project_county_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    state_county_id: {
      type: DataType.INTEGER,
      allowNull: false
    },
    project_id: {
      type: DataType.INTEGER,
      allowNull: false
    }
  }, {
    freezeTableName: true,
    tableName: 'project_county',
    createdAt: false,
    updatedAt: false
  });
  return ProjectCounty;
};

exports["default"] = _default;