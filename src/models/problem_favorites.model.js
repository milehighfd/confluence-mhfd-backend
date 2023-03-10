export default (sequelize, DataType) => {
  const ProblemFavorite = sequelize.define('problem_favorite', {

    problem_favorite_id: {
      type: DataType.INTEGER,
      primaryKey: true
    },
    // user_character_id: {
    //   type: DataType.STRING,
    //   defaultValue: 'defaultValue',
    // },
    user_id: {
      type: DataType.INTEGER,
    },
    problem_id: {
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
    tableName: 'problem_favorite',
    createdAt: false,
    updatedAt: false
  });
  return ProblemFavorite;
}
