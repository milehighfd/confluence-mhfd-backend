export default (sequelize, DataType) => {
  const CodeAcquisitionProgressStatus = sequelize.define('code_acquisition_progress_status', {
    code_acquisition_progress_status_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    acquisition_progress_status_name: {
      type: DataType.STRING,
      allowNull: false
    },
  }, {
    freezeTableName: true,
    tableName: 'code_acquisition_progress_status',
    createdAt: false,
    updatedAt: false
  });
  return CodeAcquisitionProgressStatus;
}
