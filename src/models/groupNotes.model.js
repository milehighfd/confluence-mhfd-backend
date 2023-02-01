
export default (sequelize, DataType) => {
  const GroupNotes = sequelize.define('groupnote', {
    _id: {
      type: DataType.UUID,
      defaultValue: DataType.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataType.STRING
    },
    position: {
      type: DataType.INTEGER
    },
    user_id: {
      type: DataType.INTEGER
    }
  });

  return GroupNotes;
}
