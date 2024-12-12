import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Database } from '../Database.js';
import { FilterExecutor } from './FilterExecutor.js';
import { Mailer } from './Mailer.js';

async function main() {
  const dirname = path.dirname(fileURLToPath(import.meta.url));
  dotenv.config({ path: path.resolve(dirname, '../../.env') });
  const db = await Database.getInstance().connect();
  const filterExecutor = new FilterExecutor(db);
  const mailer = new Mailer(db);
  const filterMap = await filterExecutor.runFilters();
  console.log(filterMap)
  for (const userId in filterMap) {
    console.log(filterMap);
    const filterResults = filterMap[userId];
    await mailer.send(userId, filterResults);
  }
  db.release()
}
main();