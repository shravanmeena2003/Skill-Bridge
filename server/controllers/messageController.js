import Message from '../models/Message.js';
import JobApplication from '../models/JobApplication.js';
import { sendEmail, getNewMessageEmailTemplate } from '../utils/mailer.js';
import User from '../models/User.js';
import Company from '../models/Company.js';
import Job from '../models/Job.js';

// Send a message
export const sendMessage = async (req, res) => {
    try {
        const { applicationId, content, receiverId, receiverType } = req.body;
        
        // Validate required fields
        if (!applicationId || !content || !receiverId || !receiverType) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: applicationId, content, receiverId, and receiverType are required'
            });
        }

        // Validate receiverType
        if (!['recruiter', 'candidate'].includes(receiverType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid receiverType. Must be either recruiter or candidate'
            });
        }

        // Determine sender type and ID based on the request
        const senderType = req.company ? 'recruiter' : 'candidate';
        const senderId = req.company ? req.company._id : req.auth.userId;

        // Validate content length
        if (typeof content !== 'string' || content.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Message content cannot be empty'
            });
        }

        // Verify the application exists and belongs to the sender
        const application = await JobApplication.findById(applicationId);
        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Verify sender has permission to message about this application
        if (senderType === 'recruiter' && application.companyId.toString() !== req.company._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to send messages for this application'
            });
        }
        if (senderType === 'candidate' && application.userId !== req.auth.userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to send messages for this application'
            });
        }

        let message;
        try {
            message = new Message({
                applicationId,
                senderId,
                senderType,
                receiverId,
                receiverType,
                content
            });

            await message.save();
        } catch (dbError) {
            console.error('Database error while saving message:', dbError);
            return res.status(500).json({
                success: false,
                message: 'Failed to save message to database'
            });
        }

        // Send email notification
        try {
            // Get receiver's email and application details
            let receiverEmail;
            let senderName;
            
            if (receiverType === 'candidate') {
                const user = await User.findById(receiverId);
                receiverEmail = user.email;
                const company = await Company.findById(senderId);
                senderName = company.name;
            } else {
                const company = await Company.findById(receiverId);
                receiverEmail = company.email;
                const user = await User.findById(senderId);
                senderName = user.name;
            }

            const job = await Job.findById(application.jobId);
            if (!job) {
                console.error('Job not found for application:', application.jobId);
                // Continue with message sending even if job is not found
            } else {
                await sendEmail({
                    to: receiverEmail,
                    subject: 'New Message Received - Skill-Bridge',
                    html: getNewMessageEmailTemplate(senderName, job.title)
                });
            }
        } catch (error) {
            console.error('Failed to send email notification:', error);
            // Don't fail the request if email fails, but log the error for monitoring
        }

        res.json({
            success: true,
            message: message
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get messages for an application
export const getApplicationMessages = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const userId = req.company ? req.company._id : req.auth.userId;
        const userType = req.company ? 'recruiter' : 'candidate';

        // Verify user has access to these messages
        const application = await JobApplication.findById(applicationId);
        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Check authorization
        if (userType === 'recruiter' && application.companyId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view these messages'
            });
        }
        if (userType === 'candidate' && application.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view these messages'
            });
        }

        const messages = await Message.find({ applicationId })
            .sort({ createdAt: 1 });

        // Mark messages as read if user is the receiver
        await Message.updateMany(
            {
                applicationId,
                receiverId: userId,
                isRead: false
            },
            { isRead: true }
        );

        res.json({
            success: true,
            messages
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get unread message count
export const getUnreadCount = async (req, res) => {
    try {
        const userId = req.company ? req.company._id : req.auth.userId;
        
        const count = await Message.countDocuments({
            receiverId: userId,
            isRead: false
        });

        res.json({
            success: true,
            unreadCount: count
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};