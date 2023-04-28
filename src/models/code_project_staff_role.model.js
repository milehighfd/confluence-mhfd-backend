export default  (sequelize, DataType) => {
    const CodeProjectStaffRole = sequelize.define('code_project_staff_role_type', {
      code_project_staff_role_type_id: {
        type: DataType.INTEGER,
        primaryKey: true
      },
      project_staff_role_type_name: {
        type: DataType.STRING,
        allowNull: false,
      },
    }, {
      freezeTableName: true,
      tableName: 'code_project_staff_role_type',
      createdAt: false,
      updatedAt: false
    });
    return CodeProjectStaffRole;
  }
  