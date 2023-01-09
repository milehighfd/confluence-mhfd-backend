export default (sequelize, DataType) => {
  const CodeMaintenanceEligibilityType = sequelize.define('code_maintenance_eligibility_type', {
    code_maintenance_eligibility_type_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    eligibility_type_name: {
      type: DataType.STRING,
      allowNull: false
    },
  }, {
    freezeTableName: true,
    tableName: 'code_maintenance_eligibility_type',
    createdAt: false,
    updatedAt: false
  });
  return CodeMaintenanceEligibilityType;
}
