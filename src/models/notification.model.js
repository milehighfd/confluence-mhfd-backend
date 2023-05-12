
export default (sequelize, DataType) => {
  const Notifications = sequelize.define('notification', {
    notification_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    recipient_user_id: {
      type: DataType.INTEGER,
    },
    message:{
      type: DataType.STRING,
    },
    notification_date: {
      type: DataType.DATE,
      defaultValue: DataType.NOW
    },
    project_id: {
      type: DataType.INTEGER,
    },
    created_date: {
      type: DataType.DATE,
      defaultValue: DataType.NOW
    },
    modified_date: {
      type: DataType.DATE,
      defaultValue: DataType.NOW
    },
    last_modified_by: {
      type: DataType.STRING,
    },
    created_by: {
      type: DataType.STRING
    },
    is_read: {
      type: DataType.BOOLEAN
    },
  }, {
    freezeTableName: true,
    tableName: 'notification',
    createdAt: false,
    updatedAt: false
  }
    );
  return Notifications;
}
