import express from 'express';
import db from 'bc/config/db.js';

const router = express.Router();
const CodePhaseType = db.codePhaseType;
const CodeStatusType = db.codeStatusType;

router.post('/', async (req, res) => {
  const code_project_type_id = req.body.tabKey;
  try {
    const codePhaseType = await CodePhaseType.findAll({
      where: {
        code_project_type_id: code_project_type_id
      },      
      include: { model: CodeStatusType},
      order: ['code_project_type_id','code_status_type_id'],
    });
    return res.send(codePhaseType);
  } catch(error) {
    res.status(500).send(error);
  }
});

export default router;
