export const createLocalitiesBoard = (
  isWorkPlan,
  sendToWR,
  year,
  PROJECT_TYPE,
  splitedJurisdiction,
  splitedCounty,
  splitedServicearea,
  sponsorId,
  sponsor = null
) => {
  const localitiesBoard = [];
  const typesList = [];
  const YEAR_WORKPLAN_V1 = 2021;
  const YEAR_WORKPLAN_V2 = 2024;
  const sponsorIdChech = sponsorId !== 'null' ? sponsorId : null;
  if (isWorkPlan === 'false') {
    if (sponsorIdChech) {
      localitiesBoard.push(sponsorId);
      console.log('AQUI ANADE WORK_REQUEST', isWorkPlan);
      typesList.push('WORK_REQUEST');
    }
  } else {
    if (sponsorIdChech && sponsor && sponsor !== 'MHFD') {
      localitiesBoard.push(sponsorId);
      console.log('AQUI ANADE WORK_REQUEST 2 ', sendToWR);
      typesList.push('WORK_REQUEST');
    }
    if (year <= YEAR_WORKPLAN_V1) {
      if (PROJECT_TYPE === 'capital' || PROJECT_TYPE === 'maintenance') {
        for (const c of splitedCounty) {
          if (c) {
            localitiesBoard.push(c);
            typesList.push('WORK_PLAN');
          }
        }
      } else {
        for (const s of splitedServicearea) {
          if (s) {
            localitiesBoard.push(s);
            typesList.push('WORK_PLAN');
          }
        }
      }
    } else if (year < YEAR_WORKPLAN_V2) {
      if (PROJECT_TYPE === 'study') {
        for (const s of splitedServicearea) {
          if (s) {
            localitiesBoard.push(s);
            typesList.push('WORK_PLAN');
          }
        }
      } else {
        for (const c of splitedCounty) {
          if (c) {
            localitiesBoard.push(c);
            typesList.push('WORK_PLAN');
          }
        }
      }
    }
  }
  console.log('Types List in create', typesList);
  return { localitiesBoard, typesList };
}
