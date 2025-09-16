import Job from "../models/Job.js"
import User from "../models/User.js"
import JobApplication from "../models/JobApplication.js"

// Get All Jobs
export const getJobs = async (req, res) => {
    try {

        const jobs = await Job.find({ visible: true })
            .populate({ path: 'companyId', select: '-password' })

        res.json({ success: true, jobs })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Get Single Job Using JobID
export const getJobById = async (req, res) => {
    try {

        const { id } = req.params

        const job = await Job.findById(id)
            .populate({
                path: 'companyId',
                select: '-password'
            })

        if (!job) {
            return res.json({
                success: false,
                message: 'Job not found'
            })
        }

        res.json({
            success: true,
            job
        })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Create a new job
export const createJob = async (req, res) => {
    try {
        const { company } = req;
        const jobData = {
            ...req.body,
            companyId: company._id,
            status: 'active',
            visible: true
        };

        const job = await Job.create(jobData);
        const populatedJob = await Job.findById(job._id)
            .populate({ path: 'companyId', select: '-password' });

        res.json({ success: true, job: populatedJob });
    } catch (error) {
        console.error('Create job error:', error);
        res.json({ success: false, message: error.message });
    }
}

// Update a job
export const updateJob = async (req, res) => {
    try {
        const { id } = req.params;
        const { company } = req;
        
        // First check if the job exists and belongs to the company
        const existingJob = await Job.findOne({ _id: id, companyId: company._id });
        
        if (!existingJob) {
            return res.json({
                success: false,
                message: existingJob === null ? 'Job not found' : 'You are not authorized to edit this job'
            });
        }

        // Update the job
        const updatedJob = await Job.findOneAndUpdate(
            { _id: id },
            req.body,
            { 
                new: true,
                runValidators: true
            }
        ).populate({ path: 'companyId', select: '-password' });

        res.json({ 
            success: true, 
            message: 'Job updated successfully',
            job: updatedJob
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Delete a job
export const deleteJob = async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = req.company?._id;
        
        const job = await Job.findOneAndDelete({ _id: id, companyId });

        if (!job) {
            return res.json({
                success: false,
                message: 'Job not found or unauthorized'
            });
        }

        res.json({ success: true, message: 'Job deleted successfully' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Get recruiter's jobs
export const getRecruiterJobs = async (req, res) => {
    try {
        const { company } = req;
        const jobs = await Job.find({ companyId: company._id })
            .populate({ path: 'companyId', select: '-password' })
            .populate({
                path: 'applications',
                populate: {
                    path: 'userId',
                    select: 'name email'
                }
            })
            .sort({ createdAt: -1 });

        res.json({ success: true, jobs });
    } catch (error) {
        console.error('Get recruiter jobs error:', error);
        res.json({ success: false, message: error.message });
    }
}

// Get job applications
export const getJobApplications = async (req, res) => {
    try {
        const { jobId } = req.params;
        const companyId = req.company?._id;
        
        const job = await Job.findOne({ _id: jobId, companyId });
        if (!job) {
            return res.json({
                success: false,
                message: 'Job not found or unauthorized'
            });
        }

        const applications = await JobApplication.find({ jobId })
            .populate('userId', '-password')
            .populate('jobId');

        res.json({ success: true, applications });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}