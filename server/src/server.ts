import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';
import { registerSocketHandlers } from './sockets';

const start = async () => {
  await connectDB();

  const httpServer = http.createServer(app);

  const io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
  });

  registerSocketHandlers(io);

  // Set Socket.IO instance in controllers for real-time triggers
  const { setIo } = require('./controllers/activityController');
  const { setBlockIo } = require('./controllers/blockController');
  setIo(io);
  setBlockIo(io);

  httpServer.listen(Number(env.PORT), () => {
    console.log(`🚀 Locora server running on port ${env.PORT}`);
    console.log(`🌍 Environment: ${env.NODE_ENV}`);
    console.log(`🔌 Socket.IO ready`);
  });
};

start();

