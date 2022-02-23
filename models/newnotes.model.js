
module.exports = (sequelize, DataType) => {
  const NewNotes = sequelize.define('newnotes', {
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
    },
    position: {
      type: DataType.INTEGER
    },
    group_id: {
      type: DataType.UUID,
      allowNull: false
    }
  });

  return NewNotes;
}

