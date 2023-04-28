export default (sequelize, DataType) => {
  const ProjectCost = sequelize.define('project_cost', {
    project_cost_id: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
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
      type: DataType.DATE,
      defaultValue: DataType.NOW
    },
    last_modified: {
      type: DataType.DATE,
      defaultValue: DataType.NOW
    },
    agreement_number: {
      type: DataType.STRING
    },
    amendment_number: {
      type: DataType.STRING
    },
    is_active: {
      type: DataType.BOOLEAN
    }
  }, {
    freezeTableName: true,
    tableName: 'project_cost',
    createdAt: false,
    updatedAt: false
  });
  return ProjectCost;
}
