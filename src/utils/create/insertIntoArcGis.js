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
export const insertIntoArcGis = async (geom, projectid, projectname) => {
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