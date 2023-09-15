import express from 'express';
import db from 'bc/config/db.js';
import sequelize from 'sequelize';
import auth from 'bc/auth/auth.js';
import logger from 'bc/config/logger.js';

const router = express.Router();
const ProjectChecklist = db.projectChecklist;

router.get('/', async (req, res) => {
  logger.info(`Starting endpoint projectationitem.route/filters with params ${JSON.stringify(req.params, null, 2)}`);
  logger.info(`Starting function findAll for projectationitem.route/`);
  let projectChecklist = await ProjectChecklist.findAll();
  logger.info(`Finished function findAll for projectationitem.route/`);
  res.send(projectChecklist);
});

router.post('/', async (req, res) => {
  try {
    const { project_id, phase_type_id } = req.body;
    logger.info(`Starting endpoint projectationitem.route/ with params ${JSON.stringify(req.body, null, 2)}`);
    logger.info(`Starting function findAll for projectationitem.route/`);
    const projectChecklist = await ProjectChecklist.findAll({
      where: {
        project_id,
        phase_type_id,
      },
    });
    logger.info(`Finished function findAll for projectationitem.route/`);
    res.send(projectChecklist);
  } catch (error) {
    logger.error(`Error in projectationitem.route/ findAll: ${error}`);
    res.status(500).send({ error: 'Internal server error' });
  }
});

router.put('/updateName', auth, async (req, res) => {
  try {
    const { id, checklist_todo_name } = req.body;
    logger.info(`Starting endpoint projectationitem.route/ with params ${JSON.stringify(req.body, null, 2)}`);
    logger.info(`Starting function update for projectationitem.route/`);
    const projectChecklist = await ProjectChecklist.update(
      { checklist_todo_name },
      { where: { id } },
    );
    logger.info(`Finished function update for projectationitem.route/`);
    res.send(projectChecklist);
  } catch (error) {
    logger.error(`Error in projectationitem.route/ update: ${error}`);
    res.status(500).send({ error: 'Internal server error' });
  }
});

router.put('/', async (req, res) => {
  try {
    const { project_id, phase_type_id } = req.body;
    logger.info(`Starting endpoint projectationitem.route/ with params ${JSON.stringify(req.body, null, 2)}`);
    logger.info(`Starting function update for projectationitem.route/`);
    const projectChecklist = await ProjectChecklist.update(
      { is_completed: db.sequelize.literal('NOT is_completed') },
      { where: { project_id, phase_type_id } },
    );
    logger.info(`Finished function update for projectationitem.route/`);
    res.send(projectChecklist);
  } catch (error) {
    logger.error(`Error in projectationitem.route/ update: ${error}`);
    res.status(500).send({ error: 'Internal server error' });
  }
});

router.post('/create', auth, async (req, res) => {
  try {
    const { project_id, phase_type_id } = req.body;
    logger.info(`Starting endpoint projectationitem.route/ with params ${JSON.stringify(req.body, null, 2)}`);
    logger.info(`Starting function create for projectationitem.route/`);
    const projectChecklist = await ProjectChecklist.create({
      project_id,
      phase_type_id,
      is_completed: false,
    });
    logger.info(`Finished function create for projectationitem.route/`);
    res.send(projectChecklist);
  } catch (error) {
    logger.error(`Error in projectationitem.route/ create: ${error}`);
    res.status(500).send({ error: 'Internal server error' });
  }
});

router.delete('/', auth, async (req, res) => {
  try {
    const { project_id, phase_type_id } = req.body;
    logger.info(`Starting endpoint projectationitem.route/ with params ${JSON.stringify(req.body, null, 2)}`);
    logger.info(`Starting function destroy for projectationitem.route/`);
    const projectChecklist = await ProjectChecklist.destroy({
      where: {
        project_id,
        phase_type_id,
      },
    });
    logger.info(`Finished function destroy for projectationitem.route/`);
    res.send(projectChecklist);
  } catch (error) {
    logger.error(`Error in projectationitem.route/ destroy: ${error}`);
    res.status(500).send({ error: 'Internal server error' });
  }
});

export default router;