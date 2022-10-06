const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const config = require('../config/config');
const crypto = require('crypto');
const logger = require('../config/logger');
const { Op } = require("sequelize");

module.exports = (sequelize, DataType) => {
  const CodeAcquisitionProgressStatus = sequelize.define('code_acquisition_progress_status', {
    code_acquisition_progress_status_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    acquisition_progress_status_name: {
      type: DataType.STRING,
      allowNull: false
    },
  });
  return CodeAcquisitionProgressStatus;
}
