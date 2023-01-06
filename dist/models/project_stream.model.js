"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _default = function _default(sequelize, DataType) {
  var ProjectStream = sequelize.define('project_stream', {
    project_stream_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    project_id: {
      type: DataType.INTEGER,
      allowNull: false
    },
    stream_id: {
      type: DataType.INTEGER,
      allowNull: false
    },
    local_government_id: {
      type: DataType.INTEGER,
      allowNull: false
    },
    length_in_miles: {
      type: DataType.FLOAT,
      allowNull: false
    },
    drainage_area_in_sq_miles: {
      type: DataType.FLOAT,
      allowNull: false
    }
  });
  return ProjectStream;
};

exports["default"] = _default;