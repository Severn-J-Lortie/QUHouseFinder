import express from 'express';
import bcrypt from 'bcryptjs';
import { uid } from 'uid';
import { Logger } from '../Logger.js';
import { requireType, requireValidEmail, requireLengthGreaterThan } from '../validators/common.js';

const router = express.Router();
const logger = Logger.getInstance();

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!requireType([name, email, password], 'string')) {
    res.status(400).send({ success: false, errorMessage: 'Invalid or missing field' });
    return;
  }

  const requiredPasswordLength = 8;
  if (!requireLengthGreaterThan(password, requiredPasswordLength)) {
    res.status(400).send({ success: false, errorMessage: 'Password is not long enough' });
    return;
  }

  if (!requireValidEmail(email)) {
    res.status(400).send({ success: false, errorMessage: 'Invalid email' });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const result = await req.db.query('SELECT FROM users WHERE email = $1', [email]);
    if (result.rows.length) {
      res.status(400).json({ success: false, errorMessage: `User with email ${email} is already registered` });
      return;
    }
    const id = uid();
    await req.db.query(
      'INSERT INTO users (id, name, email, password) VALUES ($1, $2, $3, $4)',
      [id, name, email, hashedPassword]
    );
    logger.info(`Registered user name: ${name}, email: ${email}, id: ${id}`);
    res.status(200).json({ success: true });
  } catch (error) {
    logger.err(`Error registering user: ${error.stack}`);
    res.status(500).json({ success: false, errorMessage: 'Error occurred while registering user' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!requireType([email, password], 'string')) {
    res.status(400).send({ success: false, errorMessage: 'Invalid or missing field' });
    return;
  }

  const result = await req.db.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];

  if (user && await bcrypt.compare(password, user.password)) {
    req.session.userId = user.id;
    res.status(200).json({ success: true });
  } else {
    res.status(400).json({ success: false, errorMessage: 'Invalid email or password' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ success: false, errorMessage: 'Error logging out.' });
    }
    res.status(200).json({ success: true });
  });
});

export default router;
