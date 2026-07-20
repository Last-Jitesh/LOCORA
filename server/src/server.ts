import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';

const start = async () => {
  await connectDB();

  app.listen(Number(env.PORT), () => {
    console.log(`🚀 Locora server running on port ${env.PORT}`);
    console.log(`🌍 Environment: ${env.NODE_ENV}`);
  });
};

start();
