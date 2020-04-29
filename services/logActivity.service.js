const LogActivity = require('../models/logActivity.model');

const getLogActivities = async () => {
  const result = await LogActivity.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "userId", 
        foreignField: "_id",
        as: "user"
      }
    },
  ]);

  return result;
}

const saveLogActivity = async (logActivity) => {
  logActivity.registerDate = new Date();
  await logActivity.save();
  return logActivity;
}

module.exports = {
  saveLogActivity,
  getLogActivities
}