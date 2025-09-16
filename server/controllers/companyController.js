import Company from "../models/Company.js";
import bcrypt from 'bcrypt'
import { v2 as cloudinary } from 'cloudinary'
import generateToken from "../utils/generateToken.js";
import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";

// Get all companies (public)
export const getAllCompanies = async (req, res) => {
    try {
        // Get query parameters for filtering
        const { industry, size, search } = req.query;
        
        // Build query object
        const query = {};
        if (industry) query.industry = industry;
        if (size) query.size = size;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { industry: { $regex: search, $options: 'i' } }
            ];
        }

        // Get companies with pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const companies = await Company.find(query)
            .select('-password') // Exclude password field
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Get total count for pagination
        const total = await Company.countDocuments(query);

        res.status(200).json({
            success: true,
            companies,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Register a new company
export const registerCompany = async (req, res) => {

    const { 
        name, 
        email, 
        password,
        website,
        location,
        about,
        industry,
        size,
        foundedYear,
        socialMedia
    } = req.body

    const imageFile = req.file;

    if (!name || !email || !password || !imageFile) {
        return res.json({ success: false, message: "Missing Required Details" })
    }

    try {

        const companyExists = await Company.findOne({ email })

        if (companyExists) {
            return res.json({ success: false, message: 'Company already registered' })
        }

        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password, salt)

        const imageUpload = await cloudinary.uploader.upload(imageFile.path)

        const company = await Company.create({
            name,
            email,
            password: hashPassword,
            image: imageUpload.secure_url,
            website,
            location,
            about,
            industry,
            size,
            foundedYear,
            socialMedia,
            verified: false
        })

        res.json({
            success: true,
            company: {
                _id: company._id,
                name: company.name,
                email: company.email,
                image: company.image
            },
            token: generateToken(company._id)
        })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Login Company
export const loginCompany = async (req, res) => {

    const { email, password } = req.body

    try {

        const company = await Company.findOne({ email })

        if (await bcrypt.compare(password, company.password)) {

            res.json({
                success: true,
                company: {
                    _id: company._id,
                    name: company.name,
                    email: company.email,
                    image: company.image
                },
                token: generateToken(company._id)
            })

        }
        else {
            res.json({ success: false, message: 'Invalid email or password' })
        }

    } catch (error) {
        res.json({ success: false, message: error.message })
    }

}

// Get Company Data
export const getCompanyData = async (req, res) => {
    try {
        const company = req.company
        
        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            })
        }

        res.status(200).json({ 
            success: true, 
            company 
        })

    } catch (error) {
        console.error('getCompanyData error:', error);
        res.status(500).json({
            success: false, 
            message: 'Server error while fetching company data'
        })
    }
}

// Post New Job
export const postJob = async (req, res) => {

    const { title, description, location, salary, level, category } = req.body

    const companyId = req.company._id

    try {

        const newJob = new Job({
            title,
            description,
            location,
            salary,
            companyId,
            date: Date.now(),
            level,
            category
        })

        await newJob.save()

        res.json({ success: true, newJob })

    } catch (error) {

        res.json({ success: false, message: error.message })

    }


}

// Get Company Job Applicants
export const getCompanyJobApplicants = async (req, res) => {
    try {

        const companyId = req.company._id

        // Find job applications for the company and populate related data
        const applications = await JobApplication.find({ companyId })
            .populate('userId', 'name image resume')
            .populate('jobId', 'title location category level salary')
            .sort({ applicationDate: -1 }) // Sort by application date, newest first
            .exec()

        if (!applications || applications.length === 0) {
            return res.json({ success: true, applications: [] })
        }

        return res.json({ success: true, applications })

    } catch (error) {
        console.error('Error fetching company job applicants:', error)
        res.json({ success: false, message: error.message })
    }
}

// Get Company Posted Jobs
export const getCompanyPostedJobs = async (req, res) => {
    try {

        const companyId = req.company._id

        const jobs = await Job.find({ companyId })

        // Adding No. of applicants info in data
        const jobsData = await Promise.all(jobs.map(async (job) => {
            const applicants = await JobApplication.find({ jobId: job._id });
            return { ...job.toObject(), applicants: applicants.length }
        }))

        res.json({ success: true, jobsData })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Change Job Application Status
export const ChangeJobApplicationsStatus = async (req, res) => {

    try {

        const { id, status } = req.body

        // Find Job application and update status
        await JobApplication.findOneAndUpdate({ _id: id }, { status })

        res.json({ success: true, message: 'Status Changed' })

    } catch (error) {

        res.json({ success: false, message: error.message })

    }
}

// Change Job Visiblity
export const changeVisiblity = async (req, res) => {
    try {

        const { id } = req.body

        const companyId = req.company._id

        const job = await Job.findById(id)

        if (companyId.toString() === job.companyId.toString()) {
            job.visible = !job.visible
        }

        await job.save()

        res.json({ success: true, job })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Update Company Profile
export const updateCompanyProfile = async (req, res) => {
    try {
        const companyId = req.company._id;
        const { name, email, website, location, about, industry, size, foundedYear, socialMedia } = req.body;

        // Find the company by ID
        const company = await Company.findById(companyId);

        if (!company) {
            return res.json({ success: false, message: 'Company not found' });
        }

        // Update company fields
        if (name) company.name = name;
        if (email) company.email = email;
        if (website) company.website = website;
        if (location) company.location = location;
        if (about) company.about = about;
        if (industry) company.industry = industry;
        if (size) company.size = size;
        if (foundedYear) company.foundedYear = foundedYear;
        
        // Update social media if provided
        if (socialMedia) {
            company.socialMedia = {
                ...company.socialMedia,
                ...socialMedia
            };
        }

        // Save the updated company
        await company.save();

        // Return the updated company without password
        const updatedCompany = await Company.findById(companyId).select('-password');

        res.json({ success: true, company: updatedCompany });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}