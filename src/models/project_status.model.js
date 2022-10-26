export default (sequelize, DataType) => {
  const ProjectStatus = sequelize.define('project_status', {
    project_status_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    code_phase_type_id: {
      type: DataType.INTEGER,
      allowNull: false
    },
    project_id: {
      type: DataType.INTEGER,
      allowNull: false,
    }, 
    status_change_date: {
      type: DataType.DATE,
      allowNull: false,
    },
    created_date: {
      type: DataType.DATE,
      allowNull: false,
    },
    modified_date: {
      type: DataType.DATE,
      allowNull: false,
    },
    last_modified_by: {
      type: DataType.STRING,
      allowNull: false,
    },
    created_by: {
      type: DataType.STRING,
      allowNull: false
    }  
  }, {
    tableName: 'project_status',
    timestamps: false,
    createdAt: false,
    updatedAt: false,
  });
  return ProjectStatus;
}
