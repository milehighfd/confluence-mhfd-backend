import db from 'bc/config/db.js';

const CodeServiceArea = db.codeServiceArea;
const CodeLocalGoverment = db.codeLocalGoverment;
const CodeStateCounty = db.codeStateCounty;

export const getLocalitiesNames = async (localities,transaction) => { 
  localities = localities.map(l => parseInt(l));
  const order = []
  const namesServiceArea = await CodeServiceArea.findAll({
    attributes: ['service_area_name', 'code_service_area_id'],
    where: {
      code_service_area_id: localities
    },
    transaction: transaction
  });
  const namesStateCounty = await CodeStateCounty.findAll({
    attributes: ['county_name', 'state_county_id'],
    where: {
      state_county_id: localities
    },
    transaction: transaction
  });
  const namesLocalGoverment = await CodeLocalGoverment.findAll({
    attributes: ['local_government_name', 'code_local_government_id'],
    where: {
      code_local_government_id: localities
    },
    transaction: transaction
  });
  if (namesServiceArea && namesServiceArea.length > 0) {
    order.push(...namesServiceArea.map(sa => ({id: sa.code_service_area_id, name: sa.service_area_name, realName: sa.service_area_name+ ' Service Area'})));
  }
  if (namesStateCounty && namesStateCounty.length > 0) {
    order.push(...namesStateCounty.map(sc => ({id: sc.state_county_id, name: sc.county_name, realName: sc.county_name + ' County'})));
  }
  if (namesLocalGoverment && namesLocalGoverment.length > 0) {
    order.push(...namesLocalGoverment.map(lg => ({id: lg.code_local_government_id, name: lg.local_government_name, realName: lg.local_government_name})));
  }
  order.sort((a, b) => localities.indexOf(a.id) - localities.indexOf(b.id)); 
  return order.map(o => o.realName);
};