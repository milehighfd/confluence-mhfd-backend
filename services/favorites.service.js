const db = require('../config/db');
const Favorites = db.favorites;
const User = db.user;

const getFavorites = async (user_id) => {
  let result = [];
  await Favorites.findAll({
    user_id: user_id
  }).then(data => {
    result = data;
  });
  return result;
}


const saveFavorite = async (favorite) => {
  await Favorites.create(favorite);
  console.log('favorite save');
  return favorite;
}

module.exports = {
  saveFavorite,
  getFavorites
}