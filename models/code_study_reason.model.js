const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const config = require('../config/config');
const crypto = require('crypto');
const logger = require('../config/logger');
const { Op } = require("sequelize");

module.exports = (sequelize, DataType) => {
  const CodeStudyReason = sequelize.define('code_study_reason', {
    code_study_reason_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    reason_name: {
      type: DataType.STRING,
      allowNull: false,
    },
  });
  return CodeStudyReason;
}
