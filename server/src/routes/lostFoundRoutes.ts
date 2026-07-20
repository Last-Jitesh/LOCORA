import { Router } from 'express';
import { createLostFound, getLostFoundItems, getLostFoundById, resolveLostFound, deleteLostFound } from '../controllers/lostFoundController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', getLostFoundItems);
router.post('/', authMiddleware, createLostFound);
router.get('/:id', getLostFoundById);
router.patch('/:id/resolve', authMiddleware, resolveLostFound);
router.delete('/:id', authMiddleware, deleteLostFound);

export default router;
