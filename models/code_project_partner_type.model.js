const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const config = require('../config/config');
const crypto = require('crypto');
const logger = require('../config/logger');
const { Op } = require("sequelize");

module.exports = (sequelize, DataType) => {
  const CodeProjectPartnerType = sequelize.define('code_project_partner_type', {
    code_project_partner_type_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    partner_type_name: {
      type: DataType.STRING,
      allowNull: false,
    },
  });
  return CodeProjectPartnerType;
}
