import { setupEnvironment } from '../../environment.js';
import { Facebook } from '../data-sources/Facebook.js';

async function main() {
  setupEnvironment();
  const facebook = new Facebook();
  const listings = await facebook.fetchListings();
  for (const listing of listings) {
    console.log(listing);
  }
}
main();