import express from 'express'
import { ChangeJobApplicationsStatus, changeVisiblity, getAllCompanies, getCompanyData, getCompanyJobApplicants, getCompanyPostedJobs, loginCompany, postJob, registerCompany, updateCompanyProfile } from '../controllers/companyController.js'
import Company from '../models/Company.js'
import upload from '../config/multer.js'
import { protectCompany } from '../middleware/authMiddleware.js'

const router = express.Router()

// Register a company
router.post('/register', upload.single('image'), registerCompany)

// Company login
router.post('/login', loginCompany)

// Get company data
router.get('/company', protectCompany, getCompanyData)

// Post a job
router.post('/post-job', protectCompany, postJob)

// Get Applicants Data of Company
router.get('/applicants', protectCompany, getCompanyJobApplicants)

// Get  Company Job List
router.get('/list-jobs', protectCompany, getCompanyPostedJobs)

// Change Applcations Status 
router.post('/change-status', protectCompany, ChangeJobApplicationsStatus)

// Change Applcations Visiblity 
router.post('/change-visiblity', protectCompany, changeVisiblity)

// Update Company Profile
router.put('/update-profile', protectCompany, updateCompanyProfile)

// Get all companies (public)
router.get('/', getAllCompanies)

// Get company by ID (public)
router.get('/:id', async (req, res) => {
    try {
        const company = await Company.findById(req.params.id).select('-password');
        
        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        res.status(200).json({ 
            success: true, 
            company 
        });
    } catch (error) {
        console.error('getCompanyById error:', error);
        res.status(500).json({
            success: false, 
            message: 'Server error while fetching company data'
        });
    }
});

export default router