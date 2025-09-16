import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    resume: { type: String },
    image: { type: String, required: true },
    
    // Profile information
    headline: { type: String },
    phone: { type: String },
    location: { type: String },
    website: { type: String },
    about: { type: String },
    
    // Experience
    experience: [{
        title: String,
        company: String,
        location: String,
        startDate: String,
        endDate: String,
        current: { type: Boolean, default: false },
        description: String
    }],
    
    // Education
    education: [{
        degree: String,
        institution: String,
        fieldOfStudy: String,
        startYear: String,
        endYear: String,
        grade: String
    }],
    
    // Skills
    skills: [String],
    
    // Certifications
    certifications: [{
        name: String,
        issuer: String,
        issueDate: String,
        credentialId: String,
        credentialUrl: String
    }],
    
    // Projects
    projects: [{
        name: String,
        description: String,
        technologies: [String],
        projectUrl: String,
        repositoryUrl: String,
        startDate: String,
        endDate: String
    }],
    
    // Job preferences
    preferences: {
        jobTypes: [String],
        workMode: [String],
        locations: [String],
        salaryRange: {
            min: String,
            max: String
        }
    },
    
    // Saved jobs
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
    
    // Recruiter specific fields
    isRecruiter: { type: Boolean, default: false },
    company: {
        name: { type: String },
        logo: { type: String },
        website: { type: String },
        description: { type: String },
        size: { type: String },
        industry: { type: String },
        location: { type: String }
    },
    postedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }]
}, { timestamps: true })

const User = mongoose.model('User', userSchema)

export default User;