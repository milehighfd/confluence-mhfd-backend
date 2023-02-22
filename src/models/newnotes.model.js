
export default (sequelize, DataType) => {
  const NewNotes = sequelize.define('newnotes', {
    newnotes_id: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    note_text: {
      type: DataType.TEXT
    },
    latitude: {
      type: DataType.FLOAT
    },
    longitude: {
      type: DataType.FLOAT
    },
    color_id: {
      type: DataType.UUID
    },
    user_id: {
      type: DataType.INTEGER,
      allowNull: false
    },
    position: {
      type: DataType.INTEGER
    },
    groupnotes_id: {
      type: DataType.INTEGER
    }
  }, {
    freezeTableName: true,
    tableName: 'newnotes',
    createdAt: false,
    updatedAt: false
  });

  return NewNotes;
}

