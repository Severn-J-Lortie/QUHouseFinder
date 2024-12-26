import fs from 'node:fs';
import https from 'node:https';

import { setupEnvironment } from '../environment.js';
import { initApp } from './app.js';
import { Logger } from '../Logger.js';

async function main() {
  setupEnvironment('../../.env');

  const logger = Logger.getInstance();
  const app = await initApp();

  const defaultPort = 8080;
  const listenPort = process.env['QU_BACKEND_PORT'] || defaultPort;

  let useHttps = true;
  if (!(process.env['QU_CERT_PATH'] && process.env['QU_KEY_PATH'])) {
    logger.info('No certs specified, running in HTTP mode');
    useHttps = false;
  }

  let server;
  if (useHttps) {
    const httpsServerOptions = {
      key: fs.readFileSync(process.env['QU_KEY_PATH']),
      cert: fs.readFileSync(process.env['QU_CERT_PATH']),
    };
    server = https.createServer(httpsServerOptions, app);
  } else {
    server = app;
  }
  server.listen(listenPort, () => {
    logger.info(`Server is starting on port ${listenPort}`);
  });
}
main();

