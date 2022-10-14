export default (sequelize, DataType) => {
  const ProjectPartner = sequelize.define('project_partner', {
    project_partner_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    partner_type_id: {
      type: DataType.INTEGER,
      allowNull: false,
    },
    project_id: {
      type: DataType.INTEGER,
      allowNull: false,
    },
    bussines_associate_id: {
      type: DataType.INTEGER,
      allowNull: false
    },
    partner_case_number: {
      type: DataType.STRING,
      allowNull: false
    }
  });
  return ProjectPartner;
}
