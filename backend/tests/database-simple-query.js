import { Database } from '../Database.js';

async function main() {
  const db = new Database('severnlortie', 'localhost', 'quhousefinder');
  await db.connect();
  await db.query("INSERT INTO test (hash, address) VALUES ('abc', '123')");
  const result = await db.query('SELECT * FROM test');
  console.log(result);
  await db.query('DELETE FROM test WHERE true');
  db.close();
}
main();