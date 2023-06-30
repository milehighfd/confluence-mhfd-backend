import needle from 'needle';

import {
  ARCGIS_SERVICE
} from 'bc/config/config.js';

export const insertIntoArcGis = async (geom, projectid, projectname) => {
  try {
    const URL_TOKEN = 'https://gis.mhfd.org/portal/sharing/rest/generateToken';
    const fd = getAuthenticationFormData();
    const token_data = await needle('post', URL_TOKEN, fd, { multipart: true });
    const TOKEN = JSON.parse(token_data.body).token;
    const bodyFD = createGeomDataForARCGIS(JSON.parse(geom).coordinates, TOKEN, projectid);
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
  } catch(e) {
    console.log('error at insert into arcgis', e);
    return {
      successArcGis: false,
      error: e
    }
  }  
}