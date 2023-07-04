import express from 'express';
import Multer from 'multer';
import { 
  createProjectWorkflow
} from 'bc/utils/create';
import auth from 'bc/auth/auth.js';

const router = express.Router();
const multer = Multer({
  storage: Multer.MemoryStorage,
  limits: {
    fileSize: 50 * 1024 * 1024
  }
});

router.post('/', [auth, multer.array('files')], async (req, res) => {
  try {
    const type = req.body.type;
    const project = await createProjectWorkflow(req.body, req.user, req.files, type, req.projectsubtype);
    res.send(project);
  } catch (error) {
    console.error('ERRORRRR',error);
    res.status(500).send(error);
  }
});

export default router;
