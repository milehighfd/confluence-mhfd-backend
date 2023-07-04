import db from 'bc/config/db.js';
import {createLocalGovernment} from 'bc/utils/create';

const ProjectLocalGovernment = db.projectLocalGovernment;

export const updateLocalGovernment = async (project_id, splitedJurisdiction, user, transaction) => {
  await ProjectLocalGovernment.destroy({
    where: {
      project_id,
    },
    transaction,
  });
  try {
    await createLocalGovernment(splitedJurisdiction, project_id, user, transaction);
    console.log('Project local governments created successfully');
  } catch (error) {
    console.error('Error creating project local governments:', error);
    throw error;    
  }
};