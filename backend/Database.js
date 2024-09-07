import pg from 'pg';
const { Pool } = pg;

export class Database {

  static #instance = null;

  constructor() {
    if (Database.#instance) {
      throw new Error('Must call getInstance');
    }
    if (!(process.env.QU_DB_USER 
          && process.env.QU_DB_DATABASE 
          && process.env.QU_DB_PORT)) {
      throw new Error(
`One or more DB environment variables missing. Required are: QU_DB_USER, QU_DB_DATABASE, QU_DB_PORT`);
    }
    const pool = new Pool({
      user: process.env.QU_DB_USER,
      host: 'localhost',
      database: process.env.QU_DB_DATABASE,
      port: process.env.QU_DB_PORT,
      max: 10
    });
    this.pool = pool;
    Database.#instance = this;
  }
  async connect() {
    return (await this.pool.connect());
  }
  async close() {
    await this.pool.end();
  }
  static getInstance() {
    if (!Database.#instance) {
      Database.#instance = new Database();
    }
    return Database.#instance;
  }
}