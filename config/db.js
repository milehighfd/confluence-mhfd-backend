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

db.project = require('../models/project.model.js')(sequelize, Sequelize);
db.user = require('../models/user.model.js')(sequelize, Sequelize);
db.component = require('../models/component.model.js')(sequelize, Sequelize);
db.attachment = require('../models/attachment.model.js')(sequelize, Sequelize);
db.task = require('../models/task.model.js')(sequelize, Sequelize);
db.coordinate = require('../models/coordinate.model.js')(sequelize, Sequelize);
db.logActivity = require('../models/logActivity.model.js')(sequelize, Sequelize);

db.user.hasMany(db.logActivity, {foreignKey: 'user_id'});
db.logActivity.belongsTo(db.user, {foreignKey: 'user_id'});
db.user.hasMany(db.attachment, {foreignKey: 'user_id'});
db.attachment.belongsTo(db.user, {foreignKey: 'user_id'});
// db.components.belongsTo(db.projects);
// db.projects.hasMany(db.components);

module.exports = db;