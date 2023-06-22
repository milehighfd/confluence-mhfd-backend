import express from 'express';
import auth from 'bc/auth/auth.js';
import db from 'bc/config/db.js';

const CodeStudyReason = db.codeStudyReason;
const router = express.Router();

const getStudies = async (req, res) => {
  try {
    const studies = await CodeStudyReason.findAll();
    res.send(studies);
  } catch (error) {
    console.error(error);
    res.status(500).send('Could not retrieve studies');
  }
}

router.get('/', getStudies);

export default router;
