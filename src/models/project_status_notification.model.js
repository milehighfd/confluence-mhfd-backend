
export default (sequelize, DataType) => {
  const ProjectStatusNotification = sequelize.define('project_status_notification', {
    project_status_notification: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    project_status_id: {
      type: DataType.INTEGER,
    },
    notification_id: {
      type: DataType.INTEGER,
    },
    notification_type_name: {
      type: DataType.STRING,
    },
    created_date: {
      type: DataType.DATE,
      defaultValue: DataType.NOW
    },
    modified_date: {
      type: DataType.DATE,
      defaultValue: DataType.NOW
    },
    last_modified_date: {
      type: DataType.DATE,
    },
    created_by: {
      type: DataType.STRING
    },
  }, {
    freezeTableName: true,
    tableName: 'project_status_notification',
    createdAt: false,
    updatedAt: false
  }
    );
  return ProjectStatusNotification;
}
