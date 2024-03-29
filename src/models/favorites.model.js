
export default (sequelize, DataType) => {
  const Favorites = sequelize.define('favorites', {
    _id: {
      type: DataType.UUID,
      defaultValue: DataType.UUIDV4,
      primaryKey: true
    },
    id: {
      type: DataType.INTEGER
    },
    table: {
      type: DataType.STRING
    },
    user_id: {
      type: DataType.UUID,
      allowNull: false
    }
  });

  return Favorites;
}
