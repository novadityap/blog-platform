import dotenv from 'dotenv';
import connectDB from './utils/connection.js';
import logger from './utils/logger.js';
import app from './app.js';
import './cron/deleteUnverifiedUsers.js';

const envPath =
  process.env.NODE_ENV === 'test' ? '.env.testing' : '.env.development';
dotenv.config({ path: envPath });

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, '0.0.0.0', () => {
      const message = `Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`;
      logger.info(message);
    });

    server.on('error', err => {
      logger.error('CRITICAL SERVER ERROR:', err);
      process.exit(1);
    });
  } catch (error) {
    logger.error('Failed to start server due to DB connection error:', error);
    process.exit(1);
  }
}

startServer();
