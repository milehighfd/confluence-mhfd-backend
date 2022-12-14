
export default (sequelize, DataType) => {
  const ProjectComponent = sequelize.define('project_component', {
    project_component_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    project_id: {
      type: DataType.INTEGER
    },
    component_id: {
      type: DataType.INTEGER
    },
    source_table_name: {
      type: DataType.STRING
    },
    component_name: {
      type: DataType.STRING
    },
    component_status: {
      type: DataType.STRING
    }
  }, {
    freezeTableName: true,
    tableName: 'project_component',
    createdAt: false,
    updatedAt: false
  });

  return ProjectComponent;
}