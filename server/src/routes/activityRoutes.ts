import { Router } from 'express';
import {
  createActivity,
  getActivities,
  getActivityById,
  joinActivity,
  leaveActivity,
  getParticipants,
  getActivityMessages,
  markInterested,
  getInterestedUsers,
  deleteActivity,
} from '../controllers/activityController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', getActivities);
router.post('/', authMiddleware, createActivity);
router.get('/:id', getActivityById);
router.post('/:id/join', authMiddleware, joinActivity);
router.post('/:id/leave', authMiddleware, leaveActivity);
router.get('/:id/participants', authMiddleware, getParticipants);
router.get('/:id/messages', authMiddleware, getActivityMessages);
router.post('/:id/interest', authMiddleware, markInterested);
router.get('/:id/interest', authMiddleware, getInterestedUsers);
router.delete('/:id', authMiddleware, deleteActivity);

export default router;
