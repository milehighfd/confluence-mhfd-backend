export default (sequelize, DataTypes) => {
  const ProjectChecklist = sequelize.define('project_checklist', {
    project_checklist_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    project_id: {
      type: DataTypes.INTEGER,
    },
    code_phase_type_id: {
      type: DataTypes.INTEGER,
    },
    checklist_todo_name: {
      type: DataTypes.STRING,
    },
    completed_date: {
      type: DataTypes.DATE,
    },
    completed_user_id: {
      type: DataTypes.INTEGER,
    },
    created_by: {
      type: DataTypes.STRING,
    },
    last_modified_by: {
      type: DataTypes.STRING,
    },
    created_date: {
      type: DataTypes.DATE,
    },
    modified_date: {
      type: DataTypes.DATE,
    },
  }, {
    freezeTableName: true,
    tableName: 'project_checklist',
    createdAt: 'created_date',
    updatedAt: 'modified_date',
    underscored: true,
  });

  return ProjectChecklist;
};