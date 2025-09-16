import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import Company from '../models/Company.js';

// In-memory OTP store (use Redis in production)
const otpStore = new Map();

// Configure nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Generate a random 6-digit OTP
const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};

// Send OTP via email
const sendOTPEmail = async (email, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset OTP',
        html: `
            <h1>Password Reset Request</h1>
            <p>Your OTP for password reset is: <strong>${otp}</strong></p>
            <p>This OTP will expire in 10 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
        `
    };

    await transporter.sendMail(mailOptions);
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Find company with the provided email
        const company = await Company.findOne({ email });
        if (!company) {
            return res.status(404).json({ message: 'No recruiter account found with this email' });
        }

        // Generate OTP
        const otp = generateOTP();
        
        // Store OTP with expiry (10 minutes)
        otpStore.set(email, {
            otp,
            expiry: Date.now() + 10 * 60 * 1000, // 10 minutes from now
            attempts: 0
        });

        // Send OTP via email
        await sendOTPEmail(email, otp);

        res.status(200).json({ message: 'OTP sent to your email' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Error sending OTP' });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        // Validate OTP
        const otpData = otpStore.get(email);
        if (!otpData) {
            return res.status(400).json({ message: 'No OTP request found. Please request a new OTP' });
        }

        // Check OTP expiry
        if (Date.now() > otpData.expiry) {
            otpStore.delete(email);
            return res.status(400).json({ message: 'OTP has expired. Please request a new one' });
        }

        // Check OTP attempts
        if (otpData.attempts >= 3) {
            otpStore.delete(email);
            return res.status(400).json({ message: 'Too many invalid attempts. Please request a new OTP' });
        }

        // Validate OTP
        if (otpData.otp !== otp) {
            otpData.attempts += 1;
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // Find and update company's password
        const company = await Company.findOne({ email });
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        company.password = hashedPassword;
        await company.save();

        // Clear OTP data
        otpStore.delete(email);

        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Error resetting password' });
    }
};