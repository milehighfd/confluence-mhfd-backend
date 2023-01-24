export default (sequelize, DataType) => {
  const ProjectStream = sequelize.define('project_stream', {
    project_stream_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    project_id: {
      type: DataType.INTEGER,
      allowNull: false
    },
    stream_id: {
      type: DataType.INTEGER,
      allowNull: false
    },
    local_government_id: {
      type: DataType.INTEGER,
      allowNull: false
    },
    length_in_mile: {
      type: DataType.FLOAT,
      allowNull: false
    },
    drainage_area_in_sq_miles: {
      type: DataType.FLOAT,
      allowNull: false
    },
    mhfd_stream_object_id_DNU: {
      type: DataType.INTEGER,
      allowNull: false
    },
  }, {
    freezeTableName: true,
    tableName: 'project_stream',
    createdAt: false,
    updatedAt: false
  }
    );
  return ProjectStream;
}
