import { Router } from 'express';
import { getMe, updateMe } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/me', authMiddleware, getMe);
router.patch('/me', authMiddleware, updateMe);

export default router;
