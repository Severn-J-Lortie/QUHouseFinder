import { setupEnvironment } from '../../../environment.js';
import { OllamaClient } from '../OllamaClient.js';

async function main() {
  setupEnvironment();
  const ollamaClient = new OllamaClient();
  const examplePost = 
`Hi all!I'm in my first year of a three-semester master's program (urban planning!) looking for a 4-month lease 
or sublet from September 1 to December 31, 2025. I'll be finishing up my master's degree and am looking for a 
furnished/unfurnished room – preferably in an upper-year/master's household (open to co-ed) with in-building/in-unit 
laundry, with a budget of $1000 + utilities.If you've anything matching my description, please let me know!Thanks`;
  const result = await ollamaClient.determineIfListing(examplePost);
  console.log(result)
}
main();