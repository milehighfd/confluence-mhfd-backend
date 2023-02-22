
export default (sequelize, DataType) => {
  const ProjectStudy = sequelize.define('project_study', {
    project_study_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    project_id: {
      type: DataType.INTEGER
    },
    study_id: {
      type: DataType.INTEGER
    },
    last_updated_date: {
      type: DataType.DATE
    },
    last_update_user: {
      type: DataType.STRING
    }
  }, {
    freezeTableName: true,
    tableName: 'project_study'
  });

  return ProjectStudy;
}
