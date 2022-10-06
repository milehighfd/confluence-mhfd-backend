const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const config = require('../config/config');
const crypto = require('crypto');
const logger = require('../config/logger');
const { Op } = require("sequelize");

module.exports = (sequelize, DataType) => {
  const CodeCostType = sequelize.define('code_cost_type', {
    code_cost_type: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    cost_type_name: {
      type: DataType.STRING,
    },
    created_by: {
      type: DataType.STRING,
    },
    modified_by: {
      type: DataType.INTEGER
    },last_modified: {
      type: DataType.DATE
    },  
  });
  return CodeCostType;
}
