import { Router } from 'express';
import { createActivity, getActivities, getActivityById, markInterested, getInterestedUsers, deleteActivity } from '../controllers/activityController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', getActivities);
router.post('/', authMiddleware, createActivity);
router.get('/:id', getActivityById);
router.post('/:id/interest', authMiddleware, markInterested);
router.get('/:id/interest', authMiddleware, getInterestedUsers);
router.delete('/:id', authMiddleware, deleteActivity);

export default router;
