import sequelize from "sequelize";
import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
import moment from 'moment';

const { Op } = sequelize;
const ProjectFavorite = db.ProjectFavorite;
const ProblemFavorite = db.problemFavorite;
const PROJECT_FAVORITE_TABLE = 'project_favorite';
const PROBLEM_FAVORITE_TABLE = 'problem_favorite';
const PROJECT_ID = 'project_id';
const PROBLEM_ID = 'problem_id';
const User = db.user;

const getAll = async () => {
  try {
    const result = await ProjectFavorite.findAll({
      include: [{
        model: User,
        require: true
      }]
    });
    return result;
  } catch(error) {
    console.log('my error is ', error);
    throw error;
  }
}

const getFields = (isProblem) => {
  let Favorite = ProjectFavorite;
  let table = PROJECT_FAVORITE_TABLE;
  let idField = PROJECT_ID;
  if (isProblem) {
    Favorite = ProblemFavorite;
    table = PROBLEM_FAVORITE_TABLE;
    idField = PROBLEM_ID;
  }
  return { Favorite, table, idField };
}

const getFavorites = async (user_id, isProblem) => {
  const { Favorite } = getFields(isProblem);
  try {
    let result = [];
    result = await Favorite.findAll({
      where: {
        user_id: user_id
      }
    });
    return result;
  } catch (error) {
    logger.error(`Error in get favorites services: ${error}`);
    throw error;
  }
}

const getOne = async (data, isProblem) => {
  const { Favorite, idField } = getFields(isProblem);
  try {
    const favorite = await Favorite.findOne({
      where: {
        [idField]: data.project_id,
        user_id: data.user_id
      }
    });
    return favorite;
  } catch (error) {
    logger.error(`Error in get one favorite services: ${error}`);
    throw error;
  }
}

const saveFavorite = async (favorite, isProblem) => {
  const { Favorite, table, idField } = getFields(isProblem);
  try {
    const fav = await Favorite.findOne({
      where: {
        [idField]: favorite.idField,
        user_id: favorite.user_id
      }
    });
    if (!fav) {
      const formatTime = moment().format('YYYY-MM-DD HH:mm:ss');
      //await ProjectFavorite.create(favorite);
      //remove user_character_id when updated db
      const insertQuery = `INSERT INTO ${table} (user_id, ${idField}, created_date, modified_date, last_modified_by, created_by, project_table_name)
      OUTPUT inserted . *
      VALUES( '${favorite.user_id}', '${favorite.idField}', '${formatTime}', '${formatTime}', '${favorite.creator}','${favorite.creator}', 'useless_column')`;
      const data = await db.sequelize.query(
        insertQuery,
        {
          type: db.sequelize.QueryTypes.INSERT,
        });
      logger.info('favorite save');
      return data[0][0];
  
    } else {
      logger.info('no update');
    }
    return favorite;
  } catch (error) {
    logger.error(`Error in save favorites services: ${error}`);
    throw error;
  }
}

const countFavorites = async (user_id, isProblem) => {
  const { Favorite } = getFields(isProblem);
  try {
    const result = await Favorite.count({
      where: {
        user_id: user_id
      }
    });
    return result;
  } catch (error) { 
    logger.error(`Error in count favorites services: ${error}`);
    throw error;
  }
}

export default {
  saveFavorite,
  getFavorites,
  getOne,
  getAll,
  countFavorites
}
