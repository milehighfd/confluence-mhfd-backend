module.exports = (sequelize, DataType) => {
  const Attachment = sequelize.define('attachment', {
    _id: {
      type: DataType.UUID,
      defaultValue: DataType.UUIDV4,
      primaryKey: true
    },
    value: {
      type: DataType.STRING
    },
    project_id: {
      type: DataType.UUID,
      allowNull: false
    }
  });
  return Attachment;
}