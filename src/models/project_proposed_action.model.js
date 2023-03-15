export default  (sequelize, DataType) => {
  const ProjectProposedAction = sequelize.define('project_proposed_action', {
    project_proposed_action_id: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    project_id: {
      type: DataType.INTEGER
    },
    object_id: {
      type: DataType.INTEGER
    },
    source_table_name: {
      type: DataType.STRING
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
    tableName: 'project_proposed_action',
    createdAt: false,
    updatedAt: false
  });
  return ProjectProposedAction;
}
