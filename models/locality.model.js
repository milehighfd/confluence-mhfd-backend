module.exports = (sequelize, DataType) => {
  const Locality = sequelize.define('locality', {
    name: {
      type: DataType.STRING,
      allowNull: false
    },
    type: {
      type: DataType.ENUM,
      values: ['JURISDICTION', 'COUNTY_OR_SERVICE_AREA']
    }
  });
  return Locality;
}
