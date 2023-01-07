"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _default = function _default(sequelize, DataType) {
  var BusinessAssociateContact = sequelize.define('business_associate_contact', {
    business_associate_contact_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    business_address_id: {
      type: DataType.INTEGER,
      allowNull: false
    },
    contact_name: {
      type: DataType.STRING,
      allowNull: false
    },
    contact_email: {
      type: DataType.STRING,
      allowNull: false
    },
    contact_phone_number: {
      type: DataType.STRING,
      allowNull: false
    }
  });
  return BusinessAssociateContact;
};

exports["default"] = _default;