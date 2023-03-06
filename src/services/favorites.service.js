import sequelize from "sequelize";
import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
import moment from 'moment';

const { Op } = sequelize;
const ProjectFavorite = db.ProjectFavorite;
const ProblemFavorite = db.problemFavorite;
const PROJECT_FAVORITE_TABLE = 'project_favorite';
const PROBLEM_FAVORITE_TABLE = 'problem_favorite';
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
  }
}
const getFavorites = async (user_id, isProblem) => {
  let Favorite = ProjectFavorite;
  if (isProblem) {
    Favorite = ProblemFavorite;
  }
  let result = [];
  result = await Favorite.findAll({
    where: {
      user_id: user_id
    }
  });
  return result;
}

const getOne = async (data, isProblem) => {
  let Favorite = ProjectFavorite;
  if (isProblem) {
    Favorite = ProblemFavorite;
  }
  const favorite = await Favorite.findOne({
    where: {
      project_id: data.project_id,
      user_id: data.user_id
    }
  });
  return favorite;
}

const saveFavorite = async (favorite, isProblem) => {
  let Favorite = ProjectFavorite;
  let table = PROJECT_FAVORITE_TABLE;
  if (isProblem) {
    Favorite = ProblemFavorite;
    table = PROBLEM_FAVORITE_TABLE;
  }
  const fav = await Favorite.findOne({
    where: {
      project_id: favorite.project_id,
      user_id: favorite.user_id
    }
  });
  if (!fav) {
    const formatTime = moment().format('YYYY-MM-DD HH:mm:ss');
    //await ProjectFavorite.create(favorite);
    //remove user_character_id when updated db
    const insertQuery = `INSERT INTO ${table} (user_id, project_id, created_date, modified_date, last_modified_by, created_by)
    OUTPUT inserted . *
    VALUES( '${favorite.user_id}', '${favorite.project_id}', '${formatTime}', '${formatTime}', '${favorite.creator}','${favorite.creator}')`;
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
}

const countFavorites = async (user_id, isProblem) => {
  let Favorite = ProjectFavorite;
  if (isProblem) {
    Favorite = ProblemFavorite;
  }
  let result = await Favorite.count({
    where: {
      user_id: user_id
    }
  });
  return result;
}

export default {
  saveFavorite,
  getFavorites,
  getOne,
  getAll,
  countFavorites
}
