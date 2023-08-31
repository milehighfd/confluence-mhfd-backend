import { insertToCartoStudy } from 'bc/utils/create';
import {
  CREATE_PROJECT_TABLE,
} from 'bc/config/config.js';

export const createCartoStudy = async (project_id, ids) => {
  let parsedIds = '';
  let idsArray = JSON.parse(ids).filter((e) => !!e);
  for (const id of idsArray) {
    if (parsedIds) {
      parsedIds += ',';
    }
    parsedIds += "'" + id + "'";
  }
  if (idsArray.length) {
    await insertToCartoStudy(CREATE_PROJECT_TABLE, project_id, parsedIds);
  }
};

export const parseIds = (ids) => {
  let parsedIds = '';
  console.log('Isd', ids);
  let idsArray = JSON.parse(ids).filter((e) => !!e);
  for (const id of idsArray) {
    if (parsedIds) {
      parsedIds += ',';
    }
    parsedIds += "'" + id + "'";
  }
  return parsedIds;
}