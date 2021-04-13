module.exports = (sequelize, DataType) => {
  const boardLocality = sequelize.define('boardLocality', {
    fromLocality: {
      type: DataType.STRING,
    },
    toLocality: {
      type: DataType.STRING,
    },
    type: {
      type: DataType.ENUM,
      values: ['COUNTY_WORK_PLAN', 'SERVICE_AREA_WORK_PLAN']
    },
  });
  return boardLocality;
}
