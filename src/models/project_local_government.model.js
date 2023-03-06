export default (sequelize, DataType) => {
  const ProjectLocalGovernment = sequelize.define('project_local_government', {
    project_local_government_id: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    code_local_government_id: {
      type: DataType.INTEGER,
      allowNull: false
    },
    project_id: {
      type: DataType.INTEGER,
      allowNull: false
    },
    shape_length_ft: {
      type: DataType.FLOAT,
      allowNull: false
    },
    created_date: {
      type: DataType.DATE,
    },
    modified_date: {
      type: DataType.DATE,
    },
    last_modified_by: {
      type: DataType.STRING,
      allowNull: false
    },
    created_by: {
      type: DataType.STRING,
      allowNull: false
    }
  }, {
    freezeTableName: true,
    tableName: 'project_local_government',
    createdAt: false,
    updatedAt: false
  }
    );
  return ProjectLocalGovernment;
}
