const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const config = require('../config/config');
const crypto = require('crypto');
const logger = require('../config/logger');
const { Op } = require("sequelize");

module.exports = (sequelize, DataType) => {
  const LocalGovernment = sequelize.define('local_government', {
    local_government_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    local_government_name: {
      type: DataType.STRING,
      allowNull: false
    }
  });
  return LocalGovernment;
}
