import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
    applicationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobApplication',
        required: true
    },
    senderId: {
        type: String, // Can be either company ID or user ID
        required: true
    },
    senderType: {
        type: String,
        enum: ['recruiter', 'candidate'],
        required: true
    },
    receiverId: {
        type: String, // Can be either company ID or user ID
        required: true
    },
    receiverType: {
        type: String,
        enum: ['recruiter', 'candidate'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    attachments: [{
        type: String, // URLs to attached files
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Add indexes for better query performance
MessageSchema.index({ applicationId: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1, receiverId: 1 });

const Message = mongoose.model('Message', MessageSchema);
export default Message;