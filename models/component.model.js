module.exports = (sequelize, DataType) => {
  const Component = sequelize.define('component', {
    _id: {
      type: DataType.UUID,
      defaultValue: DataType.UUIDV4,
      primaryKey: true
    },
    componentName: {
      type: DataType.STRING
    },
    jurisdiction: {
      type: DataType.STRING
    },
    howCost: {
      type: DataType.FLOAT
    },
    status: {
      type: DataType.STRING
    },
    mitigationType: {
      type: DataType.STRING
    },
    studyName: {
      type: DataType.STRING
    },
    projectId: {
      type: DataType.UUID,
      allowNull: false,
    }
  });

  return Component;
}