import { setupEnvironment } from '../../environment.js';
import { Heron } from '../data-sources/Heron.js';

async function main() {
  setupEnvironment()
  const heron = new Heron();
  const listings = await heron.fetchListings();
  console.log(listings);
}
main();