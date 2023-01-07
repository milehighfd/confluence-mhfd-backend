"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _default = function _default(sequelize, DataType) {
  var ProjectStatusActionItemTracking = sequelize.define('project_status_action_item_tracking', {
    project_status_action_item_tracking_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    project_status_id: {
      type: DataType.INTEGER
    },
    code_rule_action_id: {
      type: DataType.INTEGER,
      allowNull: true
    }
  });
  return ProjectStatusActionItemTracking;
};

exports["default"] = _default;