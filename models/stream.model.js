const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const config = require('../config/config');
const crypto = require('crypto');
const logger = require('../config/logger');
const { Op } = require("sequelize");

module.exports = (sequelize, DataType) => {
  const Stream = sequelize.define('stream', {
    stream_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    stream_name: {
      type: DataType.STRING,
      allowNull: false
    },
    unique_mhfd_code: {
      type: DataType.STRING,
      allowNull: false
    },
    last_update_date: {
      type: DataType.DATE,
      allowNull: false
    },
    last_update_user: {
      type: DataType.STRING,
      allowNull: false
    },
    length_in_miles: {
      type: DataType.FLOAT,
      allowNull: false
    }
  }
    );
  return Stream;
}
