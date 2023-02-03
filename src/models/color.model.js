
export default (sequelize, DataType) => {
  const ColorNotes = sequelize.define('colors', {
    _id_DNU: {
      type: DataType.UUID,
      defaultValue: DataType.UUIDV4,      
    },
    color_id: {
      type: DataType.INTEGER,
      allowNull: false,
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
      type: DataType.INTEGER,
      allowNull: false
    },
  }, {
    freezeTableName: true,
    tableName: 'colors',
    createdAt: false,
    updatedAt: false
  });

  return ColorNotes;
}

