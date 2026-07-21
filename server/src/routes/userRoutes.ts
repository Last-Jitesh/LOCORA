import { Router } from 'express';
import { getMe, updateMe, updateLocation, getUserById } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/me', authMiddleware, getMe);
router.patch('/me', authMiddleware, updateMe);
router.patch('/me/location', authMiddleware, updateLocation);
router.get('/:id', authMiddleware, getUserById);

export default router;
