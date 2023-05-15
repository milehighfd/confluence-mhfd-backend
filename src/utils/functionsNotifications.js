import db from 'bc/config/db.js';
import sequelize from 'sequelize';
import moment from 'moment';

const Notifications = db.notifications;
const ProjectStatus = db.projectStatus;
const ProjectStaff = db.projectStaff;
const BusinessAssociateContact = db.businessAssociateContact;
const User = db.user;
const Op = sequelize.Op;
const ProjectStatusNotification = db.projectStatusNotification;


export const createNotifications = async () => {
  const quantityOfDays = 14 - 2;
  const aDate = moment(moment(0, "HH"), "MM-DD-YYYY").add(quantityOfDays, 'days');
  let bDate = moment(moment(0, "HH"), "MM-DD-YYYY").add(quantityOfDays + 1, 'days').subtract(1,'s');
  // Get all projectids in statuses that are 14 day away from today (between beginning and ending)
  const allStatuses = await ProjectStatus.findAll({
    attributes: ['project_id', 'project_status_id'],
    where: { actual_end_date: {[Op.between]: [aDate, bDate]} }
  });
  const allProjectStaffs = await ProjectStaff.findAll({
    attributes: [
      'business_associate_contact_id',
      'project_staff_id',
      'project_id'
    ],
    where: { project_id: allStatuses.map(status => status.project_id)},
    include: [{
      model: BusinessAssociateContact,
      attributes: [
        'business_associate_contact_id',
        'contact_name'
      ],
      required: true,
      include: [{
        model: User,
        required: true,
        attributes: [
          'user_id',
          'email'
        ],
      }]          
    }]
  });
  allProjectStaffs.forEach(async (pS) => {
    const CODE_STATUS = 1;
    const newNotification = {
      is_read: false,
      project_id: pS.project_id,
      recipient_user_id: pS?.business_associate_contact?.user?.user_id,
      notification_date: moment(0,'HH'),
      "code_notification_type_id": CODE_STATUS
    };
    const newNotif = await Notifications.create(newNotification);
    if (newNotif?.dataValues) { 
      const projectstatus = allStatuses.find(status => status.project_id == pS.project_id);
      const newStatusNotif = await ProjectStatusNotification.create({
        project_status_id: projectstatus.project_status_id,
        notification_id: newNotif.notification_id
      });
      console.log('Created correctly', newStatusNotif);
    }
  });
  
  // console.log('allStatus', allStatuses.map(status => status.project_id), 'allstaffs ', allProjectStaffs.map(bs => bs.business_associate_contact));
}