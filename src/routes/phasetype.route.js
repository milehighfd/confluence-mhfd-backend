import express from 'express';
import db from 'bc/config/db.js';
import sequelize from 'sequelize';

const router = express.Router();
const CodePhaseType = db.codePhaseType;
const CodeRuleActionItem = db.codeRuleActionItem;
const ProjectActionItem = db.projectActionItem;
const ProjectStatus = db.projectStatus;
const Op = sequelize.Op;

router.post('/', async (req, res) => {
  const code_project_type_id = req.body.tabKey;
  try {
    const codePhaseType = await CodePhaseType.findAll({
      where: {
        code_project_type_id: code_project_type_id,
        code_status_type_id: {
          [Op.gt]: 4
        }
      },
      include: {
        all:true
      },
      order: ['code_project_type_id', 'code_status_type_id', 'phase_ordinal_position'],
    });
    return res.send(codePhaseType);
  } catch(error) {
    console.log(error)
    res.status(500).send(error);
  }
});

router.post('/phases', async (req, res) => {
  const code_project_type_id = req.body.code_phase_type_id;
  const project_id = req.body.project_id;
  try {
    const codeRuleActionItem1 = await CodeRuleActionItem.findAll({
      where: {
        code_phase_type_id: code_project_type_id
      },
      include: {
        model: ProjectActionItem,       
        where: {
          project_id: project_id,
        },
        required: false
      },
    });
    return res.send(codeRuleActionItem1);
  } catch(error) {
    console.log(error)
    res.status(500).send(error);
  }
});
router.post('/status', async (req, res) => {
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
    throw error;
  }
});


export default router;
