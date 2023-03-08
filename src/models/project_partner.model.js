export default (sequelize, DataType) => {
  const ProjectPartner = sequelize.define('project_partner', {
    project_partner_id: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    code_partner_type_id: {
      type: DataType.INTEGER,
      allowNull: false,
    },
    project_id: {
      type: DataType.INTEGER,
      allowNull: false,
    },
    business_associates_id: {
      type: DataType.INTEGER,
      allowNull: false
    },
    business_associate_contacts_id: {
      type: DataType.INTEGER,
    },
    partner_case_number: {
      type: DataType.STRING,
    }
  }, {
    freezeTableName: true,
    tableName: 'project_partner',
    createdAt: false,
    updatedAt: false
  });
  return ProjectPartner;
}
