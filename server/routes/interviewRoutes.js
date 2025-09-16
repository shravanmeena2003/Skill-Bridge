import express from 'express';
import {
    scheduleInterview,
    getCompanyInterviews,
    updateInterviewStatus,
    confirmInterview,
    getCandidateInterviews
} from '../controllers/interviewController.js';
import { protectCompany } from '../middleware/authMiddleware.js';
import { verifyClerkToken } from '../middleware/clerkMiddleware.js';

const router = express.Router();

// Company routes (protected)
router.use('/company', protectCompany);
router.post('/company/schedule', scheduleInterview);
router.get('/company/list', getCompanyInterviews);
router.put('/company/:interviewId/status', updateInterviewStatus);

// Candidate routes (protected)
router.use('/candidate', verifyClerkToken);
router.get('/candidate/list', getCandidateInterviews);
router.put('/candidate/:interviewId/confirm', confirmInterview);

export default router;