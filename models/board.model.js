module.exports = (sequelize, DataType) => {
  const board = sequelize.define('board', {
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
    },
    reqmanager1: {
      type: DataType.DOUBLE,
    },
    reqmanager2: {
      type: DataType.DOUBLE,
    },
    reqmanager3: {
      type: DataType.DOUBLE,
    },
    reqmanager4: {
      type: DataType.DOUBLE,
    },
    reqmanager5: {
      type: DataType.DOUBLE,
    },
    status: {
      type: DataType.STRING,
    },
    comment: {
      type: DataType.STRING,
    },
  });
  return board;
}