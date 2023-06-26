import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

const ProjectPartner = db.projectPartner;
const BusinessAssociates = db.businessAssociates;

const saveProjectPartner = async (
  sponsor, 
  cosponsor,
  project_id
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
          )
        });
        if(extraId) await ProjectPartner.create({
          code_partner_type_id: 12,
          project_id: project_id,
          business_associates_id: extraId.business_associates_id,
        }); 
        logger.info('create ProjectPartner CoSponsor ');
      }
    }    
    const id = await BusinessAssociates.findOne({
      where: db.Sequelize.where(
        db.Sequelize.fn('LOWER', db.Sequelize.col('business_name')),
        'LIKE',
        `${sponsor.toLowerCase()}`
      )
    });

    if(id) await ProjectPartner.create({
      code_partner_type_id: 11,
      project_id: project_id,
      business_associates_id: id.business_associates_id,
    }); 
    logger.info('create ProjectPartner Sponsor ');
  } catch(error) {
    logger.error('error ProjectPartner Sponsor ', error);
    throw error;
  }
}

const updateProjectPartner = async (
  sponsor, 
  cosponsor,
  project_id
) => {
  logger.info('create ProjectPartner updateProjectPartner ');
  try {
    if (project_id) {
      await ProjectPartner.destroy({
        where: {
          project_id: project_id
        }
      });
      await saveProjectPartner(sponsor, cosponsor, project_id);
      logger.info('created  Sponsor and CoSponsor');
    }
  } catch(error) {
    logger.error('error ProjectPartner Sponsor ', error);
    throw error;
  }
}

export default {
  saveProjectPartner,
  updateProjectPartner
};
