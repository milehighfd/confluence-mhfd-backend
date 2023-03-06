export default (sequelize, DataType) => {
  const ProjectCounty = sequelize.define('project_county', {
    project_county_id: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoincrement: true
    },
    state_county_id: {
      type: DataType.INTEGER,
      allowNull: false
    },
    project_id: {
      type: DataType.INTEGER,
      allowNull: false
    },
    shape_length_ft: {
      type: DataType.FLOAT,
      allowNull: false
    }
  }, {
    freezeTableName: true,
    tableName: 'project_county',
    createdAt: false,
    updatedAt: false
  });
  return ProjectCounty;
}
