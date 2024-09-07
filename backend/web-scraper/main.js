import { Updater } from './Updater.js'; 
import { Logger } from '../Logger.js';

async function main() {
  const updater = new Updater();
  await updater.update();
}
main();