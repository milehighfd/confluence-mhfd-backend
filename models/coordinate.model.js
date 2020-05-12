module.exports = (sequelize, DataType) => {
  const Coordinate = sequelize.define('coordinate', {
    _id: {
      type: DataType.UUID,
      defaultValue: DataType.UUIDV4,
      primaryKey: true
    },
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