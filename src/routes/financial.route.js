import express from 'express';
import logger from 'bc/config/logger.js';
import auth from 'bc/auth/auth.js';
import financialService from 'bc/services/financial.service.js';

const router = express.Router();

router.post('/get-costs-by-id/:id', [auth], async (req, res) => {
  logger.info('get-costs-by-id for project financials');
  let { id } = req.params;
  let filters = req.body;
  try {
    const financialInformation = await financialService.getFinancialInformation(id, filters);
    res.status(200).send(financialInformation);
  } catch (error) {
    logger.error(error);
    res.status(500).send({ error: error });
  }
});

export default router;