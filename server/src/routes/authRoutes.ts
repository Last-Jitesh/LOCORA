import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  requestOtp,
  verifyOtp,
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

// Rate limiters
const otpRequestLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3,
  keyGenerator: (req) => `${req.ip}:${req.body?.email || ''}`,
  message: { success: false, message: 'Too many OTP requests. Please wait 10 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const otpVerifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => `${req.ip}:${req.body?.email || ''}`,
  message: { success: false, message: 'Too many verification attempts. Please wait.' },
});

// OTP flow
router.post('/otp/request', otpRequestLimiter, requestOtp);
router.post('/otp/verify', otpVerifyLimiter, verifyOtp);

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
