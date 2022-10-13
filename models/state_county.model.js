const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const config = require('../config/config');
const crypto = require('crypto');
const logger = require('../config/logger');
const { Op } = require("sequelize");

module.exports = (sequelize, DataType) => {
  const StateCounty = sequelize.define('state_county', {
    state_county_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    state_id: {
      type: DataType.INTEGER,
      allowNull: false
    },
    county_code: {
      type: DataType.STRING,
      allowNull: false
    },
    county_name: {
      type: DataType.STRING,
      allowNull: false
    }
  });
  return StateCounty;
}
