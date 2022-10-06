const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const config = require('../config/config');
const crypto = require('crypto');
const logger = require('../config/logger');
const { Op } = require("sequelize");

module.exports = (sequelize, DataType) => {
  const ProjectCost = sequelize.define('project_cost', {
    project_cost_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    project_id: {
      type: DataType.INTEGER,
    },
    cost: {
      type: DataType.FLOAT,
    },
    code_cost_type: {
      type: DataType.INTEGER
    },
    cost_description: { 
      type: DataType.STRING,
      allowNull: true,
    },
    created_by: {
      type: DataType.STRING,
    },
    modified_by: {
      type: DataType.STRING,
    },
    created: {
      type: DataType.DATE
    },
    last_modified: {
      type: DataType.DATE
    }  
  });
  return ProjectCost;
}
