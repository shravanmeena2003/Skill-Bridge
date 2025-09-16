import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    category: { type: String, required: true },
    level: { type: String, required: true },
    salary: { 
        min: { type: Number, required: true },
        max: { type: Number, required: true }
    },
    requirements: [{ type: String }],
    responsibilities: [{ type: String }],
    benefits: [{ type: String }],
    type: { type: String, required: true }, // Full-time, Part-time, Contract, etc.
    workMode: { type: String, required: true }, // Remote, On-site, Hybrid
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    visible: { type: Boolean, default: true },
    applicationDeadline: { type: Date },
    status: { type: String, default: 'active', enum: ['active', 'closed', 'draft'] },
    applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'JobApplication' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true })

const Job = mongoose.model('Job', jobSchema)

export default Job