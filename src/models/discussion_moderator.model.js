export default (sequelize, DataTypes) => {
  const DiscussionModerator = sequelize.define('discussion_moderator', {
    discussion_moderator_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    project_discussion_topic_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    created_by: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    freezeTableName: true,
    tableName: 'discussion_moderator',
    timestamps: false
  });

  return DiscussionModerator;
};
