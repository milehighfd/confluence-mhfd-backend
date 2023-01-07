"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _default = function _default(sequelize, DataType) {
  var Attachment = sequelize.define('attachment', {
    _id: {
      type: DataType.UUID,
      defaultValue: DataType.UUIDV4,
      primaryKey: true
    },
    value: {
      type: DataType.STRING(512)
    },
    filename: {
      type: DataType.STRING(512)
    },
    mimetype: {
      type: DataType.STRING
    },
    user_id: {
      type: DataType.UUID,
      allowNull: false
    },
    register_date: {
      type: DataType.DATE
    },
    filesize: {
      type: DataType.FLOAT
    },
    project_id: {
      type: DataType.STRING,
      allowNull: true
    },
    type: {
      type: DataType.STRING
    },
    isCover: {
      type: DataType.BOOLEAN
    }
  });
  return Attachment;
};

exports["default"] = _default;