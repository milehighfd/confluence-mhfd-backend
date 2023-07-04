import db from 'bc/config/db.js';

const CodeCostType = db.codeCostType;

export const getOverheadCostIds = async (transaction) => {
  try {
    const overheadcostIds = await CodeCostType.findAll({
      attributes: [
        'code_cost_type_id'
      ],
      where: {
        is_overhead: true
      },
      transaction: transaction
    });
    const filtered = overheadcostIds.filter((element) => element.code_cost_type_id !== 2)
      .map((element) => element.code_cost_type_id).filter(Number);
    return filtered;
  } catch (error) {
    throw new ProjectCostsError('Error getting overhead costs', { cause: error });
  }
};