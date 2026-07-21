import { Router } from 'express';
import { blockUser, getBlockList, unblockUser, checkIfBlocked } from '../controllers/blockController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, getBlockList);
router.post('/', authMiddleware, blockUser);
router.get('/check', authMiddleware, checkIfBlocked);
router.delete('/:userId', authMiddleware, unblockUser);

export default router;
