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
    projecttype: {
      type: DataType.STRING
    },
    projectsubtype: {
      type: DataType.STRING
    }
  }, {
    freezeTableName: true,
    tableName: 'board_project'
  });
  return boardProject;
}