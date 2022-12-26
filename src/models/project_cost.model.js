export default (sequelize, DataType) => {
  const ProjectCost = sequelize.define('project_cost', {
    project_cost_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    project_id: {
      type: DataType.INTEGER,
    },
    cost: {
      type: DataType.FLOAT,
    },
    code_cost_type_id: {
      type: DataType.INTEGER
    },
    cost_description: { 
      type: DataType.STRING,
      allowNull: true,
    },
    created_by: {
      type: DataType.STRING,
    },
    modified_by: {
      type: DataType.STRING,
    },
    created: {
      type: DataType.DATE
    },
    last_modified: {
      type: DataType.DATE
    }  
  }, {
    freezeTableName: true,
    tableName: 'project_cost',
    createdAt: false,
    updatedAt: false
  });
  return ProjectCost;
}
