
export default (sequelize, DataType) => {
  const IndependentComponent = sequelize.define('independentComponent', {
    _id: {
      type: DataType.UUID,
      defaultValue: DataType.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataType.STRING
    },
    status: {
      type: DataType.STRING
    },
    cost: {
      type: DataType.STRING,
    },
    projectid: {
      type: DataType.INTEGER
    }
  });

  return IndependentComponent;
}
