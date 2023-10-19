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
  transaction,
  isWorkPlan
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
      // compare all partners to match 11 with sponsor and 12 with cosponsor then delete the ones that are not in there  168938
      console.log(sponsor, cosponsor, 'proejct Partners', JSON.stringify(projectPartners));
      const WORK_REQUEST_EDITED = 42;
      const WORK_PLAN_EDITED = 41;
      let sponsorDeleted = false;
      for (let i = 0; i < projectPartners.length; i++) {
        const currentPP = projectPartners[i];
        const currentBusinessData = currentPP.businessAssociateData[0];
        if (currentPP.code_partner_type_id === 11) {
          if (currentBusinessData?.business_name !== sponsor) {
            await ProjectCost.update({
              is_active: false,
              code_cost_type_id: isWorkPlan? WORK_PLAN_EDITED: WORK_REQUEST_EDITED
            }, {
              where: {
                project_partner_id: currentPP.project_partner_id
              },
              transaction: transaction
            });
            
            const destroyed = await ProjectPartner.destroy({
              where: {
                project_partner_id: currentPP.project_partner_id
              },
              transaction: transaction
            });
            sponsorDeleted = true;
          }
        } else if (currentPP.code_partner_type_id === 12) {
          if (!cosponsor.includes(currentBusinessData?.business_name)) {
            await ProjectCost.update({
              is_active: false,
              code_cost_type_id: WORK_REQUEST_EDITED
            }, {
              where: {
                project_partner_id: currentPP.project_partner_id
              },
              transaction: transaction
            });
            const destroyed = await ProjectPartner.destroy({
              where: {
                project_partner_id: currentPP.project_partner_id
              },
              transaction: transaction
            });
            console.log('DESTROYING cosponsor', currentPP.project_partner_id, 'RESULT', destroyed);
          }
        }
      }
      const savedProjectPartnersponsor = await addProjectPartners(sponsor, cosponsor, project_id, transaction); 
      console.log('SAVED PROJECT PARTNER SPONSOR', savedProjectPartnersponsor);
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
        ],
        transaction: transaction
      });
      console.log('current project partners after delete and add partners', JSON.stringify(currentProjectPartners));  // LLEGAN BIEN LOS NUEVOS
      // missing the new cosponsor check in save project partner
      // update all project costs with the new project partner id matching the previous one by business_name
      for (let i = 0; i < prevProjectCostWithBusinessName.length; i++) {
        const previousSponsorRelation = prevProjectCostWithBusinessName[i];
        console.log('JSON prevprojectcostwithbusinessname', JSON.stringify(previousSponsorRelation));
        const currentProjectPartner = currentProjectPartners.find((cpp) =>  {
          const ccpData = cpp?.businessAssociateData[0];
          const previousData = previousSponsorRelation.projectPartnerData?.businessAssociateData;
          return ccpData?.business_name === previousData?.business_name;
        });
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
        console.log('sponsorDeleted && previousSponsorRelation.projectPartnerData?.code_partner_type_id', sponsorDeleted, previousSponsorRelation.projectPartnerData?.code_partner_type_id);
        if (sponsorDeleted && previousSponsorRelation.projectPartnerData?.code_partner_type_id === 88) {
          const oldPartnerDataForMHFDFunding = previousSponsorRelation.project_partner_id;
          // update project cost with is_active false where project_partner_id is the 88 from previusSponsorRelation
          await ProjectCost.update({
            is_active: false,
            code_cost_type_id: WORK_REQUEST_EDITED
          }, {
            where: {
              project_partner_id: oldPartnerDataForMHFDFunding
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