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

export const deleteNotifications = async () => {
  const quantityOfDays = 60;
  let bDate = moment(moment(0, "HH"), "MM-DD-YYYY").subtract(quantityOfDays, 'days');
  const deleteProjectId = await Notifications.findAll({
    attributes: ['notification_id'],
    where: { notification_date: {[Op.lt]: bDate} }
  });
  const deletedProjectStatusNotification = await ProjectStatusNotification.destroy({
    where: { notification_id: deleteProjectId.map(id => id.notification_id) }
  });  
  const deletedNotifications = await Notifications.destroy({
    where: { notification_id: deleteProjectId.map(id => id.notification_id) }
  });
  console.log('Deleted correctly', deletedProjectStatusNotification, deletedNotifications);
}


export const createNotifications = async () => {
  const quantityOfDays = 14 - 2;
  const aDate = moment(moment(0, "HH"), "MM-DD-YYYY");
  let bDate = moment(moment(0, "HH"), "MM-DD-YYYY").add(quantityOfDays + 1, 'days').subtract(1,'s');
  // Get all projectids in statuses that are 14 day away from today (between beginning and ending)
  const allStatuses = await ProjectStatus.findAll({
    attributes: ['project_id', 'project_status_id'],
    where: { actual_end_date: {[Op.between]: [aDate, bDate]} }
  });  
  const sentNotifications = await Notifications.findAll({
    attributes: ['project_id'],
    include: [{
      model: ProjectStatusNotification,
      attributes: ['project_status_id'],
      where: { project_status_id: allStatuses.map(status => status.project_status_id)}
    }]
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
  const filteredProjectStaffs = allProjectStaffs.filter(pS => !sentNotifications.find(sN => sN.project_id == pS.project_id));
  
  filteredProjectStaffs.forEach(async (pS) => {
    const CODE_STATUS = 1;
    const newNotification = {
      is_read: false,
      project_id: pS.project_id,
      recipient_user_id: pS?.business_associate_contact?.user?.user_id,
      notification_date: moment(0,'HH'),
      "code_notification_type_id": CODE_STATUS,
      last_modified_by: 'cron service',
      created_by: 'cron service'
    };
    const newNotif = await Notifications.create(newNotification);
    if (newNotif?.dataValues) { 
      const projectstatus = allStatuses.find(status => status.project_id == pS.project_id);
      const newStatusNotif = await ProjectStatusNotification.create({
        project_status_id: projectstatus.project_status_id,
        notification_id: newNotif.notification_id,
        last_modified_by: 'cron service',
        created_by: 'cron service'
      });
      console.log('Created correctly', newStatusNotif);
    }
  });
  
  //console.log('allStatus', filteredProjectStaffs.map(status => status.project_id));
}