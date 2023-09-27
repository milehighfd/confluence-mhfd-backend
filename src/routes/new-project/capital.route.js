import express from 'express';
import needle from 'needle';
import projectService from 'bc/services/project.service.js';
import {
  CARTO_URL,
  CREATE_PROJECT_TABLE,
  ARCGIS_SERVICE
} from 'bc/config/config.js';

const router = express.Router();

const getTokenArcGis = async () => {
  const URL_TOKEN = 'https://gis.mhfd.org/portal/sharing/rest/generateToken';
  const fd = projectService.getAuthenticationFormData();
  const token_data = await needle('post', URL_TOKEN, fd, { multipart: true });
  const TOKEN = JSON.parse(token_data.body).token;
  return TOKEN;
}

const getGeomsToUpdate = async (TOKEN) => {
  try {
    const LIST_ARCGIS = `${ARCGIS_SERVICE}/query?where=update_flag%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryPolyline&inSR=&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Foot&relationParam=&outFields=update_flag%2C+project_id%2C+OBJECTID&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&havingClause=&gdbVersion=&historicMoment=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=xyFootprint&resultOffset=&resultRecordCount=&returnTrueCurves=false&returnExceededLimitFeatures=false&quantizationParameters=&returnCentroid=false&sqlFormat=none&resultType=&featureEncoding=esriDefault&datumTransformation=&f=geojson`;
    
    var header = {
      headers: {
          'Authorization': `Bearer ${TOKEN}`
      },
      accept: 'application/json',
      content_type: 'application/json'
    };
    const allGeoms = await needle('get', LIST_ARCGIS, header);
    if (allGeoms.statusCode === 200) {
      return {
        success: true,
        geoms: JSON.parse(allGeoms.body).features
      }
    } else {
      return {
        success: false
      }
    }
  } catch(error) {
    console.log('error at geom update', error);
    return {
      success: false,
      error: error
    }
  }
}

const sleep = m => new Promise(r => setTimeout(r, m))

const insertGeojsonToCarto = async (geojson, projectId) => {
  let deleteAttemp = 0;
  let tries = 3;
  while(true) {
    try {
      const insertQuery = `INSERT INTO ${CREATE_PROJECT_TABLE} (the_geom, projectid) VALUES(ST_GeomFromGeoJSON('${geojson}'), ${projectId})`;
      const query = {
        q: insertQuery
      };
      const data = await needle('post', CARTO_URL, query, { json: true });
      if (data.statusCode === 200) {
        return {
          success: true
        }
      } else {
        console.log('FAILED AT INSERT GEOJSON TO CARTO', data.statusCode, data.body);
        if (++deleteAttemp >= tries) {
          return {
            success: false,
            error: data.body
          }
        }
      }
    } catch (error) {
      console.error('Error at insert into carto geojson', error);
      if (++deleteAttemp >= tries) {
        return {
          success: false,
          error: error
        }
      }
    }
    await sleep(1000);
  }
}

const deleteFromCarto = async (projectid) => {
  let deleteAttemp = 0;
  let tries = 3;
  while (true) {
    try {
      const deletequery = `DELETE FROM ${CREATE_PROJECT_TABLE} WHERE projectid = ${projectid}`;
      const query = {
        q: deletequery
      };
      const data = await needle('post', CARTO_URL, query, { json: true });
      if (data.statusCode === 200) {
        return {
          success: true,
          body: data.body
        }
      } else {
        if (++deleteAttemp >= tries) {
          return {
            success: false,
            error: 'Tried 3 attemps'
          }
        }
      }
    } catch (error) {
      if (++deleteAttemp >= tries) {
        return {
          success: false,
          error: error
        }
      }
    }
    await sleep(1000);
  }
}
const updateFlagArcGis = async (objectid, value, TOKEN) => {
  let deleteAttemp = 0;
  let tries = 3;
  while(true) {
    try {
      const URL_UPDATE_ATTRIB = `${ARCGIS_SERVICE}/applyEdits`;
      const formData = {
        'f': 'json',
        'token': TOKEN,
        'updates': JSON.stringify([{"attributes":{"OBJECTID":objectid,"update_flag":value}}])
      };
      const updateFlagAG = await needle('post', URL_UPDATE_ATTRIB, formData, { multipart: true });
      if (updateFlagAG.statusCode === 200 && updateFlagAG.body.updateResults) {
        return {
          success: true,
          updated: updateFlagAG.body.updateResults.success
        }
      } else {
        console.log('Failed at update Flag ArcGis', deleteAttemp, updateFlagAG.body);
        if (++deleteAttemp >= tries) {
          return {
            success: false,
            error: updateFlagAG.body.error
          }
        }
      }
    } catch(error) {
      console.error('error at update flag arcgis', error);
      if (++deleteAttemp >= tries) {
        return {
          success: false,
          error: error
        }
      }
    }
    await sleep(1000);
  }
}

router.get('/sync', async (req, res) => {
  const TOKEN = await getTokenArcGis();
  const geoms = await getGeomsToUpdate(TOKEN); // here I have the geoms in geojson
  let isCorrectSync = false;
  const syncGeoms = [];
  // TODO: save the geom to carto
  console.log(
    'SYNC ******* \n\n Get Geometries from ArcGis',
    geoms.success,
    geoms?.geoms?.length,
    geoms
  );
  try {
    if (geoms.success) {
      const TOTAL_GEOMS = geoms.geoms.length;
      for (let i = 0; i < geoms.geoms.length; ++i) {
        // if (i > 2) break;
        let currentGeojsonToUpdate = geoms.geoms[i];
        const currentProjectId = currentGeojsonToUpdate.properties.project_id;
        const currentObjectId = currentGeojsonToUpdate.properties.OBJECTID;
        const deleteFC = await deleteFromCarto(currentProjectId); // its working, is deleting indeed
        console.log('Delete from Carto ', deleteFC);
        if (deleteFC.success) {
          const inserted = await insertGeojsonToCarto(
            JSON.stringify(currentGeojsonToUpdate.geometry),
            currentProjectId
          );
          console.log('SYNC ******* \n\n Inserted into Carto', inserted);
          if (inserted.success) {
            const upflag = await updateFlagArcGis(currentObjectId, 0, TOKEN);
            console.log('SYNC ******* \n\n Updated in ArcGIS');
            if (upflag.success) {
              console.log('Complete ', i, '/', TOTAL_GEOMS);
              isCorrectSync = true;
              syncGeoms.push({
                projectid: currentProjectId,
                sync: isCorrectSync,
              });
            } else {
              syncGeoms.push({
                projectid: currentProjectId,
                sync: false,
                error: upflag.error ? upflag.error : 'failed at update flag',
              });
            }
          } else {
            console.error('failed at insert into Carto');
            syncGeoms.push({
              projectid: currentProjectId,
              sync: false,
            });
          }
        } else {
          console.error('failed in delete Geom from Carto');
          syncGeoms.push({
            projectid: currentProjectId,
            sync: false,
          });
        }
      }
    }
    return res.send(syncGeoms);
  } catch (error) {
    console.error('error at Syncronization', error);
    return res.send('Failed At Syncronization', error);
  }
});

export default router;
