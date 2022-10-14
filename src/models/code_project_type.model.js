export default (sequelize, DataType) => {
  const CodeProjectType = sequelize.define('code_project_type', {
    code_project_type_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    project_type_name: {
      type: DataType.STRING,
      allowNull: true
    },
    project_short_name: {
      type: DataType.STRING
    }
  });
  return CodeProjectType;
}
