import express from 'express';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const listings = await req.db.query('SELECT * FROM listings;');
    res.json(listings.rows);
  } catch (error) {
    res.status(500).send('Server encountered an error trying to get latest listings.');
  }
});

export default router;