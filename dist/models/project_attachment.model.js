"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _default = function _default(sequelize, DataType) {
  var ProjectAttachment = sequelize.define('project_attachment', {
    project_attachment_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    attachment_url: {
      type: DataType.STRING,
      allowNull: false
    },
    attachment_reference_key: {
      type: DataType.STRING,
      allowNull: false
    },
    attachment_reference_key_type: {
      type: DataType.STRING,
      allowNull: false
    },
    created_by: {
      type: DataType.STRING,
      allowNull: false
    },
    created_date: {
      type: DataType.DATE,
      allowNull: false
    },
    last_modified_by: {
      type: DataType.DATE,
      allowNull: false
    },
    last_modified_date: {
      type: DataType.DATE,
      allowNull: false
    },
    mime_type: {
      type: DataType.STRING,
      allowNull: false
    },
    project_id: {
      type: DataType.INTEGER,
      allowNull: false
    }
  });
  return ProjectAttachment;
};

exports["default"] = _default;