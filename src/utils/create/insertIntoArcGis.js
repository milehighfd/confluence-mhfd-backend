import needle from 'needle';

import {
  ARCGIS_SERVICE
} from 'bc/config/config.js';

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
  const createGeomDataForARCGIS = (coordinates, token, projectid) => {  
    const newGEOM = [{"geometry":{"paths":[ ] ,"spatialReference" : {"wkid" : 4326}},"attributes":{"update_flag":0, "project_id": projectid}}];
    newGEOM[0].geometry.paths = [coordinates];
    const formData = {
      'f': 'pjson',
      'token': token,
      'adds': JSON.stringify(newGEOM)
    };
    // console.log('DATA TO SEND', JSON.stringify(newGEOM), '\n\n', 'formData arcgis', JSON.stringify(formData));
    return formData;
  };
  try {
    if(geom) {
      const URL_TOKEN = 'https://gis.mhfd.org/portal/sharing/rest/generateToken';
      const fd = getAuthenticationFormData();
      const token_data = await needle('post', URL_TOKEN, fd, { multipart: true });
      console.log('ERROR AT PARSING JSON1', token_data.body);
      const TOKEN = JSON.parse(token_data.body).token;
      console.log('ERROR AT PARSING JSON2', geom);
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