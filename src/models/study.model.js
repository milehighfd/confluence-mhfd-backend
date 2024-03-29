
export default (sequelize, DataType) => {
  const ProjectStudy = sequelize.define('study', {
    study_id: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    study_name: {
      type: DataType.STRING
    },
    study_type_id: {
      type: DataType.INTEGER
    },
    study_year: {
      type: DataType.INTEGER
    },
    complete_year: {
      type: DataType.INTEGER
    },
    status: {
      type: DataType.STRING
    },
    code_study_reason_id: {
      type: DataType.INTEGER
    },
    contract_id: {
      type: DataType.INTEGER
    },
    onbase_ID: {
      type: DataType.INTEGER
    },
    onbase_project_name: {
      type: DataType.STRING
    },
    last_updated_date: {
      type: DataType.DATE,
      defaultValue: DataType.NOW
    },
    last_update_user: {
      type: DataType.STRING,
    }
  }, {
    freezeTableName: true,
    tableName: 'study',
    createdAt: false,
    updatedAt: false
  });

  return ProjectStudy;
}
