import express from 'express';
import { uid } from 'uid';
import { Logger } from '../Logger.js';
import { validateFields } from '../validators/filters.js';

const router = express.Router();
const logger = Logger.getInstance();

router.post('/save', async (req, res) => {
  const { fields } = req.body;

  if (!fields) {
    res.status(400).json({ success: false, errorMessage: 'Filter fields not specified' });
    return;
  }

  const result = validateFields(fields);
  if (!result.success) {
    res.status(400).json(result);
    return;
  }

  const maxAllowedFilters = 5;
  try {
    const userFilters = await req.db.query('SELECT COUNT(*) FROM filters WHERE userid = $1', [req.session.userId]);
    if (parseInt(userFilters.rows[0].count, 10) >= maxAllowedFilters) {
      res.status(400).json({ success: false, errorMessage: 'Your account has exceeded the maximum number of filters.' });
      return;
    }
  } catch (error) {
    logger.err(`Failed to fetch filters associated with user: ${error.stack}`);
    res.status(500).json({ success: false, errorMessage: 'Error occurred while fetching user filters. Please try again' });
    return;
  }

  try {
    const id = uid();
    await req.db.query(
      'INSERT INTO filters (id, userid, fields, previousmatches) VALUES ($1, $2, $3, $4)',
      [id, req.session.userId, fields, 0]
    );
    res.status(200).json({ success: true, id });
  } catch (error) {
    logger.err(`Failed to insert filter: ${error.stack}`);
    res.status(500).json({ success: false, errorMessage: 'Error occurred while saving filter. Please try again' });
  }
});

router.post('/update', async (req, res) => {
  const { fields, id } = req.body;

  if (!id) {
    res.status(400).json({ success: false, errorMessage: 'Need to provide an id' });
    return;
  }

  const result = validateFields(fields);
  if (!result.success) {
    res.status(400).json(result);
    return;
  }

  try {
    const rows = await req.db.query('UPDATE filters SET fields = $1 WHERE id = $2 AND userid = $3', [fields, id, req.session.userId]);
    if (rows.rowCount < 1) {
      res.status(400).json({ success: false, errorMessage: 'Filter not found or you are not the owner' });
      return;
    }
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, errorMessage: error.message });
  }
});

router.post('/delete', async (req, res) => {
  const { id } = req.body;

  if (!id) {
    res.status(400).json({ success: false, errorMessage: 'Need to provide an id of the filter to delete' });
    return;
  }

  try {
    const rows = await req.db.query('DELETE FROM filters WHERE id = $1 AND userid = $2', [id, req.session.userId]);
    if (rows.rowCount < 1) {
      res.status(400).json({ success: false, errorMessage: 'Could not delete filter. It either does not exist or you do not own it' });
      return;
    }
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, errorMessage: error.message });
    logger.err(`Error deleting user filter: ${error.stack}`);
  }
});

router.get('/', async (req, res) => {
  try {
    const result = await req.db.query('SELECT id, fields FROM filters WHERE userid = $1', [req.session.userId]);
    res.status(200).json({ success: true, filters: result.rows });
  } catch (error) {
    logger.err(`Error retrieving user filters: ${error.stack}`);
    res.status(500).json({ success: false, errorMessage: 'Error while fetching filters. Please try again' });
  }
});

export default router;
