
export default (sequelize, DataType) => {
  const Notifications = sequelize.define('notification', {
    notification_id: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    recipient_user_id: {
      type: DataType.INTEGER,
    },
    subject: {
      type: DataType.STRING,
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
    code_notification_type_id: {
      type: DataType.INTEGER,
    }
  }, {
    freezeTableName: true,
    tableName: 'notification',
    createdAt: false,
    updatedAt: false
  }
    );
  return Notifications;
}
