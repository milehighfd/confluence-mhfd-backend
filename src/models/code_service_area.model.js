export default  (sequelize, DataType) => {
  const CodeServiceArea = sequelize.define('code_service_area', {
    code_service_area_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    service_area_name: {
      type: DataType.STRING,
      allowNull: false
    }
  });
  return CodeServiceArea;
}
