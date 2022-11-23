import express from 'express';
// import { ROLES } from 'bc/lib/enumConstants.js';
import db from 'bc/config/db.js';
// mimport auth2 from 'bc/auth0/auth2.js';

const router = express.Router();
const ServiceArea = db.codeServiceArea;
const LocalGovernment = db.codeLocalGoverment;
const StateCounty = db.codeStateCounty;


router.get('/all-localities', async (req, res) => {
  /*const sa = await ServiceArea.findAll({
    include: { all: true, nested: true },
    attributes: ['code_service_area_id', 'service_area_name']
  }) */
  const [saData] = await db.sequelize.query(`SELECT Shape.STEnvelope( ).STAsText() as bbox, code_service_area_id,
  service_area_name FROM CODE_SERVICE_AREA_4326`);
  const sa = saData.map(result => {
    return { 
      name: result.service_area_name + 'Service Area',
      id: result.code_service_area_id,
      table: 'CODE_SERVICE_AREA',
      bbox: result.bbox
    }
  });
  /*const lg = await LocalGovernment.findAll({
    include: { all: true, nested: true },
    attributes: ['code_local_government_id', 'local_government_name']
  })*/
  const [lgData] = await db.sequelize.query(`SELECT Shape.STEnvelope( ).STAsText() as bbox, code_local_government_id,
  local_government_name FROM CODE_LOCAL_GOVERNMENT_4326`);
  const lg = lgData.map(result => {
    return {
      name: result.local_government_name,
      id: result.code_local_government_id,
      table: 'CODE_LOCAL_GOVERNMENT',
      bbox: result.bbox
    }
  });
  /*const sc = await StateCounty.findAll({
    include: { all: true, nested: true },
    attributes: ['state_county_id', 'county_name']
  })*/
  const [scData] = await db.sequelize.query(`SELECT Shape.STEnvelope( ).STAsText() as bbox, state_county_id,
  county_name FROM CODE_STATE_COUNTY_4326`);
  const sc = scData.map(result => {
    return {
      name: result.county_name + ' County',
      id: result.state_county_id,
      table: 'CODE_STATE_COUNTY',
      bbox: result.bbox
    }
  });
  const answer = [...sa, ...lg, ...sc].sort((a, b) => {
    return a.name.localeCompare(b.name);
  });
  res.send(answer);
});

router.get('/', async (req, res) => {
  /*const sa = await ServiceArea.findAll({
    include: { all: true, nested: true }
  }).map(result => result.dataValues).map(res => {
    return {
      ...res,
      Shape:  res.Shape.toString()
    }
  });*/ 
  const [sa] = await db.sequelize.query(`SELECT Shape.STEnvelope( ).STAsText()   as bbox FROM CODE_SERVICE_AREA`);
  console.log(sa);
  res.send(sa);
});

export default router;
