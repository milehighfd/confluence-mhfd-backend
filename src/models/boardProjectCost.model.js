export default (sequelize, DataType) => {
  const boardProjectCost = sequelize.define('board_project_cost', {
    board_project_cost_id: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    board_project_id: {
      type: DataType.INTEGER
    },
    project_cost_id: {
      type: DataType.INTEGER
    },
    req_position: {
      type: DataType.INTEGER
    },
    createdAt: {
      type: DataType.DATE,
      defaultValue: DataType.NOW
    },
    updatedAt: {
      type: DataType.DATE,
      defaultValue: DataType.NOW
    },
    last_modified_by: {
      type: DataType.STRING
    },
    created_by: {
      type: DataType.STRING
    },
    sort_order: {
      type: DataType.INTEGER
    }
  }, {
    freezeTableName: true,
    tableName: 'board_project_cost',
    hasTrigger: true
  });
  return boardProjectCost
}