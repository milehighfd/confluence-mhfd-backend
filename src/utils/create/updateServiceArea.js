import db from 'bc/config/db.js';
import { 
  createServiceAreas, 
} from 'bc/utils/create';

const ProjectServiceArea = db.projectServiceArea;

export const updateServiceArea = async (project_id, splitedServicearea, user, transaction) => {
  await ProjectServiceArea.destroy({
    where: {
      project_id,
    },
    transaction,
  });
  try {
    await createServiceAreas(splitedServicearea, project_id, user, transaction);
    console.log('Service areas created successfully!');
  } catch (error) {
    console.error('Failed to create service areas:', error);
    throw error;
  }
};