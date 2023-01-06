"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _default = function _default(sequelize, DataType) {
  var CodeStatusType = sequelize.define('code_status_type', {
    code_status_type_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    status_name: {
      type: DataType.STRING,
      allowNull: false
    }
  }, {
    tableName: 'code_status_type',
    timestamps: false,
    createdAt: false,
    updatedAt: false
  });
  return CodeStatusType;
};

exports["default"] = _default;