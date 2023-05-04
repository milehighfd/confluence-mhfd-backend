export default  (sequelize, DataType) => {
  const StateCounty = sequelize.define('CODE_STATE_COUNTY', {
    objectid: {
      type: DataType.INTEGER,
    },
    state_county_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    state_id: {
      type: DataType.INTEGER
    },
    fema_dfirm_id: {
      type: DataType.STRING
    },
    census_geoid: {
      type: DataType.STRING
    },
    county_name: {
      type: DataType.STRING
    }
  }, {
    freezeTableName: true,
    tableName: 'CODE_STATE_COUNTY_CLIP_4326',
    createdAt: false,
    updatedAt: false
  });
  return StateCounty;
}
