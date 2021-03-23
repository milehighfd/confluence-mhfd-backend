module.exports = (sequelize, DataType) => {
  const WorkRequest = sequelize.define('workRequest', {
    _id: {
      type: DataType.UUID,
      defaultValue: DataType.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataType.STRING,
      allowNull: false
    },
    type: {
      type: DataType.ENUM,
      values: ['JURISDICTION', 'COUNTY_OR_SERVICE_AREA']
    }
  });
  return WorkRequest;
}
