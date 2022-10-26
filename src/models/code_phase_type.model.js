export default  (sequelize, DataType) => {
  const CodePhaseType = sequelize.define('code_phase_type', {
    code_phase_type_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    phase_name: {
      type: DataType.STRING,
      allowNull: true
    },
    code_status_type_id: {
      type: DataType.INTEGER,
      allowNull: false
    },
    code_project_type_id: {
      type: DataType.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'code_phase_type',
    timestamps: false,
    createdAt: false,
    updatedAt: false,
  });
  return CodePhaseType;
}
