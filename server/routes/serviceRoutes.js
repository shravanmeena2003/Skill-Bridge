import express from 'express';
import {
    getServices,
    getServiceById,
    createService,
    updateService,
    deleteService
} from '../controllers/serviceController.js';
import { protectCompany } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getServices);
router.get('/:id', getServiceById);

// Protected routes (admin only)
router.use(protectCompany);
router.post('/', createService);
router.put('/:id', updateService);
router.delete('/:id', deleteService);

export default router;