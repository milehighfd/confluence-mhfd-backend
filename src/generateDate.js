import fs from 'fs/promises';
(async function fillDate() {
  const date = new Date().toISOString();
  await fs.writeFile('./src/DATEFILE', date);
})();