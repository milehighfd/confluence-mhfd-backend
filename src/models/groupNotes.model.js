
export default (sequelize, DataType) => {
  const GroupNotes = sequelize.define('groupnotes', {    
    group_notes_name: {
      type: DataType.STRING
    },
    groupnotes_id: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    position: {
      type: DataType.INTEGER
    },
    user_id: {
      type: DataType.INTEGER
    }
  }, {
    freezeTableName: true,
    tableName: 'groupnotes',
    createdAt: false,
    updatedAt: false
  });

  return GroupNotes;
}
