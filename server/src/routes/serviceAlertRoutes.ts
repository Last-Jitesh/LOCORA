import { Router } from 'express';
import {
  createServiceAlert,
  getServiceAlerts,
  getServiceAlertById,
  expressInterest,
  getInterested,
  updateInterestStatus,
  closeAlert,
} from '../controllers/serviceAlertController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', getServiceAlerts);
router.post('/', authMiddleware, createServiceAlert);
router.get('/:id', getServiceAlertById);
router.post('/:id/interest', authMiddleware, expressInterest);
router.get('/:id/interest', authMiddleware, getInterested);
router.patch('/:id/interest/:interestId', authMiddleware, updateInterestStatus);
router.patch('/:id/close', authMiddleware, closeAlert);

export default router;
