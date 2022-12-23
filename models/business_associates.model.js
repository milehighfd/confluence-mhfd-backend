const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const config = require('../config/config');
const crypto = require('crypto');
const logger = require('../config/logger');
const { Op } = require("sequelize");

module.exports = (sequelize, DataType) => {
  const BusinessAssociates = sequelize.define('business_associates', {
    business_associates_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    business_associate_name: {
      type: DataType.STRING,
      allowNull: false
    },
    business_name: {
      type: DataType.STRING,
      allowNull: false
    },
    /*
    contact_name: {
      type: DataType.STRING,
      allowNull: false
    },
    address: {
      type: DataType.STRING,
      allowNull: false
    },
    city: {
      type: DataType.STRING,
      allowNull: false
    },
    state: {
      type: DataType.STRING,
      allowNull: false
    },
    zip: {
      type: DataType.STRING,
      allowNull: false
    },
    email_address: {
      type: DataType.STRING,
      allowNull: false
      
    },
    primary_business_associate_id: {
        type: DataType.INTEGER,
        allowNull: false
      },*/
    ba_tyler_id: {
      type: DataType.STRING,
    }
  }
    );
  return BusinessAssociates;
}
