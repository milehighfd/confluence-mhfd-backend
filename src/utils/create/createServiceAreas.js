import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
import { ProjectServiceAreasError } from '../../errors/project.error.js';

const ProjectServiceArea = db.projectServiceArea;

export const createServiceAreas = async (splitedServiceArea, project_id, user, transaction = null) => {
  for (const s of splitedServiceArea) {
    try {
      await ProjectServiceArea.create({
        project_id: project_id,
        code_service_area_id: s,
        shape_length_ft: 0,
        last_modified_by: user.name,
        created_by: user.email,
      }, { transaction: transaction });
    } catch (error) {
      throw ProjectServiceAreasError('Error creating service area', { cause: error });
    }
    logger.info('created service area');
  }
};