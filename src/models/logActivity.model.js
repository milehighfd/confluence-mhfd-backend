
export default (sequelize, DataType) => {
  const LogActivity = sequelize.define('log_activity', {    
    registerDate: {
      type: DataType.DATE
    },
    user_id: {
      type: DataType.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    activityType: {
      type: DataType.ENUM,
      values: ['user_login']
    }
  });

  return LogActivity;
}
