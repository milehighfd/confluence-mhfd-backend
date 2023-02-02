
export default (sequelize, DataType) => {
  const LogActivity = sequelize.define('log_activity', {
    _id: {
      type: DataType.UUID,
      defaultValue: DataType.UUIDV4,
      primaryKey: true
    },
    registerDate: {
      type: DataType.DATE
    },
    user_id: {
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
