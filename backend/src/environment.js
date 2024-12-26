import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function setupEnvironment(envFilePath) {
  const dirname = path.dirname(fileURLToPath(import.meta.url));
  dotenv.config({ path: path.resolve(dirname, envFilePath), override: true });
}
