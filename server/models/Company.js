import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String, required: true },
    password: { type: String, required: true },
    website: { type: String },
    location: { type: String },
    about: { type: String },
    industry: { type: String },
    size: { type: String }, // e.g., "1-10", "11-50", "51-200", "201-500", "500+"
    foundedYear: { type: Number },
    socialMedia: {
        linkedin: String,
        twitter: String,
        facebook: String
    },
    verified: { type: Boolean, default: false }
}, { timestamps: true })

const Company = mongoose.model('Company', companySchema)

export default Company