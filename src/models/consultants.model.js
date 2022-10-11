
export default (sequelize, DataType) => {
  const Consultants = sequelize.define('consultants', {
    _id: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataType.STRING
    }
  });
  return Consultants;
}
