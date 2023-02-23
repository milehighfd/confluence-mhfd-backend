export default (sequelize, DataType) => {
  const CodeStudySubReason = sequelize.define('code_study_sub_reason', {
    code_study_sub_reason_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    code_study_reason_id: {
      type: DataType.INTEGER,
      allowNull: false
    },
    sub_reason_name: {
      type: DataType.STRING,
      allowNull: false,
    },
  }, {
    freezeTableName: true,
    tableName: 'code_study_sub_reason',
    createdAt: false,
    updatedAt: false
  });
  return CodeStudySubReason;
}
