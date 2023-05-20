import express from 'express';
import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
import auth from 'bc/auth/auth.js';

const ProjectCost = db.projectCost;
const ProjectPartner = db.projectPartner;
const BusinessAssociates = db.businessAssociates;
const codePhaseType = db.codePhaseType;
const router = express.Router();

router.post('/get-costs-by-id/:id', [auth], async (req, res) => {
    let { id } = req.params;
    let filters = req.body;
    const PARTNER_FILTER = filters[0];
    const PHASE_FILTER = filters[1];
    const PROJECT_ACTIVE_STATE = 1;

    logger.info('get-costs-by-id');
    
    try {
        let where = {
            project_id: id,
            is_active: PROJECT_ACTIVE_STATE
        }
        if (PARTNER_FILTER) {
            where.project_partner_id = PARTNER_FILTER 
        }
        if (PHASE_FILTER) {
            where.code_phase_type_id = PHASE_FILTER 
        }
        let resProjectCost = await ProjectCost.findAll({
            where: where,
            raw: true,
            nest: true,
            attributes: ['agreement_number', 'amendment_number', 'code_phase_type_id', 'project_partner_id'],
        });
        resProjectCost = resProjectCost.filter(function (element) {
            if (element.agreement_number !== null || element.amendment_number !== null || element.code_phase_type_id !== null || element.project_partner_id !== null) {
                return element;
            }
        });
        await Promise.all(
            resProjectCost.map(async (projectCost) => {
                if (projectCost.project_partner_id !== null) {
                    const projectPartnerName = await ProjectPartner.findOne({
                        where: {
                            project_partner_id: projectCost.project_partner_id
                        },
                        attributes: ['business_associates_id'],
                        raw: true,
                        nest: true,
                        include: {
                            model: BusinessAssociates,
                            attributes: ['business_associate_name'],
                            required: true,
                        }
                    });
                    projectCost.project_partner_name = projectPartnerName.business_associate.business_associate_name;
                }
                if (projectCost.code_phase_type_id !== null) {
                    const codePhaseTypeName = await codePhaseType.findOne({
                        where: {
                            code_phase_type_id: projectCost.code_phase_type_id
                        },
                        attributes: ['phase_name'],
                        raw: true,
                        nest: true,
                    });
                    projectCost.code_phase_type_name = codePhaseTypeName.phase_name;
                }
                return projectCost
            })
        );
        res.status(200).send(resProjectCost);
    } catch (error) {
        logger.error(error);
        res.status(500).send({ error: error });
    }
});

export default router;