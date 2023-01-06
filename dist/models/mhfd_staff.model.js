"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _default = function _default(sequelize, DataType) {
  var MHFDStaff = sequelize.define('mhfd_staff', {
    mhfd_staff_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    email: {
      type: DataType.STRING,
      allowNull: false
    },
    full_name: {
      type: DataType.STRING,
      allowNull: false
    },
    title: {
      type: DataType.STRING,
      allowNull: false
    },
    parent_mhfd_staff_id: {
      type: DataType.INTEGER
    }
  }, {
    freezeTableName: true,
    tableName: 'mhfd_staff',
    createdAt: false,
    updatedAt: false
  });
  return MHFDStaff;
};

exports["default"] = _default;