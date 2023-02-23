export default (sequelize, DataType) => {
  const streamStudy = sequelize.define('stream_study', {
    stream_study_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    stream_id: {
      type: DataType.INTEGER,
      allowNull: false
    },
    study_id: {
      type: DataType.INTEGER,
      allowNull: false,
    },
  }, {
    freezeTableName: true,
    tableName: 'stream_study',
    createdAt: false,
    updatedAt: false
  });
  return streamStudy;
}
