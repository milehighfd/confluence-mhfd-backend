const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const config = require('../config/config');
const crypto = require('crypto');
const logger = require('../config/logger');
const { Op } = require("sequelize");

module.exports = (sequelize, DataType) => {
  const ProjectStatusActionItemTracking = sequelize.define('project_status_action_item_tracking', {
    project_status_action_item_tracking_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    project_status_id: {
      type: DataType.INTEGER,
    },
    code_rule_action_id: {
      type: DataType.INTEGER,
      allowNull: true
    }
  });
  return ProjectStatusActionItemTracking;
}
