export default  (sequelize, DataType) => {
  const CodeProjectPartnerType = sequelize.define('code_project_partner_type', {
    code_partner_type_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    partner_type_name: {
      type: DataType.STRING,
      allowNull: false,
    },    
    partner_type: {
      type: DataType.STRING,
      allowNull: false,
    },
  }, {
    freezeTableName: true,
    tableName: 'code_project_partner_type',
    createdAt: false,
    updatedAt: false
  });
  return CodeProjectPartnerType;
}
