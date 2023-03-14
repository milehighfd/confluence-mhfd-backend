export default (sequelize, DataType) => {
  const BusinessAdress = sequelize.define('business_address', {
    business_address_id: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    business_associate_id: {
      type: DataType.INTEGER,
      allowNull: false
    },
    full_address: {
      type: DataType.STRING,
      allowNull: false,
    },
    business_address_line_1: {
      type: DataType.INTEGER,
      allowNull: false
    },
    business_address_line_2: {
      type: DataType.INTEGER,
      allowNull: false
    },
    state: {
      type: DataType.STRING,
      allowNull: false
    },
    city: {
      type: DataType.STRING,
      allowNull: false
    },
    zip: {
      type: DataType.STRING,
      allowNull: false
    }
  }, {
    freezeTableName: true,
    tableName: 'business_address',
    createdAt: false,
    updatedAt: false
  }
    );
  return BusinessAdress;
}
