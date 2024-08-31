import { QueensCommunityHousing } from '../data-sources/QueensCommunityHousing.js';

async function main() {
  const heron = new QueensCommunityHousing();
  const listings = await heron.fetchListings();
  console.log(listings);
}
main();