import express from 'express'
import { 
    applyForJob, 
    getUserData, 
    getUserJobApplications, 
    updateUserResume,
    updateUserProfile,
    toggleSaveJob,
    getUserSavedJobs,
    createUserProfile
} from '../controllers/userController.js'
import upload from '../config/multer.js'
import { verifyClerkToken } from '../middleware/clerkMiddleware.js'

const router = express.Router()

// Get user Data
router.get('/user', verifyClerkToken, getUserData)

// Create user profile
router.post('/create-profile', createUserProfile)

// Apply for a job
router.post('/apply', verifyClerkToken, applyForJob)

// Get applied jobs data
router.get('/applications', verifyClerkToken, getUserJobApplications)

// Update user profile (resume)
router.post('/update-resume', verifyClerkToken, upload.single('resume'), updateUserResume)

// Update user profile
router.put('/profile', verifyClerkToken, updateUserProfile)

// Save/Unsave job
router.post('/save-job', verifyClerkToken, toggleSaveJob)

// Get saved jobs
router.get('/saved-jobs', verifyClerkToken, getUserSavedJobs)

export default router;