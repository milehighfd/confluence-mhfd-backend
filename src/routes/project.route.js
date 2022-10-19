import express from 'express';
import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

const Projects = db.project;
const router = express.Router();

router.get('/', async (req, res) => {
  const { offset = 0, limit = 10 } = req.query;
  let projects = await Projects.findAll({
    limit,
    offset
  });
  logger.info('projects being called');
  res.send(projects);
});

export default router;
