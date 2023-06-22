import express from 'express';
import auth from 'bc/auth/auth.js';
import db from 'bc/config/db.js';

const CodeStudyReason = db.codeStudyReason;
const router = express.Router();

const childs = [
  'Changed watershed conditions (land-use, topo, regional, detention, etc.)',
  'New Opportunity Available',
  'Not aligned with current stream management practices'];// lle na
const isChild = name => childs.includes(name);
const PARENT = 'Master plan recomendations are outdated';
const getReason = (data) => {
  if (isChild(data.reason_name)) {
    return PARENT;
  }
  return data.reason_name;
}
const getStudies = async (req, res) => {
  try {
    const studies = await CodeStudyReason.findAll();
    res.send(
      studies.map(d => d.dataValues)
      .map(data => ({
        ...data,
        reason: getReason(data),
        isSubreason: isChild(data.reason_name),
        isParent: data.reason_name === PARENT
      }))
    );
  } catch (error) {
    console.error(error);
    res.status(500).send('Could not retrieve studies');
  }
}

router.get('/', getStudies);

export default router;
