
module.exports = (sequelize, DataType) => {
  const NewNotes = sequelize.define('notelist', {
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
    user_id: {
      type: DataType.UUID,
      allowNull: false
    },
  });

  return NewNotes;
}

