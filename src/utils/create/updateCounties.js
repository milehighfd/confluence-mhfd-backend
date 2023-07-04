import db from 'bc/config/db.js';
import { 
  createCounties, 
} from 'bc/utils/create';

const ProjectCounty = db.projectCounty;

export const updateCounties = async (project_id, splitedCounty, transaction) => {
  await ProjectCounty.destroy({
    where: {
      project_id,
    },
    transaction,
  });    
  try {
    await createCounties(splitedCounty, project_id, transaction); 
    console.log('Counties created successfully!');
  } catch (error) {
    console.error('Failed to create counties:', error);
    throw error;
  }
};