import { HFClient } from '../HFClient.js';

async function main() {
  const hfClient = new HFClient();
  const examplePost = 
`This 3 bedroom suburban home has 3 upstairs bedrooms, plus a separate entertainment room in the finished basement.
Parking is provided. The laundry has a free-use washer/dryer in the basement. It has its own backyard where you
can grow your own garden. Lawncare is included. It is close to major shopping areas - it is only 600m to The Bayridge
Center (Metro Supermarket/Shoppers Drug Mart) and 2.5km to the Gardiners Road and the Cataraqui Centre Mall. Schools,
Parks and Bus Routes are around the corner. And only 9km to SLC and 10km to Downtown Kingston and Queen's University.
$2400 plus utilities. Available October 1st! 12 month lease and then month-to-month at the tenant's option.
`;
  const result = await hfClient.extractInformation(['leaseStartDate'], examplePost);
  console.log(result)
}
main();