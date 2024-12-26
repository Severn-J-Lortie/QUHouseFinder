import { Updater } from '../Updater.js';
import { Database } from '../../Database.js';

async function main() {
  await Database.getInstance().connect('severnlortie', 'localhost', 'quhousefinder')
  const updater = new Updater();
  await updater.update();
  Database.getInstance().close();
}
main();