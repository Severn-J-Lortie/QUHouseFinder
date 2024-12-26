import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { Panadew } from '../data-sources/Panadew.js';

async function main() {
  const dirname = path.dirname(fileURLToPath(import.meta.url));
  dotenv.config({ path: path.resolve(dirname, '../../../.env') });
  const panadew = new Panadew();
  const listings = await panadew.fetchListings();
  console.log(listings);
}
main();