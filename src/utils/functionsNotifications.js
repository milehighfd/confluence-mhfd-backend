import db from 'bc/config/db.js';
import sequelize from 'sequelize';
import moment from 'moment';

const Notifications = db.notifications;
const ProjectStatus = db.projectStatus;
const Op = sequelize.Op;

export const createNotifications = async () => {
  const aDate = moment(moment(0, "HH"), "MM-DD-YYYY").add(14, 'days');
  let bDate = moment(moment(0, "HH"), "MM-DD-YYYY").add(15, 'days').subtract(1,'s');
  // Get all projectids in statuses that are 14 day away from today (between beginning and ending)
  const allStatuses = await ProjectStatus.findAll({
    attributes: ['project_id'],
    where: { actual_end_date: {[Op.between]: [aDate, bDate]} }
  });
  console.log('allStatus', allStatuses);
}