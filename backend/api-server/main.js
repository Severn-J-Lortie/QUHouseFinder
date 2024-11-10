import fs from 'node:fs';
import https from 'node:https';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import dotenv from 'dotenv';
import { uid } from 'uid';
import { Database } from './Database.js';
import { Logger } from '../Logger.js';
import { requireLengthGreaterThan, requireValidEmail, requireType } from '../ValidationHelpers.js';

async function main() {
  const dirname = path.dirname(fileURLToPath(import.meta.url));
  dotenv.config({ path: path.resolve(dirname, '../.env') });

  const logger = Logger.getInstance();
  let platform = process.env['QU_PLATFORM'];
  if (platform && !(platform === 'production' || platform === 'development')) {
    throw new Error('Invalid platform specified in QU_PLATFORM');
  } else if (!platform) {
    platform = 'development';
  }
  logger.info(`Running in mode: ${platform}`);

  if (!(process.env['QU_CERT_PATH'] && process.env['QU_KEY_PATH'])) {
    throw new Error('Need to specify cert and key path.');
  }

  const httpsServerOptions = {
    key: fs.readFileSync(process.env['QU_KEY_PATH']),
    cert: fs.readFileSync(process.env['QU_CERT_PATH']),
  };

  const app = express();
  app.use(cors({
    origin: process.env['QU_FRONTEND_LOCATION'] || 'https://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());


  if (!process.env['QU_SESSION_SECRET']) {
    throw new Error('Need to provide session secret key in QU_SESSION_SECRET');
  }

  const sessionMaxAge = 7 * 24 * 60 * 60 * 1000;
  app.use(session({
    secret: process.env['QU_SESSION_SECRET'],
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: true,
      maxAge: sessionMaxAge,
      httpOnly: true,
      sameSite: 'none'
    }
  }));

  const db = await Database.getInstance().connect();

  app.get('/', (req, res) => {
    console.log("SHSHSH")
    res.send('QUHouseFinder is running.');
  });
  app.get('/listings', async (req, res) => {
    try {
      const listings = await db.query('SELECT * FROM listings;');
      res.json(listings.rows);
    } catch (error) {
      res.status(500).send('Server encountered an error trying to get latest listings.');
    }
  });

  app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!requireType([name, email, password], 'string')) {
      res.status(400).send({ success: false, errorMessage: 'Invalid or missing field' });
      return;
    };

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
      let result = await db.query('SELECT FROM users WHERE email = $1', [email]);
      if (result.rows.length) {
        res.status(400).json({ success: false, errorMessage: `User with email ${email} is already registered` });
        return;
      }
      const id = uid();
      result = await db.query('INSERT INTO users (id, name, email, password) VALUES ($1, $2, $3, $4)',
        [id, name, email, hashedPassword]
      );
      logger.info(`Registered user name: ${name}, email: ${email}, id: ${id}`);
      res.status(200).json({ success: true });
    } catch (error) {
      logger.err(`Error registering user: ${error.stack}`);
      res.status(500).json({ success: false, errorMessage: 'Error occured while registering user' });
    }
  });

  app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!requireType([email, password], 'string')) {
      res.status(400).send({ success: false, errorMessage: 'Invalid or missing field' });
      return;
    };
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (user && await bcrypt.compare(password, user.password)) {
      req.session.userId = user.id;
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ success: false, errorMessage: 'Invalid email or password' });
    }
  });

  app.post('/logout', (req, res) => {
    req.session.destroy(err => {
      if (err) {
        return res.status(500).json({ success: false, errorMessage: 'Error logging out.' });
      }
      res.status(200).json({ success: true });
    });
  });

  function validateFields(fields) {
    if (typeof fields !== 'object') {
      return { success: false, errorMessage: 'Fields is wrong type' }
    }
    if (!fields) {
      return { success: false, errorMessage: 'Fields not specified' };
    }

    const fieldsSchema = {
      columnKeys: ['value', 'matchMode'],
      requiredKeys: ['address', 'beds', 'priceperbed', 'rentaltype', 'leasestartdate'],
      address: { dataType: 'string' },
      beds: { dataType: 'number' },
      priceperbed: { dataType: 'number' },
      rentaltype: { dataType: 'string' },
      leasestartdate: { dataType: 'date' }
    };
    const allowableMatchModes = {
      string: ['contains', 'notContains', 'startsWith', 'endsWith', 'equals', 'notEquals'],
      number: ['equals', 'notEquals', 'lt', 'lte', 'gt', 'gte'],
      date: ['dateIs', 'dateIsNot', 'dateBefore', 'dateAfter']
    };

    if (Object.keys(fields).length !== fieldsSchema.requiredKeys.length) {
      return { success: false, errorMessage: 'Invalid fields: incorrect number of columns' }
    }
    if (!fieldsSchema.requiredKeys.every(key => Object.keys(fields).includes(key))) {
      return { success: false, errorMessage: 'Invalid fields: incorrect columns' }
    }
    for (const key in fields) {
      const column = fields[key];
      if (Object.keys(column).length !== fieldsSchema.columnKeys.length) {
        return { success: false, errorMessage: `Invalid fields: column ${key} has incorrect number of fields` }
      }
      if (!fieldsSchema.columnKeys.every(key => Object.keys(column).includes(key))) {
        return { success: false, errorMessage: `Invalid fields: column ${key} has incorrect fields` }
      }
      const dataType = fieldsSchema[key].dataType;
      const matchModesForDataType = allowableMatchModes[dataType];
      if (!matchModesForDataType.includes(column.matchMode)) {
        return { success: false, errorMessage: `Invalid fields: column ${key} has invalid matchMode` }
      }
    }
    return { success: true }
  }

  app.post('/savefilter', async (req, res) => {
    if (!req.session.userId) {
      res.status(401).json({ success: false, errorMessage: 'Not authorized' });
      return;
    }

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
    let userFilters;
    try {
      userFilters = await db.query('SELECT COUNT(*) FROM filters WHERE userid = $1', [req.session.userId]);
      if (userFilters.rows[0].count > maxAllowedFilters) {
        res.status(400).json({ success: false, errorMessage: 'Your account has exceeded the maximum number of filters.' });
        return;
      }
    } catch (error) {
      logger.err(`Failed to fetch filters associated with user: ${error.stack}`);
      res.status(500).json({ success: false, errorMessage: 'Error occured while fetching user filters. Please try again' });
      return;
    }

    try {
      const id = uid();
      await db.query('INSERT INTO filters (id, userid, fields, previousmatches) VALUES ($1, $2, $3, $4)',
        [id, req.session.userId, fields, 0]);
      res.status(200).json({ success: true, id });
    } catch (error) {
      logger.err(`Failed to insert filter: ${error.stack}`);
      res.status(500).json({ success: false, errorMessage: 'Error occured while saving filter. Please try again' });
    }
  });

  app.post('/updateFilter', async (req, res) => {
    if (!req.session.userId) {
      res.status(401).json({ success: false, errorMessage: 'Not authorized' });
      return;
    }
    const { fields, id } = req.body;
    const result = validateFields(fields);
    if (!result.success) {
      res.status(400).json(result);
      return;
    }
    if (!id) {
      res.status(400).json({ success: false, errorMessage: 'Need to provide an id' });
      return;
    }

    try {
      const rows = await db.query('UPDATE filters SET fields = $1 WHERE id = $2 AND userid = $3', [fields, id, req.session.userId]);
      if (rows.rowCount < 1) {
        res.status(400).json({ success: false, errorMessage: 'Filter not found or you are not the owner' });
        return;
      }
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, errorMessage: error.message });
      return;
    };

  });

  app.post('/deleteFilter', async (req, res) => {
    if (!req.session.userId) {
      res.status(401).json({ success: false, errorMessage: 'Not authorized' });
      return;
    }
    const { id } = req.body;
    if (!id) {
      res.status(400).json({ success: false, errorMessage: 'Need to provide an id of the filter to delete' });
      return;
    }

    try {
      const rows = await db.query('DELETE FROM filters WHERE id = $1 AND userid = $2', [id, req.session.userId]);
      if (rows.rowCount < 1) {
        res.status(400).json({ success: false, errorMessage: 'Could not delete filter. It either does not exist or you do not own it' });
        return;
      }
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, errorMessage: error.message });
      logger.err('Error deleting user filter ${error.stack}');
      return;
    };

  });

  app.get('/filters', async (req, res) => {
    if (!req.session.userId) {
      res.status(401).json({ success: false, errorMessage: 'Not authorized' });
      return;
    }
    try {
      const result = await db.query('SELECT id, fields FROM filters WHERE userid = $1', [req.session.userId]);
      res.status(200).json({ success: true, filters: result.rows });
    } catch (error) {
      logger.err(`Error retrieving user filters ${error.stack}`);
      res.status(500).json({ success: false, errorMessage: 'Error while fetching filters. Please try again' });
    }
  });

  app.get('/me', (req, res) => {
    if (!req.session.userId) {
      res.status(200).json({ success: true, loggedIn: false });
      return;
    }
    res.status(200).json({ success: true, loggedIn: true });
  })

  const defaultPort = 8080;
  let listenPort = process.env['QU_BACKEND_PORT'] || defaultPort;

  // Create the HTTPS server
  https.createServer(httpsServerOptions, app).listen(listenPort, () => {
    logger.info(`Server is starting on port ${listenPort}`);
  });
}
main();

