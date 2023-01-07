"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _default = function _default(sequelize, DataType) {
  var GroupNotes = sequelize.define('groupnote', {
    _id: {
      type: DataType.UUID,
      defaultValue: DataType.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataType.STRING
    },
    position: {
      type: DataType.INTEGER
    },
    user_id: {
      type: DataType.UUID
    }
  });
  return GroupNotes;
};

exports["default"] = _default;