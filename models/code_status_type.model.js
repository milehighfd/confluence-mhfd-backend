const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const config = require('../config/config');
const crypto = require('crypto');
const logger = require('../config/logger');
const { Op } = require("sequelize");

module.exports = (sequelize, DataType) => {
  const CodeStatusType = sequelize.define('code_status_type', {
    code_status_type_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    status_name: {
      type: DataType.STRING,
      allowNull: false
    },
  });
  return CodeStatusType;
}
