import express from 'express';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import dotenv from 'dotenv';
import { uid } from 'uid';
import { Database } from './Database.js';
import { Logger } from './Logger.js';
import { requireLengthGreaterThan, requireValidEmail, requireType } from './ValidationHelpers.js';

async function main() {
  dotenv.config();

  const logger = Logger.getInstance();
  let platform = process.env['QU_PLATFORM'];
  if (platform && !(platform === 'production' || platform === 'development')) {
    throw new Error('Invalid platform specified in QU_PLATFORM');
  } else if (!platform) {
    platform = 'development';
  }
  logger.info(`Running in mode: ${platform}`);

  const app = express();
  app.use(cors({
    credentials: true,
    origin: 'http://localhost:5173'
  }));
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());


  if (!process.env['QU_SESSION_SECRET']) {
    throw new Error('Need to provide session secret key in QU_SESSION_SECRET');
  }

  const sessionMaxAge = 7*24*60*60*1000;
  app.use(session({
    secret: process.env['QU_SESSION_SECRET'],
    resave: false,
    saveUninitialized: true,
    cookie: { 
      secure: false,
      maxAge: sessionMaxAge,
      httpOnly: true,
      sameSite: 'none'
    }
  }));

  const db = await Database.getInstance().connect();

  app.get('/', (req, res) => {
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
    const {name, email, password } = req.body;

    if (!requireType([name, email, password], 'string')) {
      res.status(400).send({success: false, errorMessage: 'Invalid or missing field'});
      return;
    };

    const requiredPasswordLength = 8;
    if (!requireLengthGreaterThan(password, requiredPasswordLength)) {
      res.status(400).send({success: false, errorMessage: 'Password is not long enough'});
      return;
    }

    if (!requireValidEmail(email)) {
      res.status(400).send({success: false, errorMessage: 'Invalid email'});
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      let result = await db.query('SELECT FROM users WHERE email = $1', [email]);
      if (result.rows.length) {
        res.status(400).json({success: false, errorMessage: `User with email ${email} is already registered`});
        return;
      }
      const id = uid();
      result = await db.query('INSERT INTO users (id, name, email, password) VALUES ($1, $2, $3, $4)',
        [id, name, email, hashedPassword]
      );
      logger.info(`Registered user name: ${name}, email: ${email}, id: ${id}`);
      res.status(200).json({success: true});
    } catch (error) {
      logger.err(`Error registering user: ${error.stack}`);
      res.status(500).json({success: false, errorMessage: 'Error occured while registering user'});
    }
  });

  app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!requireType([email, password], 'string')) {
      res.status(400).send({success: false, errorMessage: 'Invalid or missing field'});
      return;
    };
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (user && await bcrypt.compare(password, user.password)) {
      req.session.userId = user.id;
      res.status(200).json({success: true});
    } else {
      res.status(400).json({success: false, errorMessage: 'Invalid email or password'});
    }
  });

  app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({success: false, errorMessage: 'Error logging out.'});
        }
        res.status(200).json({success: true});
    });
  });

  app.post('/savefilter', async (req, res) => {
    if (!req.session.userId) {
      res.status(401).json({success: false, errorMessage: 'Not authorized'});
      return;
    }

    const { filter } = req.body;
    if (!filter) {
      res.status(400).json({success: false, errorMessage: 'Filter not specified'});
      return;
    }
    if (typeof filter !== 'object') {
      res.status(400).json({success: false, errorMessage: 'Filter is wrong type'});
      return;
    }

    const filterSchema = {
      columnKeys: ['value', 'matchMode'],
      requiredKeys: ['address', 'beds', 'priceperbed', 'rentaltype', 'leasestartdate'],
      address: { dataType: 'string' },
      beds: { dataType: 'number' },
      priceperbed: { dataType: 'number' },
      rentaltype: { dataType: 'string' },
      leasestartdate: { dataType: 'date' }
    }
    const allowableFilterModes = {
      string: ['contains', 'notContains', 'startsWith', 'endsWith', 'equals', 'notEquals'],
      number: ['equals', 'notEquals', 'lt', 'lte', 'gt', 'gte'],
      date: ['dateIs', 'dateIsNot', 'dateBefore', 'dateAfter']
    }

    if (Object.keys(filter).length !== filterSchema.requiredKeys.length) {
      res.status(400).json({success: false, errorMessage: 'Invalid filter: incorrect number of columns'});
      return;
    }
    if (!filterSchema.requiredKeys.every(key => Object.keys(filter).includes(key))) {
      res.status(400).json({success: false, errorMessage: 'Invalid filter: incorrect columns'});
      return;
    }
    for (const key in filter) {
      const column = filter[key];
      if (Object.keys(column).length !== filterSchema.columnKeys.length) {
        res.status(400).json({success: false, errorMessage: `Invalid filter: column ${key} has incorrect number of fields`});
        return;
      }
      if (!filterSchema.columnKeys.every(key => Object.keys(column).includes(key))) {
        res.status(400).json({success: false, errorMessage: `Invalid filter: column ${key} has incorrect fields`});
        return;
      }
      const dataType = filterSchema[key].dataType;
      const filterModesForDataType = allowableFilterModes[dataType];
      if (!filterModesForDataType.includes(column.matchMode)) {
        res.status(400).json({success: false, errorMessage: `Invalid filter: column ${key} has invalid matchMode`});
        return;
      }
    }
    const maxAllowedFilters = 5;
    let userFilters;
    try {
      userFilters = await db.query('SELECT COUNT(*) FROM filters WHERE userid = $1', [req.session.userId]);
      if (userFilters.rows[0].count > maxAllowedFilters) {
        res.status(400).json({success: false, errorMessage: 'Your account has exceeded the maximum number of filters.'});
        return;
      }
    } catch (error) {
      logger.err(`Failed to fetch filters associated with user: ${error.stack}`);
      res.status(500).json({success: false, errorMessage: 'Error occured while fetching user filters. Please try again'});
      return;
    }

    try {
      const id = uid();
      await db.query('INSERT INTO filters (id, userid, filter, previousmatches) VALUES ($1, $2, $3, $4)',
        [id, req.session.userId, filter, 0]);
      res.status(200).json({success: true, id});
    } catch (error) {
      logger.err(`Failed to insert filter: ${error.stack}`);
      res.status(500).json({success: false, errorMessage: 'Error occured while saving filter. Please try again'});
    }
  });

  app.get('/filters', async (req, res) => {
    if (!req.session.userId) {
      res.status(401).json({success: false, errorMessage: 'Not authorized'});
      return;
    }
    try {
      const result = await db.query('SELECT * FROM filters WHERE userid = $1', [req.session.userId]);
      res.status(200).json({success: true, filters: result.rows});
    } catch (error) {
      logger.err(`Error retrieving user filters ${error.stack}`);
      res.status(500).json({success: false, errorMessage: 'Error while fetching filters. Please try again'});
    }
  });


  if (process.env['QU_BACKEND_PORT']) {
    app.listen(Number(process.env['QU_BACKEND_PORT']));
  } else {
    app.listen(8080);
  }
}
main();

