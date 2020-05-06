//const mongoose = require('mongoose');
const config = require('./config');
const Sequelize = require('sequelize');

/* mongoose.connect(config.MONGODB_URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
});
 */
const sequelize = new Sequelize(config.POSTGRESQL_DB, config.POSTGRESQL_USER, config.POSTGRESQL_PASSWORD, {
  host: config.POSTGRESQL_HOST,
  dialect: "postgres",
  operatorAliases: false,

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

db.projects = require('../models/project.model.js')(sequelize, Sequelize);
db.users = require('../models/user.model.js')(sequelize, Sequelize);
db.components = require('../models/component.model.js')(sequelize, Sequelize);
db.attachments = require('../models/attachment.model.js')(sequelize, Sequelize);

module.exports = db;