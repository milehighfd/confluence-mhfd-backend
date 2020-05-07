module.exports = (sequelize, DataType) => {
  const Task = sequelize.define('task', {
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