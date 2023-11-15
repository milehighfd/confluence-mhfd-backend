export default (sequelize, DataType) => {
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
    },
    createdAt: {
      type: DataType.DATE,
      allowNull: true
    },
    updatedAt: {
      type: DataType.DATE,
      allowNull: true
    },
    id: {
      type: DataType.INTEGER,
      primaryKey: true,
    }
  });
  return Configuration;
};
