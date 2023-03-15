module.exports = (sequelize, DataType) => {
  const ProjectComponent = sequelize.define('project_proposed_action', {
    project_component_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    project_id: {
      type: DataType.INTEGER,
    },
    component_id: {
      type: DataType.INTEGER
    }
  });
  return ProjectComponent;
}
