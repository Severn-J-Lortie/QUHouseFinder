import { Axon } from '../data-sources/Axon.js';

async function main() {
  const axon = new Axon();
  const listings = await axon.fetchListings();
  console.log(listings);
}
main();