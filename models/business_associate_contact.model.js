const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const config = require('../config/config');
const crypto = require('crypto');
const logger = require('../config/logger');
const { Op } = require("sequelize");

module.exports = (sequelize, DataType) => {
  const BusinessAssociateContact = sequelize.define('business_associate_contact', {
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
  }
    );
  return BusinessAssociateContact;
}
