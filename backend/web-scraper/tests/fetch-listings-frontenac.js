import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

import { Frontenac } from '../data-sources/Frontenac.js';

async function main() {
  const dirname = path.dirname(fileURLToPath(import.meta.url));
  dotenv.config({ path: path.resolve(dirname, '../../../.env') });
  const frontenac = new Frontenac();
  const listings = await frontenac.fetchListings();
  console.log(listings);
}
main();