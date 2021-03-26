module.exports = (sequelize, DataType) => {
  const WorkRequest = sequelize.define('board', {
    _id: {
      type: DataType.UUID,
      defaultValue: DataType.UUIDV4,
      primaryKey: true
    },
    locality: {
      type: DataType.STRING,
    },
    year: {
      type: DataType.STRING,
    },
    projecttype: {
      type: DataType.ENUM,
      values: ['Capital', 'Study', 'Maintenance', 'Acquisition', 'Special']
    },
    type: {
      type: DataType.ENUM,
      values: ['WORK_REQUEST', 'WORK_PLAN']
    }
  });
  return WorkRequest;
}