// testEmail.js
import { sendEmail } from './src/config/sendgrid.js';
import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file

const testEmail = async () => {
  try {
    await sendEmail(
      'anooprai6598@gmail.com', // Replace with a recipient email address
      'Test Email',
      'This is a test email from the Service Marketplace API.',
      '<h1>Test Email</h1><p>This is a test email from the Qwikli API.</p>'
    );
    console.log('Test email sent successfully!');
  } catch (error) {
    console.error('Error sending test email:', error);
  }
};

testEmail();