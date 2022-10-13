const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const config = require('../config/config');
const crypto = require('crypto');
const logger = require('../config/logger');
const { Op } = require("sequelize");

module.exports = (sequelize, DataType) => {
  const ProjectComponent = sequelize.define('project_component', {
    project_component_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    project_id: {
      type: DataType.INTEGER,
    },
    component_id: {
      type: DataType.INTEGER
    }
  });
  return ProjectComponent;
}
