import sequelize from "sequelize";
import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

const { Op } = sequelize;
const Favorites = db.favorites;
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
      table: {
        [Op.like]: '%' + data.table + '%'
      },
      id: data.id,
      user_id: data.user_id
    }
  });
  return favorite;
}

const saveFavorite = async (favorite) => {
  const fav = await Favorites.findOne({
    where: {
      table: {
        [Op.like]: '%' + favorite.table + '%'
      },
      id: favorite.id,
      user_id: favorite.user_id
    }
  });
  if (!fav) {
    await Favorites.create(favorite);
    logger.info('favorite save');
  } else {
    logger.info('no update');
  }
  return favorite;
}

export default {
  saveFavorite,
  getFavorites,
  getOne,
  getAll
}
