import { Model } from '../Model.js';

function main() {
  const post = 'blah blah blah';
  const model = new Model();
  let prompt = model.createPrompt('all', post);
  console.log(prompt);
  console.log('-------------');
  prompt = model.createPrompt(['tags', 'date'], post);
  console.log(prompt);
}
main();