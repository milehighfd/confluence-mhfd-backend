const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const config = require('../config/config');
const crypto = require('crypto');
const logger = require('../config/logger');
const { Op } = require("sequelize");

module.exports = (sequelize, DataType) => {
  const ProjectStatus = sequelize.define('project_status', {
    project_status_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    code_phase_type_id: {
      type: DataType.INTEGER,
      allowNull: false
    },
    project_id: {
      type: DataType.INTEGER,
      allowNull: false,
    }, 
    status_change_date: {
      type: DataType.DATE,
      allowNull: false,
    },
    create_date: {
      type: DataType.DATE,
      allowNull: false,
    },
    modified_date: {
      type: DataType.DATE,
      allowNull: false,
    },
    las_modified_by: {
      type: DataType.STRING,
      allowNull: false,
    },
    created_by: {
      type: DataType.STRING,
      allowNull: false
    }  
  });
  return ProjectStatus;
}