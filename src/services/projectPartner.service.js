import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

const ProjectPartner = db.projectPartner;
const BusinessAssociates = db.businessAssociates;

const saveProjectPartner = async (
  sponsor, 
  cosponsor,
  project_id
) => {
  try {
    if (cosponsor) {
      const splitedCosponsor = cosponsor.split(',');
      for (const splited of splitedCosponsor) {
        const extraId = await BusinessAssociates.findOne({
          where: {
            business_associate_name: splited.toUpperCase(),
            business_name: splited.toUpperCase()
          }
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
      where: {
        business_associate_name: sponsor.toUpperCase(),
        business_name: sponsor.toUpperCase()
      }
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



export default {
  saveProjectPartner,
};
