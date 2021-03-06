const config = require('./config');
const Sequelize = require('sequelize');

const sequelize = new Sequelize(config.POSTGRESQL_DB, config.POSTGRESQL_USER, config.POSTGRESQL_PASSWORD, {
  host: config.POSTGRESQL_HOST,
  dialect: "postgres",
  //operatorAliases: false,

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require('../models/user.model.js')(sequelize, Sequelize);
db.attachment = require('../models/attachment.model.js')(sequelize, Sequelize);
db.logActivity = require('../models/logActivity.model.js')(sequelize, Sequelize);
db.favorites = require('../models/favorites.model.js')(sequelize, Sequelize);
db.board = require('../models/board.model.js')(sequelize, Sequelize);
db.locality = require('../models/locality.model.js')(sequelize, Sequelize);
db.boardProject = require('../models/boardProject.model.js')(sequelize, Sequelize);
db.independentComponent = require('../models/independentComponent.model.js')(sequelize, Sequelize);
db.boardLocality = require('../models/boardLocality.model.js')(sequelize, Sequelize);
db.note = require('../models/note.model.js')(sequelize, Sequelize);
db.projectStream = require('../models/projectstream.model.js')(sequelize, Sequelize);
db.projectComponent = require('../models/projectComponent.model.js')(sequelize, Sequelize);

db.user.hasMany(db.favorites, {foreignKey: 'user_id'});
db.user.hasMany(db.logActivity, {foreignKey: 'user_id'});
db.user.hasMany(db.note, {foreignKey: 'user_id'});
db.logActivity.belongsTo(db.user, {foreignKey: 'user_id'});
db.favorites.belongsTo(db.user, {foreignKey: 'user_id'});
db.user.hasMany(db.attachment, {foreignKey: 'user_id'});
db.attachment.belongsTo(db.user, {foreignKey: 'user_id'});
db.note.belongsTo(db.user, {foreignKey: 'user_id'});

module.exports = db;