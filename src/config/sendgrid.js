import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

// Set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Function to send an email
      export const sendEmail = async (to, subject, text, html) => {
  const msg = {
    to, // Recipient email
    from: process.env.EMAIL_FROM, // Sender email
    subject, // Email subject
    text, // Plain text body
    html, // HTML body
  };

  try {
    await sgMail.send(msg);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    if (error.response) {
      console.error('Error response body:', error.response.body);
    }
    throw error;
  }
};