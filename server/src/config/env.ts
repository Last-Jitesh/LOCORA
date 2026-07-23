import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: process.env.PORT || '5000',
  MONGO_URI: process.env.MONGO_URI || '',
  JWT_SECRET: process.env.JWT_SECRET || 'locora_access_secret_CHANGE_ME',
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || 'locora_refresh_secret_CHANGE_ME',
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
};
