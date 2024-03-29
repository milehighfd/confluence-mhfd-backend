export default (sequelize, DataType) => {
  const Project = sequelize.define('project', {
    project_id: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    project_name: {
      type: DataType.STRING,
    },
    project_alias : {
      type: DataType.STRING,
    },
    description: {
      type: DataType.STRING,
    },
    onbase_project_number: {
      type: DataType.INTEGER,
    },
    location: {
      type: DataType.STRING,
    },
    code_project_type_id: {
      type: DataType.INTEGER,
    },
    start_date: {
      type: DataType.DATE,
    },
    staff_lead_email: {
      type: DataType.STRING,
    },
    current_project_status_id: {
      type: DataType.INTEGER,
    },
    code_maintenance_eligibility_type_id: {
      type: DataType.INTEGER,
    },
    cover_image_project_attachment_id: {
      type: DataType.INTEGER,
    },
    parent_project_id: {
      type: DataType.INTEGER,
    },
    is_spatial_data_required: {
      type: DataType.INTEGER,
    },
    created_date: {
      type: DataType.DATE,
    },
    modified_date: {
      type: DataType.DATE,
    },
    last_modified_by: {
      type: DataType.STRING,
    },
    created_by: {
      type: DataType.STRING,
    }
  }, {
    tableName: 'project',
    timestamps: false,
    createdAt: false,
    updatedAt: false,
  });
  Project.removeAttribute('id');

  return Project;
}
