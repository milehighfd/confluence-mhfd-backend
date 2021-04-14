
module.exports = (sequelize, DataType) => {
  const Note = sequelize.define('note', {
    _id: {
      type: DataType.UUID,
      defaultValue: DataType.UUIDV4,
      primaryKey: true
    },
    content: {
      type: DataType.STRING
    },
    latitude: {
      type: DataType.FLOAT
    },
    longitude: {
      type: DataType.FLOAT
    },
    color: {
      type: DataType.STRING
    },
    user_id: {
      type: DataType.UUID,
      allowNull: false
    }
  });

  return Note;
}
