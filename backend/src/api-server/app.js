import express from 'express';
import cors from 'cors';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { Database } from '../Database.js';
import { getRoutes as indexRoutes } from './routes/index.js';
import { getRoutes as authRoutes } from './routes/auth.js';
import { getRoutes as filterRoutes } from './routes/filters.js';
import { getRoutes as listingRoutes } from './routes/listings.js';
import { requireAuth } from './middleware/auth.js';

export async function initApp() {
  const app = express();

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
  app.set('trust proxy', true);
  app.use(session({
    store: new PgSession({
      pool: Database.getInstance().getPool(),
      tableName: 'sessions',
      createTableIfMissing: true
    }),
    secret: process.env['QU_SESSION_SECRET'],
    resave: false,
    saveUninitialized: true,
    proxy: true,
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

  app.use('/', indexRoutes());
  app.use('/auth', authRoutes());
  app.use('/filters', requireAuth, filterRoutes());
  app.use('/listings', listingRoutes());
  return app;
}