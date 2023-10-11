import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

const ProjectPartner = db.projectPartner;
const ProjectCost = db.projectCost;
const CodeProjectPartnerType = db.codeProjectPartnerType;
const BusinessAssociates = db.businessAssociates;

import { 
  addProjectPartners
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
      const prevProjectCostWithBusinessName = await ProjectCost.findAll({
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
      // await ProjectPartner.destroy({
      //   where: {
      //     project_id: project_id
      //   },
      //   transaction: transaction
      // });
      const projectPartners = await ProjectPartner.findAll({
        where: {
          project_id: project_id,
          code_partner_type_id: [ 11, 12 ]
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
        ]});
      // compare all partners to match 11 with sponsor and 12 with cosponsor then delete the ones that are not in there 
      console.log(sponsor, cosponsor, 'proejct Partners', JSON.stringify(projectPartners));
      for (let i = 0; i < projectPartners.length; i++) {
        const currentPP = projectPartners[i];
        const currentBusinessData = currentPP.businessAssociateData[0];
        console.log(' ********-************ \n Project Partner check', JSON.stringify(currentPP), currentPP.code_partner_type_id, 'bname', currentPP.businessAssociateData[0].business_name);
        if (currentPP.code_partner_type_id === 11) {
          if (currentBusinessData?.business_name !== sponsor) {
            console.log('about to destro sponsor', JSON.stringify(currentPP));
            // update project cost set is_active to false where project_partner_id = currentPP.project_partner_id
            await ProjectCost.update({
              is_active: false
            }, {
              where: {
                project_partner_id: currentPP.project_partner_id
              },
              transaction: transaction
            });
            
            await ProjectPartner.destroy({
              where: {
                project_partner_id: currentPP.project_partner_id
              },
              transaction: transaction
            });
          }
        } else if (currentPP.code_partner_type_id === 12) {
          console.log('HOJA osponsor', cosponsor.includes(currentBusinessData?.business_name), cosponsor, JSON.stringify(currentBusinessData));
          if (!cosponsor.includes(currentBusinessData?.business_name)) {
            console.log('about to destroy cosponsor', JSON.stringify(currentPP));
            await ProjectCost.update({
              is_active: false
            }, {
              where: {
                project_partner_id: currentPP.project_partner_id
              },
              transaction: transaction
            });
            await ProjectPartner.destroy({
              where: {
                project_partner_id: currentPP.project_partner_id
              },
              transaction: transaction
            });
          }
        }
      }
      const savedProjectPartnersponsor = await addProjectPartners(sponsor, cosponsor, project_id, transaction); // CREATE -> MHFD, SPONSOR y COSPONSORs
      // get all partners of project_id
     

      console.log('SAVED PROJECT PARTNER SPONSOR', savedProjectPartnersponsor);
      // we need to get all previous relations in proejct cost in order to reemplace them here after it is saved. 
      // so first lets get 2 things, all project costs with complete data, even business name 
      // then we need all current partners of that project specific 

      console.log('previous sponsor relations', prevProjectCostWithBusinessName);
      // now we need to get all current project partners
      const currentProjectPartners = await ProjectPartner.findAll({ // the new project partners after the destroyed ones
        where: {
          project_id: project_id,
          code_partner_type_id: [ 88, 11, 12 ]
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
      console.log('current project partners', currentProjectPartners); // missing the new cosponsor check in save project partner
      // update all project costs with the new project partner id matching the previous one by business_name
      for (let i = 0; i < prevProjectCostWithBusinessName.length; i++) {
        const previousSponsorRelation = prevProjectCostWithBusinessName[i];
        console.log('JSON prevprojectcostwithbusinessname', JSON.stringify(previousSponsorRelation));
        const currentProjectPartner = currentProjectPartners.find((cpp) => cpp?.businessAssociateData?.business_name === previousSponsorRelation.projectPartnerData?.businessAssociateData?.business_name);
        console.log('JSON currentProjectPartner', JSON.stringify(currentProjectPartner));
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