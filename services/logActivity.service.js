const LogActivity = require('../models/logActivity.model');

const getLogActivities = async () => {
  const result = await LogActivity.find();
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