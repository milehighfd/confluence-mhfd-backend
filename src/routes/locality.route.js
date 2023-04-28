import express from 'express';
import { ROLES } from 'bc/lib/enumConstants.js';
import db from 'bc/config/db.js';
import auth2 from 'bc/auth/auth2.js';
import { parse } from 'wkt';
import logger from 'bc/config/logger.js';
const router = express.Router();

const polygonParser = (coordinates) => {
  return parse(coordinates);
}
const getData = async (req, res, next) => {
  const [localities] = await db.sequelize.query(`SELECT name, type FROM Localities ORDER BY name ASC;`);
  res.locals.data = [];
  if (req.user) {
    if([ROLES.MFHD_STAFF, ROLES.GOVERNMENT_ADMIN, ROLES.MFHD_ADMIN].includes(req.user.designation)) {
      res.locals.data = localities.filter(l => l.type === 'LOCAL_GOVERNMENT');
    } else if (req.user.designation === ROLES.GOVERNMENT_STAFF) {
      res.locals.data = localities;
    }
  }
  next();
}

const getData2 = async (req, res, next) => {
  const { type } = req.params;
  let response;
  try {
    const { nogeom } = req.query;
    let geom = `Shape.STEnvelope( ).STAsText() as bbox,
    Shape.STAsText() as coordinates,`;
    if (nogeom) {
      geom = '';
    }
    const proms = [
      db.sequelize.query(`SELECT ${geom}
        code_service_area_id,
        service_area_name FROM CODE_SERVICE_AREA_4326`),
      db.sequelize.query(`SELECT  ${geom}
        code_local_government_id,
        local_government_name FROM CODE_LOCAL_GOVERNMENT_4326`),
      db.sequelize.query(`SELECT  ${geom}
        state_county_id,
        county_name FROM CODE_STATE_COUNTY_4326`),
      db.sequelize.query(`SELECT  ${geom}
        OBJECTID,
        'Mile High Flood District' as name FROM MHFD_BOUNDARY_4326`)
    ];
    const solved = await Promise.all(proms);
    const [saData] = solved[0];
    const sa = saData.map(result => {
      const obj = {
        name: result.service_area_name + ' Service Area',
        id: result.code_service_area_id,
        table: 'CODE_SERVICE_AREA'
      };
      if (!nogeom) {
        obj.bbox = polygonParser(result.bbox);
        obj.coordinates = polygonParser(result.coordinates); 
      }
      return obj;
    });
    /*const lg = await LocalGovernment.findAll({
      include: { all: true, nested: true },
      attributes: ['code_local_government_id', 'local_government_name']
    })*/
    const [lgData] = solved[1];
    const lg = lgData.map(result => {
      const obj = {
        name: result.local_government_name,
        id: result.code_local_government_id,
        table: 'CODE_LOCAL_GOVERNMENT',
      };
      if (!nogeom) {
        obj.bbox = polygonParser(result.bbox);
        obj.coordinates = polygonParser(result.coordinates); 
      }
      return obj;
    });
    /*const sc = await StateCounty.findAll({
      include: { all: true, nested: true },
      attributes: ['state_county_id', 'county_name']
    })*/
    const [scData] = solved[2];
    const sc = scData.map(result => {
      const obj = {
        name: result.county_name + ' County',
        id: result.state_county_id,
        table: 'CODE_STATE_COUNTY',
      };
      if (!nogeom) {
        obj.bbox = polygonParser(result.bbox);
        obj.coordinates = polygonParser(result.coordinates); 
      }
      return obj;
    });
    const [mhfdData] = solved[3];
    const mhfd = mhfdData.map(result => {
      const obj = {
        name: result.name,
        id: result.OBJECTID,
        table: 'MHFD_BOUNDARY',
      };
      if (!nogeom) {
        obj.bbox = polygonParser(result.bbox);
        obj.coordinates = polygonParser(result.coordinates); 
      }
      return obj;
    });
    const answer = [...sa, ...lg, ...sc].sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
    response = [...mhfd, ...answer];
  } catch (error) {
    throw(error)
  }
  res.locals.data = [];
  if (type === 'WORK_REQUEST') {
    if (req.user) {
      if(req.user.designation === ROLES.MFHD_STAFF || req.user.designation === ROLES.MFHD_ADMIN) {
        res.locals.data = response.filter(l => l.table === 'CODE_LOCAL_GOVERNMENT');
      } else if (req.user.designation === ROLES.GOVERNMENT_STAFF) {
        res.locals.data = response.filter(l => l.name === req.user.organization);
      }
    } else {
      res.locals.data = response.filter(l => l.table === 'CODE_LOCAL_GOVERNMENT');
    }
  } else if (type === 'WORK_PLAN') {
    res.locals.data = response.filter(l => l.table !== 'CODE_LOCAL_GOVERNMENT');
  }
  next();
}

router.get('/', [auth2, getData],  (req, res) => {
  logger.info(`Starting endpoint locality.route/ with params ${JSON.stringify(req.params, null, 2)}`);
    res.send({
        localities: res.locals.data
    })
})

router.get('/:type', [getData2], async (req, res) => {
  logger.info(`Starting endpoint locality.route/:type with params ${JSON.stringify(req.params, null, 2)}`);
  let localities = res.locals.data;
  res.send({ localities });
})

export default router;
