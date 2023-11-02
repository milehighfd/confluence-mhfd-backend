
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
    },
    is_deleted: {
      type: DataType.INTEGER
    },
    created_by: {
      type: DataType.STRING
    },
    last_modified_by: {
      type: DataType.STRING
    }
  }, {
    freezeTableName: true,
    tableName: 'groupnotes',
    createdAt: false,
    updatedAt: false
  });

  return GroupNotes;
}
