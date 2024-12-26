import { Database } from '../Database.js';

async function main() {
  const db = new Database();
  const conn = await db.connect();
  await conn.query("INSERT INTO test (hash, address) VALUES ('abc', '123')");
  const result = await conn.query('SELECT * FROM test');
  console.log(result.rows);
  await conn.query('DELETE FROM test WHERE true');
  await conn.release();
  await db.close();
}
main();