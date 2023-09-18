import express from 'express';
import db from 'bc/config/db.js';
import sequelize from 'sequelize';
import auth from 'bc/auth/auth.js';
import logger from 'bc/config/logger.js';

const router = express.Router();
const ProjectChecklist = db.projectChecklist;

router.get('/', async (req, res) => {
  try {
    let projectChecklist = await ProjectChecklist.findAll({
      attributes: [
        'id',
        'project_id',
        'phase_type_id',
        'is_completed',
      ]
    });
    res.send(projectChecklist);
  } catch (error) {
    res.status(500).send({ error: 'Internal server error' + error });
  }
});
router.post('/', async (req, res) => {
  try {
    const { project_id, phase_type_id } = req.body;
    const projectChecklist = await ProjectChecklist.findAll({
      where: {
        project_id,
        phase_type_id,
      },
    });
    res.send(projectChecklist);
  } catch (error) {
    res.status(500).send({ error: 'Internal server error' });
  }
});

router.put('/updateName', auth, async (req, res) => {
  try {
    const { id, checklist_todo_name } = req.body;
    const projectChecklist = await ProjectChecklist.update(
      { checklist_todo_name },
      { where: { id } },
    );
    res.send(projectChecklist);
  } catch (error) {
    res.status(500).send({ error: 'Internal server error' });
  }
});

router.put('/toggle', auth, async (req, res) => {
  try {
    const { id, is_completed } = req.body;
    const projectChecklist = await ProjectChecklist.update(
      { is_completed: is_completed },
      { where: { id } },
    );
    res.send(projectChecklist);
  } catch (error) {
    res.status(500).send({ error: 'Internal server error', error: error });
  }
});

router.post('/create', auth, async (req, res) => {
  try {
    const { project_id, phase_type_id } = req.body;
    const projectChecklist = await ProjectChecklist.create({
      project_id,
      phase_type_id,
      is_completed: false,
    });
    res.send(projectChecklist);
  } catch (error) {
    res.status(500).send({ error: 'Internal server error' });
  }
});

router.delete('/', auth, async (req, res) => {
  try {
    const { id } = req.body;
    const projectChecklist = await ProjectChecklist.destroy({
      where: {
        id
      },
    });
    res.send({message: 'Project checklist item deleted', projectChecklist});
  } catch (error) {
    res.status(500).send({ error: 'Internal server error' + error});
  }
});

export default router;