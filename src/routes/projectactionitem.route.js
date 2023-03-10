import express from 'express';
import db from 'bc/config/db.js';
import sequelize from 'sequelize';

const router = express.Router();
const CodePhaseType = db.codePhaseType;
const CodeRuleActionItem = db.codeRuleActionItem;
const ProjectActionItem = db.projectActionItem;
const Op = sequelize.Op;

router.get('/', async (req, res) => {
  let boardProjects = await ProjectActionItem.findAll({      
    attributes: ['project_id','project_action_item_id','code_rule_action_item_id'],
    include: {
      all:true
    },
  });
  res.send(boardProjects);
});

router.post('/', async (req, res) => {
  const  name  = req.body;  
  try {
    const group = await ProjectActionItem.create(name);
    return res.send(group);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

router.delete('/', async (req, res) => {
  const  name  = req.body;  
  try {
    const project =  await ProjectActionItem.destroy({
      where: { code_rule_action_item_id: name.code_rule_action_item_id ,
      project_id: name.project_id  },
    });
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
