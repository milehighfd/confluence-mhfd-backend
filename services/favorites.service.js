const db = require('../config/db');
const Favorites = db.favorites;
const User = db.user;
const { Op } = require("sequelize");

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
        [Op.iLike]: '%' + data.table + '%'
      },
      cartodb_id: data.cartodb_id,
      user_id: data.user_id
    }
  });
  return favorite;
}

const saveFavorite = async (favorite) => {
  await Favorites.create(favorite);
  console.log('favorite save');
  return favorite;
}

module.exports = {
  saveFavorite,
  getFavorites,
  getOne
}