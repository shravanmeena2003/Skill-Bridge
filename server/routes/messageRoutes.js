import express from 'express';
import { sendMessage, getApplicationMessages, getUnreadCount } from '../controllers/messageController.js';
import { protectCompany } from '../middleware/authMiddleware.js';
import { verifyClerkToken } from '../middleware/clerkMiddleware.js';

const router = express.Router();

// Routes that need either company or user authentication
router.use((req, res, next) => {
    // Try company auth first, if it fails, try user auth
    protectCompany(req, res, (err) => {
        if (err) {
            // If company auth failed, try user auth
            verifyClerkToken(req, res, next);
        } else {
            // If company auth succeeded, continue
            next();
        }
    });
});

// Send a new message
router.post('/send', sendMessage);

// Get messages for a specific application
router.get('/application/:applicationId', getApplicationMessages);

// Get unread message count
router.get('/unread', getUnreadCount);

export default router;