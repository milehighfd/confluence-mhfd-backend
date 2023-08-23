import needle from 'needle';

import {
  ARCGIS_SERVICE,
  CARTO_URL
} from 'bc/config/config.js';


export const getGeoJSON = async (table, projectid) => {
  const getQuery = ` SELECT
  ST_AsGeoJSON(st_union(the_geom)) as the_geom 
    FROM ${table} where projectid = ${projectid}`;
  const query = {
    q: getQuery
  };
  try {
    const data = await needle('post', CARTO_URL, query, { json: true });
    if (data.statusCode === 200) {
      console.log(data.body);
    } else {
      console.error('bad status ' + data.statusCode + '  -- ' + getQuery + JSON.stringify(data.body, null, 2));
    }
    return data.body.rows[0].the_geom;
  } catch (error) {
    console.error(error, 'at', getQuery);
  }
}
const getAuthenticationFormData = () => {
  const formData = {
    'username': 'ricardo_confluence',
    'password': 'M!l3H!gh$m$',
    'client': 'referer',
    'ip': '181.188.178.182',
    'expiration': '60',
    'f': 'pjson',
    'referer': 'localhost'
  };
  return formData;
}
const depth = (arr) => arr.reduce((count, v) => (!Array.isArray(v) ? count : 1 + depth(v)), 1);
const createGeomDataForARCGIS = (coordinates, token, projectid) => {  
  const newGEOM = [{"geometry":{"paths":[ ] ,"spatialReference" : {"wkid" : 4326}},"attributes":{"update_flag":0, "project_id": projectid}}];
  const depthGeom = depth(coordinates);
  newGEOM[0].geometry.paths = depthGeom == 3 ? coordinates : [coordinates];
  const formData = {
    'f': 'pjson',
    'token': token,
    'adds': JSON.stringify(newGEOM)
  };
  console.log('DATA TO SEND\n\n', 'formData arcgis', JSON.stringify(formData));
  return formData;
};
export const insertIntoArcGis = async (geom, projectid) => {
  try {
    if(geom) {
      const URL_TOKEN = 'https://gis.mhfd.org/portal/sharing/rest/generateToken';
      const fd = getAuthenticationFormData();
      const token_data = await needle('post', URL_TOKEN, fd, { multipart: true });
      const TOKEN = JSON.parse(token_data.body).token;
      const bodyFD = createGeomDataForARCGIS(JSON.parse(geom).coordinates, TOKEN, projectid);
      console.log('About to call endpoint: ', `${ARCGIS_SERVICE}/applyEdits`);
      const createOnArcGis = await needle('post',`${ARCGIS_SERVICE}/applyEdits`, bodyFD, { multipart: true });
      console.log('create on arc gis at ', ARCGIS_SERVICE, createOnArcGis.statusCode, JSON.stringify(createOnArcGis.body));
      if (createOnArcGis.statusCode == 200) {
        if (createOnArcGis.body.error) {
          console.log('Error at ARGIS creation', createOnArcGis.body.error);
          return { successArcGis: false, error: createOnArcGis.body.error };  
        }
        return { successArcGis: createOnArcGis.body.addResults[0].success };
      } else {
        console.log('Error at ARGIS creation', createOnArcGis.body);
        return { successArcGis: false, error:createOnArcGis.body};
      }
    } else {
      console.error('No geom found', geom);
    }
  } catch(e) {
    console.log('error at insert into arcgis', e);
    return {
      successArcGis: false,
      error: e
    }
  }  
}
const getDataFromArcGis = async (projectid, TOKEN) => { 
  const getFromArcGis = `${ARCGIS_SERVICE}/query?where=project_id%3D${projectid}&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&distance=&units=esriSRUnit_Foot&relationParam=&outFields=OBJECTID%2Cproject_id&returnGeometry=false&maxAllowableOffset=&geometryPrecision=&outSR=&havingClause=&gdbVersion=&historicMoment=&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&multipatchOption=xyFootprint&resultOffset=&resultRecordCount=&returnTrueCurves=false&returnExceededLimitFeatures=false&quantizationParameters=&returnCentroid=false&sqlFormat=none&resultType=&featureEncoding=esriDefault&datumTransformation=&f=json`
  console.log('GET FROM ARc', getFromArcGis);
  try {
    var header = {
      headers: {
          'Authorization': `Bearer ${TOKEN}`
      },
      accept: 'application/json',
      content_type: 'application/json'
    };
    const allGeoms = await needle('get', getFromArcGis, header);
    console.log('Data from ArcGis', allGeoms.body );
    if (allGeoms.statusCode === 200) {
      if (allGeoms.body.features.length) {
        return {
          success: true,
          data: allGeoms.body.features[0].attributes
        };
      } else {
        return {
          success: false,
          data: []
        };
      }
      
    } else {
      return {
        success: false
      };
    }
  } catch (e) {
    console.error('error at get data from arcgis', e);
    return {
      successArcGis: false,
      error: e
    };
  }
};
const updateGeomDataForARCGIS = (coordinates, token, OBJECTID) => {  
  const newGEOM = [{"geometry":{"paths":[] ,"spatialReference" : {"wkid" : 4326}}, "attributes":{"OBJECTID": OBJECTID}}];
  console.log('NEW GEOM', newGEOM);
  const depthGeom = depth(coordinates);
  newGEOM[0].geometry.paths = depthGeom == 3 ? coordinates : [coordinates];
  const formData = {
    'f': 'pjson',
    'token': token,
    'updates': JSON.stringify(newGEOM)
  };
  console.log('DATA TO SEND\n\n', 'formData arcgis', JSON.stringify(formData));
  return formData;
};
export const updateIntoArcGis = async (geom, projectid) => {
  console.log('Geom inside update ArcGis ', projectid, geom);
  try {
    if (geom) {
      const URL_TOKEN = 'https://gis.mhfd.org/portal/sharing/rest/generateToken';
      const fd = getAuthenticationFormData();
      const token_data = await needle('post', URL_TOKEN, fd, { multipart: true });
      const TOKEN = JSON.parse(token_data.body).token;
      const features = await getDataFromArcGis(projectid,TOKEN);
      console.log('FEatures', features);
      let bodyFD;
      if (features.data.OBJECTID) {
        bodyFD = updateGeomDataForARCGIS(JSON.parse(geom).coordinates, TOKEN, features.data.OBJECTID);
      } else {
        bodyFD = createGeomDataForARCGIS(JSON.parse(geom).coordinates, TOKEN, projectid);
      }
      const createOnArcGis = await needle('post',`${ARCGIS_SERVICE}/applyEdits`, bodyFD, { multipart: true });
      console.log('create on arc gis at ', ARCGIS_SERVICE, createOnArcGis.statusCode, JSON.stringify(createOnArcGis.body));
      if (createOnArcGis.statusCode == 200) {
        if (createOnArcGis.body.error) {
          console.log('Error at ARGIS creation', createOnArcGis.body.error);
          return { successArcGis: false, error: createOnArcGis.body.error };  
        }
        return { successArcGis: createOnArcGis.body.updateResults[0].success };
      } else {
        console.log('Error at ARGIS creation', createOnArcGis.body);
        return { successArcGis: false, error:createOnArcGis.body};
      }
    }
  } catch(e) {
    console.log('error at update into arcgis', e);
    return {
      successArcGis: false,
      error: e
    }
  }
}
