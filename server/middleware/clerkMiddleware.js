import jwt from 'jsonwebtoken';

export const verifyClerkToken = async (req, res, next) => {
    try {
        // Get token from header
        let token = req.headers.authorization;

        if (!token || !token.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false, 
                message: 'No token provided' 
            });
        }

        // Remove Bearer from string
        token = token.split(' ')[1];

        try {
            // Verify token
            const decoded = jwt.decode(token);
            
            if (!decoded || !decoded.sub) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Invalid token' 
                });
            }

            // Add user ID to request object
            req.auth = {
                userId: decoded.sub
            };

            next();
        } catch (error) {
            console.error('Token verification error:', error);
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token' 
            });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Server error in auth middleware' 
        });
    }
}