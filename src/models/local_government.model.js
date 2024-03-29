export default (sequelize, DataType) => {
  const LocalGovernment = sequelize.define('local_government', {
    local_government_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    local_government_name: {
      type: DataType.STRING,
      allowNull: false
    }
  }, {
    freezeTableName: true,
    tableName: 'local_government',
    createdAt: false,
    updatedAt: false
  });
  return LocalGovernment;
}
