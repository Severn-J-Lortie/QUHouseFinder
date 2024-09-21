import express from 'express';
import { Database } from './Database.js';
import cors from 'cors';

async function main() {
  const app = express();
  app.use(cors());
  const db = await Database.getInstance().connect();
  app.get('/listings', async (req, res) => {
    try {
      const listings = await db.query('SELECT * FROM listings;');
      res.json(listings.rows);
    } catch (error) {
      res.status(500).send('Server encountered an error trying to get latest listings.');
    }
  });
  app.listen('8080');
}
main();

