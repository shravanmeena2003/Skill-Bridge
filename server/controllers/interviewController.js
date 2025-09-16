import Interview from '../models/Interview.js';
import JobApplication from '../models/JobApplication.js';
import { sendEmail } from '../utils/mailer.js';
import User from '../models/User.js';
import Company from '../models/Company.js';

// Schedule a new interview
export const scheduleInterview = async (req, res) => {
    try {
        const {
            applicationId,
            scheduledTime,
            duration,
            meetingType,
            meetingDetails,
            interviewers
        } = req.body;

        // Verify the application exists and belongs to the company
        const application = await JobApplication.findOne({
            _id: applicationId,
            companyId: req.company._id
        }).populate('userId', 'email name');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found or unauthorized'
            });
        }

        // Create new interview
        const interview = new Interview({
            applicationId,
            scheduledTime,
            duration,
            meetingType,
            meetingDetails,
            interviewers: interviewers || [req.company._id]
        });

        await interview.save();

        // Send email notification to candidate
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Interview Scheduled</h2>
                <p>Your interview has been scheduled for ${new Date(scheduledTime).toLocaleString()}</p>
                <p><strong>Duration:</strong> ${duration} minutes</p>
                <p><strong>Type:</strong> ${meetingType}</p>
                ${meetingDetails.location ? `<p><strong>Location:</strong> ${meetingDetails.location}</p>` : ''}
                ${meetingDetails.joinUrl ? `<p><strong>Meeting Link:</strong> <a href="${meetingDetails.joinUrl}">${meetingDetails.joinUrl}</a></p>` : ''}
                ${meetingDetails.notes ? `<p><strong>Notes:</strong> ${meetingDetails.notes}</p>` : ''}
            </div>
        `;

        await sendEmail({
            to: application.userId.email,
            subject: 'Interview Scheduled - Skill-Bridge',
            html: emailHtml
        });

        res.json({
            success: true,
            interview
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get interviews for a company
export const getCompanyInterviews = async (req, res) => {
    try {
        const { status, startDate, endDate } = req.query;
        const query = {
            interviewers: req.company._id
        };

        if (status) {
            query.status = status;
        }

        if (startDate && endDate) {
            query.scheduledTime = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const interviews = await Interview.find(query)
            .populate({
                path: 'applicationId',
                populate: [
                    { path: 'userId', select: 'name email' },
                    { path: 'jobId', select: 'title' }
                ]
            })
            .sort({ scheduledTime: 1 });

        res.json({
            success: true,
            interviews
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update interview status
export const updateInterviewStatus = async (req, res) => {
    try {
        const { interviewId } = req.params;
        const { status, notes } = req.body;

        const interview = await Interview.findOne({
            _id: interviewId,
            interviewers: req.company._id
        });

        if (!interview) {
            return res.status(404).json({
                success: false,
                message: 'Interview not found or unauthorized'
            });
        }

        interview.status = status;
        if (notes) {
            interview.meetingDetails.notes = notes;
        }

        await interview.save();

        res.json({
            success: true,
            interview
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Candidate confirm interview
export const confirmInterview = async (req, res) => {
    try {
        const { interviewId } = req.params;
        const userId = req.auth.userId;

        const interview = await Interview.findOne({
            _id: interviewId
        }).populate('applicationId');

        if (!interview || interview.applicationId.userId !== userId) {
            return res.status(404).json({
                success: false,
                message: 'Interview not found or unauthorized'
            });
        }

        interview.candidateConfirmed = true;
        await interview.save();

        res.json({
            success: true,
            interview
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get upcoming interviews for a candidate
export const getCandidateInterviews = async (req, res) => {
    try {
        const userId = req.auth.userId;
        
        const applications = await JobApplication.find({ userId });
        const applicationIds = applications.map(app => app._id);

        const interviews = await Interview.find({
            applicationId: { $in: applicationIds },
            scheduledTime: { $gte: new Date() }
        }).populate({
            path: 'applicationId',
            populate: [
                { path: 'companyId', select: 'name' },
                { path: 'jobId', select: 'title' }
            ]
        }).sort({ scheduledTime: 1 });

        res.json({
            success: true,
            interviews
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};