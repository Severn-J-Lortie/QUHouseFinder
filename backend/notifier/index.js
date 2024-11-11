import { Database } from '../Database.js';
import { FilterExecutor } from './FilterExecutor.js';

async function main() {
  const db = await Database.getInstance().connect();
  const filterExecutor = new FilterExecutor(db);
  console.log(await filterExecutor.runFilters())
  db.release()
}
main();