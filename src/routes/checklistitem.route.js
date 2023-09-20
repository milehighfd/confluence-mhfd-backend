import express from 'express';
import db from 'bc/config/db.js';
import auth from 'bc/auth/auth.js';
import moment from 'moment';

const router = express.Router();
const ProjectChecklist = db.projectChecklist;

router.get('/', async (req, res) => {
  try {
    let projectChecklist = await ProjectChecklist.findAll({
      attributes: [
        'project_checklist_id',
        'project_id',
        'code_phase_type_id',
        'completed_user_id',
        'completed_date'
      ]
    });
    res.send(projectChecklist);
  } catch (error) {
    res.status(500).send({ error: 'Internal server error' + error });
  }
});
router.post('/', async (req, res) => {
  try {
    const { project_id, code_phase_type_id } = req.body;
    const projectChecklist = await ProjectChecklist.findAll({
      where: {
        project_id,
        code_phase_type_id,        
      },
    });
    res.send(projectChecklist);
  } catch (error) {
    res.status(500).send({ error: 'Internal server error' + error });
  }
});

router.put('/updateName', auth, async (req, res) => {
  try {
    const { project_checklist_id, checklist_todo_name } = req.body;
    const projectChecklist = await ProjectChecklist.update(
      { checklist_todo_name },
      { where: { project_checklist_id } },
    );
    res.send(projectChecklist);
  } catch (error) {
    res.status(500).send({ error: 'Internal server error' });
  }
});

router.put('/toggle', auth, async (req, res) => {
  try {
    const { project_checklist_id, is_completed } = req.body;
    let projectChecklist = null;
    if (!is_completed){
      projectChecklist = await ProjectChecklist.update(
        {
          completed_date: moment().format('YYYY-MM-DD HH:mm:ss'),
          completed_user_id: req.user.user_id,
        },
        { where: { project_checklist_id } },
      );
    }else{
      projectChecklist = await ProjectChecklist.update(
        {
          completed_date: null,
          completed_user_id: null,
        },
        { where: { project_checklist_id } },
      );
    }    
    res.send(projectChecklist);
  } catch (error) {
    res.status(500).send({ error: 'Internal server error', error: error });
  }
});

router.post('/create', auth, async (req, res) => {
  try {
    const { project_id, code_phase_type_id } = req.body;
    const projectChecklist = await ProjectChecklist.create({
      project_id,
      code_phase_type_id,
      created_by: req.user.email,
      checklist_todo_name: 'New Checklist Item',
      last_modified_by: req.user.email,
    });
    res.send(projectChecklist);
  } catch (error) {
    res.status(500).send({ error: 'Internal server error' });
  }
});

router.delete('/', auth, async (req, res) => {
  try {
    const { project_checklist_id } = req.body;
    const projectChecklist = await ProjectChecklist.destroy({
      where: {
        project_checklist_id
      },
    });
    res.send({message: 'Project checklist item deleted', projectChecklist});
  } catch (error) {
    res.status(500).send({ error: 'Internal server error' + error});
  }
});

export default router;