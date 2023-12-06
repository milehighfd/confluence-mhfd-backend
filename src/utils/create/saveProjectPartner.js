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
  logger.info('start ProjectPartner saveProjectPartner ' + sponsor +' '+ cosponsor);
  console.log('\n Cosponsor', cosponsor, ' in saveprojectpartner \n');
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
        console.log('Should create cosponsor with', splited, 'and id', extraId, ' __________________________ \n');
        if(extraId) await ProjectPartner.create({
          code_partner_type_id: 12,
          project_id: project_id,
          business_associates_id: extraId.business_associates_id,
        }, { transaction: transaction });
        logger.info('create ProjectPartner CoSponsor '+ splited);
      }
    }    
    
    const idmhfd = await BusinessAssociates.findOne({
      where: {
        business_name: 'MHFD'
      },
      transaction: transaction
    });
    let projectPartnerMhfd = undefined;
    if(idmhfd) {
      projectPartnerMhfd = await ProjectPartner.create({
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
    } else {
      return ({ message: 'Sponsor not found' })
    }
    return projectPartnerMhfd;
  } catch(error) {
    logger.error('error ProjectPartner Sponsor ', error);
    throw new ProjectSponsorsError('Error creating ProjectPartner Sponsor', { cause: error});
  }
}

export const addProjectPartners = async (
  sponsor, 
  cosponsor,
  project_id,
  transaction = null
) => {
  logger.info('start ProjectPartner saveProjectPartner ' + sponsor +' '+ cosponsor);
  console.log('\n Cosponsor', cosponsor, ' in saveprojectpartner \n');
  const allPartnersCreated = [];
  try {
    if (cosponsor) {
      const COSPONSOR_CODE_ID = 12;
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
        console.log('Should create cosponsor with', splited, 'and id', extraId, ' __________________________ \n');
        if(extraId) {
          const existingProjectPartner = await ProjectPartner.findOne({
            where: {
              project_id: project_id,
              business_associates_id: extraId.business_associates_id,
              code_partner_type_id: COSPONSOR_CODE_ID
            },
            transaction: transaction
          });
          console.log('Exisintg ProjectPartner relation', existingProjectPartner);
          if(!existingProjectPartner) {
            const cosponsorCreated = await ProjectPartner.create({
              code_partner_type_id: COSPONSOR_CODE_ID,
              project_id: project_id,
              business_associates_id: extraId.business_associates_id,
            }, { transaction: transaction });
            if(cosponsorCreated) {
              allPartnersCreated.push(cosponsorCreated);
            }
          }
        } 
        logger.info('create ProjectPartner CoSponsor '+ splited);
      }
    }    
    const SPONSOR_CODE_ID = 11;
    const idSponsor = await BusinessAssociates.findOne({
      where: db.Sequelize.where(
        db.Sequelize.fn('LOWER', db.Sequelize.col('business_name')),
        'LIKE',
        `${sponsor.toLowerCase()}`
      ),
      transaction: transaction
    });

    if(idSponsor) {
      const existingProjectPartner = await ProjectPartner.findOne({
        where: {
          project_id: project_id,
          business_associates_id: idSponsor.business_associates_id,
          code_partner_type_id: SPONSOR_CODE_ID
        },
        transaction: transaction
      });
      if (!existingProjectPartner) {
        const projectPartner = await ProjectPartner.create({
          code_partner_type_id: SPONSOR_CODE_ID,
          project_id: project_id,
          business_associates_id: idSponsor.business_associates_id,
        }, { transaction: transaction });
        allPartnersCreated.push(projectPartner);
      }
    } 

    return allPartnersCreated;
    
  } catch(error) {
    logger.error('error ProjectPartner Sponsor ', error);
    throw new ProjectSponsorsError('Error creating ProjectPartner Sponsor', { cause: error});
  }
}