export const createLocalitiesBoard = (isWorkPlan, sendToWR, year, PROJECT_TYPE, splitedJurisdiction, splitedCounty, splitedServicearea, sponsorId) => {
  const localitiesBoard = [];
  const typesList = [];
  const YEAR_WORKPLAN_V1 = 2021;
  const YEAR_WORKPLAN_V2 = 2024;

  if (isWorkPlan === 'false') {
    for (const j of splitedJurisdiction) {
      if (j) {
        localitiesBoard.push(j);
        typesList.push('WORK_REQUEST');
      }
    }
  } else {
    if (sendToWR === 'true') {
      // for (const j of splitedJurisdiction) {
      //   if (j) {
      //     localitiesBoard.push(j);
      //     typesList.push('WORK_REQUEST');
      //   }
      // }
      if (sponsorId) {
        localitiesBoard.push(sponsorId);
        typesList.push('WORK_REQUEST');
      }
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

  return { localitiesBoard, typesList };
}
