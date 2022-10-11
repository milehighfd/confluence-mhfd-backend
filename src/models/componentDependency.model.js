
export default (sequelize, DataType) => {
  const ComponentDependency = sequelize.define('componentdependecy', {
    objectid: {
      type: DataType.INTEGER,
    },
    problem_id: {
      type: DataType.INTEGER,
    },
    component_id: {
      type: DataType.INTEGER
    },
    globalid: {
      type: DataType.STRING
    },
    created_user: {
      type: DataType.STRING
    },
    created_date: {
      type: DataType.STRING
    },
    last_edited_user: {
      type: DataType.STRING
    },
    last_edited_date: {
      type: DataType.STRING
    },
    gdb_from_date: {
      type: DataType.STRING
    },
    gdb_is_delete: {
      type: DataType.STRING
    },
    gdb_branch_id: {
      type: DataType.STRING
    },
    gdb_deleted_at: {
      type: DataType.STRING
    },
    gdb_deleted_by: {
      type: DataType.STRING
    },
  }, {
    tableName: 'component_dependency'
  });

  return ComponentDependency;
}

