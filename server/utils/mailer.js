import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

export const sendEmail = async ({ to, subject, html }) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            html
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Email sending failed:', error);
        return false;
    }
};

// Email templates
export const getNewMessageEmailTemplate = (senderName, applicationTitle) => {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>New Message Received</h2>
            <p>You have received a new message from ${senderName} regarding the application for ${applicationTitle}.</p>
            <p>Login to your account to view and respond to the message.</p>
            <div style="margin-top: 20px; padding: 10px; background-color: #f5f5f5;">
                <p style="margin: 0;">Best regards,</p>
                <p style="margin: 5px 0;">The Skill-Bridge Team</p>
            </div>
        </div>
    `;
};

export const getApplicationStatusUpdateTemplate = (applicationTitle, newStatus) => {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Application Status Update</h2>
            <p>The status of your application for ${applicationTitle} has been updated to: <strong>${newStatus}</strong></p>
            <p>Login to your account to view more details about your application.</p>
            <div style="margin-top: 20px; padding: 10px; background-color: #f5f5f5;">
                <p style="margin: 0;">Best regards,</p>
                <p style="margin: 5px 0;">The Skill-Bridge Team</p>
            </div>
        </div>
    `;
};