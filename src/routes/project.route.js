import express from 'express';
import db from 'bc/config/db.js';
import logger from 'bc/config/logger.js';

const Projects = db.project;
const router = express.Router();

const listProjects = async (req, res) => {
  const { offset = 0, limit = 10 } = req.query;
  let projects = await Projects.findAll({
    limit,
    offset,
    include: { all: true, nested: true }
  });
  logger.info('projects being called');
  res.send(projects);
};

router.post('/', listProjects);

export default router;
