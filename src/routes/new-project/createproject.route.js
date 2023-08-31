import express from 'express';
import Multer from 'multer';
import { 
  createProjectArcgis,
  createProjectWorkflow,
  updateProjectArcgis
} from 'bc/utils/create';
import auth from 'bc/auth/auth.js';
import db from 'bc/config/db.js';

const ServiceArea = db.codeServiceArea;
const LocalGovernment = db.codeLocalGoverment;
const StateCounty = db.codeStateCounty;
const Project = db.project;
const User = db.user;
const BusinessAssociateContact = db.businessAssociateContact;
const BusinessAssociates = db.businessAssociates;
const BusinessAdress = db.businessAdress;


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
    const subtype = req.body.projectsubtype;
    const project = await createProjectWorkflow(req.body, req.user, req.files, type, subtype);
    res.send(project);
  } catch (error) {
    console.error('ERROR',error);
    res.status(500).send(error);
  }
});

router.post('/arcgis', auth, async (req, res) => {
  try {
    const createArcgis = await createProjectArcgis(req.body);
    res.send(createArcgis);
  } catch (error) {
    console.error('ERROR at create ARCGIS',error);
    res.status(500).send(error);
  }
});

router.post('/arcgis-update', auth, async (req, res) => {
  try {
    const updateArcGis = await updateProjectArcgis(req.body);
    res.send(updateArcGis);
  } catch (error) {
    console.error('ERROR at update ARCGIS',error);
  }
});
router.post('/countydata', auth, async (req, res) => {
  const { state } = req.body;
  const stateString = Array.isArray(state) ? state.join(',') : state;
  try {
    const sqlQuery1 = `
    SELECT DISTINCT lg.code_service_area_id, lg.service_area_name
    FROM CODE_SERVICE_AREA_4326 lg
    JOIN CODE_STATE_COUNTY_CLIP_4326 c ON lg.Shape.STIntersects(c.Shape) = 1
    WHERE c.state_county_id IN (${stateString})
    `;
    const sqlQuery2 = `
    SELECT DISTINCT lg.code_local_government_id, lg.local_government_name 
    FROM CODE_LOCAL_GOVERNMENT_4326 lg
    JOIN CODE_STATE_COUNTY_CLIP_4326 c ON lg.Shape.STIntersects(c.Shape) = 1
    WHERE c.state_county_id IN (${stateString})
    `;
    const result1 = await db.sequelize.query(sqlQuery1, { type: db.sequelize.QueryTypes.SELECT});
    const result2 = await db.sequelize.query(sqlQuery2, { type: db.sequelize.QueryTypes.SELECT});    
    res.send({ serviceArea: result1, localGovernment: result2 });
  } catch (error) {
    console.error('ERROR', error);
    res.status(500).send(error);
  }
});

router.get('/createdata', auth, async (req, res) => {
  const {project_id} = req.query;
  try {
    const project = await Project.findOne({
      attributes: ['created_by', 'created_date'],
      where: { project_id }
    });
    const user = await User.findOne({
      attributes: ['name'],
      where: { email: project.created_by },
      include: {
        attributes: ['business_associate_contact_id'],
        model: BusinessAssociateContact,
        include: {
          attributes: ['business_address_id'],
          model: BusinessAdress,
          include: {
            attributes: ['business_name'],
            model: BusinessAssociates,
            required: false
          },
          required: false
        },
        required: false
      },
    });
    res.send({ user, created_date: project.created_date });
  } catch (error) {
    console.error('ERROR', error);
    res.status(500).send(error);
  }
});

export default router;
