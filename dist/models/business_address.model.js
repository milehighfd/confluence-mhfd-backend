"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _default = function _default(sequelize, DataType) {
  var BusinessAdress = sequelize.define('business_address', {
    business_address_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    business_associate_id: {
      type: DataType.INTEGER,
      allowNull: false
    },
    business_address_line_1: {
      type: DataType.INTEGER,
      allowNull: false
    },
    business_address_line_2: {
      type: DataType.INTEGER,
      allowNull: false
    },
    state: {
      type: DataType.STRING,
      allowNull: false
    },
    city: {
      type: DataType.STRING,
      allowNull: false
    },
    zip: {
      type: DataType.STRING,
      allowNull: false
    }
  });
  return BusinessAdress;
};

exports["default"] = _default;