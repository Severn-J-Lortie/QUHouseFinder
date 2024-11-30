import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

import { Facebook } from '../data-sources/Facebook.js';

async function main() {
  const dirname = path.dirname(fileURLToPath(import.meta.url));
  dotenv.config({ path: path.resolve(dirname, '../../../.env') });
  const facebook = new Facebook();
  const listings = await facebook.fetchListings();
  console.log(listings);
}
main();