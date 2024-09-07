import fs from 'node:fs';

export class Logger {
  static #instance = null;
  constructor() {
    if (Logger.#instance) {
      throw new Error('Call getInstance()');
    }
    this.logFilePath = process.env.QU_LOG_PATH;
    if (!fs.existsSync(this.logFilePath)) {
      fs.writeFileSync(this.logFilePath, '', 'utf-8');
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
    this.#writeToFile(`INFO: ${message}`);
  }
  err(message) {
    this.#writeToFile(`ERR: ${message}`);
  }
  #getDateAndTimeString() {
    const now = new Date();
    const datePart = now.toLocaleDateString('en-CA');
    const timePart = now.toLocaleTimeString('en-CA', { hour12: true });
    return `[${datePart} ${timePart}]`;
  }
  #writeToFile(string) {
    if (process.env.QU_DEBUG) {
      console.log(string);
    }
    fs.appendFileSync(this.logFilePath, `${this.#getDateAndTimeString()} ${string}\n`, 'utf-8');
  }
}