import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

const ProjectCounty = db.projectCounty;

export const createCounties = async (splitedCounty, project_id, transaction = null) => {
  const t = transaction ? await transaction : null;
  for (const c of splitedCounty) {
    try {
      await ProjectCounty.create({
        state_county_id: c,
        project_id: project_id,
        shape_length_ft: 0,
      }, { transaction: t });
    } catch (error) {
      logger.error('cannot create county ' + error);
      throw error;
    }
    logger.info('created county');
  }
};
