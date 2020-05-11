//const LogActivity = require('../models/logActivity.model');
const db = require('../config/db');
const LogActivity = db.logActivity;

const getLogActivities = async (page, limit, sortByField, sortType) => {

  const result = await LogActivity.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user"
      }
    }, 
    {
      $sort: {
        sortByField: parseInt(sortType)
      }
    },
    {
      $project: {
        "_id": 1,
        "activityType": 1,
        "registerDate": 1,
        "user": {"firstName":1,"lastName":1, "city":1}
      }
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [ {
            $arrayElemAt: [ "$user", 0]
          }, "$$ROOT"]
        }
      }
    },
    {
      $project: {
        user: 0
      }
    }
  ]).limit(limit * page)
  .skip(limit * (page - 1));
  return result;
}

const countLogActivities = async () => {
  return await LogActivity.count();
}

const saveLogActivity = async (logActivity) => {
  logActivity.registerDate = new Date();
  await LogActivity.create(logActivity); // logActivity.save();
  console.log('activity save');
  return logActivity;
}

module.exports = {
  saveLogActivity,
  getLogActivities,
  countLogActivities
}