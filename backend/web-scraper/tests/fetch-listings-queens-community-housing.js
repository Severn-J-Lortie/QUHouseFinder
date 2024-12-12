import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

import { QueensCommunityHousing } from '../data-sources/QueensCommunityHousing.js';

async function main() {
  const dirname = path.dirname(fileURLToPath(import.meta.url));
  dotenv.config({ path: path.resolve(dirname, '../../../.env') });
  const queensCommunityHousing = new QueensCommunityHousing();
  const listings = await queensCommunityHousing.fetchListings();
  console.log(listings);
}
main();