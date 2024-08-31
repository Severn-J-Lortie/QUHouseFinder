import { Panadew } from '../data-sources/Panadew.js';

async function main() {
  const panadew = new Panadew();
  const listings = await panadew.fetchListings();
  console.log(listings);
}
main();