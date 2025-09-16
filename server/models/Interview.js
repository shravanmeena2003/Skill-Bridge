import mongoose from "mongoose";

const InterviewSchema = new mongoose.Schema({
    applicationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobApplication',
        required: true
    },
    scheduledTime: {
        type: Date,
        required: true
    },
    duration: {
        type: Number, // Duration in minutes
        default: 60
    },
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
        default: 'scheduled'
    },
    meetingType: {
        type: String,
        enum: ['online', 'in-person'],
        required: true
    },
    meetingDetails: {
        location: String, // Physical location or meeting link
        platform: String, // For online meetings (Zoom, Google Meet, etc.)
        joinUrl: String,  // Meeting URL for online interviews
        notes: String     // Additional instructions or notes
    },
    interviewers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company'
    }],
    candidateConfirmed: {
        type: Boolean,
        default: false
    },
    reminderSent: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
InterviewSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Create indexes for better query performance
InterviewSchema.index({ applicationId: 1, scheduledTime: 1 });
InterviewSchema.index({ status: 1 });

const Interview = mongoose.model('Interview', InterviewSchema);
export default Interview;