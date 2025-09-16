import mongoose from "mongoose";
import JobApplication from "../models/JobApplication.js";
import Job from "../models/Job.js";
import { sendEmail, getApplicationStatusUpdateTemplate } from '../utils/mailer.js';
import User from '../models/User.js';

// Get single application by ID
export const getSingleApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { company } = req;

        console.log('Fetching application:', { 
            applicationId,
            companyId: company._id,
            paramsReceived: req.params,
            fullUrl: req.originalUrl
        });

        // Debug database connection
        console.log('Database connection state:', mongoose.connection.readyState);
        
        // First try to find the application without any conditions to verify it exists
        const rawApplication = await JobApplication.findById(applicationId).lean();
        console.log('Raw application found:', rawApplication ? 'Yes' : 'No', rawApplication);

        if (!mongoose.Types.ObjectId.isValid(applicationId)) {
            console.log('Invalid application ID format:', applicationId);
            return res.status(400).json({
                success: false,
                message: 'Invalid application ID format'
            });
        }

        // First find the application without company filter to debug
        const anyApplication = await JobApplication.findById(applicationId).lean();
        console.log('Application found (without company filter):', anyApplication ? 'Yes' : 'No');
        
        if (!anyApplication) {
            console.log('No application found with ID:', applicationId);
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Now check with company filter
        const application = await JobApplication.findOne({
            _id: applicationId,
            companyId: company._id
        })
        .populate('userId', 'name email image resume')
        .populate('jobId', 'title location salary description')
        .lean();

        console.log('Application belongs to company:', application ? 'Yes' : 'No');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found or you are not authorized to view it'
            });
        }

        // Transform the application to include the resume
        const transformedApplication = {
            ...application,
            userId: {
                ...application.userId,
                resume: application.resume || null
            }
        };

        res.status(200).json({
            success: true,
            application: transformedApplication
        });

    } catch (error) {
        console.error('Get single application error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch application details' 
        });
    }
};

// Get all applications for a company
export const getCompanyApplications = async (req, res) => {
    try {
        const { company } = req;
        
        const applications = await JobApplication.find({ companyId: company._id })
            .populate({
                path: 'userId',
                select: 'name email image'
            })
            .populate('jobId', 'title location')
            .sort({ applicationDate: -1 })
            .lean(); // Convert to plain JavaScript objects

        // Transform the applications to include the resume from the application record
        const transformedApplications = applications.map(app => ({
            ...app,
            userId: {
                ...app.userId,
                // Use the resume URL stored in the application record
                resume: app.resume || null
            }
        }));

        res.json({
            success: true,
            applications: transformedApplications
        });
    } catch (error) {
        console.error('Get company applications error:', error);
        res.json({ success: false, message: error.message });
    }
};

// Update application status (recruiter only)
export const updateApplicationStatus = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { status } = req.body;
        const { company } = req;

        if (!['pending', 'reviewed', 'shortlisted', 'rejected', 'interviewed', 'offered', 'hired'].includes(status)) {
            return res.json({
                success: false,
                message: 'Invalid status value'
            });
        }

        const application = await JobApplication.findOne({
            _id: applicationId,
            companyId: company._id
        });

        if (!application) {
            return res.json({
                success: false,
                message: 'Application not found or you are not authorized to update it'
            });
        }

        // Update status and lastStatusUpdate
        application.status = status;
        application.lastStatusUpdate = new Date();
        await application.save();

        // Return updated application with populated user data
        const updatedApplication = await JobApplication.findById(applicationId)
            .populate('userId', 'name email resume')
            .populate('jobId', 'title company')
            .exec();

        // Send email notification to candidate
        try {
            const user = await User.findById(application.userId);
            const job = await Job.findById(application.jobId);
            
            await sendEmail({
                to: user.email,
                subject: 'Application Status Update - Skill-Bridge',
                html: getApplicationStatusUpdateTemplate(job.title, status)
            });
        } catch (error) {
            console.error('Failed to send status update email:', error);
            // Don't fail the request if email fails
        }

        res.json({
            success: true,
            message: 'Application status updated successfully',
            application: updatedApplication
        });
    } catch (error) {
        console.error('Update application status error:', error);
        res.json({ 
            success: false, 
            message: 'Failed to update application status',
            error: error.message 
        });
    }
};

// Get all applications for a job (recruiter only)
export const getJobApplications = async (req, res) => {
    try {
        const { jobId } = req.params;
        const { company } = req;

        const job = await Job.findOne({
            _id: jobId,
            companyId: company._id
        });

        if (!job) {
            return res.json({
                success: false,
                message: 'Job not found or you are not authorized to view these applications'
            });
        }

        const applications = await JobApplication.find({ jobId })
            .populate('userId', 'name email resume')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            applications
        });
    } catch (error) {
        console.error('Get job applications error:', error);
        res.json({ success: false, message: error.message });
    }
};

// Get application statistics for a job (company/recruiter)
export const getJobApplicationStats = async (req, res) => {
    try {
        const { jobId } = req.params;
        let job;

        // Check for company auth first
        if (req.company) {
            job = await Job.findOne({
                _id: jobId,
                companyId: req.company._id
            });
        }
        // Then check for recruiter auth
        else if (req.user) {
            job = await Job.findOne({
                _id: jobId,
                recruiter: req.user._id
            });
        }

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found or you are not authorized to view these statistics'
            });
        }

        const stats = await JobApplication.aggregate([
            { $match: { jobId: mongoose.Types.ObjectId(jobId) } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const totalApplications = await JobApplication.countDocuments({ jobId });
        const avgRating = await JobApplication.aggregate([
            { 
                $match: { 
                    jobId: mongoose.Types.ObjectId(jobId), 
                    recruiterRating: { $exists: true } 
                } 
            },
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: '$recruiterRating' }
                }
            }
        ]);

        const formattedStats = {
            total: totalApplications,
            pending: 0,
            reviewed: 0,
            shortlisted: 0,
            rejected: 0,
            interviewed: 0,
            offered: 0,
            hired: 0
        };

        stats.forEach(stat => {
            if (stat._id in formattedStats) {
                formattedStats[stat._id] = stat.count;
            }
        });

        res.json({
            success: true,
            stats: {
                ...formattedStats,
                averageRating: avgRating[0]?.avgRating || 0
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update application status with rating (recruiter only)
export const updateApplicationWithRating = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { status, notes, rating } = req.body;
        const recruiterId = req.user._id;

        const application = await JobApplication.findById(applicationId)
            .populate('job');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        if (application.job.recruiter.toString() !== recruiterId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this application'
            });
        }

        application.status = status;
        application.recruiterNotes = notes;
        if (rating) application.recruiterRating = rating;
        application.lastStatusUpdate = Date.now();

        await application.save();

        res.json({
            success: true,
            message: 'Application status updated successfully',
            application
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};