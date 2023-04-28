import express from 'express';
import db from 'bc/config/db.js';
import sequelize from 'sequelize';
import logger from 'bc/config/logger.js';

const router = express.Router();
const CodePhaseType = db.codePhaseType;
const CodeRuleActionItem = db.codeRuleActionItem;
const ProjectActionItem = db.projectActionItem;
const ProjectStatus = db.projectStatus;
const Op = sequelize.Op;

router.post('/', async (req, res) => {
  logger.info(`Starting endpoint phasetype.route/ with params ${JSON.stringify(req.params, null, 2)}`);
  const code_project_type_id = req.body.tabKey;
  try {
    logger.info(`Starting function findAll for phasetype.route/`);
    const codePhaseType = await CodePhaseType.findAll({
      where: {
        code_project_type_id: code_project_type_id,
        code_status_type_id: {
          [Op.gt]: 4
        },
        phase_ordinal_position:{
          [Op.not]: -1,        
        }
      },
      include: {
        all:true
      },
      order: ['phase_ordinal_position'],
    });
    logger.info(`Finished function findAll for phasetype.route/`);
    return res.send(codePhaseType);
  } catch(error) {
    console.log(error)
    res.status(500).send(error);
  }
});

router.post('/phases', async (req, res) => {
  logger.info(`Starting endpoint phasetype.route/phases with params ${JSON.stringify(req.params, null, 2)}`);
  const code_project_type_id = req.body.code_phase_type_id;
  const project_id = req.body.project_id;
  try {
    logger.info(`Starting function findAll for phasetype.route/phases`);
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
    logger.info(`Finished function findAll for phasetype.route/phases`);
    return res.send(codeRuleActionItem1);
  } catch(error) {
    console.log(error)
    res.status(500).send(error);
  }
});
//This endpoint fails the test
router.post('/status', async (req, res) => {
  logger.info(`Starting endpoint phasetype.route/status with params ${JSON.stringify(req.params, null, 2)}`);
  const code_phase_type_id = req.body.code_phase_type_id;
  const project_id = req.body.project_id;
  try {
    logger.info(`Starting function findAll for phasetype.route/status`);
    const list = await ProjectStatus.findAll({      
      where: {
        code_phase_type_id: code_phase_type_id,
        project_id: project_id
      },
    });
    logger.info(`Starting function findAll for phasetype.route/status`);
    return res.send(list);
  } catch (error) {
    console.log(error);
    throw error;
  }
});


export default router;
