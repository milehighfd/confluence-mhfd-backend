"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _default = function _default(sequelize, DataType) {
  var LocalGovernment = sequelize.define('CODE_LOCAL_GOVERNMENT', {
    objectid: {
      type: DataType.INTEGER
    },
    code_local_government_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    local_government_name: {
      type: DataType.STRING
    },
    local_government_type: {
      type: DataType.STRING
    }
  }, {
    freezeTableName: true,
    tableName: 'CODE_LOCAL_GOVERNMENT_4326',
    createdAt: false,
    updatedAt: false
  });
  return LocalGovernment;
};

exports["default"] = _default;