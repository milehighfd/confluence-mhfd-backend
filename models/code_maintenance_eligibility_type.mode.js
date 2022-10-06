const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const config = require('../config/config');
const crypto = require('crypto');
const logger = require('../config/logger');
const { Op } = require("sequelize");

module.exports = (sequelize, DataType) => {
  const CodeMaintenanceEligibilityType = sequelize.define('code_maintenance_eligibility_type', {
    code_maintenance_eligibility_type_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    eligibility_type_name: {
      type: DataType.STRING,
      allowNull: false
    },
  });
  return CodeMaintenanceEligibilityType;
}
