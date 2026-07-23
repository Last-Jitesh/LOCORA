import { Router } from 'express';
import {
  signup,
  signin,
  refresh,
  logout,
  logoutAll,
  getMe,
  updateMe,
  getSessions,
  revokeSession,
} from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Password-based auth
router.post('/signup', signup);
router.post('/signin', signin);

// JWT refresh token rotation
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/logout-all', authMiddleware, logoutAll);

// Active sessions (per-user device management)
router.get('/sessions', authMiddleware, getSessions);
router.delete('/sessions/:id', authMiddleware, revokeSession);

// Protected profile routes
router.get('/me', authMiddleware, getMe);
router.patch('/me', authMiddleware, updateMe);

export default router;
