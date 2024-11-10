import fs from 'node:fs';
import https from 'node:https';
import app from './app.js';
import { Logger } from '../Logger.js';

const logger = Logger.getInstance();

const defaultPort = 8080;
const listenPort = process.env['QU_BACKEND_PORT'] || defaultPort;

if (!(process.env['QU_CERT_PATH'] && process.env['QU_KEY_PATH'])) {
  throw new Error('Need to specify cert and key path.');
}

const httpsServerOptions = {
  key: fs.readFileSync(process.env['QU_KEY_PATH']),
  cert: fs.readFileSync(process.env['QU_CERT_PATH']),
};

https.createServer(httpsServerOptions, app).listen(listenPort, () => {
  logger.info(`Server is starting on port ${listenPort}`);
});
