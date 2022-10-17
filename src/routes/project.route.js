import express from 'express';
import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

const Projects = db.project;
const router = express.Router();

router.get('/', async (req, res) => {
  let projects = await Projects.findAll();
  logger.info('projects being called');
  res.send(projects);
});

export default router;
