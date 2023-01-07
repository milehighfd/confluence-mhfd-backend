"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _default = function _default(sequelize, DataType) {
  var board = sequelize.define('board', {
    _id: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    locality: {
      type: DataType.STRING
    },
    year: {
      type: DataType.STRING
    },
    projecttype: {
      type: DataType.ENUM,
      values: ['Capital', 'Study', 'Maintenance', 'Acquisition', 'Special']
    },
    type: {
      type: DataType.ENUM,
      values: ['WORK_REQUEST', 'WORK_PLAN']
    },
    total_county_budget: {
      type: DataType.DOUBLE
    },
    targetcost1: {
      type: DataType.DOUBLE
    },
    targetcost2: {
      type: DataType.DOUBLE
    },
    targetcost3: {
      type: DataType.DOUBLE
    },
    targetcost4: {
      type: DataType.DOUBLE
    },
    targetcost5: {
      type: DataType.DOUBLE
    },
    status: {
      type: DataType.STRING
    },
    substatus: {
      type: DataType.STRING(512)
    },
    comment: {
      type: DataType.STRING
    },
    submissionDate: {
      type: DataType.DATE
    }
  });
  return board;
};

exports["default"] = _default;