export default (sequelize, DataType) => {
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
    staff: {
      type: DataType.STRING,
    },
    email: {
      type: DataType.STRING,
    }
  },{
    freezeTableName: true,
    tableName: 'boardLocalities'
  });
  return boardLocality;
}
