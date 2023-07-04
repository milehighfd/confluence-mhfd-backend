export const createLocalitiesBoard = (isWorkPlan, sendToWR, year, PROJECT_TYPE, splitedJurisdiction, splitedCounty, splitedServicearea) => {
  const localitiesBoard = [];
  const typesList = [];
  const YEAR_WORKPLAN = 2021;

  if (isWorkPlan === 'false') {
    for (const j of splitedJurisdiction) {
      if (j) {
        localitiesBoard.push(j);
        typesList.push('WORK_REQUEST');
      }
    }
  } else {
    if (sendToWR === 'true') {
      for (const j of splitedJurisdiction) {
        if (j) {
          localitiesBoard.push(j);
          typesList.push('WORK_REQUEST');
        }
      }
    }
    if (year <= YEAR_WORKPLAN) {
      if (PROJECT_TYPE === 'capital' || PROJECT_TYPE === 'Maintenance') {
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
    } else {
      if (PROJECT_TYPE === 'Study') {
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

  return { localitiesBoard, typesList };
}