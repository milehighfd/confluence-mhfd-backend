"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _default = function _default(sequelize, DataType) {
  var CodeProjectPartnerType = sequelize.define('code_project_partner_type', {
    code_project_partner_type_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    partner_type_name: {
      type: DataType.STRING,
      allowNull: false
    }
  }, {
    freezeTableName: true,
    tableName: 'code_project_partner_type',
    createdAt: false,
    updatedAt: false
  });
  return CodeProjectPartnerType;
};

exports["default"] = _default;