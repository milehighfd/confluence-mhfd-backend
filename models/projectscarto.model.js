
module.exports = (sequelize, DataType) => {
  const projectscarto = sequelize.define('projectscarto', {
    _id: {
      type: DataType.UUID,
      defaultValue: DataType.UUIDV4,
      primaryKey: true
    },
    projectid: {
      type: DataType.FLOAT
    }
  });

  return projectscarto;
}

