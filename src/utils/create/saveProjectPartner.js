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
    
    const idmhfd = await BusinessAssociates.findOne({
      where: {
        business_name: 'MHFD'
      },
      transaction: transaction
    });

    if(idmhfd) {
      const projectPartnerMhfd = await ProjectPartner.create({
        code_partner_type_id: 88,
        project_id: project_id,
        business_associates_id: idmhfd.business_associates_id,
      }, { transaction: transaction });
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
      return ({ message: 'Sponsor not found' })
    }
    
  } catch(error) {
    logger.error('error ProjectPartner Sponsor ', error);
    throw new ProjectSponsorsError('Error creating ProjectPartner Sponsor', { cause: error});
  }
}