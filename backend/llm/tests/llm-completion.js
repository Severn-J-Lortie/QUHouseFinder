import { HFClient } from '../HFClient.js';

async function main() {
  const hfClient = new HFClient();
  const examplePost = `
Looking for two Queen's students to fill 2 bedrooms in a 5 bedroom unit. 
Available Sept 1, 2024 - 4, 8 or 12 month leases 
The current tenants are 3 male undergrad Queen's students
The house was newly built in 2020
Kitchen has quartz countertops and a dishwasher
There is in-unit laundry machines (not coin-op)
$900/month plus utilities
Single Occupancy in each room only, only street parking available
Please message me with any questions
Thanks
  `;
  const result = await hfClient.generateCompletion('all', examplePost);
  console.log(result);
}
main();