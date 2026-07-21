import { Router } from 'express';
import { createService, getServices, getServiceById, deleteService } from '../controllers/serviceController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', getServices);
router.post('/', authMiddleware, createService);
router.get('/:id', getServiceById);
router.delete('/:id', authMiddleware, deleteService);

export default router;
