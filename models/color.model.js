
module.exports = (sequelize, DataType) => {
  const ColorNotes = sequelize.define('color', {
    _id: {
      type: DataType.UUID,
      defaultValue: DataType.UUIDV4,
      primaryKey: true
    },
    label: {
      type: DataType.TEXT
    },
    color: {
      type: DataType.STRING
    },
    opacity: {
      type: DataType.FLOAT
    },
    user_id: {
      type: DataType.UUID,
      allowNull: false
    },
  });

  return ColorNotes;
}

