// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;
//const { ACTIVITY_TYPE } = require('../lib/enumConstants');
module.exports = (sequelize, DataType) => {
  const LogActivity = sequelize.define('log_activity', {
    registerDate: {
      type: DataType.DATE
    },
    userId: {
      type: DataType.INTEGER,
      allowNull: false
    },
    activityType: {
      type: DataType.ENUM,
      values: ['user_login']
    }
  });

  return LogActivity;
}
