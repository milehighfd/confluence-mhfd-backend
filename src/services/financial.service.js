import db from 'bc/config/db.js';
import moment from 'moment';

const ProjectCost = db.projectCost;
const ProjectPartner = db.projectPartner;
const BusinessAssociates = db.businessAssociates;
const codePhaseType = db.codePhaseType;
const CodeCostType = db.codeCostType

const getFinancialInformation = async (id, filters) => {
    const PARTNER_FILTER = parseInt(filters[0]);
    const PHASE_FILTER = filters[1];
    const IS_INCOME = filters[2];
    const PROJECT_ACTIVE_STATE = 1;
    let resProjectCost;
    let whereConditions = {
        project_id: id,
        is_active: PROJECT_ACTIVE_STATE
    }
    // todo update -1 state to mhfd partner id 
    const MHFD_PARTNER_ID = -1

    if (PARTNER_FILTER && PARTNER_FILTER !== MHFD_PARTNER_ID) {
        const partner_allowed = await ProjectPartner.findAll({
            where: {
                business_associates_id: PARTNER_FILTER
            },
            attributes: ['project_partner_id'],
            raw: true,
            nest: true,
        });
        const partner_allowed_ids = partner_allowed.map(a => a.project_partner_id);
        whereConditions.project_partner_id = partner_allowed_ids
    }
    if (PHASE_FILTER) {
        whereConditions.code_phase_type_id = PHASE_FILTER
    }

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
        raw: true,
        nest: true,
        attributes: ['code_cost_type_id']
    })

    const code_cost_type_allowed_ids = code_cost_type_allowed.map(a => a.code_cost_type_id);
    whereConditions.code_cost_type_id = code_cost_type_allowed_ids;

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
        whereConditions.code_cost_type_id = arrayValues;
    }

    resProjectCost = await ProjectCost.findAll({
        where: whereConditions,
        raw: true,
        nest: true,
        attributes: ['agreement_number', 'amendment_number', 'code_phase_type_id', 'project_partner_id', 'cost', 'cost_project_partner_contribution', 'effective_date'],
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
                        attributes: ['business_name', 'business_associates_id'],
                        required: true,
                    }
                });
                projectCost.business_associates_id = projectPartnerName?.business_associate?.business_associates_id;
                projectCost.project_partner_name = projectPartnerName?.business_associate?.business_name || 'N/A';
            }

            if (projectCost.code_phase_type_id !== null) {
                const codePhaseTypeName = await codePhaseType.findOne({
                    where: {
                        code_phase_type_id: projectCost.code_phase_type_id
                    },
                    attributes: ['phase_name', 'phase_ordinal_position'],
                    raw: true,
                    nest: true,
                });
                projectCost.code_phase_type = { name: codePhaseTypeName?.phase_name || 'N/A' };
                projectCost.code_phase_type.sort_value = codePhaseTypeName?.phase_ordinal_position
            }
            return projectCost
        })
    );
    if (!PARTNER_FILTER || PARTNER_FILTER === MHFD_PARTNER_ID) {
        // mhfd project cost creation 
        resProjectCost.forEach(function callback(projectCost) {
            if (projectCost?.cost_project_partner_contribution && projectCost?.cost > 0 && !projectCost?.code_cost_type?.cost_type_name.includes('Vendor')) {
                resProjectCost.push({
                    "agreement_number": projectCost.agreement_number,
                    "amendment_number": projectCost.amendment_number,
                    "code_phase_type_id": projectCost.code_phase_type_id,
                    "project_partner_id": MHFD_PARTNER_ID,
                    "cost": projectCost.cost - projectCost.cost_project_partner_contribution,
                    "cost_project_partner_contribution": projectCost.cost_project_partner_contribution,
                    "effective_date": projectCost.effective_date,
                    "code_cost_type": {
                        "code_cost_type_id": projectCost.code_cost_type.code_cost_type_id,
                        "cost_type_name": projectCost.code_cost_type.cost_type_name,
                        "is_income": projectCost.code_cost_type.is_income
                    },
                    "business_associates_id": MHFD_PARTNER_ID,
                    "project_partner_name": 'MHFD',
                    "code_phase_type": {
                        "name": projectCost.code_phase_type?.name || '',
                        "sort_value": projectCost.code_phase_type?.sort_value || '',
                    },
                    "code_phase_type_name": projectCost.code_phase_type_name,
                })
            }
        });
    }

    await Promise.all(
        resProjectCost.map(e => {
            resProjectCost.map(element => {
                if (e.amendment_number === element.amendment_number && e.agreement_number === element.agreement_number && e.code_phase_type_id === element.code_phase_type_id
                    && e.project_partner_id === element.project_partner_id && element.code_cost_type?.cost_type_name?.includes(e?.code_cost_type?.cost_type_name.split(' ')[0])) {

                    if (element?.code_cost_type?.cost_type_name?.includes('Projected')) {
                        e.projected = { 'is_income': element.code_cost_type.is_income, 'cost': element.cost || 0 }
                    }

                    if (element?.code_cost_type?.cost_type_name?.includes('Encumbered') && !element?.code_cost_type?.cost_type_name?.includes('Tyler Encumbered')) {
                        if (element?.code_cost_type?.cost_type_name?.includes('LG Funds Encumbered') && element?.project_partner_name !== 'MHFD') {
                            e.encumbered = { 'is_income': element.code_cost_type.is_income, 'cost': element.cost_project_partner_contribution || 0 }
                        } else {
                            e.encumbered = { 'is_income': element.code_cost_type.is_income, 'cost': element.cost || 0 }
                        }
                    }

                    if (element?.code_cost_type?.cost_type_name?.includes('Tyler Encumbered')) {
                        e.tyler_encumbered = { 'is_income': element.code_cost_type.is_income, 'cost': element.cost || 0 }
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
    if (PARTNER_FILTER === MHFD_PARTNER_ID) {
        uniquesProjectCost = uniquesProjectCost.filter(value => value.project_partner_id === MHFD_PARTNER_ID);
    }

    uniquesProjectCost.map(element => {
        if (element.effective_date) {
            element.effective_date = moment(element?.effective_date).format('MM-DD-YYYY')
        }
        
        if (element.agreement_number) {
            element.agreement_number = element.agreement_number.replace(/\D/g, '');
            element.agreement_number = element.agreement_number.slice(0, 2) + '-' + element.agreement_number.slice(2, 4) + '.' + element.agreement_number.slice(4, 6);
        }
    })

    return uniquesProjectCost;
}

export default {
    getFinancialInformation,
}
