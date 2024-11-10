import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import cors from 'cors';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { Logger } from '../Logger.js';
import { Database } from './Database.js';
import indexRoutes from './routes/index.js';
import authRoutes from './routes/auth.js';
import filterRoutes from './routes/filters.js';
import listingRoutes from './routes/listings.js';
import { requireAuth } from './middleware/auth.js';

const app = express();

async function initApp() {
  const dirname = path.dirname(fileURLToPath(import.meta.url));
  dotenv.config({ path: path.resolve(dirname, '../../.env') });

  const logger = Logger.getInstance();
  let platform = process.env['QU_PLATFORM'] || 'development';
  if (!['production', 'development'].includes(platform)) {
    throw new Error('Invalid platform specified in QU_PLATFORM');
  }
  logger.info(`Running in mode: ${platform}`);

  app.use(cors({
    origin: process.env['QU_FRONTEND_LOCATION'] || 'https://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  if (!process.env['QU_SESSION_SECRET']) {
    throw new Error('Need to provide session secret key in QU_SESSION_SECRET');
  }

  const PgSession = connectPgSimple(session);

  const sessionMaxAge = 7 * 24 * 60 * 60 * 1000;
  const db = await Database.getInstance().connect();
  app.use(session({
    store: new PgSession({
      pool: Database.getInstance().getPool(),
      tableName: 'sessions',
      createTableIfMissing: true
    }),
    secret: process.env['QU_SESSION_SECRET'],
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: true,
      maxAge: sessionMaxAge,
      httpOnly: true,
      sameSite: 'none',
    },
  }));

  app.use((req, res, next) => {
    req.db = db;
    next();
  });

  app.use('/', indexRoutes);
  app.use('/auth', authRoutes);
  app.use('/filters', requireAuth, filterRoutes);
  app.use('/listings', listingRoutes);
}

initApp();

export default app;