import Job from "../models/Job.js"
import JobApplication from "../models/JobApplication.js"
import User from "../models/User.js"
import { v2 as cloudinary } from "cloudinary"
import mongoose from "mongoose"

// Create User Profile
export const createUserProfile = async (req, res) => {
    try {
        // Extract user data from request body
        const { _id, email, name, image, resume } = req.body
        
        // Validate required fields
        if (!_id || !email || !name) {
            return res.json({ success: false, message: 'Missing required user information' })
        }
        
        // Check if user already exists using _id from request body
        const existingUser = await User.findById(_id)
        if (existingUser) {
            return res.json({ success: true, message: 'User already exists', user: existingUser })
        }
        
        // Create new user with _id from request body
        const newUser = new User({
            _id, // Use the ID provided in the request body
            email,
            name,
            image: image || '',
            resume: resume || ''
        })
        
        // Save the new user
        await newUser.save()
        
        res.json({ success: true, message: 'User profile created successfully', user: newUser })
    } catch (error) {
        console.error('Error creating user profile:', error)
        res.json({ success: false, message: error.message })
    }
}

// Get User Data
export const getUserData = async (req, res) => {

    const userId = req.auth.userId

    try {

        const user = await User.findById(userId)

        if (!user) {
            return res.json({ success: false, message: 'User Not Found' })
        }

        res.json({ success: true, user })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }

}

// Update User Profile
export const updateUserProfile = async (req, res) => {
    const userId = req.auth.userId
    const { profile } = req.body

    try {
        const user = await User.findById(userId)

        if (!user) {
            return res.json({ success: false, message: 'User Not Found' })
        }

        // Update profile fields
        if (profile.personalInfo) {
            user.headline = profile.personalInfo.headline || user.headline
            user.phone = profile.personalInfo.phone || user.phone
            user.location = profile.personalInfo.location || user.location
            user.website = profile.personalInfo.website || user.website
            user.about = profile.personalInfo.about || user.about
        }

        if (profile.experience) {
            user.experience = profile.experience
        }

        if (profile.education) {
            user.education = profile.education
        }

        if (profile.skills) {
            user.skills = profile.skills
        }

        if (profile.certifications) {
            user.certifications = profile.certifications
        }

        if (profile.projects) {
            user.projects = profile.projects
        }

        if (profile.preferences) {
            user.preferences = profile.preferences
        }

        await user.save()

        res.json({ success: true, message: 'Profile updated successfully', user })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Save/Unsave Job
export const toggleSaveJob = async (req, res) => {
    const userId = req.auth.userId
    const { jobId } = req.body

    try {
        const user = await User.findById(userId)

        if (!user) {
            return res.json({ success: false, message: 'User Not Found' })
        }

        const jobExists = await Job.findById(jobId)
        if (!jobExists) {
            return res.json({ success: false, message: 'Job Not Found' })
        }

        const isSaved = user.savedJobs.includes(jobId)

        if (isSaved) {
            // Remove from saved jobs
            user.savedJobs = user.savedJobs.filter(id => id.toString() !== jobId)
            await user.save()
            res.json({ success: true, message: 'Job removed from saved jobs', saved: false })
        } else {
            // Add to saved jobs
            user.savedJobs.push(jobId)
            await user.save()
            res.json({ success: true, message: 'Job saved successfully', saved: true })
        }

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Get User Saved Jobs
export const getUserSavedJobs = async (req, res) => {
    try {
        const userId = req.auth.userId

        const user = await User.findById(userId)
            .populate({
                path: 'savedJobs',
                populate: {
                    path: 'companyId',
                    select: 'name image'
                }
            })

        if (!user) {
            return res.json({ success: false, message: 'User Not Found' })
        }

        res.json({ success: true, savedJobs: user.savedJobs })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}


// Apply For Job
export const applyForJob = async (req, res) => {

    const { jobId } = req.body

    const userId = req.auth.userId

    try {

        const isAlreadyApplied = await JobApplication.find({ jobId, userId })

        if (isAlreadyApplied.length > 0) {
            return res.json({ success: false, message: 'Already Applied' })
        }

        const jobData = await Job.findById(jobId)

        if (!jobData) {
            return res.json({ success: false, message: 'Job Not Found' })
        }

        // Get user data to access resume
        const userData = await User.findById(userId)
        
        if (!userData || !userData.resume) {
            return res.json({ success: false, message: 'Resume is required to apply for jobs' })
        }

        // Validate resume URL
        try {
            new URL(userData.resume);
        } catch (error) {
            return res.json({ success: false, message: 'Invalid resume URL format' });
        }

        await JobApplication.create({
            companyId: jobData.companyId,
            userId,
            jobId,
            resume: userData.resume, // Store the resume URL at time of application
            applicationDate: Date.now()
        })

        res.json({ success: true, message: 'Applied Successfully' })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }

}

// Get User Applied Applications Data
export const getUserJobApplications = async (req, res) => {

    try {
        const userId = req.auth.userId
        
        // Log the incoming userId for debugging
        console.log('Fetching applications for userId:', userId)
        
        const applications = await JobApplication.find({ 
            userId: userId // userId is now a string, matching the schema
        })
        .populate('companyId', 'name email image')
        .populate('jobId', 'title description location category level salary')
        .sort({ applicationDate: -1 }) // Sort by application date, newest first
        .exec()

        console.log(`Found ${applications.length} applications for user ${userId}`)

        if (!applications || applications.length === 0) {
            return res.json({ success: true, applications: [] })
        }

        return res.json({ success: true, applications })

    } catch (error) {
        console.error('Error fetching user job applications:', error)
        res.json({ success: false, message: error.message })
    }

}

// Update User Resume
export const updateUserResume = async (req, res) => {
    try {
        const userId = req.auth.userId
        const resumeFile = req.file

        console.log('Resume upload request received for user ID:', userId)

        // Check if file exists
        if (!resumeFile) {
            return res.json({ success: false, message: 'No resume file provided' })
        }

        // Validate file type
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        if (!allowedTypes.includes(resumeFile.mimetype)) {
            return res.json({ success: false, message: 'Invalid file type. Please upload a PDF or Word document.' })
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024 // 5MB in bytes
        if (resumeFile.size > maxSize) {
            return res.json({ success: false, message: 'File size exceeds 5MB. Please upload a smaller file.' })
        }
        
        // Check if userId is valid
        if (!userId) {
            console.error('Missing userId in auth object')
            return res.status(401).json({ success: false, message: 'Authentication failed. Please log in again.' })
        }

        const userData = await User.findById(userId)
        if (!userData) {
            console.error('User not found with ID:', userId)
            return res.json({ success: false, message: 'User not found' })
        }

        // Upload to Cloudinary with specific folder and resource type
        const resumeUpload = await cloudinary.uploader.upload(resumeFile.path, {
            folder: 'resumes',
            resource_type: 'auto',
            allowed_formats: ['pdf', 'doc', 'docx']
        })

        // Update user's resume URL
        userData.resume = resumeUpload.secure_url
        await userData.save()

        return res.json({ 
            success: true, 
            message: 'Resume updated successfully',
            resumeUrl: resumeUpload.secure_url
        })

    } catch (error) {
        console.error('Resume upload error:', error)
        res.json({ success: false, message: error.message || 'Failed to upload resume' })
    }
}