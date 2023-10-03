export default (sequelize, DataType) => {
  const BudgetBoardTable = sequelize.define('budget_board_table', {
    id: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    boards_id: {
      type: DataType.INTEGER,
      allowNull: false
    },
    locality: {
      type: DataType.STRING(100),
      allowNull: false
    },
    targetcost1: {
      type: DataType.FLOAT
    },
    targetcost2: {
      type: DataType.FLOAT
    },
    targetcost3: {
      type: DataType.FLOAT
    },
    targetcost4: {
      type: DataType.FLOAT
    },
    targetcost5: {
      type: DataType.FLOAT
    },
    created_date: {
      type: DataType.DATE,
      allowNull: false
    },
    modified_date: {
      type: DataType.DATE,
      allowNull: false
    },
    last_modified_by: {
      type: DataType.STRING(50),
      allowNull: false
    },
    created_by: {
      type: DataType.STRING(50),
      allowNull: false
    }
  }, {
    freezeTableName: true,
    tableName: 'budget_board_table',
    createdAt: false,
    updatedAt: false
  });
  return BudgetBoardTable;
}
