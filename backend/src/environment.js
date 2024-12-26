import fs from 'node:fs';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function setupEnvironment() {
  const dirname = path.dirname(fileURLToPath(import.meta.url));
  const fullEnvFilePath = path.resolve(dirname, '../../.env');
  if (!fs.existsSync(fullEnvFilePath)) {
    throw new Error(`No .env file at ${fullEnvFilePath}`)
  }
  dotenv.config({ path: fullEnvFilePath, override: true });
}
