const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { ACTIVITY_TYPE } = require('../lib/enumConstants');

var LogActivitySchema = new Schema({
  registerDate: Date,
  userId: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  city: String,
  activityType: {
    type: String,
    enum: Object.values(ACTIVITY_TYPE)
  }
});

const LogActivity = mongoose.model('LogActivity', LogActivitySchema);

module.exports = LogActivity;