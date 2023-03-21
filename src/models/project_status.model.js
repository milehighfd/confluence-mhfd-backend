export default (sequelize, DataType) => {
  const ProjectStatus = sequelize.define('project_status', {
    project_status_id: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    code_phase_type_id: {
      type: DataType.INTEGER,
      allowNull: false
    },
    project_id: {
      type: DataType.INTEGER,
      allowNull: false,
    },
    phase_change_date: {
      type: DataType.DATE
    },
    planned_start_date: {
      type: DataType.DATE
    },
    actual_start_date: {
      type: DataType.DATE
    },
    planned_end_date: {
      type: DataType.DATE
    },
    actual_end_date: {
      type: DataType.DATE
    },
    duration: {
      type: DataType.INTEGER,
    },
    created_date: {
      type: DataType.DATE
    },
    modified_date: {
      type: DataType.DATE
    },
    last_modified_by: {
      type: DataType.STRING
    },
    created_by: {
      type: DataType.STRING
    },
    comment: {
      type: DataType.STRING
    }  
  }, {
    tableName: 'project_status',
    timestamps: false,
    createdAt: false,
    updatedAt: false,
  });
  return ProjectStatus;
}
