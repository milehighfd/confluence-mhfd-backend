export default (sequelize, DataType) => {
  const StreamSegment = sequelize.define('streamSegment', {
    stream_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    OBJECTID: {
      type: DataType.INTEGER,
      primaryKey: false
    },
    stream_name: {
      type: DataType.STRING,
      allowNull: false
    },
    mhfd_code_stream: {
      type: DataType.STRING,
      allowNull: false
    },
    mhfd_code_segment: {
      type: DataType.STRING,
      allowNull: false
    },
    slope_ft: {
      type: DataType.FLOAT,
      allowNull: false
    },
  }, {
    freezeTableName: true,
    tableName: 'STREAM_SEGMENT',
    createdAt: false,
    updatedAt: false  
  }
    );
  return StreamSegment;
}
