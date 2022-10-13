const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const config = require('../config/config');
const crypto = require('crypto');
const logger = require('../config/logger');
const { Op } = require("sequelize");

module.exports = (sequelize, DataType) => {
  const CodeProjectType = sequelize.define('code_project_type', {
    code_project_type_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    project_type_name: {
      type: DataType.STRING,
      allowNull: true
    },
    project_short_name: {
      type: DataType.STRING
    }
  });
  return CodeProjectType;
}
