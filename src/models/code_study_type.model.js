export default (sequelize, DataType) => {
  const CodeStudyType = sequelize.define('code_study_type', {
    study_type_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    study_type_name: {
      type: DataType.STRING,
      allowNull: false
    },
    study_type_desc: {
      type: DataType.STRING,
    },
  }, {
    tableName: 'code_study_type',
    timestamps: false,
    createdAt: false,
    updatedAt: false,
  });
  return CodeStudyType;
}
