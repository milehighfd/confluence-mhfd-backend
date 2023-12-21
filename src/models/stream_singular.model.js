export default (sequelize, DataType) => {
  const StreamSingular = sequelize.define('stream', {
    OBJECTID: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    stream_id: {
      type: DataType.INTEGER,
      allowNull: true
    },
    stream_name: {
      type: DataType.STRING(100),
      allowNull: true
    },
    mhfd_code_stream: {
      type: DataType.STRING(512),
      allowNull: true
    }
  }, {
    freezeTableName: true,
    tableName: 'STREAM',
    timestamps: false
  });

  return StreamSingular;
};
