"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _default = function _default(sequelize, DataType) {
  var IndependentComponent = sequelize.define('independentComponent', {
    _id: {
      type: DataType.UUID,
      defaultValue: DataType.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataType.STRING
    },
    status: {
      type: DataType.STRING
    },
    cost: {
      type: DataType.STRING
    },
    projectid: {
      type: DataType.INTEGER
    }
  });
  return IndependentComponent;
};

exports["default"] = _default;