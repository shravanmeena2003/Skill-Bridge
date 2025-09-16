import express from 'express';
import { forgotPassword, resetPassword } from '../controllers/authController.js';

const router = express.Router();

// Forgot password route - send OTP
router.post('/forgot-password', forgotPassword);

// Reset password route - verify OTP and set new password
router.post('/reset-password', resetPassword);

export default router;