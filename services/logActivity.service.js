const db = require('../config/db');
const LogActivity = db.logActivity;
const User = db.user;

const getLogActivities = async (page, limit, sortByField, sortType) => {
  let result = [];
  await LogActivity.findAll({
    include: [{
      model: User,
      require: true
    }],
    offset: limit * (page - 1),
    limit: limit,
    order: [
      [sortByField, sortType] 
    ]
  }).then(logs => {
    result = logs.map(log => {
      return Object.assign(
        {},
        {
          log_id: log.id,
          user_id: log.user_id,
          registerDate: log.registerDate,
          activityType: log.activityType,
          firstName: log.user.firstName,
          lastName: log.user.lastName,
          city: log.user.city
        }
      );
    });
  });
  return result;
}

const timesLogin = async (user_id) => {
  return await LogActivity.count({where: {
    user_id: user_id
  }});  
}

const countLogActivities = async () => {
  return await LogActivity.count();
}

const saveLogActivity = async (logActivity) => {
  logActivity.registerDate = new Date();
  await LogActivity.create(logActivity);
  console.log('activity save');
  return logActivity;
}

module.exports = {
  saveLogActivity,
  getLogActivities,
  countLogActivities,
  timesLogin
}