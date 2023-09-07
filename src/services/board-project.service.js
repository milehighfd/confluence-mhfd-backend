export const isOnWorkspace = (boardProject) => {
  let allNull = true;
  const indexes = [1, 2, 3, 4, 5];
  indexes.forEach((index) => {
    const rankColumnName = `rank${index}`;
    if (boardProject[rankColumnName] !== null) {
      allNull = false;
    }
  });
  return allNull;
};
