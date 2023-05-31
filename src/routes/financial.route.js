import express from 'express';
import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';
import auth from 'bc/auth/auth.js';

const ProjectCost = db.projectCost;
const ProjectPartner = db.projectPartner;
const BusinessAssociates = db.businessAssociates;
const codePhaseType = db.codePhaseType;
const CodeCostType = db.codeCostType
const router = express.Router();


router.post('/get-costs-by-id/:id', [auth], async (req, res) => {
    logger.info('get-costs-by-id for project financials');
    let { id } = req.params;
    let filters = req.body;
    const PARTNER_FILTER = filters[0];
    const PHASE_FILTER = filters[1];
    const IS_INCOME = filters[2];
    const PROJECT_ACTIVE_STATE = 1;
    let resProjectCost;
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
    try {
        const code_cost_type_allowed = await CodeCostType.findAll({
            where: {
                cost_type_name: ['LG Funds Projected',
                    'LG Funds Encumbered',
                    'LG Funds Tyler Encumbered',
                    'MHFD Funds Projected',
                    'MHFD Funds Encumbered',
                    'MHFD Funds Tyler Encumbered',
                    'Vendor Agreement Projected',
                    'Vendor Agreement Encumbered',
                    'Vendor Agreement Tyler Encumbered']
            },
            attributes: ['code_cost_type_id']
        })

        const code_cost_type_allowed_ids = code_cost_type_allowed.map(a => a.code_cost_type_id);
        where.code_cost_type_id = code_cost_type_allowed_ids;

        if (IS_INCOME && (IS_INCOME?.income !== true || IS_INCOME?.expense !== true)) {
            let INCOME_STATE;
            if (IS_INCOME?.income === true) {
                INCOME_STATE = 1;
            }
            if (IS_INCOME?.expense === true) {
                INCOME_STATE = 0;
            }
            let isIncomeState = await CodeCostType.findAll({
                where: {
                    is_income: INCOME_STATE
                },
                raw: true,
                nest: true,
                attributes: ['code_cost_type_id'],
            });
            let arrayValues = isIncomeState.map(a => a.code_cost_type_id);
            where.code_cost_type_id = arrayValues;
        }

        resProjectCost = await ProjectCost.findAll({
            where: where,
            raw: true,
            nest: true,
            attributes: ['agreement_number', 'amendment_number', 'code_phase_type_id', 'project_partner_id', 'cost', 'cost_project_partner_contribution'],
            include: {
                model: CodeCostType,
                required: true,
                attributes: ['code_cost_type_id', 'cost_type_name', 'is_income']
            }
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
                    console.log(projectPartnerName)
                    projectCost.project_partner_name = projectPartnerName?.business_associate?.business_associate_name || 'N/A';
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
                    projectCost.code_phase_type_name = codePhaseTypeName?.phase_name || 'N/A';
                }
                return projectCost
            })
        );

        let auxResProjecCost = resProjectCost;

        auxResProjecCost.forEach(function callback(projectCost, index) {
            projectCost.sortValue = index;
            if (projectCost?.cost_project_partner_contribution && projectCost?.cost > 0) {
                resProjectCost.push({
                    "agreement_number": projectCost.agreement_number,
                    "amendment_number": projectCost.amendment_number,
                    "code_phase_type_id": projectCost.code_phase_type_id,
                    "project_partner_id": 0,
                    "cost": projectCost.cost - projectCost.cost_project_partner_contribution,
                    "cost_project_partner_contribution": projectCost.cost_project_partner_contribution,
                    "code_cost_type": {
                        "code_cost_type_id": projectCost.code_cost_type.code_cost_type_id,
                        "cost_type_name": projectCost.code_cost_type.cost_type_name,
                        "is_income": projectCost.code_cost_type.is_income
                    },
                    "project_partner_name": 'MHFD',
                    "code_phase_type_name": projectCost.code_phase_type_name,
                    "sortValue": projectCost.sortValue,
                })
            }
        });


        await Promise.all(
            resProjectCost.map(e => {
                resProjectCost.map(element => {
                    if (e.amendment_number === element.amendment_number && e.agreement_number === element.agreement_number && e.code_phase_type_id === element.code_phase_type_id
                        && e.project_partner_id === element.project_partner_id && element.code_cost_type?.cost_type_name?.includes(e?.code_cost_type?.cost_type_name.split(' ')[0])) {

                        if (element?.code_cost_type?.cost_type_name?.includes('Projected')) {
                            e.projected = { 'cost': element.cost || 0 }
                        }

                        if (element?.code_cost_type?.cost_type_name?.includes('Encumbered') && !element?.code_cost_type?.cost_type_name?.includes('Tyler Encumbered')) {
                            e.encumbered = { 'cost': element.cost || 0 }
                        }

                        if (element?.code_cost_type?.cost_type_name?.includes('Tyler Encumbered')) {
                            e.tyler_encumbered = { 'cost': element.cost || 0 }
                        }
                    }
                })
            })
        );

        let uniquesProjectCost = resProjectCost.filter((value, index, self) =>
            index === self.findIndex((t) => (
                (t.agreement_number === value.agreement_number && t.amendment_number === value.amendment_number && t.code_phase_type_id === value.code_phase_type_id
                    && t.project_partner_id === value.project_partner_id)
            )),
        )
        res.status(200).send(uniquesProjectCost);
    } catch (error) {
        logger.error(error);
        res.status(500).send({ error: error });
    }
});

export default router;