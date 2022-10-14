export default (sequelize, DataType) => {
  const ProjectLocalGovernment = sequelize.define('project_local_government', {
    project_local_government_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    local_government_id: {
      type: DataType.INTEGER,
      allowNull: false
    },
    project_id: {
      type: DataType.INTEGER,
      allowNull: false
    }
  }
    );
  return ProjectLocalGovernment;
}
