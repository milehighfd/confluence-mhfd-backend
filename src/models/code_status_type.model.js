export default (sequelize, DataType) => {
  const CodeStatusType = sequelize.define('code_status_type', {
    code_status_type_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    status_name: {
      type: DataType.STRING,
      allowNull: false
    },
  });
  return CodeStatusType;
}
