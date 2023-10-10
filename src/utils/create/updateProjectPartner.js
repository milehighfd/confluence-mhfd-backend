import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

const ProjectPartner = db.projectPartner;
const ProjectCost = db.projectCost;
const CodeProjectPartnerType = db.codeProjectPartnerType;
const BusinessAssociates = db.businessAssociates;

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
      const previousSponsorRelations = await ProjectCost.findAll({
        where: {
          project_id: project_id,
          is_active: true,
          code_cost_type_id: 22
        },
        include: [{
          model: ProjectPartner,
          as: 'projectPartnerData',
          include: [
            {
              model: CodeProjectPartnerType,
              as: 'projectPartnerTypeData'
            },
            {
              model: BusinessAssociates,
              as: 'businessAssociateData'
            }
          ]
        }]
      });
      await ProjectPartner.destroy({
        where: {
          project_id: project_id
        },
        transaction: transaction
      });
      await saveProjectPartner(sponsor, cosponsor, project_id, transaction);
      // we need to get all previous relations in proejct cost in order to reemplace them here after it is saved. 
      // so first lets get 2 things, all project costs with complete data, even business name 
      // then we need all current partners of that project specific 

      console.log('previous sponsor relations', previousSponsorRelations);
      // now we need to get all current project partners
      const currentProjectPartners = await ProjectPartner.findAll({
        where: {
          project_id: project_id
        },
        include: [
          {
            model: CodeProjectPartnerType,
            as: 'projectPartnerTypeData'
          },
          {
            model: BusinessAssociates,
            as: 'businessAssociateData'
          }
        ]
      });
      console.log('current project partners', currentProjectPartners);
      // update all project costs with the new project partner id matching the previous one by business_name
      for (let i = 0; i < previousSponsorRelations.length; i++) {
        const previousSponsorRelation = previousSponsorRelations[i];
        console.log('previous sponsor relation', previousSponsorRelation);
        const currentProjectPartner = currentProjectPartners.find((cpp) => cpp.businessAssociateData.business_name === previousSponsorRelation.projectPartnerData.businessAssociateData.business_name);
        console.log('current project partner', currentProjectPartner);
        if (currentProjectPartner) {
          await ProjectCost.update({
            project_partner_id: currentProjectPartner.project_partner_id
          }, {
            where: {
              project_cost_id: previousSponsorRelation.project_cost_id
            },
            transaction: transaction
          });
        }
      }
      logger.info('created  Sponsor and CoSponsor');
    }
  } catch(error) {
    logger.error('error ProjectPartner Sponsor ', error);
    throw error;
  }
}