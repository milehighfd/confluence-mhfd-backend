import express from 'express';
import db from 'bc/config/db.js';
import sequelize from 'sequelize';

const router = express.Router();
const projectStatus = db.projectStatus;
const Op = sequelize.Op;

router.post('/', async (req, res) => {
  const code_phase_type_id = req.body.code_phase_type_id;
  const project_id = req.body.project_id;
  try {
    const list = await projectStatus.findAll({      
      where: {
        code_phase_type_id: code_phase_type_id,
        project_id: project_id
      },
    });
    return res.send(list);
  } catch (error) {
    console.log(error);
    throw error;
  }
});

router.put('/', async (req, res) => {
  const code_phase_type_id = req.body.code_phase_type_id;
  const project_id = req.body.project_id;
  const comments = req.body.comments;
  try {
    const result = await projectStatus.update(
      { comments: comments },
      { where: { project_id: project_id, code_phase_type_id: code_phase_type_id } }
    )
    return res.send(result);
  } catch (err) {
    throw err;
  }
});


export default router;
