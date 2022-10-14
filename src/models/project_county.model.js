export default (sequelize, DataType) => {
  const ProjectCounty = sequelize.define('project_county', {
    project_county_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    state_county_id: {
      type: DataType.INTEGER,
      allowNull: false
    },
    project_id: {
      type: DataType.INTEGER,
      allowNull: false
    }
  });
  return ProjectCounty;
}
