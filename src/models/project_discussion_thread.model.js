export default (sequelize, DataTypes) => {
  const ProjectDiscussionThread = sequelize.define('project_discussion_thread', {
    project_discussion_thread_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    project_discussion_topic_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    is_internal: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    ref_project_discussion_thread_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    created_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    project_partner_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    freezeTableName: true,
    tableName: 'project_discussion_thread',
    timestamps: false
  });

  return ProjectDiscussionThread;
};
