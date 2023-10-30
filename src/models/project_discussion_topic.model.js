export default (sequelize, DataTypes) => {
  const ProjectDiscussionTopic = sequelize.define('project_discussion_topic', {
    project_discussion_topic_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    project_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    topic: {
      type: DataTypes.STRING,
      allowNull: false
    },
    is_discussion_thread_open: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    created_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    modified_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    last_modified_by: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created_by: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    related_project_discussion_topic_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    freezeTableName: true,
    tableName: 'project_discussion_topic',
    timestamps: false
  });

  return ProjectDiscussionTopic;
};
