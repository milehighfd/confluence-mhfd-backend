
export default (sequelize, DataType) => {
  const CodeNotificationType = sequelize.define('code_notification_type', {
    code_notification_type_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    notification_type_name: {
      type: DataType.STRING,
      allowNull: true
    },
    notification_type_description: {
      type: DataType.STRING,
      allowNull: true
    }
  }, {
    freezeTableName: true,
    tableName: 'code_notification_type',
    createdAt: false,
    updatedAt: false
  }
    );
  return CodeNotificationType;
}
