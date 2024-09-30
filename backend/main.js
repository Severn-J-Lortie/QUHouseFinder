import express from 'express';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import dotenv from 'dotenv';
import { Database } from './Database.js';
import { Logger } from './Logger.js';
import { requireLengthGreaterThan, requireValidEmail, requireType } from './ValidationHelpers.js';

async function main() {
  dotenv.config();
  const app = express();
  app.use(cors());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  const logger = Logger.getInstance();

  let platform = process.env['QU_PLATFORM'];
  if (platform && !(platform === 'production' || platform === 'development')) {
    throw new Error('Invalid platform specified in QU_PLATFORM');
  } else if (!platform) {
    platform = 'development';
  }
  logger.info(`Running in mode: ${platform}`);

  if (!process.env['QU_SESSION_SECRET']) {
    throw new Error('Need to provide session secret key in QU_SESSION_SECRET');
  }

  const sessionMaxAge = 7*24*60*60*1000;
  app.use(session({
    secret: process.env['QU_SESSION_SECRET'],
    resave: false,
    saveUninitialized: true,
    cookie: { 
      secure: platform === 'production',
      maxAge: sessionMaxAge
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
      result = await db.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3) returning ID',
        [name, email, hashedPassword]
      );
      logger.info(`Registered user name: ${name}, email: ${email}, id: ${result.rows[0].id}`);
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
      req.session.userName = user.name;
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


  if (process.env['QU_BACKEND_PORT']) {
    app.listen(Number(process.env['QU_BACKEND_PORT']));
  } else {
    app.listen(8080);
  }
}
main();

