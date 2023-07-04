export const cleanStringValue = (value) => {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'string' && value.length > 0) {
    return value.replace("'", "''");
  }
  return value;
};