import jwt from 'jsonwebtoken'
import Company from '../models/Company.js'

// Middleware ( Protect Company Routes )
export const protectCompany = async (req,res,next) => {

    // Getting Token From Headers (case-insensitive)
    let token = req.headers.token || req.headers.authorization || req.headers.Authorization

    // Check if using Bearer token format
    if (token && token.startsWith('Bearer ')) {
        token = token.split(' ')[1]
    }
    
    if (!token) {
        return res.status(401).json({ success:false, message:'Not authorized, Login Again'})
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        req.company = await Company.findById(decoded.id).select('-password')

        next()

    } catch (error) {
        res.status(401).json({success:false, message: 'Not authorized, token failed'})
    }

}