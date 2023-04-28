import express from 'express';
import db from 'bc/config/db.js';
import sequelize from 'sequelize';
import logger from 'bc/config/logger.js';

const router = express.Router();
const CodePhaseType = db.codePhaseType;
const CodeRuleActionItem = db.codeRuleActionItem;
const ProjectActionItem = db.projectActionItem;
const Op = sequelize.Op;

router.get('/', async (req, res) => {
  logger.info(`Starting endpoint projectationitem.route/filters with params ${JSON.stringify(req.params, null, 2)}`);
  logger.info(`Starting function findAll for projectationitem.route/`);
  let boardProjects = await ProjectActionItem.findAll({      
    attributes: ['project_id','project_action_item_id','code_rule_action_item_id'],
    include: {
      all:true
    },
  });
  logger.info(`Finished function findAll for projectationitem.route/`);
  res.send(boardProjects);
});

router.post('/', async (req, res) => {
  logger.info(`Starting endpoint projectationitem.route/filters with params ${JSON.stringify(req.params, null, 2)}`);
  const  name  = req.body;  
  try {
    logger.info(`Starting function create for projectationitem.route/`);
    const group = await ProjectActionItem.create(name);
    logger.info(`Finished function create for projectationitem.route/`);
    return res.send(group);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

router.delete('/', async (req, res) => {
  logger.info(`Starting endpoint projectationitem.route/filters with params ${JSON.stringify(req.params, null, 2)}`);
  const  name  = req.body;  
  try {
    logger.info(`Starting function destroy for projectationitem.route/`);
    const project =  await ProjectActionItem.destroy({
      where: { code_rule_action_item_id: name.code_rule_action_item_id ,
      project_id: name.project_id  },
    });
    logger.info(`Finished function findAll for projectationitem.route/`);
    if (project) {      
      res.status(200).send('Destroyed'); 
    } else {  
      res.status(200).send('Not Found');  
    }
   
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

export default router;
