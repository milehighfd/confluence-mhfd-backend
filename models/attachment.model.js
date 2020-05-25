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
    filename: {
      type: DataType.STRING
    },
    mimetype: {
      type: DataType.STRING
    },
    user_id: {
      type: DataType.UUID,
      allowNull: false
    },
    register_date: {
      type: DataType.DATE
    },
    filesize: {
      type: DataType.FLOAT
    },
    project_id: {
      type: DataType.UUID,
      allowNull: true
    }
  });
  return Attachment;
}