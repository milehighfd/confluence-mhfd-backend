export default  (sequelize, DataType) => {
  const ProjectStaff = sequelize.define('project_staff', {
    project_staff_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    project_id: {
      type: DataType.INTEGER
    },
    project_staff_email_do_not_use: {
      type: DataType.STRING
    },
    project_staff_name_do_not_use: {
      type: DataType.STRING
    },
    mhfd_staff_id: {
      type: DataType.INTEGER
    },
    code_project_staff_role_type_id: {
      type: DataType.INTEGER
    },
    is_active: {
      type: DataType.INTEGER
    }
  }, {
    freezeTableName: true,
    tableName: 'project_staff',
    createdAt: false,
    updatedAt: false
  });
  return ProjectStaff;
}
