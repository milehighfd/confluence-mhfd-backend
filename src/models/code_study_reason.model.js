export default (sequelize, DataType) => {
  const CodeStudyReason = sequelize.define('code_study_reason', {
    code_study_reason_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    reason_name: {
      type: DataType.STRING,
      allowNull: false,
    },
  }, {
    freezeTableName: true,
    tableName: 'code_study_reason'
  });
  return CodeStudyReason;
}
