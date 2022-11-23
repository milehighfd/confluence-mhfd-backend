export default  (sequelize, DataType) => {
  const CodeServiceArea = sequelize.define('CODE_SERVICE_AREA', {
    code_service_area_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    service_area_name: {
      type: DataType.STRING,
      allowNull: false
    },
    Shape: {
      type: DataType.GEOMETRY
    },
    cities: {
      type: DataType.STRING,
    },
    watershed_manager: {
      type: DataType.STRING
    }
  }, {
    freezeTableName: true,
    tableName: 'CODE_SERVICE_AREA_4326',
    createdAt: false,
    updatedAt: false
  });
  return CodeServiceArea;
}
