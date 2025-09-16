import mongoose from "mongoose";

const JobApplicationSchema = new mongoose.Schema({
    userId: { type: String, ref: 'User', required: true }, // Changed to String for Clerk auth compatibility
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    resume: { type: String, required: true },
    coverLetter: { type: String },
    expectedSalary: { type: Number },
    status: { 
        type: String, 
        enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'interviewed', 'offered', 'hired'],
        default: 'pending' 
    },
    recruiterNotes: { type: String },
    recruiterRating: { type: Number, min: 1, max: 5 },
    applicationDate: { type: Date, default: Date.now },
    lastStatusUpdate: { type: Date, default: Date.now }
}, { timestamps: true })

const JobApplication = mongoose.model('JobApplication', JobApplicationSchema)

export default JobApplication