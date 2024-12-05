import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Updater } from './Updater.js'; 
import { Logger } from '../Logger.js';
import dotenv from 'dotenv';

async function main() {
  const dirname = path.dirname(fileURLToPath(import.meta.url));
  dotenv.config({ path: path.resolve(dirname, '../../.env') });
  Logger.getInstance().info('Fetching latest listings...');
  const updater = new Updater();
  // await updater.update();
  await updater.cleanupOldListings();
}
main();