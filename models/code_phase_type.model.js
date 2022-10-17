const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const config = require('../config/config');
const crypto = require('crypto');
const logger = require('../config/logger');
const { Op } = require("sequelize");

module.exports = (sequelize, DataType) => {
  const CodePhaseType = sequelize.define('code_phase_type', {
    code_phase_type_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    phase_name: {
      type: DataType.STRING,
      allowNull: true
    },
    code_status_type_id: {
      type: DataType.INTEGER,
      allowNull: false
    },
    code_project_type_id: {
      type: DataType.INTEGER,
      allowNull: false
    }
  });
  return CodePhaseType;
}