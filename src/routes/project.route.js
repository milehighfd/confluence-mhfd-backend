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
  await db.sequelize.transaction({ type: db.Sequelize.Transaction.TYPES.SERIALIZABLE }, async (transaction) => {
    db.sequelize.query('SET IDENTITY_INSERT [project] ON;', { transaction });
    let x = new Projects({
      project_id: 1000404,
      project_name: 'test',
      code_project_type_id: 5,
      code_project_subtype_id: 3,
      start_date: '2022-10-24 21:54:00.000',
      created_date: '2022-10-24 21:54:00.000',
      modified_date: '2022-10-24 21:54:00.000',
      last_modified_by: 'jose',
      created_by: 'jose'
    }, {
      transaction
    });
    await x.save();
    res.send(x);
 });

});
router.post('/', listProjects);

export default router;
