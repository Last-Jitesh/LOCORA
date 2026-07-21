import { Router } from 'express';
import {
  createLostFound,
  getLostFoundItems,
  getLostFoundById,
  resolveLostFound,
  deleteLostFound,
  initiateClaim,
  getClaimChat,
  getMyClaims,
} from '../controllers/lostFoundController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', getLostFoundItems);
router.post('/', authMiddleware, createLostFound);
router.get('/chats/my', authMiddleware, getMyClaims);
router.get('/:id', getLostFoundById);
router.patch('/:id/resolve', authMiddleware, resolveLostFound);
router.delete('/:id', authMiddleware, deleteLostFound);
router.post('/:id/claim', authMiddleware, initiateClaim);
router.get('/:id/chat', authMiddleware, getClaimChat);

export default router;
