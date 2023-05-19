export default (sequelize, DataType) => {
  const CodeCostType = sequelize.define('code_cost_type', {
    code_cost_type_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    cost_type_name: {
      type: DataType.STRING,
    },
    created_by: {
      type: DataType.STRING,
    },
    modified_by: {
      type: DataType.STRING
    },
    last_modified: {
      type: DataType.DATE
    },
    created: {
      type: DataType.DATE
    },
    is_income: {
      type: DataType.BOOLEAN
    },
    is_overhead: {
      type: DataType.BOOLEAN
    },
  }, {
    freezeTableName: true,
    tableName: 'code_cost_type',
    createdAt: false,
    updatedAt: false
  });
  return CodeCostType;
}
