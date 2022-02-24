
module.exports = (sequelize, DataType) => {
  const GroupNotes = sequelize.define('groupnote', {
    _id: {
      type: DataType.UUID,
      defaultValue: DataType.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataType.STRING
    },
    user_id: {
      type: DataType.UUID
    }
  });

  return GroupNotes;
}
