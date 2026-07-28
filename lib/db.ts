import { Pool, QueryResult } from 'pg';
import { logger } from './logger';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  logger.error('DATABASE_URL environment variable is missing!');
}

const isSslDisabled =
  process.env.DB_SSL === 'false' ||
  connectionString?.includes('sslmode=disable') ||
  !connectionString ||
  connectionString.includes('localhost') ||
  connectionString.includes('127.0.0.1') ||
  connectionString.includes('@postgres:') ||
  connectionString.includes('@postgres/');

const ssl =
  process.env.DB_SSL === 'true'
    ? { rejectUnauthorized: false }
    : isSslDisabled
    ? false
    : { rejectUnauthorized: false };

export const pool = new Pool({
  connectionString,
  ssl,
  max: process.env.NODE_ENV === 'production' ? 20 : 5, // Production size pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  logger.error('Unexpected database pool client error', err);
});

pool.on('connect', () => {
  logger.debug('Database pool client connected');
});

/**
 * Execute a query with parameters against the database pool.
 */
export async function query<T = any>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  try {
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (err) {
    logger.error('Error executing database query', err, { text, params });
    throw err;
  }
}
