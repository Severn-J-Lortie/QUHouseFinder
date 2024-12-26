import { Updater } from './Updater.js'; 
import { Logger } from '../Logger.js';
import { setupEnvironment } from '../environment.js'

async function main() {
  setupEnvironment('../../.env');
  Logger.getInstance().info('Fetching latest listings...');
  const updater = new Updater();
  await updater.update();
  await updater.cleanupOldListings();
}
main();