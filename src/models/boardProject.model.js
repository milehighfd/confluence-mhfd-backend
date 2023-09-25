export default (sequelize, DataType) => {
  const boardProject = sequelize.define('board_project', {
    board_project_id: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    board_id: {
      type: DataType.INTEGER
    },
    project_id: {
      type: DataType.INTEGER,
    },
    position0: {
      type: DataType.INTEGER
    },
    position1: {
      type: DataType.INTEGER
    },
    position2: {
      type: DataType.INTEGER
    },
    position3: {
      type: DataType.INTEGER
    },
    position4: {
      type: DataType.INTEGER
    },
    position5: {
      type: DataType.INTEGER
    },
    rank0: {
      type: DataType.STRING
    },
    rank1: {
      type: DataType.STRING
    },
    rank2: {
      type: DataType.STRING
    },
    rank3: {
      type: DataType.STRING
    },
    rank4: {
      type: DataType.STRING
    },
    rank5: {
      type: DataType.STRING
    },
    originPosition0: {
      type: DataType.INTEGER
    },
    originPosition1: {
      type: DataType.INTEGER
    },
    originPosition2: {
      type: DataType.INTEGER
    },
    originPosition3: {
      type: DataType.INTEGER
    },
    originPosition4: {
      type: DataType.INTEGER
    },
    originPosition5: {
      type: DataType.INTEGER
    },
    req1: {
      type: DataType.DOUBLE,
    },
    req2: {
      type: DataType.DOUBLE,
    },
    req3: {
      type: DataType.DOUBLE,
    },
    req4: {
      type: DataType.DOUBLE,
    },
    req5: {
      type: DataType.DOUBLE,
    },
    year1: {
      type: DataType.DOUBLE,
    },
    year2: {
      type: DataType.DOUBLE,
    },
    origin: {
      type: DataType.STRING,
      allowNull: false
    },
    projectname: {
      type: DataType.STRING
    },
    code_status_type_id: {
      type: DataType.INTEGER
    },
    parent_board_project_id: {
      type: DataType.INTEGER
    }
  }, {
    freezeTableName: true,
    tableName: 'board_project'
  });
  return boardProject;
}