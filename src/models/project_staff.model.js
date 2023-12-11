export default  (sequelize, DataType) => {
  const ProjectStaff = sequelize.define('project_staff', {
    project_staff_id: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    project_id: {
      type: DataType.INTEGER
    },
    code_project_staff_role_type_id: {
      type: DataType.INTEGER
    },
    business_associate_contact_id: {
      type: DataType.INTEGER
    },
    is_active: {
      type: DataType.INTEGER
    },
    effective_date: {
      type: DataType.DATE
    },
    last_modified_date: {
      type: DataType.DATE
    },
  }, {
    freezeTableName: true,
    tableName: 'project_staff',
    createdAt: false,
    updatedAt: false
  });
  return ProjectStaff;
}
