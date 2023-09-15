export default (sequelize, DataTypes) => {
  const ProjectChecklist = sequelize.define('project_checklist', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    project_id: {
      type: DataTypes.INTEGER,
    },
    phase_type_id: {
      type: DataTypes.INTEGER,
    },
    checklist_todo_name: {
      type: DataTypes.STRING,
    },
    is_completed: {
      type: DataTypes.BOOLEAN,
    },
    created_by: {
      type: DataTypes.STRING,
    },
    updated_by: {
      type: DataTypes.STRING,
    },
    created_at: {
      type: DataTypes.DATE,
    },
    updated_at: {
      type: DataTypes.DATE,
    },
  }, {
    freezeTableName: true,
    tableName: 'project_checklist',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
  });

  return ProjectChecklist;
};