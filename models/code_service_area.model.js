const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const config = require('../config/config');
const crypto = require('crypto');
const logger = require('../config/logger');
const { Op } = require("sequelize");

module.exports = (sequelize, DataType) => {
  const CodeServiceArea = sequelize.define('code_service_area', {
    code_service_area_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    service_area_name: {
      type: DataType.STRING,
      allowNull: false
    }
  });
  return CodeServiceArea;
}
