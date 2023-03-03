export default  (sequelize, DataType) => {
  const ProjectServiceArea = sequelize.define('project_service_area', {
    project_service_area_id: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoincrement: true
    },
    project_id: {
      type: DataType.INTEGER
    },
    code_service_area_id: {
      type: DataType.INTEGER
    },
    created_date: {
      type: DataType.DATE
    },
    modified_date: {
      type: DataType.DATE
    },
    last_modified_by: {
      type: DataType.STRING,
    },
    created_by: {
      type: DataType.STRING
    }
  }, {
    freezeTableName: true,
    tableName: 'project_service_area',
    createdAt: false,
    updatedAt: false
  });
  return ProjectServiceArea;
}
