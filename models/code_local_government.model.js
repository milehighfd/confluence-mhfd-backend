module.exports = (sequelize, DataType) => {
  const LocalGovernment = sequelize.define('CODE_LOCAL_GOVERNMENT', {
    objectid: {
      type: DataType.INTEGER,
    },
    code_local_government: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    local_government_name: {
      type: DataType.STRING
    },
    local_government_type: {
      type: DataType.STRING
    }
  });
  return LocalGovernment;
}
