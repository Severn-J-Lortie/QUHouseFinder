import pg from 'pg';
const { Client } = pg;

export class Database {

  static #instance = null;

  constructor() {
    if (Database.#instance) {
      throw new Error('Must call getInstance');
    }
  }
  async connect(user, host, database) {
    this.client = new Client({
      user,
      host,
      database,
      password: '',
      port: 5432
    });
    await this.client.connect();
  }
  async query(queryString, values) {
    return (await this.client.query(queryString, values)).rows;
  }
  close() {
    this.client.end();
  }
  static getInstance() {
    if (!Database.#instance) {
      Database.#instance = new Database();
    }
    return Database.#instance;
  }
}