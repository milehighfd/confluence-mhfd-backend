export default (sequelize, DataType) => {
  const ProjectLocalGovernment = sequelize.define('project_local_government', {
    project_local_government_id: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    code_local_government_id: {
      type: DataType.INTEGER,
      allowNull: false
    },
    project_id: {
      type: DataType.INTEGER,
      allowNull: false
    }
  }, {
    freezeTableName: true,
    tableName: 'project_local_government',
    createdAt: false,
    updatedAt: false
  }
    );
  return ProjectLocalGovernment;
}
