export default  (sequelize, DataType) => {
  const ProjectIndependentAction = sequelize.define('independent_action', {
    independent_action_id: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    project_id: {
      type: DataType.INTEGER
    },
    action_name: {
      type: DataType.STRING
    },
    cost: {
      type: DataType.INTEGER
    },
    action_status: {
      type: DataType.STRING,
    },
    created_date: {
      type: DataType.DATE,
      defaultValue: DataType.NOW
    },
    modified_date: {
      type: DataType.DATE,
      defaultValue: DataType.NOW
    },
    last_modified_by: {
      type: DataType.STRING
    },
    created_by: {
      type: DataType.STRING
    }
  }, {
    freezeTableName: true,
    tableName: 'independent_action',
    createdAt: false,
    updatedAt: false
  });
  return ProjectIndependentAction;
}
