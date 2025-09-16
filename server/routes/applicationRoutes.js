import express from 'express';
import { 
    getJobApplications, 
    updateApplicationStatus, 
    getJobApplicationStats,
    getCompanyApplications,
    getSingleApplication
} from '../controllers/applicationController.js';
import { protectCompany } from '../middleware/authMiddleware.js';

const router = express.Router();

// Debug middleware to log all requests
router.use((req, res, next) => {
    console.log('Application route hit:', {
        method: req.method,
        url: req.url,
        params: req.params,
        path: req.path,
        originalUrl: req.originalUrl
    });
    next();
});

// All routes are protected for recruiters
router.use(protectCompany);

// Diagnostic route to check database state
router.get('/debug/state', async (req, res) => {
    try {
        const counts = {
            applications: await JobApplication.countDocuments(),
            byStatus: await JobApplication.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ])
        };
        
        return res.json({
            success: true,
            dbState: mongoose.connection.readyState,
            counts
        });
    } catch (error) {
        console.error('Debug state error:', error);
        return res.status(500).json({
            success: false,
            message: error.message,
            dbState: mongoose.connection.readyState
        });
    }
});

// Diagnostic route to check raw application data
router.get('/debug/:applicationId', async (req, res) => {
    try {
        const { applicationId } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(applicationId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid application ID format'
            });
        }

        // Try to find the raw application
        const application = await JobApplication.findById(applicationId).lean();
        
        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found in database'
            });
        }

        return res.json({
            success: true,
            application,
            dbState: mongoose.connection.readyState
        });
    } catch (error) {
        console.error('Debug route error:', error);
        return res.status(500).json({
            success: false,
            message: error.message,
            dbState: mongoose.connection.readyState
        });
    }
});

// More specific routes first
router.get('/job/:jobId/stats', getJobApplicationStats);
router.get('/job/:jobId', getJobApplications);
router.get('/company', getCompanyApplications);

// Generic parameter routes last
router.get('/:applicationId', getSingleApplication);
router.put('/:applicationId', updateApplicationStatus);

export default router;