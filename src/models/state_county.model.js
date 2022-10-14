export default (sequelize, DataType) => {
  const StateCounty = sequelize.define('state_county', {
    state_county_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    state_id: {
      type: DataType.INTEGER,
      allowNull: false
    },
    county_code: {
      type: DataType.STRING,
      allowNull: false
    },
    county_name: {
      type: DataType.STRING,
      allowNull: false
    }
  });
  return StateCounty;
}
