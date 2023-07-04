import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

const ProjectPartner = db.projectPartner;

import { 
  saveProjectPartner
} from 'bc/utils/create';

export const updateProjectPartner = async (
  sponsor, 
  cosponsor,
  project_id,
  transaction
) => {
  logger.info('create ProjectPartner updateProjectPartner ');
  try {
    if (project_id) {
      await ProjectPartner.destroy({
        where: {
          project_id: project_id
        },
        transaction: transaction
      });
      await saveProjectPartner(sponsor, cosponsor, project_id, transaction);
      logger.info('created  Sponsor and CoSponsor');
    }
  } catch(error) {
    logger.error('error ProjectPartner Sponsor ', error);
    throw error;
  }
}