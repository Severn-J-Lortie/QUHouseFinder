import fs from 'node:fs';
import path from 'node:path';

export class Logger {
  static #instance = null;
  constructor() {
    if (Logger.#instance) {
      throw new Error('Call getInstance()');
    }
    this.logFilePath = process.env.QU_LOG_PATH;
    if (!this.logFilePath) {
      throw new Error('Need to specify log file path with environment variable QU_LOG_PATH');
    }
    if (!fs.existsSync(this.logFilePath)) {
      fs.writeFileSync(this.logFilePath, '', 'utf-8', 'w+');
    }
    Logger.#instance = this;
  }
  static getInstance() {
    if (!Logger.#instance) {
      Logger.#instance = new Logger();
    }
    return Logger.#instance;
  }
  info(message) {
    let logStr = `INFO: ${message}`;
    if (process.env.QU_DEBUG) {
      console.log(logStr);
    }
    this.#writeToFile(logStr);
  }
  err(message) {
    let logStr = `ERR: ${message}`;
    console.log(logStr);
    this.#writeToFile(logStr);
  }
  #getDateAndTimeString() {
    const now = new Date();
    const datePart = now.toLocaleDateString('en-CA');
    const timePart = now.toLocaleTimeString('en-CA', { hour12: true });
    return `[${datePart} ${timePart}]`;
  }
  #writeToFile(string) {
    fs.appendFileSync(this.logFilePath, `${this.#getDateAndTimeString()} ${string}\n`, 'utf-8');
  }
}