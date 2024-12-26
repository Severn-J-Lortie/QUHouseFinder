import { Database } from '../../Database.js';
import { FilterExecutor } from './FilterExecutor.js';
import { Mailer } from './Mailer.js';
import { setupEnvironment } from '../environment.js';

async function main() {
  setupEnvironment()
  const db = await Database.getInstance().connect();
  const filterExecutor = new FilterExecutor(db);
  const mailer = new Mailer(db);
  const filterMap = await filterExecutor.runFilters();
  for (const userId in filterMap) {
    const filterResults = filterMap[userId];
    await mailer.send(userId, filterResults);
  }
  db.release()
}
main();