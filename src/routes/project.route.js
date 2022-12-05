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

router.get('/', async (req, res) => {
  const insertQuery = `INSERT INTO project (project_name, description, code_project_type_id, start_date, current_project_status_id, created_date, modified_date, last_modified_by, created_by)
  OUTPUT inserted . *
  VALUES('test-name', 'test', 5, '2007-05-09 23:59:59', 5, '2007-05-09 23:59:59', '2007-05-09 23:59:59', 'angel', 'angel')`;
  logger.info('my query ' + insertQuery);
  const update = await db.sequelize.query(
    insertQuery,
    {
      type: db.sequelize.QueryTypes.INSERT,
    })
  res.send(update);
});
router.post('/', listProjects);

export default router;
