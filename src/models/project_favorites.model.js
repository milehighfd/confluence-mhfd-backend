export default (sequelize, DataType) => {
    const ProjectFavorite = sequelize.define('project_favorite', {
      project_favorite_id: {
        type: DataType.INTEGER,
        primaryKey: true
      },
      user_character_id: {
        type: DataType.STRING,
      },
      user_id: {
        type: DataType.INTEGER,
      },
      project_id: {
        type: DataType.INTEGER,
      },
      project_table_name: {
        type: DataType.STRING,
      },
      created_date: {
        type: DataType.DATE,
      },
      modified_date: {
        type: DataType.DATE,
      },
      last_modified_by: {
        type: DataType.STRING,
      },
      created_by: {
        type: DataType.STRING,
      }
    }, {
      freezeTableName: true,
      tableName: 'project_favorite',
      createdAt: false,
      updatedAt: false
    });
    return ProjectFavorite;
  }
  