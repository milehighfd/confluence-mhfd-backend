import Sequelize from 'sequelize';
import config from 'bc/config/config.js';
import user from 'bc/models/user.model.js';
import attachment from 'bc/models/attachment.model.js';
import logActivity from 'bc/models/logActivity.model.js';
import favorites from 'bc/models/favorites.model.js';
import board from 'bc/models/board.model.js';
import locality from 'bc/models/locality.model.js';
import boardProject from 'bc/models/boardProject.model.js';
import independentComponent from 'bc/models/independentComponent.model.js';
import boardLocality from 'bc/models/boardLocality.model.js';
import newnotes from 'bc/models/newnotes.model.js';
import color from 'bc/models/color.model.js';
import groupNotes from 'bc/models/groupNotes.model.js';
import projectstream from 'bc/models/projectstream.model.js';
import projectComponent from 'bc/models/projectComponent.model.js';
import consultants from 'bc/models/consultants.model.js';
import componentDependency from 'bc/models/componentDependency.model.js';
import configuration from 'bc/models/configuration.model.js';

const sequelize = new Sequelize(config.POSTGRESQL_DB, config.POSTGRESQL_USER, config.POSTGRESQL_PASSWORD, {
  dialect: config.DB_DIALECT,
  host: config.POSTGRESQL_HOST,
  port: config.DB_PORT,
  databaseVersion: '10.50.6000',
  dialectOptions: {
    instancName: 'XXX',
    options:{
      encrypt: false
    }
  },
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

db.user = user(sequelize, Sequelize);
db.attachment = attachment(sequelize, Sequelize);
db.logActivity = logActivity(sequelize, Sequelize);
db.favorites = favorites(sequelize, Sequelize);
db.board = board(sequelize, Sequelize);
db.locality = locality(sequelize, Sequelize);
db.boardProject = boardProject(sequelize, Sequelize);
db.independentComponent = independentComponent(sequelize, Sequelize);
db.boardLocality = boardLocality(sequelize, Sequelize);
db.newnotes = newnotes(sequelize, Sequelize);
db.color = color(sequelize, Sequelize);
db.groupnotes = groupNotes(sequelize, Sequelize);
db.projectStream = projectstream(sequelize, Sequelize);
db.projectComponent = projectComponent(sequelize, Sequelize);
db.consultants = consultants(sequelize, Sequelize);
db.componentdependency = componentDependency(sequelize, Sequelize);
db.configuration = configuration(sequelize, Sequelize);

db.user.hasMany(db.favorites, {foreignKey: 'user_id'});
db.user.hasMany(db.logActivity, {foreignKey: 'user_id'});
db.user.hasMany(db.color, {foreignKey: 'user_id'});
db.color.belongsTo(db.user, {foreignKey: 'user_id'});
db.newnotes.belongsTo(db.color, {foreignKey: {name: 'color_id', allowNull: true}});
db.color.hasMany(db.newnotes, {foreignKey: {name: 'color_id', allowNull: true}});
db.logActivity.belongsTo(db.user, {foreignKey: 'user_id'});
db.favorites.belongsTo(db.user, {foreignKey: 'user_id'});
db.user.hasMany(db.attachment, {foreignKey: 'user_id'});
db.attachment.belongsTo(db.user, {foreignKey: 'user_id'});
db.user.hasMany(db.newnotes, {foreignKey: 'user_id'});
db.newnotes.belongsTo(db.user, {foreignKey: 'user_id'});
db.newnotes.belongsTo(db.groupnotes, {foreignKey: {name: 'group_id', allowNull: true}});
db.groupnotes.hasMany(db.newnotes, { foreignKey: {name: 'group_id', allowNull: true }});
db.groupnotes.belongsTo(db.user, {foreignKey: 'user_id'});
db.user.hasMany(db.groupnotes, {foreignKey: 'user_id'});

db.sequelize.authenticate().then(()=>{
  console.log("Connected to Database");
}).catch((error)=>{
  console.log("Error" + error);
});

export default db;
