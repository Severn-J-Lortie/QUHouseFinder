import { Updater } from './Updater.js'; 
import { Logger } from '../Logger.js';
import dotenv from 'dotenv';

async function main() {
  dotenv.config();
  Logger.getInstance().info('Fetching latest listings...');
  const updater = new Updater();
  await updater.update();
}
main();