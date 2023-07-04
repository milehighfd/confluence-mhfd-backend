import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
import { ProjectSponsorsError, NotFoundError } from '../../errors/project.error.js';

const ProjectPartner = db.projectPartner;
const BusinessAssociates = db.businessAssociates;

export const saveProjectPartner = async (
  sponsor, 
  cosponsor,
  project_id,
  transaction = null
) => {
  logger.info('start ProjectPartner saveProjectPartner ');
  try {
    if (cosponsor) {
      const splitedCosponsor = cosponsor.split(',');
      for (const splited of splitedCosponsor) {
        const extraId = await BusinessAssociates.findOne({
          where: db.Sequelize.where(
            db.Sequelize.fn('LOWER', db.Sequelize.col('business_name')),
            'LIKE',
            `${splited.toLowerCase()}`
          ),
          transaction: transaction 
        });
        if(extraId) await ProjectPartner.create({
          code_partner_type_id: 12,
          project_id: project_id,
          business_associates_id: extraId.business_associates_id,
        }, { transaction: transaction });
        logger.info('create ProjectPartner CoSponsor ');
      }
    }    
    const id = await BusinessAssociates.findOne({
      where: db.Sequelize.where(
        db.Sequelize.fn('LOWER', db.Sequelize.col('business_name')),
        'LIKE',
        `${sponsor.toLowerCase()}`
      ),
      transaction: transaction
    });

    if(id) {
      const projectPartner = await ProjectPartner.create({
        code_partner_type_id: 11,
        project_id: project_id,
        business_associates_id: id.business_associates_id,
      }, { transaction: transaction });
      return projectPartner;
    } else {
      await transaction.rollback();
      throw new NotFoundError('Business Associate not found');
    }
    logger.info('create ProjectPartner Sponsor ');
  } catch(error) {
    logger.error('error ProjectPartner Sponsor ', error);
    throw new ProjectSponsorsError('Error creating ProjectPartner Sponsor', { cause: error});
  }
}