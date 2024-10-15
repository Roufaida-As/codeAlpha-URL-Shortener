const nodemailer = require('nodemailer');
const axios = require('axios')
require("dotenv").config();

// Create a transporter using Gmail
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Function to send an email
exports.sendVerificationEmail = async (email, token) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verify your email',
        html: `<p>Click the link below to verify your email:</p>
        <a href="${process.env.BASE_URL}/verify-email/${token}">Verify Email</a>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Verification email sent');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};


// Hunter.io email verification function
exports.verifyEmailWithHunter = async (email) => {
    const apiKey = process.env.HUNTER_API_KEY;
    const url = `https://api.hunter.io/v2/email-verifier?email=${email}&api_key=${apiKey}`;

    try {
        const response = await axios.get(url);
        // Check if the email is deliverable
        return response.data.data.result === 'deliverable';
    } catch (error) {
        console.error('Email verification error:', error);
        return false; 
    }
}

