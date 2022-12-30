export default (sequelize, DataType) => {
  const ProjectDetail = sequelize.define('project_detail', {
    project_detail_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    maintenance_frequency: {
      type: DataType.INTEGER,
      allowNull: false
    },
    is_public_ownership: {
      type: DataType.BOOLEAN,
      allowNull: false
    },
    code_maintenance_eligibility_type_id: {
      type: DataType.INTEGER,
      allowNull: false
    },
    project_id: {
      type: DataType.INTEGER,
      allowNull: false
    },
    code_study_sub_reason_id: {
      type: DataType.INTEGER,
      allowNull: true
    },
    acquisition_anticipated_year: {
      type: DataType.INTEGER,
      allowNull: true
    },
    code_acquisition_progress_status_id: {
      type: DataType.INTEGER,
      allowNull: true
    }
  }, {
    freezeTableName: true,
    tableName: 'project_detail',
    createdAt: false,
    updatedAt: false
  });
  return ProjectDetail;
}
