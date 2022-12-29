import express from 'express';
import { parse } from 'wkt';
// import { ROLES } from 'bc/lib/enumConstants.js';
import db from 'bc/config/db.js';
// mimport auth2 from 'bc/auth0/auth2.js';

const router = express.Router();
const ServiceArea = db.codeServiceArea;
const LocalGovernment = db.codeLocalGoverment;
const StateCounty = db.codeStateCounty;

const polygonParser = (coordinates) => {
  return parse(coordinates);
}
router.get('/all-localities', async (req, res) => {
  /*const sa = await ServiceArea.findAll({
    include: { all: true, nested: true },
    attributes: ['code_service_area_id', 'service_area_name']
  }) */
  const [saData] = await db.sequelize.query(`SELECT Shape.STEnvelope( ).STAsText() as bbox,
  Shape.STAsText() as coordinates,
  code_service_area_id,
  service_area_name FROM CODE_SERVICE_AREA_4326`);
  const sa = saData.map(result => {
    return { 
      name: result.service_area_name + 'Service Area',
      id: result.code_service_area_id,
      table: 'CODE_SERVICE_AREA',
      bbox: polygonParser(result.bbox),
      coordinates: polygonParser(result.coordinates)
    }
  });
  /*const lg = await LocalGovernment.findAll({
    include: { all: true, nested: true },
    attributes: ['code_local_government_id', 'local_government_name']
  })*/
  const [lgData] = await db.sequelize.query(`SELECT Shape.STEnvelope( ).STAsText() as bbox,
  Shape.STAsText() as coordinates,
  code_local_government_id,
  local_government_name FROM CODE_LOCAL_GOVERNMENT_4326`);
  const lg = lgData.map(result => {
    return {
      name: result.local_government_name,
      id: result.code_local_government_id,
      table: 'CODE_LOCAL_GOVERNMENT',
      bbox: polygonParser(result.bbox),
      coordinates: polygonParser(result.coordinates)
    }
  });
  /*const sc = await StateCounty.findAll({
    include: { all: true, nested: true },
    attributes: ['state_county_id', 'county_name']
  })*/
  const [scData] = await db.sequelize.query(`SELECT Shape.STEnvelope( ).STAsText() as bbox,
  Shape.STAsText() as coordinates,
  state_county_id,
  county_name FROM CODE_STATE_COUNTY_4326`);
  const sc = scData.map(result => {
    return {
      name: result.county_name + ' County',
      id: result.state_county_id,
      table: 'CODE_STATE_COUNTY',
      bbox: polygonParser(result.bbox),
      coordinates: polygonParser(result.coordinates)
    }
  });
  const [mhfdData] = await db.sequelize.query(`SELECT Shape.STEnvelope( ).STAsText() as bbox,
  Shape.STAsText() as coordinates,
  OBJECTID,
  'Mile High Flood District' as name FROM MHFD_BOUNDARY`);
  const mhfd = mhfdData.map(result => {
    return {
      name: result.name,
      id: result.OBJECTID,
      table: 'MHFD_BOUNDARY',
      bbox: polygonParser(result.bbox),
      coordinates: polygonParser(result.coordinates)
    }
  });
  const answer = [...sa, ...lg, ...sc].sort((a, b) => {
    return a.name.localeCompare(b.name);
  });
  res.send([...mhfd, ...answer]);
});

router.get('/get-list', async (req, res) => {
  const answer = {};
  if (req.query.jurisdiction) {
    const [lgData] = await db.sequelize.query(`SELECT
    code_local_government_id,
    local_government_name FROM CODE_LOCAL_GOVERNMENT_4326`);
    const lg = lgData.map(result => {
      return {
        local_government_name: result.local_government_name,
        code_local_government_id: result.code_local_government_id,
        table: 'CODE_LOCAL_GOVERNMENT',
      }
    });
    answer.jurisdiction = lg;
  }
  if (req.query.servicearea) {
    const [saData] = await db.sequelize.query(`SELECT
    code_service_area_id,
    service_area_name FROM CODE_SERVICE_AREA_4326`);
    const sa = saData.map(result => {
      return { 
        service_area_name: result.service_area_name + 'Service Area',
        code_service_area_id: result.code_service_area_id,
        table: 'CODE_SERVICE_AREA',
      }
    });
    answer.servicearea = sa;
  }
  if (req.query.county) {
    const [scData] = await db.sequelize.query(`SELECT
      state_county_id,
      county_name FROM CODE_STATE_COUNTY_4326`);
    const sc = scData.map(result => {
      return {
        county_name: result.county_name + ' County',
        state_county_id: result.state_county_id,
        table: 'CODE_STATE_COUNTY',
      }
    });
    answer.county = sc;
  }
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
