import express from 'express';
import logger from 'bc/config/logger.js';

const router = express.Router();

router.get('/get-images-drive', async (req, res) => {
  logger.info(`Starting endpoint drive.route/get-images-drive with params ${JSON.stringify(req.params, null, 2)}`);
  res
    .status(200)
    .send([
      'Confluence Park25.jpg',
      'Drainageway A25.jpg',
      'Eco Park25.jpg',
      'Low drop25.jpg',
      'Westminster Station25.jpg'
    ]);
});

export default router;
