const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const config = require('../config/config');
const crypto = require('crypto');
const logger = require('../config/logger');
const { Op } = require("sequelize");

module.exports = (sequelize, DataType) => {
  const ProjectStream = sequelize.define('project_stream', {
    project_stream_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    project_id: {
      type: DataType.INTEGER,
      allowNull: false
    },
    stream_id: {
      type: DataType.INTEGER,
      allowNull: false
    },
    local_government_id: {
      type: DataType.INTEGER,
      allowNull: false
    },
    length_in_miles: {
      type: DataType.FLOAT,
      allowNull: false
    },
    drainage_area_in_sq_miles: {
      type: DataType.FLOAT,
      allowNull: false
    }
  }
    );
  return ProjectStream;
}
