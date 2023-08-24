import express from 'express';
import Multer from 'multer';
import { 
  editProjectWorkflow,
  updateIntoArcGis
} from 'bc/utils/create';
import auth from 'bc/auth/auth.js';

const router = express.Router();
const multer = Multer({
  storage: Multer.MemoryStorage,
  limits: {
    fileSize: 50 * 1024 * 1024
  }
});

router.post('/:projectid', [auth, multer.array('files')], async (req, res) => {
  try {
    const project_id = req.params.projectid;
    const type = req.body.type;
    const subtype = req.body.projectsubtype;
    console.log(' ************* \n\n START EDIT PROJECT ');
    const project = await editProjectWorkflow(req.body, req.user, req.files, type, subtype, project_id);
    res.send(project);
  } catch (error) {
    console.error('ERRORRRR',error);
    res.status(500).send(error);
  }
});

router.get('/:projectid', async (req, res) => {
  const project_id = req.params.projectid;
  console.log('Hey', project_id);
  await updateIntoArcGis(undefined, project_id);
  res.status(200).send({yes: 'yes'});
});

export default router;
