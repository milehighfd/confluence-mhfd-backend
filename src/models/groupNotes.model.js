
export default (sequelize, DataType) => {
  const GroupNotes = sequelize.define('groupnotes', {
    _id_DNU: {
      type: DataType.UUID,
      defaultValue: DataType.UUIDV4,      
    },
    group_notes_name: {
      type: DataType.STRING
    },
    position: {
      type: DataType.INTEGER
    },
    user_id: {
      type: DataType.INTEGER,
      primaryKey: true
    }
  }, {
    freezeTableName: true,
    tableName: 'groupnotes',
    createdAt: false,
    updatedAt: false
  });

  return GroupNotes;
}
