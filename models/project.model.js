const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const config = require('../config/config');
const crypto = require('crypto');
const logger = require('../config/logger');
const { Op } = require("sequelize");

module.exports = (sequelize, DataType) => {
  const Project = sequelize.define('user', {
    project_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    project_name: {
      type: DataType.STRING,
    },
    description: {
      type: DataType.STRING,
    },
    on_base_project_number: {
      type: DataType.INTEGER
    },
    location: {
      type: DataType.STRING
    },
    code_project_type_id: {
      type: DataType.TINY_INT
    },
    start_date: {
      type: DataType.DATE
    },
    code_service_area_id: {
      type: DataType.INTEGER
    },
    staff_lead_email: {
      type: DataType.STRING,
    },
    last_update_date: {
      type: DataType.DATE
    },
    last_update_user: {
      type: DataType.STRING,
    },
    current_project_status_id: {
      type: DataType.INTEGER
    },
    cover_image_project_attachment_id: {
      type: DataType.INTEGER
    }
  });
  return Project;
}
