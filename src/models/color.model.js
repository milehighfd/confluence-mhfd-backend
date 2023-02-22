
export default (sequelize, DataType) => {
  const ColorNotes = sequelize.define('colors', {    
    color_id: {
      type: DataType.INTEGER,
      allowNull: false,
      autoIncrement: true,
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

