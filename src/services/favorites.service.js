import sequelize from "sequelize";
import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
import moment from 'moment';

const { Op } = sequelize;
const Favorites = db.ProjectFavorite;
const User = db.user;

const getAll = async () => {
  try {
    const result = await Favorites.findAll({
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
const getFavorites = async (user_id) => {
  let result = [];
  result = await Favorites.findAll({
    where: {
      user_id: user_id
    }
  });
  return result;
}

const getOne = async (data) => {
  const favorite = await Favorites.findOne({
    where: {
      project_id: data.project_id,
      user_id: data.user_id
    }
  });
  return favorite;
}

const saveFavorite = async (favorite) => {
  const fav = await Favorites.findOne({
    where: {
      project_table_name: {
        [Op.like]: '%' + favorite.project_table_name + '%'
      },
      project_id: favorite.project_id,
      user_id: favorite.user_id
    }
  });
  if (!fav) {
    const formatTime = moment().format('YYYY-MM-DD HH:mm:ss');
    //await Favorites.create(favorite);
    //remove user_character_id when updated db
    const insertQuery = `INSERT INTO project_favorite (user_id, project_id, project_table_name, created_date, modified_date, last_modified_by, created_by, user_character_id)
    OUTPUT inserted . *
    VALUES( '${favorite.user_id}', '${favorite.project_id}', '${favorite.project_table_name}', '${formatTime}', '${formatTime}', '${favorite.creator}','${favorite.creator}','${favorite.user_character_id}')`;
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

const countFavorites = async (user_id) => {
  let result = await Favorites.count({
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
