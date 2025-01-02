import { Frontenac } from '../data-sources/Frontenac.js';
import { setupEnvironment } from '../../environment.js';

async function main() {
  setupEnvironment();
  const frontenac = new Frontenac();
  const listings = await frontenac.fetchListings();
  console.log(listings);
}
main();