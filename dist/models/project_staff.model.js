"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _default = function _default(sequelize, DataType) {
  var ProjectStaff = sequelize.define('project_staff', {
    project_staff_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    project_id: {
      type: DataType.INTEGER
    },
    project_staff_email_do_not_use: {
      type: DataType.STRING
    },
    project_staff_name_do_not_use: {
      type: DataType.STRING
    },
    mhfd_staff_id: {
      type: DataType.INTEGER
    },
    code_project_staff_role_type_id: {
      type: DataType.INTEGER
    }
  }, {
    freezeTableName: true,
    tableName: 'project_staff',
    createdAt: false,
    updatedAt: false
  });
  return ProjectStaff;
};

exports["default"] = _default;