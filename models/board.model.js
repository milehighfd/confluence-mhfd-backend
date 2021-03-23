module.exports = (sequelize, DataType) => {
  const WorkRequest = sequelize.define('board', {
    _id: {
      type: DataType.UUID,
      defaultValue: DataType.UUIDV4,
      primaryKey: true
    },
    locality_id: {
      type: DataType.STRING,
    },
    year: {
      type: DataType.STRING,
    },
    type: {
      type: DataType.ENUM,
      values: ['WORK_REQUEST', 'WORK_PLAN']
    }
  });
  return WorkRequest;
}