"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _default = function _default(sequelize, DataType) {
  var NewNotes = sequelize.define('newnote', {
    _id: {
      type: DataType.UUID,
      defaultValue: DataType.UUIDV4,
      primaryKey: true
    },
    content: {
      type: DataType.TEXT
    },
    latitude: {
      type: DataType.FLOAT
    },
    longitude: {
      type: DataType.FLOAT
    },
    color_id: {
      type: DataType.UUID
    },
    user_id: {
      type: DataType.UUID,
      allowNull: false
    },
    position: {
      type: DataType.INTEGER
    },
    group_id: {
      type: DataType.UUID
    }
  });
  return NewNotes;
};

exports["default"] = _default;