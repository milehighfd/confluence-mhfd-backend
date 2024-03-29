export default (sequelize, DataType) => {
  const ProjectStream = sequelize.define('project_stream', {
    project_stream_id: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    project_id: {
      type: DataType.INTEGER,
      allowNull: false
    },
    stream_id: {
      type: DataType.INTEGER,
      allowNull: false
    },
    code_local_government_id: {
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
  }, {
    freezeTableName: true,
    tableName: 'project_stream',
    createdAt: false,
    updatedAt: false
  }
    );
  return ProjectStream;
}
