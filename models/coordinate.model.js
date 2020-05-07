module.exports = (sequelize, DataType) => {
  const Coordinate = sequelize.define('coordinate', {
    name: {
      type: DataType.STRING
    },
    projectId: {
      type: DataType.UUID,
      allowNull: false
    }
  });
  return Coordinate;
}