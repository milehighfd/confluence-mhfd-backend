"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _default = function _default(sequelize, DataType) {
  var boardLocality = sequelize.define('boardLocality', {
    fromLocality: {
      type: DataType.STRING
    },
    toLocality: {
      type: DataType.STRING
    },
    type: {
      type: DataType.ENUM,
      values: ['COUNTY_WORK_PLAN', 'SERVICE_AREA_WORK_PLAN']
    },
    staff: {
      type: DataType.STRING
    },
    email: {
      type: DataType.STRING
    }
  });
  return boardLocality;
};

exports["default"] = _default;