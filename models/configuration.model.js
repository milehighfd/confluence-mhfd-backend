module.exports = (sequelize, DataType) => {
  const Configuration = sequelize.define('configuration', {
    key: {
      type: DataType.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataType.STRING,
      allowNull: false
    },
    value: {
      type: DataType.STRING,
      allowNull: false
    },
    type: {
      type: DataType.STRING,
      allowNull: false
    }
  });
  return Configuration;
};
