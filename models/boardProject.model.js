module.exports = (sequelize, DataType) => {
  const boardProject = sequelize.define('boardProject', {
    board_id: {
      type: DataType.INTEGER
    },
    project_id: {
      type: DataType.STRING,
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
    }
  }, {
    tableName: 'board-projects'
  });
  return boardProject;
}