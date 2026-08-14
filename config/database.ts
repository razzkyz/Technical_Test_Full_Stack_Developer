import dotenv from 'dotenv';

dotenv.config();

export const databaseConfig = {
  url: process.env.DATABASE_URL || '',
  
  // Connection pool settings
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
  },
};

export default databaseConfig;
