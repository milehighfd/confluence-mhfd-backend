"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _default = function _default(sequelize, DataType) {
  var ProjectComponent = sequelize.define('project_component', {
    project_component_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    project_id: {
      type: DataType.INTEGER
    },
    component_id: {
      type: DataType.INTEGER
    }
  });
  return ProjectComponent;
};

exports["default"] = _default;