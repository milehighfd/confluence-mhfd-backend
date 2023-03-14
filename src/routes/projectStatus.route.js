import express from 'express';
import db from 'bc/config/db.js';
import sequelize from 'sequelize';

const router = express.Router();
const ProjectStatus = db.projectStatus;
const Op = sequelize.Op;

router.post('/', async (req, res) => {
  const code_phase_type_id = req.body.code_phase_type_id;
  const project_id = req.body.project_id;
  try {
    const list = await ProjectStatus.findAll({      
      where: {
        code_phase_type_id: code_phase_type_id,
        project_id: project_id
      },
    });
    return res.send(list);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

router.put('/', async (req, res) => {
  const code_phase_type_id = req.body.code_phase_type_id;
  const project_id = req.body.project_id;
  const comments = req.body.comments;
  const actual_start_date = req.body.actual_start_date;
  const actual_end_date = req.body.actual_end_date;
  try {
    const result = await ProjectStatus.update(
      { comments: comments, actual_start_date: actual_start_date, actual_end_date: actual_end_date },
      { where: { project_id: project_id, code_phase_type_id: code_phase_type_id } }
    )
    return res.send(result);
  } catch (error) {
    return res.status(500).send(error);
  }
});


export default router;
