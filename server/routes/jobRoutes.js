import express from 'express'
import { getJobById, getJobs, createJob, updateJob, deleteJob, getRecruiterJobs, getJobApplications } from '../controllers/jobController.js';
import { protectCompany } from '../middleware/authMiddleware.js';

const router = express.Router()

// Public routes
router.get('/', getJobs)

// Protected recruiter routes (mounted BEFORE dynamic ':id' route)
router.use('/recruiter', protectCompany)
router.get('/recruiter/jobs', getRecruiterJobs)
router.get('/recruiter/:jobId/applications', getJobApplications)

// CRUD routes for jobs owned by the authenticated company
router.post('/', protectCompany, createJob)
router.put('/:id', protectCompany, updateJob)
router.delete('/:id', protectCompany, deleteJob)

// Public single job route placed last to avoid shadowing
router.get('/:id', getJobById)

export default router;