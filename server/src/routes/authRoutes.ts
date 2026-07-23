import { Router } from 'express';
import {
  signup,
  signin,
  refresh,
  logout,
  getMe,
  updateMe,
} from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Password-based auth
router.post('/signup', signup);
router.post('/signin', signin);

// JWT token management
router.post('/refresh', refresh);
router.post('/logout', logout);

// Protected profile routes
router.get('/me', authMiddleware, getMe);
router.patch('/me', authMiddleware, updateMe);

export default router;
