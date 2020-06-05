module.exports = (sequelize, DataType) => {
  const Task = sequelize.define('task', {
    _id: {
      type: DataType.UUID,
      defaultValue: DataType.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataType.STRING
    },
    projectId: {
      type: DataType.UUID,
      allowNull: false
    }
  });
  return Task;
}