import { Logger } from '../../Logger.js';

function main() {
  Logger.create('/Users/severnlortie/log/quhousefinder.log');
  Logger.getInstance().info('Hello, world!');
}
main();