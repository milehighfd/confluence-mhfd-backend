import fs from 'fs/promises';
(async function fillDate() {
  const date = new Date().toLocaleString();
  await fs.writeFile('./src/DATEFILE', date);
})();