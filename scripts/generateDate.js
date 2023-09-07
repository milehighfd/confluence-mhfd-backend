import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

(async function fillDate() {
  const date = new Date().toLocaleString();
  const filePath = join(__dirname, 'DATEFILE');
  await fs.writeFile(filePath, date);
})();
