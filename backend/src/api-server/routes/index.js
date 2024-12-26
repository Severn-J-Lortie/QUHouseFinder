import express from 'express';

export function getRoutes() {
  const router = express.Router();

  router.get('/', (req, res) => {
    res.send('QUHouseFinder is running.');
  });

  router.get('/me', (req, res) => {
    res.status(200).json({ success: true, loggedIn: !!req.session.userId });
  });

  return router;
}
