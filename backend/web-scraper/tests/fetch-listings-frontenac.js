import { Frontenac } from '../data-sources/Frontenac.js';

async function main() {
  const frontenac = new Frontenac();
  const listings = await frontenac.fetchListings();
  console.log(listings);
}
main();