export default (sequelize, DataType) => {
  const BusinessAssociateContact = sequelize.define('business_associate_contact', {
    business_associate_contact_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    business_address_id: {
      type: DataType.INTEGER,
      allowNull: false
    },
    contact_name: {
      type: DataType.STRING,
      allowNull: false
    },
    contact_email: {
      type: DataType.STRING,
      allowNull: false
    },
    contact_phone_number: {
      type: DataType.STRING,
      allowNull: false
    }
  }, {
    freezeTableName: true,
    tableName: 'business_associate_contact',
    createdAt: false,
    updatedAt: false
  }
    );
  return BusinessAssociateContact;
}
