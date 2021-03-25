module.exports = (sequelize, DataType) => {
  const WorkRequest = sequelize.define('boardProject', {
    board_id: {
      type: DataType.UUID,
      defaultValue: DataType.UUIDV4,
    },
    project_id: {
      type: DataType.STRING,
    },
    column: {
      type: DataType.INTEGER
    },
    position: {
      type: DataType.INTEGER
    },
  });
  return WorkRequest;
}