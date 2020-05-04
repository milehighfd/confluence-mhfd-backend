const LogActivity = require('../models/logActivity.model');

const getLogActivities = async (page, limit, sortByField, sortType) => {
  //sortByField = 'users.' + sortByField;

  const result = await LogActivity.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user"
      }
      /* $lookup: {
        from: 'users',
        let: {
          'userId': '$_id',
        },
        'pipeline': [{
          '$match': {'$expr': { 
            '$eq': ['$userId', '$$userId']
          }}
        }, {
          '$sort': { sortByField: parseInt(sortType)}
        }],
        'as': 'user'
      } */
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
    },
    /* {
      $sort: {
        sortByField: parseInt(sortType)
      }
    } */
  ]).limit(limit * page)
  .skip(limit * (page - 1));
  return result;
}

const countLogActivities = async () => {
  return await LogActivity.count();
}

const saveLogActivity = async (logActivity) => {
  logActivity.registerDate = new Date();
  await logActivity.save();
  return logActivity;
}

module.exports = {
  saveLogActivity,
  getLogActivities,
  countLogActivities
}