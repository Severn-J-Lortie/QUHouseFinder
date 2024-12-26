import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

import { Heron } from '../data-sources/Heron.js';

async function main() {
  const dirname = path.dirname(fileURLToPath(import.meta.url));
  dotenv.config({ path: path.resolve(dirname, '../../../.env') });
  const heron = new Heron();
  const listings = await heron.fetchListings();
  console.log(listings);
}
main();