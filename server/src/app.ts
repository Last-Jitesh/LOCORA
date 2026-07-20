import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { errorHandler, notFound } from './middleware/errorHandler';

// Routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import activityRoutes from './routes/activityRoutes';
import lostFoundRoutes from './routes/lostFoundRoutes';
import serviceAlertRoutes from './routes/serviceAlertRoutes';

const app = express();

// ── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser());

// ── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/lost-found', lostFoundRoutes);
app.use('/api/service-alerts', serviceAlertRoutes);

// ── Error Handling ─────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
