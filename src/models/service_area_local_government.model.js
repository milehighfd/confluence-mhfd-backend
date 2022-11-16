export default  (sequelize, DataType) => {
  const serviceAreaLocalGovernment = sequelize.define('SERVICE_AREA_LOCAL_GOVERNMENT', {
    objectid: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    shape: {
      type: DataType.GEOMETRY
    },
    gdb_geomattr_data: {
      type: DataType.GEOMETRY
    },
    service_area_local_government_id: {
      type: DataType.INTEGER
    },
    code_local_government_id: {
      type: DataType.INTEGER
    },
    code_service_area_id: {
      type: DataType.INTEGER,
    },
    area_in_service_area_sqmi: {
      type: DataType.DOUBLE
    },
    area_in_service_area_acres: {
      type: DataType.DOUBLE
    },
    percent_in_service_area: {
      type: DataType.DOUBLE
    },
    primary_contact: {
      type: DataType.INTEGER
    }
  }, {
    freezeTableName: true,
    tableName: 'SERVICE_AREA_LOCAL_GOVERNMENT',
    createdAt: false,
    updatedAt: false
  });
  return serviceAreaLocalGovernment;
}