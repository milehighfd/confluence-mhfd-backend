export default (sequelize, DataType) => {
  const ProjectDetail = sequelize.define('project_detail', {
    project_detail_id: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    maintenance_frequency: {
      type: DataType.INTEGER,
      allowNull: false
    },
    is_public_ownership: {
      type: DataType.BOOLEAN,
      allowNull: false
    },
    project_id: {
      type: DataType.INTEGER,
      allowNull: false
    },
    acquisition_anticipated_year: {
      type: DataType.INTEGER,
      allowNull: true
    },
    code_acquisition_progress_status_id: {
      type: DataType.INTEGER,
      allowNull: true
    },
    comments: {
      type: DataType.STRING,
    }
  }, {
    freezeTableName: true,
    tableName: 'project_detail',
    createdAt: false,
    updatedAt: false
  });
  return ProjectDetail;
}
