// config/email.js
import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import dotenv from "dotenv";

dotenv.config();

const OAuth2 = google.auth.OAuth2;

// OAuth 2.0 credentials
const oauth2Client = new OAuth2(
  process.env.GOOGLE_CLIENT_ID, // Replace with your Client ID
  process.env.GOOGLE_CLIENT_SECRET, // Replace with your Client Secret
  'https://developers.google.com/oauthplayground' // Redirect URI
);

// Set refresh token
oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN, // Replace with your Refresh Token
});

// Function to get access token
const getAccessToken = async () => {
  try {
    const { token } = await oauth2Client.getAccessToken();
    return token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
};

// Create a transporter object using OAuth 2.0
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER, // Replace with your email address
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    accessToken: await getAccessToken(),
  },
});

// Function to send an email
export const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Qwikli" <${process.env.EMAIL_USER}>`, // Sender address
      to, // Recipient address
      subject, // Subject line
      text, // Plain text body
      html, // HTML body
    });

    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};