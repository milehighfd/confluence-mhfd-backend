export default (sequelize, DataType) => {
  const ProjectSpatial = sequelize.define('PROJECT_SPATIAL_4326', {
    OBJECTID: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    project_id: {
      type: DataType.INTEGER,
      allowNull: false
    },
    Editor: {
      type: DataType.STRING
    },
  }, {
    freezeTableName: true,
    tableName: 'PROJECT_SPATIAL_4326',
    createdAt: false,
    updatedAt: false
  });
  return ProjectSpatial;
}
